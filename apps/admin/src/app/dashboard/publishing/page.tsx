'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import {
  TENANT_PUBLISHING_PROFILES,
  buildTenantPublishingSummary,
  getDetailUrl,
  getEditUrl,
  getPreviewUrl,
  getTenantDomain,
  type PagePublishingReadiness,
  type PublishingReadinessStatus,
  type PublishingWarningGroup,
  type TenantPublishingSummary,
} from '@/lib/publishing-readiness'
import type { Page } from 'pumpkin-ts-models'

const STATUS_STYLES: Record<PublishingReadinessStatus, string> = {
  ready_for_snapshot: 'border-green-200 bg-green-50 text-green-800',
  needs_review: 'border-amber-200 bg-amber-50 text-amber-900',
  needs_rebuild: 'border-blue-200 bg-blue-50 text-blue-800',
  blocked_by_errors: 'border-red-200 bg-red-50 text-red-800',
  not_configured: 'border-neutral-200 bg-neutral-50 text-neutral-700',
}

const STATUS_DOT_STYLES: Record<PublishingReadinessStatus, string> = {
  ready_for_snapshot: 'bg-green-500',
  needs_review: 'bg-amber-500',
  needs_rebuild: 'bg-blue-500',
  blocked_by_errors: 'bg-red-500',
  not_configured: 'bg-neutral-400',
}

export default function PublishingDashboardPage() {
  const { token, currentTenant, isLoading, isLoadingTenants, tenantLoadError } = useAuth()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCurrent = true

    async function loadPages() {
      if (!token || !currentTenant) {
        setPages([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const tenantPages = await apiClient.getPages(token, currentTenant.tenantId)
        if (isCurrent) {
          setPages(tenantPages)
        }
      } catch (err) {
        console.error('[Publishing Dashboard] Failed to load pages:', err)
        if (isCurrent) {
          setError(getErrorMessage(err, 'Failed to load tenant publishing data.'))
        }
      } finally {
        if (isCurrent) {
          setLoading(false)
        }
      }
    }

    loadPages()

    return () => {
      isCurrent = false
    }
  }, [token, currentTenant])

  const summary = useMemo(() => buildTenantPublishingSummary(pages), [pages])
  const tenantId = currentTenant?.tenantId || ''
  const tenantProfile = tenantId ? TENANT_PUBLISHING_PROFILES[tenantId] : null
  const tenantDomain = tenantId ? getTenantDomain(tenantId, pages) : ''
  const commands = tenantId ? getPublishCommands(tenantId) : []

  if (isLoading) {
    return (
      <div className="card">
        <h1 className="text-2xl font-bold text-neutral-900">Publishing Dashboard</h1>
        <p className="mt-2 text-neutral-600">Loading admin session...</p>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="card">
        <h1 className="text-2xl font-bold text-neutral-900">Publishing Dashboard</h1>
        <p className="mt-2 text-neutral-600">Please log in to view tenant publishing readiness.</p>
      </div>
    )
  }

  if (!currentTenant && isLoadingTenants) {
    return (
      <div className="card">
        <h1 className="text-2xl font-bold text-neutral-900">Publishing Dashboard</h1>
        <p className="mt-2 text-neutral-600">Loading tenant context...</p>
      </div>
    )
  }

  if (!currentTenant && tenantLoadError) {
    return (
      <div className="card border-red-200 bg-red-50">
        <h1 className="text-2xl font-bold text-red-900">Publishing Dashboard</h1>
        <p className="mt-2 text-red-800">Tenant list failed to load: {tenantLoadError}</p>
      </div>
    )
  }

  if (!currentTenant) {
    return (
      <div className="card">
        <h1 className="text-2xl font-bold text-neutral-900">Publishing Dashboard</h1>
        <p className="mt-2 text-neutral-600">Select a tenant/site before reviewing static publishing readiness.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Static Publishing</p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">Build Status Dashboard</h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-600">
              Tenant-scoped CMS-to-static readiness for {currentTenant.name || tenantProfile?.displayName || tenantId}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard/publishing/repairs" className="btn btn-secondary">
              Repair Metadata
            </Link>
            <StatusBadge status={summary.status} label={summary.statusLabel} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <ReadOnlyDetail label="Tenant" value={tenantId} />
          <ReadOnlyDetail label="Site Name" value={currentTenant.name || tenantProfile?.displayName || 'not recorded yet'} />
          <ReadOnlyDetail label="Domain" value={tenantDomain || 'not recorded yet'} />
        </div>

        <div className={`mt-5 rounded-lg border px-4 py-3 text-sm ${STATUS_STYLES[summary.status]}`}>
          <div className="font-semibold">{summary.statusLabel}</div>
          <div className="mt-1">{summary.statusDescription}</div>
        </div>
      </header>

      {loading && (
        <div className="card text-sm text-neutral-600">Loading publishing readiness data...</div>
      )}

      {error && (
        <div className="card border-red-200 bg-red-50 text-sm text-red-800">{error}</div>
      )}

      {!loading && !error && pages.length === 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-neutral-900">No Pages Found</h2>
          <p className="mt-2 text-sm text-neutral-600">This tenant has no pages to evaluate for static publishing yet.</p>
        </div>
      )}

      {!loading && !error && pages.length > 0 && (
        <>
          <SummaryGrid summary={summary} />
          <BuildFields summary={summary} />
          <WarningGroups groups={summary.warningGroups} />
          <PublishCommands tenantId={tenantId} commands={commands} />
          <PageReadinessTable rows={summary.pageReadiness} />
        </>
      )}
    </div>
  )
}

