'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import type { ImportRun } from 'pumpkin-ts-models'

export default function ImportRunDetailPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const { token, currentTenant, isLoading, isLoadingTenants, tenantLoadError } = useAuth()
  const [run, setRun] = useState<ImportRun | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const id = decodeURIComponent(params.id)
  const routeTenantId = searchParams.get('tenantId') || currentTenant?.tenantId || ''
  const canLoad = Boolean(token && routeTenantId && currentTenant && routeTenantId === currentTenant.tenantId)

  useEffect(() => {
    let isCurrent = true

    async function loadRun() {
      if (!token || !routeTenantId || !currentTenant) {
        setRun(null)
        setLoading(false)
        return
      }

      if (routeTenantId !== currentTenant.tenantId) {
        setError('This import run belongs to a different tenant context. Switch tenants to view it.')
        setRun(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const loadedRun = await apiClient.getImportRun(token, routeTenantId, id)
        if (isCurrent) {
          setRun(loadedRun)
        }
      } catch (err) {
        console.error('[ImportRun Detail] Failed to load import run:', err)
        if (isCurrent) {
          setError(getErrorMessage(err, 'Failed to load import run detail. Confirm the ImportRun container exists with partition key /tenantId.'))
        }
      } finally {
        if (isCurrent) {
          setLoading(false)
        }
      }
    }

    loadRun()

    return () => {
      isCurrent = false
    }
  }, [token, currentTenant, routeTenantId, id])

  if (isLoading) {
    return <StateCard title="Import Run Detail" message="Loading admin session..." />
  }

  if (!token) {
    return <StateCard title="Import Run Detail" message="Please log in to view import audit history." />
  }

  if (!currentTenant && isLoadingTenants) {
    return <StateCard title="Import Run Detail" message="Loading tenant context..." />
  }

  if (!currentTenant && tenantLoadError) {
    return <StateCard title="Import Run Detail" message={`Tenant list failed to load: ${tenantLoadError}`} tone="error" />
  }

  if (!currentTenant) {
    return <StateCard title="Import Run Detail" message="Select a tenant/site before viewing this import run." />
  }

  return (
    <div className="space-y-6">
      <header className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Import History</p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">{run?.importRunId || 'Import Run Detail'}</h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-600">
              Tenant-scoped ImportRun audit record for {currentTenant.name || currentTenant.tenantId}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/pages/import-runs" className="btn btn-secondary">Back to Import History</Link>
            <Link href="/dashboard/pages/import-export" className="btn btn-secondary">Import/Export</Link>
          </div>
        </div>
      </header>

      {!canLoad && (
        <div className="card border-amber-200 bg-amber-50 text-sm text-amber-900">
          Switch to tenant `{routeTenantId}` to view this ImportRun. Cross-tenant import history viewing is blocked.
        </div>
      )}

      {loading && <div className="card text-sm text-neutral-600">Loading import run detail...</div>}
      {error && <div className="card border-red-200 bg-red-50 text-sm text-red-800">{error}</div>}

      {!loading && run && (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <DetailCard label="Status" value={formatLabel(run.status)} />
            <DetailCard label="Mode" value={run.importMode} />
            <DetailCard label="Source" value={formatLabel(run.source)} />
            <DetailCard label="Completed" value={formatDateTime(run.completedAt || run.createdAt)} />
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <DetailCard label="Pages" value={String(run.pageCount)} />
            <DetailCard label="Creates" value={String(run.createCount)} />
            <DetailCard label="Updates" value={String(run.updateCount)} />
            <DetailCard label="Skips" value={String(run.skipCount)} />
            <DetailCard label="Errors" value={String(run.errorCount)} />
            <DetailCard label="Warnings" value={String(run.warningCount)} />
            <DetailCard label="Revisions" value={String(run.revisionCount)} />
            <DetailCard label="Needs Rebuild" value={String(run.pagesNeedingRebuildCount)} />
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold text-neutral-900">Run Metadata</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <ReadOnlyRow label="Run ID" value={run.importRunId} />
              <ReadOnlyRow label="Record ID" value={run.id} />
              <ReadOnlyRow label="Tenant" value={run.tenantId} />
              <ReadOnlyRow label="Created By" value={run.createdBy || 'Not recorded'} />
              <ReadOnlyRow label="Source Package" value={run.sourcePackageName || run.sourcePackageId || 'Not from staged package'} />
              <ReadOnlyRow label="File Name" value={run.fileName || 'Not recorded'} />
              <ReadOnlyRow label="Tenant Match" value={run.tenantMatch ? 'yes' : 'no'} />
              <ReadOnlyRow label="Deployment Triggered" value={run.deploymentTriggered ? 'yes' : 'no'} />
              <ReadOnlyRow label="Protected Config Changed" value={run.protectedConfigChanged || 'unknown'} />
              <ReadOnlyRow label="Notes" value={run.notes || 'No notes'} />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <SummaryPanel title="Validation Summary">
              <ReadOnlyRow label="Generated" value={formatDateTime(run.validationSummary?.generatedAt || '')} />
              <ReadOnlyRow label="Pages" value={String(run.validationSummary?.pageCount || 0)} />
              <ReadOnlyRow label="Errors" value={String(run.validationSummary?.errorCount || 0)} />
              <ReadOnlyRow label="Warnings" value={String(run.validationSummary?.warningCount || 0)} />
            </SummaryPanel>
            <SummaryPanel title="Diff Summary">
              <ReadOnlyRow label="Incoming" value={String(run.diffSummary?.incomingCount || 0)} />
              <ReadOnlyRow label="Conflicts" value={String(run.diffSummary?.conflictCount || 0)} />
              <ReadOnlyRow label="Published Updates" value={String(run.diffSummary?.publishedUpdateCount || 0)} />
              <ReadOnlyRow label="Slug Changes" value={String(run.diffSummary?.slugChangeCount || 0)} />
            </SummaryPanel>
            <SummaryPanel title="Import Result Summary">
              <ReadOnlyRow label="Timestamp" value={formatDateTime(run.importResultSummary?.timestamp || '')} />
              <ReadOnlyRow label="Dry-Run Only" value={run.reportSummary?.dryRunOnly ? 'yes' : 'no'} />
              <ReadOnlyRow label="Write Attempted" value={run.reportSummary?.writeAttempted ? 'yes' : 'no'} />
              <ReadOnlyRow label="Wrote Count" value={String(run.reportSummary?.wroteCount || 0)} />
            </SummaryPanel>
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold text-neutral-900">Preflight Acknowledgements</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <ReadOnlyRow label="Published Updates" value={run.preflightAcknowledgements?.publishedUpdatesAcknowledged ? 'acknowledged' : 'not acknowledged'} />
              <ReadOnlyRow label="Slug Changes" value={run.preflightAcknowledgements?.slugChangesAcknowledged ? 'acknowledged' : 'not acknowledged'} />
              <ReadOnlyRow label="Warnings" value={run.preflightAcknowledgements?.warningsAcknowledged ? 'acknowledged' : 'not acknowledged'} />
            </div>
          </section>

          <section className="card overflow-hidden">
            <h2 className="text-lg font-semibold text-neutral-900">Affected Pages</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Sanitized per-page import results. No page content snapshots or secrets are stored in this registry.
            </p>

            {run.affectedPages.length === 0 ? (
              <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                No affected page rows were recorded.
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 text-sm">
                  <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    <tr>
                      <Th>Page</Th>
                      <Th>Slug</Th>
                      <Th>Action</Th>
                      <Th>Revision</Th>
                      <Th>Rebuild</Th>
                      <Th>Messages</Th>
                      <Th>Links</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 bg-white">
                    {run.affectedPages.map((page, index) => (
                      <tr key={`${page.pageSlug}-${index}`}>
                        <Td>{page.title || 'Untitled'}</Td>
                        <Td>
                          <div className="font-mono">{page.pageSlug || 'n/a'}</div>
                          {page.previousSlug && page.newSlug && (
                            <div className="mt-1 text-xs text-neutral-500">{page.previousSlug} to {page.newSlug}</div>
                          )}
                        </Td>
                        <Td>{formatLabel(page.action)}</Td>
                        <Td>{page.revisionCreated ? 'created' : 'not recorded'}</Td>
                        <Td>{page.needsRebuild ? 'yes' : 'no'}</Td>
                        <Td>
                          <MessageList warnings={page.warnings} errors={page.errors} />
                        </Td>
                        <Td>
                          {page.pageSlug ? (
                            <Link
                              href={`/dashboard/pages/${encodeURIComponent(page.pageSlug)}/view?tenantId=${encodeURIComponent(run.tenantId)}`}
                              className="font-medium text-primary-700 hover:text-primary-900"
                            >
                              View Page
                            </Link>
                          ) : (
                            <span className="text-neutral-500">n/a</span>
                          )}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="card border-blue-200 bg-blue-50 text-sm text-blue-900">
            This ImportRun is an audit record only. It did not trigger Azure deployment, Cloudflare purge, static export, hard delete, or any browser-side shell command.
          </section>
        </>
      )}
    </div>
  )
}

function SummaryPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card">
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  )
}

function MessageList({ warnings, errors }: { warnings: string[]; errors: string[] }) {
  if (warnings.length === 0 && errors.length === 0) {
    return <span className="text-neutral-500">No messages.</span>
  }

  return (
    <div className="space-y-1">
      {errors.map((message) => <div key={`error-${message}`} className="text-red-700">{message}</div>)}
      {warnings.map((message) => <div key={`warning-${message}`} className="text-amber-700">{message}</div>)}
    </div>
  )
}

function StateCard({ title, message, tone = 'neutral' }: { title: string; message: string; tone?: 'neutral' | 'error' }) {
  return (
    <div className={`card ${tone === 'error' ? 'border-red-200 bg-red-50 text-red-800' : ''}`}>
      <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  )
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-100 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 break-words text-lg font-semibold text-neutral-900">{value || 'Not recorded'}</div>
    </div>
  )
}

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 break-words text-sm font-medium text-neutral-900">{value || 'Not recorded'}</div>
    </div>
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
