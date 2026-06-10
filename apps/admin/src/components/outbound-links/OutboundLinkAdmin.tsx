'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import {
  createOutboundLinkEnvelope,
  defaultOutboundLinkQuery,
  getOutboundLinkAdminSnapshot,
  getOutboundLinkDetail,
  getOutboundLinkDomains,
  getOutboundLinkExportStatuses,
  listOutboundLinks,
  listReviewQueue,
  normalizeKey,
} from '@/lib/outbound-links/mock-provider'
import type {
  OutboundLinkAuditLogRecord,
  OutboundLinkExportStatus,
  OutboundLinkInstanceRecord,
  OutboundLinkPolicyRecord,
  OutboundLinkQueryState,
  OutboundLinkRecord,
  OutboundLinkScanRunRecord,
  OutboundLinkStatus,
  OutboundLinkStoreSnapshot,
} from '@/lib/outbound-links/types'
import {
  Ban,
  ClipboardList,
  Eye,
  FileArchive,
  Filter,
  History,
  Link2,
  ListChecks,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react'

const viewLinks = [
  { label: 'Dashboard', href: '/dashboard/outbound-links' },
  { label: 'Instances', href: '/dashboard/outbound-links/instances' },
  { label: 'Policies', href: '/dashboard/outbound-links/policies' },
  { label: 'Scan Runs', href: '/dashboard/outbound-links/scan-runs' },
  { label: 'Audit', href: '/dashboard/outbound-links/audit' },
  { label: 'Review Queue', href: '/dashboard/outbound-links/review' },
  { label: 'Exports', href: '/dashboard/outbound-links/exports' },
]

const statusLabels: Record<OutboundLinkStatus, string> = {
  active: 'Active',
  disabled: 'Disabled',
  pending_review: 'Pending Review',
  domain_blocked: 'Domain Blocked',
}

interface FrameRenderState {
  snapshot: OutboundLinkStoreSnapshot
  tenantLabel: string
}

export function OutboundLinkDashboardView() {
  return (
    <OutboundLinkFrame>
      {({ snapshot, tenantLabel }) => <OutboundLinkDashboard snapshot={snapshot} tenantLabel={tenantLabel} />}
    </OutboundLinkFrame>
  )
}

export function OutboundLinkDetailView({ linkId }: { linkId: string }) {
  return (
    <OutboundLinkFrame>
      {({ snapshot }) => <OutboundLinkDetail snapshot={snapshot} linkId={linkId} />}
    </OutboundLinkFrame>
  )
}

export function OutboundLinkInstancesView({ linkId }: { linkId?: string }) {
  return (
    <OutboundLinkFrame>
      {({ snapshot }) => <InstancesView snapshot={snapshot} linkId={linkId} />}
    </OutboundLinkFrame>
  )
}

export function OutboundLinkPoliciesView() {
  return (
    <OutboundLinkFrame>
      {({ snapshot }) => <PoliciesView snapshot={snapshot} />}
    </OutboundLinkFrame>
  )
}

export function OutboundLinkScanRunsView() {
  return (
    <OutboundLinkFrame>
      {({ snapshot }) => <ScanRunsView scanRuns={snapshot.scanRuns} />}
    </OutboundLinkFrame>
  )
}

export function OutboundLinkAuditView() {
  return (
    <OutboundLinkFrame>
      {({ snapshot }) => <AuditView auditLogs={snapshot.auditLogs} />}
    </OutboundLinkFrame>
  )
}

export function OutboundLinkReviewQueueView() {
  return (
    <OutboundLinkFrame>
      {({ snapshot }) => <ReviewQueueView snapshot={snapshot} />}
    </OutboundLinkFrame>
  )
}

export function OutboundLinkExportsView() {
  return (
    <OutboundLinkFrame>
      {({ snapshot }) => <ExportsView statuses={getOutboundLinkExportStatuses(snapshot)} />}
    </OutboundLinkFrame>
  )
}

function OutboundLinkFrame({ children }: { children: (state: FrameRenderState) => ReactNode }) {
  const { currentTenant, isLoading, isLoadingTenants, tenantLoadError } = useAuth()
  const tenantKey = normalizeKey(currentTenant?.tenantId || 'fixture-tenant')
  const siteKey = normalizeKey(currentTenant?.tenantId || 'fixture-site')
  const tenantLabel = currentTenant?.name || currentTenant?.tenantId || 'Fixture Tenant'
  const snapshot = useMemo(() => getOutboundLinkAdminSnapshot(tenantKey, siteKey), [tenantKey, siteKey])

  if (isLoading || isLoadingTenants) {
    return <StateCard title="Outbound Links" message="Loading tenant context..." />
  }

  if (tenantLoadError) {
    return <StateCard title="Outbound Links" message={`Tenant list failed to load: ${tenantLoadError}`} tone="error" />
  }

  return (
    <div className="space-y-6">
      <header className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Tenant Link Governance</p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">Outbound Link Manager</h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-600">
              Read-only registry visibility for {tenantLabel}. Data is supplied by the local Admin fixture provider and follows the Phase 2H-9 GET contract shape.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ReadOnlyActionButton label="Run Scan" />
            <ReadOnlyActionButton label="Bulk Actions" />
            <ReadOnlyActionButton label="Edit Policy" />
          </div>
        </div>
        <ReadOnlyBanner snapshot={snapshot} />
      </header>

      <nav className="flex flex-wrap gap-2">
        {viewLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {children({ snapshot, tenantLabel })}
    </div>
  )
}

function OutboundLinkDashboard({ snapshot, tenantLabel }: { snapshot: OutboundLinkStoreSnapshot; tenantLabel: string }) {
  const [query, setQuery] = useState<OutboundLinkQueryState>(defaultOutboundLinkQuery)
  const domains = useMemo(() => getOutboundLinkDomains(snapshot), [snapshot])
  const list = useMemo(() => listOutboundLinks(snapshot, query), [snapshot, query])
  const envelope = useMemo(
    () => createOutboundLinkEnvelope(snapshot.tenantKey, snapshot.siteKey, { items: list.items }, list.pagination, {
      domain: query.domain,
      status: query.status,
      reviewOnly: String(query.reviewOnly),
      search: query.search || null,
    }),
    [snapshot, list, query],
  )

  return (
    <>
      <MetricGrid snapshot={snapshot} />
      <section className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Registry</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Search and filter tenant-scoped outbound links for {tenantLabel}.
            </p>
          </div>
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
            Envelope: {envelope.code} / {envelope.meta.mode}
          </div>
        </div>
        <OutboundLinkFilters query={query} domains={domains} onChange={setQuery} />
        <OutboundLinksTable links={list.items} />
        <PaginationControls query={query} pagination={list.pagination} onChange={setQuery} />
      </section>
      <ExportsView statuses={getOutboundLinkExportStatuses(snapshot)} compact />
    </>
  )
}

function MetricGrid({ snapshot }: { snapshot: OutboundLinkStoreSnapshot }) {
  const summary = snapshot.dashboardSummary
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard icon={<Link2 className="h-5 w-5" />} label="Registry Links" value={summary.linkCount} />
      <MetricCard icon={<ListChecks className="h-5 w-5" />} label="Instances" value={summary.instanceCount} />
      <MetricCard icon={<ShieldCheck className="h-5 w-5" />} label="Policies" value={summary.policyCount} />
      <MetricCard icon={<History className="h-5 w-5" />} label="Audit Events" value={summary.auditLogCount} />
      <MetricCard icon={<Eye className="h-5 w-5" />} label="Pending Review" value={summary.pendingReviewCount} tone={summary.pendingReviewCount ? 'amber' : 'neutral'} />
      <MetricCard icon={<Ban className="h-5 w-5" />} label="Disabled Links" value={summary.disabledLinkCount} tone={summary.disabledLinkCount ? 'red' : 'neutral'} />
      <MetricCard icon={<Filter className="h-5 w-5" />} label="Blocked Domains" value={summary.domainBlockedLinkCount} tone={summary.domainBlockedLinkCount ? 'red' : 'neutral'} />
      <MetricCard icon={<RefreshCw className="h-5 w-5" />} label="Stale Instances" value={summary.staleInstanceCount} tone={summary.staleInstanceCount ? 'amber' : 'neutral'} />
    </section>
  )
}

function OutboundLinkFilters({
  query,
  domains,
  onChange,
}: {
  query: OutboundLinkQueryState
  domains: string[]
  onChange: (query: OutboundLinkQueryState) => void
}) {
  const update = (patch: Partial<OutboundLinkQueryState>) => onChange({ ...query, ...patch, page: patch.page ?? 1 })

  return (
    <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_180px]">
      <label className="block">
        <span className="mb-1 flex items-center gap-2 text-sm font-medium text-neutral-700">
          <Search className="h-4 w-4" />
          Search
        </span>
        <input
          value={query.search}
          onChange={(event) => update({ search: event.target.value })}
          className="input"
          placeholder="URL, domain, or registry id"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-700">Domain</span>
        <select value={query.domain} onChange={(event) => update({ domain: event.target.value })} className="input">
          <option value="all">All domains</option>
          {domains.map((domain) => <option key={domain} value={domain}>{domain}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-700">Status</span>
        <select value={query.status} onChange={(event) => update({ status: event.target.value as OutboundLinkQueryState['status'] })} className="input">
          <option value="all">All statuses</option>
          {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-700">Page Size</span>
        <select value={query.pageSize} onChange={(event) => update({ pageSize: Number(event.target.value) })} className="input">
          <option value={5}>5 rows</option>
          <option value={10}>10 rows</option>
          <option value={25}>25 rows</option>
        </select>
      </label>
      <div className="flex flex-wrap items-center gap-3 lg:col-span-4">
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={query.reviewOnly}
            onChange={(event) => update({ reviewOnly: event.target.checked })}
            className="rounded border-neutral-300 text-primary-600"
          />
          Review required only
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          Sort
          <select value={query.sortField} onChange={(event) => update({ sortField: event.target.value as OutboundLinkQueryState['sortField'] })} className="rounded-md border border-neutral-300 bg-white px-2 py-1">
            <option value="lastDetectedAt">Last detected</option>
            <option value="domain">Domain</option>
            <option value="status">Status</option>
            <option value="instanceCount">Instances</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          Direction
          <select value={query.sortDirection} onChange={(event) => update({ sortDirection: event.target.value as OutboundLinkQueryState['sortDirection'] })} className="rounded-md border border-neutral-300 bg-white px-2 py-1">
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
      </div>
    </div>
  )
}

function OutboundLinksTable({ links }: { links: OutboundLinkRecord[] }) {
  if (links.length === 0) {
    return <p className="mt-5 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-600">No outbound links match the current filters.</p>
  }

  return (
    <div className="mt-5 overflow-x-auto">
      <table className="min-w-full divide-y divide-neutral-200 text-sm">
        <thead className="bg-neutral-50">
          <tr>
            <Th>URL</Th>
            <Th>Domain</Th>
            <Th>Status</Th>
            <Th>Instances</Th>
            <Th>Render</Th>
            <Th>Last Detected</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 bg-white">
          {links.map((link) => (
            <tr key={link.id} className="align-top hover:bg-neutral-50">
              <Td>
                <div className="max-w-md break-words font-medium text-neutral-900">{link.normalizedUrl}</div>
                <div className="mt-1 text-xs text-neutral-500">{link.id}</div>
              </Td>
              <Td>{link.domain}</Td>
              <Td>
                <StatusBadge status={link.status} />
                <div className="mt-1 text-xs text-neutral-500">{link.policyStatus}</div>
              </Td>
              <Td>
                <div>{link.instanceCount} total</div>
                <div className="mt-1 text-xs text-neutral-500">{link.activeInstanceCount} active, {link.staleInstanceCount} stale</div>
              </Td>
              <Td>{formatRenderAction(link.renderAction)}</Td>
              <Td>{formatDateTime(link.lastDetectedAt)}</Td>
              <Td>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/dashboard/outbound-links/${encodeURIComponent(link.id)}`} className="text-xs font-medium text-primary-700 hover:text-primary-900">
                    Detail
                  </Link>
                  <Link href={`/dashboard/outbound-links/${encodeURIComponent(link.id)}/instances`} className="text-xs font-medium text-primary-700 hover:text-primary-900">
                    Instances
                  </Link>
                  <ReadOnlyInlineAction label="Enable" />
                  <ReadOnlyInlineAction label="Disable" />
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PaginationControls({
  query,
  pagination,
  onChange,
}: {
  query: OutboundLinkQueryState
  pagination: { page: number; totalPages: number; totalItems: number; hasNextPage: boolean; hasPreviousPage: boolean }
  onChange: (query: OutboundLinkQueryState) => void
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-600">
      <div>
        Page {pagination.page} of {pagination.totalPages}. {pagination.totalItems} link{pagination.totalItems === 1 ? '' : 's'}.
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!pagination.hasPreviousPage}
          onClick={() => onChange({ ...query, page: Math.max(1, query.page - 1) })}
          className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={!pagination.hasNextPage}
          onClick={() => onChange({ ...query, page: query.page + 1 })}
          className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

function OutboundLinkDetail({ snapshot, linkId }: { snapshot: OutboundLinkStoreSnapshot; linkId: string }) {
  const detail = getOutboundLinkDetail(snapshot, decodeURIComponent(linkId))

  if (!detail) {
    return <StateCard title="Link Not Found" message={`No local fixture link exists for ${linkId}.`} tone="error" />
  }

  return (
    <>
      <section className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Link Detail</p>
            <h2 className="mt-1 break-words text-2xl font-bold text-neutral-900">{detail.link.normalizedUrl}</h2>
            <p className="mt-2 text-sm text-neutral-600">{detail.link.id}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={detail.link.status} />
            <ReadOnlyActionButton label="Approve" />
            <ReadOnlyActionButton label="Disable" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <ReadOnlyDetail label="Tenant" value={detail.link.tenantKey} />
          <ReadOnlyDetail label="Site" value={detail.link.siteKey} />
          <ReadOnlyDetail label="Domain" value={detail.link.domain} />
          <ReadOnlyDetail label="Policy" value={detail.link.policyStatus} />
          <ReadOnlyDetail label="Render Action" value={formatRenderAction(detail.link.renderAction)} />
          <ReadOnlyDetail label="First Detected" value={formatDateTime(detail.link.firstDetectedAt)} />
          <ReadOnlyDetail label="Last Detected" value={formatDateTime(detail.link.lastDetectedAt)} />
          <ReadOnlyDetail label="Instances" value={String(detail.link.instanceCount)} />
        </div>
        {detail.link.disabledReason && (
          <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {detail.link.disabledReason}
          </div>
        )}
      </section>
      <InstancesTable instances={detail.instances} title="Link Usage" />
      {detail.activePolicy && <PolicyCard policy={detail.activePolicy} />}
    </>
  )
}

function InstancesView({ snapshot, linkId }: { snapshot: OutboundLinkStoreSnapshot; linkId?: string }) {
  const decodedLinkId = linkId ? decodeURIComponent(linkId) : ''
  const instances = decodedLinkId
    ? snapshot.instances.filter((instance) => instance.outboundLinkId === decodedLinkId)
    : snapshot.instances
  const title = decodedLinkId ? `Instances For ${decodedLinkId}` : 'All Outbound Link Instances'
  return <InstancesTable instances={instances} title={title} />
}

function InstancesTable({ instances, title }: { instances: OutboundLinkInstanceRecord[]; title: string }) {
  return (
    <section className="card overflow-hidden">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        <p className="text-sm text-neutral-600">Placement tracking across pages, navigation, footer, rich text, and theme fields.</p>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <Th>Anchor</Th>
              <Th>Page</Th>
              <Th>Field</Th>
              <Th>Status</Th>
              <Th>Render</Th>
              <Th>Detected</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {instances.map((instance) => (
              <tr key={instance.id} className="align-top hover:bg-neutral-50">
                <Td>
                  <div className="font-medium text-neutral-900">{instance.anchorText || 'No anchor text'}</div>
                  <div className="mt-1 break-words text-xs text-neutral-500">{instance.normalizedUrl}</div>
                </Td>
                <Td>{instance.pageId || instance.contentType}</Td>
                <Td>
                  <div>{instance.fieldName}</div>
                  <div className="mt-1 max-w-sm break-words font-mono text-xs text-neutral-500">{instance.locationPath}</div>
                </Td>
                <Td>{instance.status.replace(/_/g, ' ')}</Td>
                <Td>{formatRenderAction(instance.renderAction)}</Td>
                <Td>{formatDateTime(instance.lastDetectedAt)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function PoliciesView({ snapshot }: { snapshot: OutboundLinkStoreSnapshot }) {
  return (
    <div className="space-y-6">
      <section className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Policies</h2>
            <p className="mt-1 text-sm text-neutral-600">Tenant policy visibility only. Edits require a future write-action approval.</p>
          </div>
          <ReadOnlyActionButton label="Create Policy" />
        </div>
      </section>
      {snapshot.policies.map((policy) => <PolicyCard key={policy.id} policy={policy} />)}
    </div>
  )
}

function PolicyCard({ policy }: { policy: OutboundLinkPolicyRecord }) {
  return (
    <section className="card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">{policy.name}</h2>
          <p className="mt-1 text-sm text-neutral-600">{policy.id} / {policy.source}</p>
        </div>
        <ReadOnlyActionButton label="Edit Policy" />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ReadOnlyDetail label="Disabled Behavior" value={policy.defaultDisabledBehavior.replace(/_/g, ' ')} />
        <ReadOnlyDetail label="Target" value={policy.externalTargetBehavior} />
        <ReadOnlyDetail label="Rel" value={policy.defaultRel.join(', ')} />
        <ReadOnlyDetail label="Review New Domains" value={policy.reviewRequiredForNewDomains ? 'Yes' : 'No'} />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DomainList title="Allowed Domains" domains={policy.allowedDomains} tone="green" />
        <DomainList title="Pending Review" domains={policy.pendingReviewDomains} tone="amber" />
        <DomainList title="Blocked Domains" domains={policy.blockedDomains} tone="red" />
      </div>
    </section>
  )
}

function ScanRunsView({ scanRuns }: { scanRuns: OutboundLinkScanRunRecord[] }) {
  return (
    <section className="card overflow-hidden">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Scan Runs</h2>
          <p className="mt-1 text-sm text-neutral-600">Read-only scan history from the local fixture provider.</p>
        </div>
        <ReadOnlyActionButton label="Start Scan" />
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <Th>Run</Th>
              <Th>Status</Th>
              <Th>Mode</Th>
              <Th>Pages</Th>
              <Th>Links</Th>
              <Th>New</Th>
              <Th>Stale</Th>
              <Th>Completed</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {scanRuns.map((run) => (
              <tr key={run.id} className="hover:bg-neutral-50">
                <Td>{run.id}</Td>
                <Td>{run.status.replace(/_/g, ' ')}</Td>
                <Td>{run.mode}</Td>
                <Td>{run.pagesScanned}</Td>
                <Td>{run.linksFound}</Td>
                <Td>{run.newLinksFound}</Td>
                <Td>{run.staleInstancesFound}</Td>
                <Td>{formatDateTime(run.completedAt)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function AuditView({ auditLogs }: { auditLogs: OutboundLinkAuditLogRecord[] }) {
  return (
    <section className="card">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-neutral-900">Audit Log</h2>
        <p className="text-sm text-neutral-600">Governance history for registry, policy, and scan-run events.</p>
      </div>
      <div className="mt-5 space-y-3">
        {auditLogs.map((event) => (
          <div key={event.id} className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="font-medium text-neutral-900">{event.action.replace(/_/g, ' ')}</div>
                <div className="mt-1 text-sm text-neutral-600">{event.recordType}: {event.recordId}</div>
                {event.reason && <div className="mt-2 text-sm text-neutral-700">{event.reason}</div>}
              </div>
              <div className="text-sm text-neutral-500">{formatDateTime(event.createdAt)}</div>
            </div>
            <div className="mt-2 text-xs text-neutral-500">{event.actor} / {event.mode}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ReviewQueueView({ snapshot }: { snapshot: OutboundLinkStoreSnapshot }) {
  const reviewLinks = listReviewQueue(snapshot)
  return (
    <section className="card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Review Queue</h2>
          <p className="mt-1 text-sm text-neutral-600">Links requiring operator review before future status or policy changes.</p>
        </div>
        <ReadOnlyActionButton label="Resolve Selected" />
      </div>
      <div className="mt-5 space-y-3">
        {reviewLinks.map((link) => (
          <div key={link.id} className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="font-medium text-amber-950">{link.domain}</div>
                <div className="mt-1 break-words text-sm text-amber-900">{link.normalizedUrl}</div>
                <div className="mt-2 text-xs text-amber-800">{link.policyStatus}; {link.pendingReviewCount} placement review item(s)</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/dashboard/outbound-links/${encodeURIComponent(link.id)}`} className="btn btn-secondary">
                  View Detail
                </Link>
                <ReadOnlyActionButton label="Approve" />
                <ReadOnlyActionButton label="Block" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ExportsView({ statuses, compact = false }: { statuses: OutboundLinkExportStatus[]; compact?: boolean }) {
  return (
    <section className="card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">{compact ? 'Backup And Bundle Status' : 'Backup, Onboarding, And Tenant Bundle Status'}</h2>
          <p className="mt-1 text-sm text-neutral-600">Read-only compatibility indicators for downstream operational packages.</p>
        </div>
        <ReadOnlyActionButton label="Generate Export" />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        {statuses.map((status) => (
          <div key={status.label} className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="font-medium text-neutral-900">{status.label}</div>
              <ExportStatusBadge status={status.status} />
            </div>
            <p className="mt-2 text-sm text-neutral-600">{status.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ReadOnlyBanner({ snapshot }: { snapshot: OutboundLinkStoreSnapshot }) {
  return (
    <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
      <div className="flex items-start gap-3">
        <Lock className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <div>
          <div className="font-semibold">Read-only Admin foundation</div>
          <div className="mt-1">
            Local fixture mode for tenant {snapshot.tenantKey}. No write actions, crawler execution, production renderer integration, or protected configuration reads are wired.
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  tone = 'neutral',
}: {
  icon: ReactNode
  label: string
  value: number
  tone?: 'neutral' | 'amber' | 'red'
}) {
  const toneClass = tone === 'amber'
    ? 'border-amber-200 bg-amber-50 text-amber-950'
    : tone === 'red'
      ? 'border-red-200 bg-red-50 text-red-950'
      : 'border-neutral-100 bg-white text-neutral-900'

  return (
    <div className={`rounded-lg border p-5 shadow-sm ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-neutral-500">{icon}</div>
      </div>
      <div className="mt-1 text-sm font-medium">{label}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: OutboundLinkStatus }) {
  const className = status === 'active'
    ? 'bg-green-100 text-green-800'
    : status === 'disabled'
      ? 'bg-neutral-200 text-neutral-800'
      : status === 'pending_review'
        ? 'bg-amber-100 text-amber-900'
        : 'bg-red-100 text-red-800'

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>
      {statusLabels[status]}
    </span>
  )
}

function ExportStatusBadge({ status }: { status: OutboundLinkExportStatus['status'] }) {
  const label = status.replace(/_/g, ' ')
  const className = status === 'included' || status === 'ready'
    ? 'bg-green-100 text-green-800'
    : status === 'blocked'
      ? 'bg-red-100 text-red-800'
      : 'bg-neutral-100 text-neutral-700'

  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>{label}</span>
}

function DomainList({ title, domains, tone }: { title: string; domains: string[]; tone: 'green' | 'amber' | 'red' }) {
  const toneClass = tone === 'green'
    ? 'border-green-200 bg-green-50 text-green-900'
    : tone === 'amber'
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : 'border-red-200 bg-red-50 text-red-900'

  return (
    <div className={`rounded-lg border px-4 py-3 ${toneClass}`}>
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {domains.length > 0 ? domains.map((domain) => (
          <span key={domain} className="rounded bg-white/70 px-2 py-1 text-xs font-medium">{domain}</span>
        )) : <span className="text-xs">None recorded</span>}
      </div>
    </div>
  )
}

function ReadOnlyActionButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      className="inline-flex cursor-not-allowed items-center gap-2 rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-500"
      title="Future approval required before write actions are enabled."
    >
      <Lock className="h-4 w-4" />
      {label}
    </button>
  )
}

function ReadOnlyInlineAction({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      className="cursor-not-allowed text-xs font-medium text-neutral-400"
      title="Future approval required before write actions are enabled."
    >
      {label}
    </button>
  )
}

function ReadOnlyDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 break-words text-sm font-medium text-neutral-900">{value || 'not recorded'}</div>
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

function Th({ children }: { children: ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">{children}</th>
}

function Td({ children }: { children: ReactNode }) {
  return <td className="max-w-sm px-4 py-3 text-neutral-700">{children}</td>
}

function formatRenderAction(value: string) {
  return value.replace(/_/g, ' ')
}

function formatDateTime(value: string | null) {
  if (!value) return 'not recorded'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