function SummaryGrid({ summary }: { summary: TenantPublishingSummary }) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Total Pages" value={summary.totalPages} />
      <MetricCard label="Published Pages" value={summary.publishedPages} />
      <MetricCard label="Draft/Unpublished" value={summary.draftPages} />
      <MetricCard label="Sitemap Pages" value={summary.sitemapPages} />
      <MetricCard label="Needs Rebuild" value={summary.pagesNeedingRebuild} tone={summary.pagesNeedingRebuild ? 'blue' : 'neutral'} />
      <MetricCard label="Page Warnings" value={summary.pagesWithPageQualityWarnings} tone={summary.pagesWithPageQualityWarnings ? 'amber' : 'neutral'} />
      <MetricCard label="Redirect Warnings" value={summary.pagesWithRedirectWarnings} tone={summary.pagesWithRedirectWarnings ? 'amber' : 'neutral'} />
      <MetricCard label="Missing Approval" value={summary.pagesMissingWorkflowApproval} tone={summary.pagesMissingWorkflowApproval ? 'amber' : 'neutral'} />
      <MetricCard label="Missing Template" value={summary.pagesMissingTemplateIdentity} tone={summary.pagesMissingTemplateIdentity ? 'amber' : 'neutral'} />
      <MetricCard label="Missing SEO/Media/Fulfillment" value={summary.pagesMissingRequiredFields} tone={summary.pagesMissingRequiredFields ? 'amber' : 'neutral'} />
      <MetricCard label="Hash Mismatches" value={summary.contentHashMismatchCount} tone={summary.contentHashMismatchCount ? 'amber' : 'neutral'} />
      <MetricCard label="Cloudflare Purge Flags" value={summary.needsCloudflarePurgeCount} tone={summary.needsCloudflarePurgeCount ? 'blue' : 'neutral'} />
    </section>
  )
}

function BuildFields({ summary }: { summary: TenantPublishingSummary }) {
  return (
    <section className="card">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-neutral-900">Static Build And Deployment Fields</h2>
        <p className="text-sm text-neutral-600">
          These values are read from page-level static publishing and deployment metadata. Missing values mean the workflow has not recorded them yet.
        </p>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ReadOnlyDetail label="Last Snapshot" value={formatDateTime(summary.lastSnapshotAt)} />
        <ReadOnlyDetail label="Last Static Build" value={formatDateTime(summary.lastStaticBuildAt)} />
        <ReadOnlyDetail label="Last Deployed" value={formatDateTime(summary.lastDeployedAt)} />
        <ReadOnlyDetail label="Deployment Status" value={summary.deploymentStatuses.join(', ') || 'not recorded yet'} />
      </div>
    </section>
  )
}

