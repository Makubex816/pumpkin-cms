'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import type { ImportRun } from 'pumpkin-ts-models'

export default function ImportRunHistoryPage() {
  const { token, currentTenant, isLoading, isLoadingTenants, tenantLoadError } = useAuth()
  const [runs, setRuns] = useState<ImportRun[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCurrent = true

    async function loadRuns() {
      if (!token || !currentTenant) {
        setRuns([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const tenantRuns = await apiClient.getImportRuns(token, currentTenant.tenantId)
        if (isCurrent) {
          setRuns(tenantRuns)
        }
      } catch (err) {
        console.error('[Import History] Failed to load import runs:', err)
        if (isCurrent) {
          setError(getErrorMessage(err, 'Failed to load import history. Confirm the ImportRun container exists with partition key /tenantId.'))
        }
      } finally {
        if (isCurrent) {
          setLoading(false)
        }
      }
    }

    loadRuns()

    return () => {
      isCurrent = false
    }
  }, [token, currentTenant])

  const summary = useMemo(() => buildSummary(runs), [runs])

  if (isLoading) {
    return <StateCard title="Import History" message="Loading admin session..." />
  }

  if (!token) {
    return <StateCard title="Import History" message="Please log in to view import audit history." />
  }

  if (!currentTenant && isLoadingTenants) {
    return <StateCard title="Import History" message="Loading tenant context..." />
  }

  if (!currentTenant && tenantLoadError) {
    return <StateCard title="Import History" message={`Tenant list failed to load: ${tenantLoadError}`} tone="error" />
  }

  if (!currentTenant) {
    return <StateCard title="Import History" message="Select a tenant/site before reviewing import audit history." />
  }

  return (
    <div className="space-y-6">
      <header className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Pages</p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">Import History</h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-600">
              Tenant-scoped ImportRun audit records for {currentTenant.name || currentTenant.tenantId}. These records describe import dry-runs and import results; they do not deploy, purge, or execute imports.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/pages/import-export" className="btn btn-secondary">Import/Export</Link>
            <Link href="/dashboard/pages/import-diff" className="btn btn-secondary">Import Diff</Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-5">
          <Metric label="Runs" value={summary.total} />
          <Metric label="Dry-Runs" value={summary.dryRuns} />
          <Metric label="Write Results" value={summary.writeRuns} />
          <Metric label="Errors" value={summary.errorCount} />
          <Metric label="Warnings" value={summary.warningCount} />
        </div>
      </header>

      <div className="card border-blue-200 bg-blue-50 text-sm text-blue-900">
        Import history stores sanitized metadata, summaries, and affected-page references only. No API keys, protected config files, Azure deploys, or Cloudflare purges are stored or triggered here.
      </div>

      {loading && <div className="card text-sm text-neutral-600">Loading import history...</div>}
      {error && <div className="card border-amber-200 bg-amber-50 text-sm text-amber-900">{error}</div>}

      {!loading && !error && runs.length === 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-neutral-900">No Import Runs Yet</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Run a dry-run import from Import/Export, then save the report to Import History.
          </p>
        </div>
      )}

      {!loading && runs.length > 0 && (
        <section className="card overflow-hidden">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Tenant Import Runs</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Showing {runs.length} audit record{runs.length === 1 ? '' : 's'} for {currentTenant.tenantId}.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 text-sm">
              <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <tr>
                  <Th>Date</Th>
                  <Th>Source</Th>
                  <Th>Mode</Th>
                  <Th>Status</Th>
                  <Th>Pages</Th>
                  <Th>Creates</Th>
                  <Th>Updates</Th>
                  <Th>Skips</Th>
                  <Th>Errors</Th>
                  <Th>Warnings</Th>
                  <Th>Revisions</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {runs.map((run) => (
                  <tr key={run.id}>
                    <Td>
                      <div className="font-medium text-neutral-900">{formatDateTime(run.completedAt || run.createdAt)}</div>
                      <div className="mt-1 max-w-xs truncate font-mono text-xs text-neutral-500">{run.importRunId}</div>
                    </Td>
                    <Td>
                      <div>{formatLabel(run.source)}</div>
                      {run.sourcePackageName && <div className="mt-1 text-xs text-neutral-500">{run.sourcePackageName}</div>}
                    </Td>
                    <Td>{run.importMode}</Td>
                    <Td><StatusBadge status={run.status} /></Td>
                    <Td>{run.pageCount}</Td>
                    <Td>{run.createCount}</Td>
                    <Td>{run.updateCount}</Td>
                    <Td>{run.skipCount}</Td>
                    <Td>{run.errorCount}</Td>
                    <Td>{run.warningCount}</Td>
                    <Td>{run.revisionCount}</Td>
                    <Td>
                      <Link
                        href={`/dashboard/pages/import-runs/${encodeURIComponent(run.id)}?tenantId=${encodeURIComponent(run.tenantId)}`}
                        className="font-medium text-primary-700 hover:text-primary-900"
                      >
                        View
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

function buildSummary(runs: ImportRun[]) {
  return {
    total: runs.length,
    dryRuns: runs.filter((run) => run.importMode === 'dry-run').length,
    writeRuns: runs.filter((run) => run.importMode !== 'dry-run').length,
    errorCount: runs.reduce((total, run) => total + run.errorCount, 0),
    warningCount: runs.reduce((total, run) => total + run.warningCount, 0),
  }
}

function StateCard({ title, message, tone = 'neutral' }: { title: string; message: string; tone?: 'neutral' | 'error' }) {
  return (
    <div className={`card ${tone === 'error' ? 'border-red-200 bg-red-50 text-red-800' : ''}`}>
      <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-100 bg-white p-4 shadow-sm">
      <div className="text-2xl font-bold text-neutral-900">{value}</div>
      <div className="mt-1 text-sm font-medium text-neutral-600">{label}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === 'failed' || status === 'blocked_by_preflight'
    ? 'bg-red-100 text-red-800'
    : status === 'completed_with_warnings'
      ? 'bg-amber-100 text-amber-800'
      : status === 'completed'
        ? 'bg-green-100 text-green-800'
        : 'bg-blue-100 text-blue-800'

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}>
      {formatLabel(status)}
    </span>
  )
}

function Th({ children }: { children: ReactNode }) {
  return <th className="px-4 py-3">{children}</th>
}

function Td({ children }: { children: ReactNode }) {
  return <td className="max-w-sm px-4 py-3 text-neutral-700">{children}</td>
}

function formatDateTime(value: string) {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function formatLabel(value: string) {
  return (value || 'unknown').replace(/[_-]/g, ' ')
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message || fallback)
  }

  return fallback
}
