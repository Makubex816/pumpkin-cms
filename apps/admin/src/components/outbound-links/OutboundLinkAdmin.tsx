'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import {
  createLocalWriteActionResponse,
  createOutboundLinkEnvelope,
  defaultOutboundLinkQuery,
  getOutboundLinkAdminSnapshot,
  getOutboundLinkDetail,
  getOutboundLinkDomains,
  getOutboundLinkExportStatuses,
  getOutboundLinkProviderReadiness,
  listOutboundLinks,
  listReviewQueue,
  normalizeKey,
  OUTBOUND_LINK_PROVIDER_MODE_MESSAGE,
} from '@/lib/outbound-links/mock-provider'
import type {
  OutboundLinkAuditLogRecord,
  OutboundLinkDetailResult,
  OutboundLinkExportStatus,
  OutboundLinkInstanceRecord,
  OutboundLinkPolicyRecord,
  OutboundLinkProviderReadiness,
  OutboundLinkQuickFilter,
  OutboundLinkQueryState,
  OutboundLinkRecord,
  OutboundLinkScanRunRecord,
  OutboundLinkSeverity,
  OutboundLinkStatus,
  OutboundLinkStoreSnapshot,
  OutboundLinkWriteAction,
  OutboundLinkWriteActionResponse,
} from '@/lib/outbound-links/types'
import {
  Activity,
  AlertTriangle,
  Ban,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  Filter,
  History,
  Link2,
  ListChecks,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
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
  policy_conflict: 'Policy Conflict',
}

const quickFilters: Array<{ value: OutboundLinkQuickFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'disabled', label: 'Disabled' },
  { value: 'stale', label: 'Stale' },
  { value: 'broken', label: 'Broken' },
  { value: 'new', label: 'New' },
  { value: 'policy_violations', label: 'Policy Violations' },
]

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
              Read-only registry visibility for {tenantLabel}. The Admin view uses local fixture data with staging-backed read-only provider readiness from the verified V2.2 staging readback contract.
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
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null)
  const [localWriteResponse, setLocalWriteResponse] = useState<OutboundLinkWriteActionResponse | null>(null)
  const domains = useMemo(() => getOutboundLinkDomains(snapshot), [snapshot])
  const list = useMemo(() => listOutboundLinks(snapshot, query), [snapshot, query])
  const selectedDetail = selectedLinkId ? getOutboundLinkDetail(snapshot, selectedLinkId) : null
  const envelope = useMemo(
    () => createOutboundLinkEnvelope(snapshot.tenantKey, snapshot.siteKey, { items: list.items }, list.pagination, {
      domain: query.domain,
      status: query.status,
      quickFilter: query.quickFilter,
      reviewOnly: String(query.reviewOnly),
      search: query.search || null,
    }),
    [snapshot, list, query],
  )
  const runLocalSandboxAction = (action: OutboundLinkWriteAction, link?: OutboundLinkRecord | null) => {
    const targetLink = link ?? selectedDetail?.link ?? list.items[0] ?? snapshot.links[0] ?? null
    setLocalWriteResponse(createLocalWriteActionResponse(snapshot, { action, link: targetLink }))
  }

  return (
    <>
      <ActionCenter
        snapshot={snapshot}
        onQuickFilter={(quickFilter) => setQuery({ ...query, quickFilter, page: 1 })}
        onLocalAction={runLocalSandboxAction}
      />
      {localWriteResponse && <LocalWriteTracePanel response={localWriteResponse} onClear={() => setLocalWriteResponse(null)} />}
      <OperationalSummaryGrid snapshot={snapshot} />
      <section className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Registry Review Queue</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Triage tenant-scoped outbound links for {tenantLabel}. Select any row to inspect its source, policy, scan, and audit context.
            </p>
          </div>
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
            Envelope: {envelope.code} / {envelope.meta.mode}
          </div>
        </div>
        <QuickFilterBar query={query} onChange={setQuery} />
        <OutboundLinkFilters query={query} domains={domains} onChange={setQuery} />
        <OutboundLinksTable links={list.items} onSelectLink={setSelectedLinkId} selectedLinkId={selectedLinkId} />
        <PaginationControls query={query} pagination={list.pagination} onChange={setQuery} />
      </section>
      <ExportsView statuses={getOutboundLinkExportStatuses(snapshot)} compact />
      <LinkDetailDrawer
        detail={selectedDetail}
        snapshot={snapshot}
        onClose={() => setSelectedLinkId(null)}
        onLocalAction={runLocalSandboxAction}
      />
    </>
  )
}

