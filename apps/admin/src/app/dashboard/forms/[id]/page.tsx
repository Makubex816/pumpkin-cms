'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import type { FormEntry } from 'pumpkin-ts-models'

const STATUS_OPTIONS = ['new', 'reviewed', 'contacted', 'quoted', 'won', 'lost', 'spam', 'suspected-spam', 'archived'] as const

type LeadStatus = (typeof STATUS_OPTIONS)[number]
type LeadField = 'name' | 'email' | 'phone' | 'eventDate' | 'eventLocation'

export default function FormEntryDetailPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const { token, currentTenant, isLoading, isLoadingTenants, tenantLoadError } = useAuth()
  const [entry, setEntry] = useState<FormEntry | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>('new')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const id = decodeURIComponent(params.id)
  const routeTenantId = searchParams.get('tenantId') || currentTenant?.tenantId || ''
  const canLoad = Boolean(token && routeTenantId && currentTenant && routeTenantId === currentTenant.tenantId)

  useEffect(() => {
    let isCurrent = true

    async function loadEntry() {
      if (!token || !routeTenantId || !currentTenant) {
        setEntry(null)
        setLoading(false)
        return
      }

      if (routeTenantId !== currentTenant.tenantId) {
        setError('This lead belongs to a different tenant context. Switch tenants to view it.')
        setEntry(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const loadedEntry = await apiClient.getFormEntry(token, routeTenantId, id)
        if (isCurrent) {
          setEntry(loadedEntry)
          setSelectedStatus(normalizeStatus(loadedEntry.metadata?.status || 'new'))
        }
      } catch (err) {
        console.error('[Lead Detail] Failed to load form entry:', err)
        if (isCurrent) {
          setError(getErrorMessage(err, 'Failed to load form entry.'))
        }
      } finally {
        if (isCurrent) {
          setLoading(false)
        }
      }
    }

    loadEntry()

    return () => {
      isCurrent = false
    }
  }, [token, currentTenant, routeTenantId, id])

  const leadSummary = useMemo(() => {
    if (!entry) return ''

    return [
      `Lead: ${getLeadField(entry, 'name') || 'Not provided'}`,
      `Email: ${getLeadField(entry, 'email') || 'Not provided'}`,
      `Phone: ${getLeadField(entry, 'phone') || 'Not provided'}`,
      `Event Date: ${getLeadField(entry, 'eventDate') || 'Not provided'}`,
      `Event Location: ${getLeadField(entry, 'eventLocation') || 'Not provided'}`,
      `Source Page: ${entry.pageSlug || 'Not recorded'}`,
      `Submitted: ${formatDateTime(entry.submittedAt)}`,
    ].join('\n')
  }, [entry])

  async function saveStatus() {
    if (!token || !routeTenantId || !entry || saving) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      const updatedEntry = await apiClient.updateFormEntryStatus(
        token,
        routeTenantId,
        entry.id,
        selectedStatus,
        entry.metadata?.tags || []
      )
      setEntry(updatedEntry)
      setSelectedStatus(normalizeStatus(updatedEntry.metadata?.status || selectedStatus))
      setSuccess('Lead status updated.')
    } catch (err) {
      console.error('[Lead Detail] Failed to update form entry status:', err)
      setError(getErrorMessage(err, 'Failed to update lead status.'))
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return <StateCard title="Lead Detail" message="Loading admin session..." />
  }

  if (!token) {
    return <StateCard title="Lead Detail" message="Please log in to view lead submissions." />
  }

  if (!currentTenant && isLoadingTenants) {
    return <StateCard title="Lead Detail" message="Loading tenant context..." />
  }

  if (!currentTenant && tenantLoadError) {
    return <StateCard title="Lead Detail" message={`Tenant list failed to load: ${tenantLoadError}`} tone="error" />
  }

  if (!currentTenant) {
    return <StateCard title="Lead Detail" message="Select a tenant/site before viewing this lead." />
  }

  return (
    <div className="space-y-6">
      <header className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Lead Detail</p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">
              {entry ? getLeadField(entry, 'name') || 'Unnamed Lead' : 'Form Submission'}
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Tenant-scoped FormEntry record for {currentTenant.name || currentTenant.tenantId}.
            </p>
          </div>
          <Link href="/dashboard/forms" className="btn btn-secondary">
            Back to Leads
          </Link>
        </div>
      </header>

      {!canLoad && (
        <div className="card border-amber-200 bg-amber-50 text-sm text-amber-900">
          Switch to tenant `{routeTenantId}` to view this lead. Cross-tenant lead viewing is blocked.
        </div>
      )}

      {loading && <div className="card text-sm text-neutral-600">Loading lead details...</div>}
      {error && <div className="card border-red-200 bg-red-50 text-sm text-red-800">{error}</div>}
      {success && <div className="card border-green-200 bg-green-50 text-sm text-green-800">{success}</div>}

      {!loading && entry && (
        <>
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <DetailCard label="Name" value={getLeadField(entry, 'name') || 'Not provided'} />
            <DetailCard label="Email" value={getLeadField(entry, 'email') || 'Not provided'} />
            <DetailCard label="Phone" value={getLeadField(entry, 'phone') || 'Not provided'} />
            <DetailCard label="Event Date" value={getLeadField(entry, 'eventDate') || 'Not provided'} />
            <DetailCard label="Event Location" value={getLeadField(entry, 'eventLocation') || 'Not provided'} />
            <DetailCard label="Submitted" value={formatDateTime(entry.submittedAt)} />
          </section>

          <section className="card">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Status</h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Status updates change metadata only. Submitted form data is preserved.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="block">
                  <span className="text-sm font-medium text-neutral-700">Lead Status</span>
                  <select
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value as LeadStatus)}
                    className="mt-1 w-full min-w-48 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{formatStatus(status)}</option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={saveStatus}
                  disabled={saving || selectedStatus === normalizeStatus(entry.metadata?.status || 'new')}
                  className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Status'}
                </button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="card">
              <h2 className="text-lg font-semibold text-neutral-900">Lead Summary</h2>
              <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-800">
                {leadSummary}
              </pre>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-neutral-900">Source</h2>
              <div className="mt-3 space-y-3 text-sm">
                <ReadOnlyRow label="Form ID" value={entry.formId || 'Not recorded'} />
                <ReadOnlyRow label="Page Slug" value={entry.pageSlug || 'Not recorded'} />
                <ReadOnlyRow label="Metadata Source" value={entry.metadata?.source || 'Not recorded'} />
                <ReadOnlyRow label="Referrer" value={entry.metadata?.referrer || 'Not recorded'} />
                <ReadOnlyRow label="Tags" value={(entry.metadata?.tags || []).join(', ') || 'None'} />
              </div>
            </div>
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold text-neutral-900">All Form Data</h2>
            <dl className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {Object.entries(entry.formData || {}).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-neutral-200 bg-white p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{key}</dt>
                  <dd className="mt-1 break-words text-sm text-neutral-900">{stringifyFormValue(value) || 'Blank'}</dd>
                </div>
              ))}
            </dl>
            {Object.keys(entry.formData || {}).length === 0 && (
              <p className="mt-3 text-sm text-neutral-600">No formData fields were stored on this entry.</p>
            )}
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold text-neutral-900">Request Metadata</h2>
            <div className="mt-3 space-y-3 text-sm">
              <ReadOnlyRow label="Entry ID" value={entry.id} />
              <ReadOnlyRow label="Tenant ID" value={entry.tenantId} />
              <ReadOnlyRow label="IP Address" value={entry.ipAddress || 'Not recorded'} muted />
              <ReadOnlyRow label="User Agent" value={entry.userAgent || 'Not recorded'} muted />
            </div>
          </section>
        </>
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

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-2 break-words text-lg font-semibold text-neutral-900">{value}</div>
    </div>
  )
}

function ReadOnlyRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-1 rounded-lg border border-neutral-200 p-3 md:grid-cols-4">
      <div className="font-medium text-neutral-700">{label}</div>
      <div className={`break-words md:col-span-3 ${muted ? 'text-neutral-500' : 'text-neutral-900'}`}>{value}</div>
    </div>
  )
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

function normalizeStatus(status: string): LeadStatus {
  return STATUS_OPTIONS.includes(status as LeadStatus) ? status as LeadStatus : 'new'
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
