'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import type { FormEntry } from 'pumpkin-ts-models'

const STATUS_OPTIONS = ['all', 'new', 'reviewed', 'contacted', 'quoted', 'won', 'lost', 'spam', 'suspected-spam', 'archived'] as const

type StatusFilter = (typeof STATUS_OPTIONS)[number]
type LeadField = 'name' | 'email' | 'phone' | 'eventDate' | 'eventLocation'

interface Filters {
  status: StatusFilter
  formId: string
  pageSlug: string
  search: string
}

const defaultFilters: Filters = {
  status: 'all',
  formId: '',
  pageSlug: '',
  search: '',
}

export default function FormEntriesDashboardPage() {
  const { token, currentTenant, isLoading, isLoadingTenants, tenantLoadError } = useAuth()
  const [entries, setEntries] = useState<FormEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>(defaultFilters)

  useEffect(() => {
    let isCurrent = true

    async function loadEntries() {
      if (!token || !currentTenant) {
        setEntries([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const tenantEntries = await apiClient.getFormEntries(token, currentTenant.tenantId)
        if (isCurrent) {
          setEntries(tenantEntries)
        }
      } catch (err) {
        console.error('[Lead Inbox] Failed to load form entries:', err)
        if (isCurrent) {
          setError(getErrorMessage(err, 'Failed to load form entries.'))
        }
      } finally {
        if (isCurrent) {
          setLoading(false)
        }
      }
    }

    loadEntries()

    return () => {
      isCurrent = false
    }
  }, [token, currentTenant])

  const formIds = useMemo(() => uniqueSorted(entries.map((entry) => entry.formId).filter(Boolean)), [entries])
  const pageSlugs = useMemo(() => uniqueSorted(entries.map((entry) => entry.pageSlug).filter(Boolean)), [entries])
  const filteredEntries = useMemo(() => filterEntries(entries, filters), [entries, filters])
  const summary = useMemo(() => buildSummary(entries), [entries])

  if (isLoading) {
    return <StateCard title="Leads" message="Loading admin session..." />
  }

  if (!token) {
    return <StateCard title="Leads" message="Please log in to view lead submissions." />
  }

  if (!currentTenant && isLoadingTenants) {
    return <StateCard title="Leads" message="Loading tenant context..." />
  }

  if (!currentTenant && tenantLoadError) {
    return <StateCard title="Leads" message={`Tenant list failed to load: ${tenantLoadError}`} tone="error" />
  }

  if (!currentTenant) {
    return <StateCard title="Leads" message="Select a tenant/site before reviewing form submissions." />
  }

  return (
    <div className="space-y-6">
      <header className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Forms</p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">Lead Inbox</h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-600">
              Tenant-scoped quote and contact submissions for {currentTenant.name || currentTenant.tenantId}.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => exportEntriesAsCsv(filteredEntries, currentTenant.tenantId)}
              disabled={filteredEntries.length === 0}
              className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => exportEntriesAsJson(filteredEntries, currentTenant.tenantId)}
              disabled={filteredEntries.length === 0}
              className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export JSON
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
          <Metric label="Total" value={summary.total} />
          <Metric label="New" value={summary.newCount} />
          <Metric label="Reviewed+" value={summary.reviewedCount} />
          <Metric label="Latest" value={summary.latestSubmissionLabel} />
        </div>
      </header>

      <section className="card">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Status</span>
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as StatusFilter }))}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All statuses' : formatStatus(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Form ID</span>
            <select
              value={filters.formId}
              onChange={(event) => setFilters((current) => ({ ...current, formId: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="">All forms</option>
              {formIds.map((formId) => (
                <option key={formId} value={formId}>{formId}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Page</span>
            <select
              value={filters.pageSlug}
              onChange={(event) => setFilters((current) => ({ ...current, pageSlug: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="">All pages</option>
              {pageSlugs.map((pageSlug) => (
                <option key={pageSlug} value={pageSlug}>{pageSlug}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Search</span>
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              placeholder="Name, email, phone, location"
            />
          </label>
        </div>
      </section>

      {loading && <div className="card text-sm text-neutral-600">Loading form entries...</div>}
      {error && <div className="card border-red-200 bg-red-50 text-sm text-red-800">{error}</div>}

      {!loading && !error && entries.length === 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-neutral-900">No Submissions Yet</h2>
          <p className="mt-2 text-sm text-neutral-600">
            This tenant has no FormEntry records yet. Runtime and future static-compatible form endpoints will both feed this inbox.
          </p>
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <section className="card overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Submissions</h2>
              <p className="mt-1 text-sm text-neutral-600">
                Showing {filteredEntries.length} of {entries.length} tenant entries.
              </p>
            </div>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
              No submissions match the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 text-sm">
                <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Event Date</th>
                    <th className="px-4 py-3">Event Location</th>
                    <th className="px-4 py-3">Form</th>
                    <th className="px-4 py-3">Page</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-neutral-700">{formatDateTime(entry.submittedAt)}</td>
                      <td className="px-4 py-3 font-medium text-neutral-900">{getLeadField(entry, 'name') || 'Not provided'}</td>
                      <td className="px-4 py-3 text-neutral-700">{getLeadField(entry, 'email') || 'Not provided'}</td>
                      <td className="px-4 py-3 text-neutral-700">{getLeadField(entry, 'phone') || 'Not provided'}</td>
                      <td className="px-4 py-3 text-neutral-700">{getLeadField(entry, 'eventDate') || 'Not provided'}</td>
                      <td className="px-4 py-3 text-neutral-700">{getLeadField(entry, 'eventLocation') || 'Not provided'}</td>
                      <td className="px-4 py-3 text-neutral-700">{entry.formId || 'Not recorded'}</td>
                      <td className="px-4 py-3 text-neutral-700">{entry.pageSlug || 'Not recorded'}</td>
                      <td className="px-4 py-3"><StatusBadge status={entry.metadata?.status || 'new'} /></td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/forms/${encodeURIComponent(entry.id)}?tenantId=${encodeURIComponent(entry.tenantId)}`}
                          className="text-primary-700 hover:text-primary-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function StateCard({ title, message, tone = 'neutral' }: { title: string; message: string; tone?: 'neutral' | 'error' }) {
  return (
    <div className={`card ${tone === 'error' ? 'border-red-200 bg-red-50' : ''}`}>
      <h1 className={`text-2xl font-bold ${tone === 'error' ? 'text-red-900' : 'text-neutral-900'}`}>{title}</h1>
      <p className={`mt-2 ${tone === 'error' ? 'text-red-800' : 'text-neutral-600'}`}>{message}</p>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-neutral-900">{value}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = status === 'new'
    ? 'border-blue-200 bg-blue-50 text-blue-800'
    : status === 'spam' || status === 'suspected-spam' || status === 'lost'
      ? 'border-red-200 bg-red-50 text-red-800'
      : status === 'won'
        ? 'border-green-200 bg-green-50 text-green-800'
        : 'border-neutral-200 bg-neutral-50 text-neutral-700'

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${styles}`}>
      {formatStatus(status)}
    </span>
  )
}

function buildSummary(entries: FormEntry[]) {
  const latestEntry = entries[0]
  return {
    total: entries.length,
    newCount: entries.filter((entry) => (entry.metadata?.status || 'new') === 'new').length,
    reviewedCount: entries.filter((entry) => (entry.metadata?.status || 'new') !== 'new').length,
    latestSubmissionLabel: latestEntry ? formatDateTime(latestEntry.submittedAt) : 'None',
  }
}

function filterEntries(entries: FormEntry[], filters: Filters) {
  const search = filters.search.trim().toLowerCase()

  return entries.filter((entry) => {
    const status = entry.metadata?.status || 'new'
    if (filters.status !== 'all' && status !== filters.status) return false
    if (filters.formId && entry.formId !== filters.formId) return false
    if (filters.pageSlug && entry.pageSlug !== filters.pageSlug) return false

    if (!search) return true

    const searchText = [
      getLeadField(entry, 'name'),
      getLeadField(entry, 'email'),
      getLeadField(entry, 'phone'),
      getLeadField(entry, 'eventLocation'),
      entry.formId,
      entry.pageSlug,
    ].join(' ').toLowerCase()

    return searchText.includes(search)
  })
}

function getLeadField(entry: FormEntry, field: LeadField) {
  const aliases: Record<LeadField, string[]> = {
    name: ['name', 'fullName', 'contactName', 'firstName'],
    email: ['email', 'emailAddress', 'contactEmail'],
    phone: ['phone', 'phoneNumber', 'telephone', 'contactPhone'],
    eventDate: ['eventDate', 'eventDateOrDateRange', 'date', 'event_date', 'event-date', 'preferredDate'],
    eventLocation: ['eventLocation', 'eventCity', 'eventState', 'location', 'event_location', 'event-location', 'city', 'venue'],
  }

  const formData = entry.formData || {}
  const formKeys = Object.keys(formData)
  for (const alias of aliases[field]) {
    const matchedKey = formKeys.find((key) => normalizeKey(key) === normalizeKey(alias))
    if (matchedKey) {
      const value = stringifyFormValue(formData[matchedKey])
      if (value) return value
    }
  }

  return ''
}

function exportEntriesAsCsv(entries: FormEntry[], tenantId: string) {
  const headers = ['submittedAt', 'formId', 'pageSlug', 'status', 'name', 'email', 'phone', 'eventDate', 'eventLocation', 'formDataJson']
  const rows = entries.map((entry) => [
    entry.submittedAt,
    entry.formId,
    entry.pageSlug,
    entry.metadata?.status || 'new',
    getLeadField(entry, 'name'),
    getLeadField(entry, 'email'),
    getLeadField(entry, 'phone'),
    getLeadField(entry, 'eventDate'),
    getLeadField(entry, 'eventLocation'),
    JSON.stringify(entry.formData || {}),
  ])

  const csv = [headers, ...rows]
    .map((row) => row.map(csvEscape).join(','))
    .join('\r\n')

  downloadTextFile(csv, `${tenantId}-form-entries.csv`, 'text/csv;charset=utf-8')
}

function exportEntriesAsJson(entries: FormEntry[], tenantId: string) {
  const payload = {
    tenantId,
    exportedAt: new Date().toISOString(),
    count: entries.length,
    formEntries: entries,
  }

  downloadTextFile(JSON.stringify(payload, null, 2), `${tenantId}-form-entries.json`, 'application/json;charset=utf-8')
}

function downloadTextFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function csvEscape(value: string) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Invalid date'
  return date.toLocaleString()
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))
}

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function stringifyFormValue(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(stringifyFormValue).filter(Boolean).join(', ')
  return JSON.stringify(value)
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message || fallback)
  }

  return fallback
}