function ActionCenter({
  snapshot,
  onQuickFilter,
  onLocalAction,
}: {
  snapshot: OutboundLinkStoreSnapshot
  onQuickFilter: (filter: OutboundLinkQuickFilter) => void
  onLocalAction: (action: OutboundLinkWriteAction) => void
}) {
  const summary = snapshot.dashboardSummary
  const actionItems = [
    {
      label: 'Review Required',
      count: summary.pendingReviewCount,
      detail: 'New or pending domains need owner review.',
      tone: 'amber' as const,
      filter: 'pending' as OutboundLinkQuickFilter,
    },
    {
      label: 'Blocked Domains',
      count: summary.domainBlockedLinkCount,
      detail: 'Blocked domains are hidden or downgraded at render time.',
      tone: 'red' as const,
      filter: 'blocked' as OutboundLinkQuickFilter,
    },
    {
      label: 'Stale Placements',
      count: summary.staleInstanceCount,
      detail: 'Placements no longer detected in the latest scan.',
      tone: 'amber' as const,
      filter: 'stale' as OutboundLinkQuickFilter,
    },
    {
      label: 'Disabled Links',
      count: summary.disabledLinkCount,
      detail: 'Disabled links remain visible for audit and restore.',
      tone: 'neutral' as const,
      filter: 'disabled' as OutboundLinkQuickFilter,
    },
    {
      label: 'Policy Conflicts',
      count: summary.policyConflictCount,
      detail: 'Fixture records where policy and source intent disagree.',
      tone: 'purple' as const,
      filter: 'policy_violations' as OutboundLinkQuickFilter,
    },
  ]

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
      <div className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Action Center</p>
            <h2 className="mt-1 text-2xl font-bold text-neutral-900">What needs attention</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Prioritized read-only triage for outbound link governance. Future actions are visible but locked.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LocalSandboxActionButton label="Run Scan" onClick={() => onLocalAction('createScanRun')} />
            <LocalSandboxActionButton label="Bulk Resolve" onClick={() => onLocalAction('bulkDomainRequireReview')} />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          {actionItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onQuickFilter(item.filter)}
              className={`rounded-lg border p-4 text-left transition-colors hover:bg-white ${toneCardClass(item.tone)}`}
            >
              <div className="text-2xl font-bold">{item.count}</div>
              <div className="mt-1 text-sm font-semibold">{item.label}</div>
              <div className="mt-2 text-xs leading-5 opacity-80">{item.detail}</div>
            </button>
          ))}
        </div>
      </div>
      <RecentAuditActivity snapshot={snapshot} />
    </section>
  )
}

function LocalWriteTracePanel({
  response,
  onClear,
}: {
  response: OutboundLinkWriteActionResponse
  onClear: () => void
}) {
  return (
    <section className="card border-green-200 bg-green-50">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-green-700">Local Sandbox Trace</p>
          <h2 className="mt-1 text-lg font-semibold text-green-950">{response.action.replace(/([A-Z])/g, ' $1')}</h2>
          <p className="mt-1 text-sm text-green-900">{response.message}</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-2 rounded-md border border-green-300 bg-white px-3 py-2 text-sm font-medium text-green-900 hover:bg-green-100"
        >
          <X className="h-4 w-4" />
          Clear
        </button>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ReadOnlyDetail label="Request ID" value={response.requestId} />
        <ReadOnlyDetail label="Action ID" value={response.actionId} />
        <ReadOnlyDetail label="Correlation ID" value={response.correlationId} />
        <ReadOnlyDetail label="Provider Mode" value={response.providerMode} />
        <ReadOnlyDetail label="Actor" value={`${response.traceLog.actorIdentity} / ${response.traceLog.actorRole}`} />
        <ReadOnlyDetail label="Outcome" value={response.traceLog.outcome} />
        <ReadOnlyDetail label="Audit IDs" value={response.auditEventIds.join(', ')} />
        <ReadOnlyDetail label="Rollback ID" value={response.rollbackPlanId} />
        <ReadOnlyDetail label="Before Hash" value={response.beforeStateHash} />
        <ReadOnlyDetail label="After Hash" value={response.afterStateHash} />
        <ReadOnlyDetail label="Entity IDs" value={response.traceLog.entityIds.join(', ') || 'not recorded'} />
        <ReadOnlyDetail label="Affected Pages" value={response.publishingImpact.affectedPageIds.join(', ') || 'none'} />
      </div>
      <div className="mt-4 rounded-lg border border-green-200 bg-white px-4 py-3 text-sm text-green-950">
        {response.publishingImpact.summary} Affected instances: {response.publishingImpact.affectedInstanceIds.join(', ') || 'none'}.
      </div>
    </section>
  )
}