function WarningGroups({ groups }: { groups: PublishingWarningGroup[] }) {
  return (
    <section className="card">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-neutral-900">Warning Groups</h2>
        <p className="text-sm text-neutral-600">Grouped readiness warnings for the selected tenant.</p>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {groups.map((group) => {
          const examples = summarizeWarnings(group)
          const hasWarnings = group.warnings.length > 0
          return (
            <div key={group.category} className={`rounded-lg border p-4 ${hasWarnings ? 'border-amber-200 bg-amber-50/60' : 'border-neutral-200 bg-white'}`}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-neutral-900">{group.label}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${hasWarnings ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-600'}`}>
                  {group.warnings.length}
                </span>
              </div>
              {examples.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {examples.map((example) => (
                    <p key={example} className="text-xs text-neutral-700">{example}</p>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-neutral-500">No warnings in this group.</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function PublishCommands({ tenantId, commands }: { tenantId: string; commands: string[] }) {
  return (
    <section className="card">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-neutral-900">Publish Dry-Run Commands</h2>
        <p className="text-sm text-neutral-600">
          The dashboard does not run shell commands or deploy anything. Use these commands locally after reviewing warnings.
        </p>
      </div>
      {commands.length > 0 ? (
        <pre className="mt-5 overflow-x-auto rounded-lg bg-neutral-950 p-4 text-sm leading-6 text-neutral-50">
          <code>{commands.join('\n')}</code>
        </pre>
      ) : (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          No dedicated CMS static scripts are recorded for tenant {tenantId}. Add tenant-specific snapshot, validation, export, and dry-run scripts before publishing.
        </div>
      )}
    </section>
  )
}

function PageReadinessTable({ rows }: { rows: PagePublishingReadiness[] }) {
  return (
    <section className="card overflow-hidden">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-neutral-900">Page Readiness</h2>
        <p className="text-sm text-neutral-600">Per-page publishing status and the fastest paths to view, edit, or preview public output.</p>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <Th>Title</Th>
              <Th>Slug</Th>
              <Th>Published</Th>
              <Th>Sitemap</Th>
              <Th>Workflow</Th>
              <Th>Needs Rebuild</Th>
              <Th>Warnings</Th>
              <Th>Redirects</Th>
              <Th>Missing Fields</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {rows.map((row) => {
              const page = row.page
              const key = page.PageId || page.id || `${page.tenantId}-${page.pageSlug}`
              return (
                <tr key={key} className="align-top hover:bg-neutral-50">
                  <Td>
                    <div className="font-medium text-neutral-900">{page.MetaData?.title || 'Untitled page'}</div>
                    <div className="mt-1 text-xs text-neutral-500">{page.PageId || page.id || 'missing page id'}</div>
                  </Td>
                  <Td>
                    <code className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-800">{page.pageSlug || 'missing-slug'}</code>
                  </Td>
                  <Td>{formatBoolean(page.isPublished)}</Td>
                  <Td>{formatBoolean(page.includeInSitemap)}</Td>
                  <Td>
                    <div>{page.workflow?.status || 'not recorded'}</div>
                    <div className="mt-1 text-xs text-neutral-500">Approved: {formatBoolean(page.workflow?.approvedForPublish)}</div>
                  </Td>
                  <Td>{formatBoolean(page.staticPublishing?.needsRebuild)}</Td>
                  <Td>
                    <WarningCount warnings={row.warnings.length} errors={row.errors.length} />
                  </Td>
                  <Td>{row.redirectCount}</Td>
                  <Td>
                    {row.missingFields.length > 0 ? (
                      <span className="text-xs text-neutral-700">{row.missingFields.slice(0, 4).join(', ')}{row.missingFields.length > 4 ? '...' : ''}</span>
                    ) : (
                      <span className="text-xs text-neutral-500">None</span>
                    )}
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      <Link href={getDetailUrl(page)} className="text-xs font-medium text-primary-700 hover:text-primary-900">View</Link>
                      <Link href={getEditUrl(page)} className="text-xs font-medium text-primary-700 hover:text-primary-900">Edit</Link>
                      <a href={getPreviewUrl(page)} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary-700 hover:text-primary-900">Preview</a>
                    </div>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function MetricCard({ label, value, tone = 'neutral' }: { label: string; value: number; tone?: 'neutral' | 'amber' | 'blue' }) {
  const toneClass = tone === 'amber'
    ? 'border-amber-200 bg-amber-50 text-amber-900'
    : tone === 'blue'
      ? 'border-blue-200 bg-blue-50 text-blue-900'
      : 'border-neutral-100 bg-white text-neutral-900'

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${toneClass}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-1 text-sm font-medium">{label}</div>
    </div>
  )
}

function StatusBadge({ status, label }: { status: PublishingReadinessStatus; label: string }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${STATUS_STYLES[status]}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT_STYLES[status]}`} />
      {label}
    </div>
  )
}

function ReadOnlyDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 break-words text-sm font-medium text-neutral-900">{value || 'not recorded yet'}</div>
    </div>
  )
}

function WarningCount({ warnings, errors }: { warnings: number; errors: number }) {
  if (warnings === 0 && errors === 0) {
    return <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">0</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {errors > 0 && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">{errors} errors</span>}
      {warnings > 0 && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">{warnings} warnings</span>}
    </div>
  )
}

function Th({ children }: { children: ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">{children}</th>
}

function Td({ children }: { children: ReactNode }) {
  return <td className="max-w-xs px-4 py-3 text-neutral-700">{children}</td>
}

function getPublishCommands(tenantId: string) {
  if (tenantId === 'ice-rink-rentals') {
    return [
      'cd apps/ice-rink-web',
      'npm run snapshot:cms:ice',
      'npm run validate:snapshot:ice',
      'npm run export:static:ice:cms',
      'npm run publish:dry-run:cms',
    ]
  }

  if (tenantId === 'roller-rink-rentals') {
    return [
      'cd apps/ice-rink-web',
      'npm run snapshot:cms:roller',
      'npm run validate:snapshot:roller',
      'npm run export:static:roller:cms',
      'npm run publish:dry-run:cms',
    ]
  }

  return []
}

function summarizeWarnings(group: PublishingWarningGroup) {
  const counts = new Map<string, number>()

  group.warnings.forEach((warning) => {
    const label = warning.field ? `${warning.field}: ${warning.message}` : warning.message
    counts.set(label, (counts.get(label) || 0) + 1)
  })

  return Array.from(counts.entries())
    .sort((first, second) => second[1] - first[1])
    .slice(0, 4)
    .map(([message, count]) => `${message}${count > 1 ? ` (${count} pages)` : ''}`)
}

function formatBoolean(value: boolean | null | undefined) {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return 'not recorded'
}

function formatDateTime(value: string) {
  if (!value) return 'not recorded yet'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'invalid date'

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message || fallback)
  }

  return fallback
}