function OperationalSummaryGrid({ snapshot }: { snapshot: OutboundLinkStoreSnapshot }) {
  const summary = snapshot.dashboardSummary
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <LastScanCard snapshot={snapshot} />
      <RegistryActivityCard snapshot={snapshot} />
      <DomainHealthCard snapshot={snapshot} />
    </section>
  )
}

function LastScanCard({ snapshot }: { snapshot: OutboundLinkStoreSnapshot }) {
  const scan = snapshot.dashboardSummary.lastScan
  return (
    <section className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Last Scan</p>
          <h2 className="mt-1 text-lg font-semibold text-neutral-900">{scan.status.replace(/_/g, ' ')}</h2>
        </div>
        <Clock3 className="h-5 w-5 text-neutral-500" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <ReadOnlyDetail label="Timestamp" value={formatDateTime(scan.timestamp)} />
        <ReadOnlyDetail label="Duration" value={`${scan.durationSeconds}s`} />
        <ReadOnlyDetail label="Links Scanned" value={String(scan.linksScanned)} />
        <ReadOnlyDetail label="New Links" value={String(scan.newLinks)} />
        <ReadOnlyDetail label="Violations" value={String(scan.violations)} />
        <ReadOnlyDetail label="Run ID" value={scan.id} />
      </div>
    </section>
  )
}

function RegistryActivityCard({ snapshot }: { snapshot: OutboundLinkStoreSnapshot }) {
  const activitySummary = snapshot.dashboardSummary.registryActivity
  return (
    <section className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Registry Activity</p>
          <h2 className="mt-1 text-lg font-semibold text-neutral-900">Recent movement</h2>
        </div>
        <BarChart3 className="h-5 w-5 text-neutral-500" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <ReadOnlyDetail label="Today" value={signedCount(activitySummary.todayDelta)} />
        <ReadOnlyDetail label="This Week" value={signedCount(activitySummary.weekDelta)} />
        <ReadOnlyDetail label="This Month" value={signedCount(activitySummary.monthDelta)} />
        <ReadOnlyDetail label="Domains Added" value={String(activitySummary.domainsAdded)} />
        <ReadOnlyDetail label="Domains Removed" value={String(activitySummary.domainsRemoved)} />
      </div>
    </section>
  )
}

function DomainHealthCard({ snapshot }: { snapshot: OutboundLinkStoreSnapshot }) {
  const health = snapshot.dashboardSummary.domainHealth
  return (
    <section className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Domain Health</p>
          <h2 className="mt-1 text-lg font-semibold text-neutral-900">Policy posture</h2>
        </div>
        <ShieldCheck className="h-5 w-5 text-neutral-500" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <ReadOnlyDetail label="Allowed" value={String(health.allowedDomains)} />
        <ReadOnlyDetail label="Pending" value={String(health.pendingDomains)} />
        <ReadOnlyDetail label="Blocked" value={String(health.blockedDomains)} />
        <ReadOnlyDetail label="Broken" value={String(health.brokenDomains)} />
        <ReadOnlyDetail label="Suspicious" value={String(health.suspiciousDomains)} />
      </div>
    </section>
  )
}

function RecentAuditActivity({ snapshot }: { snapshot: OutboundLinkStoreSnapshot }) {
  return (
    <section className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Recent Activity</p>
          <h2 className="mt-1 text-lg font-semibold text-neutral-900">Latest registry events</h2>
        </div>
        <Activity className="h-5 w-5 text-neutral-500" />
      </div>
      <div className="mt-4 space-y-3">
        {snapshot.auditLogs.slice(0, 3).map((event) => (
          <div key={event.id} className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
            <div className="text-sm font-medium text-neutral-900">{event.action.replace(/_/g, ' ')}</div>
            <div className="mt-1 text-xs text-neutral-600">{event.recordType}: {event.recordId}</div>
            <div className="mt-1 text-xs text-neutral-500">{formatDateTime(event.createdAt)}</div>
          </div>
        ))}
      </div>
    </section>
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

function QuickFilterBar({
  query,
  onChange,
}: {
  query: OutboundLinkQueryState
  onChange: (query: OutboundLinkQueryState) => void
}) {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {quickFilters.map((filter) => {
        const isActive = query.quickFilter === filter.value
        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange({ ...query, quickFilter: filter.value, page: 1 })}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'border-primary-300 bg-primary-50 text-primary-800'
                : 'border-neutral-200 bg-white text-neutral-700 hover:border-primary-200 hover:bg-primary-50'
            }`}
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}

function OutboundLinksTable({
  links,
  onSelectLink,
  selectedLinkId,
}: {
  links: OutboundLinkRecord[]
  onSelectLink: (linkId: string) => void
  selectedLinkId: string | null
}) {
  if (links.length === 0) {
    return <p className="mt-5 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-600">No outbound links match the current filters.</p>
  }

  return (
    <div className="mt-5 overflow-x-auto">
      <table className="min-w-full divide-y divide-neutral-200 text-sm">
        <thead className="bg-neutral-50">
          <tr>
            <Th>URL</Th>
            <Th>Risk</Th>
            <Th>Domain</Th>
            <Th>Status</Th>
            <Th>Source</Th>
            <Th>Owner</Th>
            <Th>Policy</Th>
            <Th>Last Detected</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 bg-white">
          {links.map((link) => (
            <tr
              key={link.id}
              onClick={() => onSelectLink(link.id)}
              className={`cursor-pointer align-top transition-colors hover:bg-neutral-50 ${
                selectedLinkId === link.id ? 'bg-primary-50/70' : ''
              }`}
            >
              <Td>
                <div className="max-w-md break-words font-medium text-neutral-900">{link.normalizedUrl}</div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-neutral-500">
                  <span>{link.id}</span>
                  <span>{link.instanceCount} placement{link.instanceCount === 1 ? '' : 's'}</span>
                </div>
              </Td>
              <Td>
                <SeverityBadge severity={link.severity} />
                <div className="mt-1 max-w-[12rem] text-xs text-neutral-500">{link.riskReason}</div>
              </Td>
              <Td>{link.domain}</Td>
              <Td>
                <StatusBadge status={link.status} />
                {link.isNew && <div className="mt-1 text-xs font-medium text-blue-700">New in latest scan</div>}
              </Td>
              <Td>
                <div className="font-medium text-neutral-900">{link.sourceContent}</div>
                <div className="mt-1 text-xs text-neutral-500">{link.sourceType}</div>
              </Td>
              <Td>{link.owner}</Td>
              <Td>
                <div className="font-medium text-neutral-900">{link.policyStatus}</div>
                <div className="mt-1 text-xs text-neutral-500">{link.policyRuleReference}</div>
              </Td>
              <Td>{formatDateTime(link.lastDetectedAt)}</Td>
              <Td>
                <div className="flex flex-wrap items-center gap-2" onClick={(event) => event.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onSelectLink(link.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 hover:text-primary-900"
                  >
                    Open <ChevronRight className="h-3 w-3" />
                  </button>
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

function LinkDetailDrawer({
  detail,
  snapshot,
  onClose,
  onLocalAction,
}: {
  detail: OutboundLinkDetailResult | null
  snapshot: OutboundLinkStoreSnapshot
  onClose: () => void
  onLocalAction: (action: OutboundLinkWriteAction, link: OutboundLinkRecord) => void
}) {
  if (!detail) return null

  const linkAudit = snapshot.auditLogs.filter((event) => event.recordId === detail.link.id || event.recordId === snapshot.dashboardSummary.lastScan.id)
  const latestScan = snapshot.scanRuns[0] || null

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-neutral-950/30" role="dialog" aria-modal="true" aria-label="Outbound link detail">
      <aside className="h-full w-full max-w-2xl overflow-y-auto border-l border-neutral-200 bg-white shadow-xl">
        <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Read-only link detail</p>
              <h2 className="mt-1 break-words text-xl font-bold text-neutral-900">{detail.link.domain}</h2>
              <p className="mt-1 break-all text-sm text-neutral-600">{detail.link.normalizedUrl}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
              aria-label="Close outbound link detail"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={detail.link.status} />
            <SeverityBadge severity={detail.link.severity} />
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-700">
              {detail.link.owner}
            </span>
          </div>

          <section className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
            <h3 className="text-sm font-semibold text-neutral-900">Policy Explanation</h3>
            <p className="mt-2 text-sm text-neutral-700">{detail.link.policyExplanation}</p>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <ReadOnlyDetail label="Policy Status" value={detail.link.policyStatus} />
              <ReadOnlyDetail label="Rule Reference" value={detail.link.policyRuleReference} />
              <ReadOnlyDetail label="Render Action" value={formatRenderAction(detail.link.renderAction)} />
              <ReadOnlyDetail label="Risk Reason" value={detail.link.riskReason} />
            </div>
          </section>

          <section className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
            <h3 className="text-sm font-semibold text-neutral-900">Source Content</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <ReadOnlyDetail label="Source" value={detail.link.sourceContent} />
              <ReadOnlyDetail label="Type" value={detail.link.sourceType} />
              <ReadOnlyDetail label="Owner" value={detail.link.owner} />
              <ReadOnlyDetail label="First Detected" value={formatDateTime(detail.link.firstDetectedAt)} />
            </div>
          </section>

          <section className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
            <h3 className="text-sm font-semibold text-neutral-900">Instance Locations</h3>
            <div className="mt-3 space-y-3">
              {detail.instances.map((instance) => (
                <div key={instance.id} className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="font-medium text-neutral-900">{instance.sourceContent}</div>
                      <div className="mt-1 text-xs text-neutral-600">{instance.anchorText || 'No anchor text'} / {instance.fieldName}</div>
                    </div>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-neutral-700">{instance.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="mt-2 break-words font-mono text-xs text-neutral-500">{instance.locationPath}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
            <h3 className="text-sm font-semibold text-neutral-900">Scan History</h3>
            {latestScan ? (
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <ReadOnlyDetail label="Latest Run" value={latestScan.id} />
                <ReadOnlyDetail label="Status" value={latestScan.status.replace(/_/g, ' ')} />
                <ReadOnlyDetail label="Completed" value={formatDateTime(latestScan.completedAt)} />
                <ReadOnlyDetail label="Stale Found" value={String(latestScan.staleInstancesFound)} />
              </div>
            ) : (
              <p className="mt-2 text-sm text-neutral-600">No scan history recorded.</p>
            )}
          </section>

          <section className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
            <h3 className="text-sm font-semibold text-neutral-900">Audit History</h3>
            <div className="mt-3 space-y-3">
              {(linkAudit.length > 0 ? linkAudit : snapshot.auditLogs.slice(0, 2)).map((event) => (
                <div key={event.id} className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                  <div className="font-medium text-neutral-900">{event.action.replace(/_/g, ' ')}</div>
                  <div className="mt-1 text-xs text-neutral-600">{event.actor} / {formatDateTime(event.createdAt)}</div>
                  {event.reason && <div className="mt-2 text-sm text-neutral-700">{event.reason}</div>}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <h3 className="text-sm font-semibold text-blue-950">Future-Gated Actions</h3>
            <p className="mt-1 text-sm text-blue-900">Production writes remain disabled. Local/fake preflight records scoped trace, audit, rollback, and publishing-impact data.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <LocalSandboxActionButton label="Approve" onClick={() => onLocalAction('approveReviewDecision', detail.link)} />
              <LocalSandboxActionButton label="Block" onClick={() => onLocalAction('blockReviewDecision', detail.link)} />
              <LocalSandboxActionButton label="Ignore" onClick={() => onLocalAction('ignoreReviewDecision', detail.link)} />
              <LocalSandboxActionButton label="Disable" onClick={() => onLocalAction('setLinkStatus', detail.link)} />
              <LocalSandboxActionButton label="Restore" onClick={() => onLocalAction('restorePriorStatus', detail.link)} />
            </div>
          </section>
        </div>
      </aside>
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
          <h2 className="text-lg font-semibold text-neutral-900">{compact ? 'Registry Export Readiness' : 'Registry Export Package'}</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Admin-friendly export readiness for links, domains, policies, decisions, scan history, and audit context.
          </p>
        </div>
        <ReadOnlyActionButton label="Download Registry Export" />
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
  const readiness = getOutboundLinkProviderReadiness(snapshot)
  return (
    <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
      <div className="flex items-start gap-3">
        <Lock className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <div>
          <div className="font-semibold">Read-only Admin foundation</div>
          <div className="mt-1">
            Local fixture mode for tenant {snapshot.tenantKey} with {OUTBOUND_LINK_PROVIDER_MODE_MESSAGE.stagingProviderMode} readiness metadata. live-readonly/write profiles remain blocked; no write actions, crawler execution, production renderer integration, or protected configuration reads are wired.
          </div>
          <ProviderReadinessStrip readiness={readiness} />
        </div>
      </div>
    </div>
  )
}

function ProviderReadinessStrip({ readiness }: { readiness: OutboundLinkProviderReadiness }) {
  return (
    <div className="mt-3 grid grid-cols-1 gap-2 text-xs md:grid-cols-4">
      <ReadinessPill label="Provider" value={readiness.providerMode} />
      <ReadinessPill label="Execution" value={readiness.stagingExecutionStatus} />
      <ReadinessPill label="Readback" value={readiness.readbackStatus} />
      <ReadinessPill label="Live Writes" value="blocked" />
    </div>
  )
}

function ReadinessPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-blue-200 bg-white px-3 py-2">
      <div className="font-semibold text-blue-950">{label}</div>
      <div className="mt-0.5 text-blue-800">{value}</div>
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
        : status === 'policy_conflict'
          ? 'bg-purple-100 text-purple-800'
          : 'bg-red-100 text-red-800'

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>
      {statusLabels[status]}
    </span>
  )
}

function SeverityBadge({ severity }: { severity: OutboundLinkSeverity }) {
  const className = severity === 'low'
    ? 'bg-green-100 text-green-800'
    : severity === 'medium'
      ? 'bg-amber-100 text-amber-900'
      : severity === 'high'
        ? 'bg-orange-100 text-orange-800'
        : 'bg-red-100 text-red-800'
  const icon = severity === 'low'
    ? <CheckCircle2 className="h-3.5 w-3.5" />
    : <AlertTriangle className="h-3.5 w-3.5" />

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>
      {icon}
      {capitalize(severity)}
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

function toneCardClass(tone: 'neutral' | 'amber' | 'red' | 'purple') {
  if (tone === 'amber') return 'border-amber-200 bg-amber-50 text-amber-950'
  if (tone === 'red') return 'border-red-200 bg-red-50 text-red-950'
  if (tone === 'purple') return 'border-purple-200 bg-purple-50 text-purple-950'
  return 'border-neutral-200 bg-neutral-50 text-neutral-900'
}

function ReadOnlyActionButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      className="inline-flex cursor-not-allowed items-center gap-2 rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-500"
      title="Future production write approval required. Local sandbox preflight is available through the Phase 2H-12 CLI."
    >
      <Lock className="h-4 w-4" />
      {label}
    </button>
  )
}

function LocalSandboxActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md border border-green-200 bg-white px-3 py-2 text-sm font-medium text-green-800 hover:bg-green-50"
      title="Run local/fake sandbox preflight only."
    >
      <ShieldCheck className="h-4 w-4" />
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
      title="Future production write approval required. Local sandbox preflight is available through the Phase 2H-12 CLI."
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

function signedCount(value: number) {
  if (value > 0) return `+${value}`
  return String(value)
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
