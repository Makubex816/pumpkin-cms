'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Database,
  Eye,
  FileSearch,
  Filter,
  Lock,
  Search,
  ShieldCheck,
  TableProperties,
} from 'lucide-react'
import {
  AUDIT_JOB_LEDGER_PROVIDER_MODE,
  defaultAuditJobLedgerQuery,
  getAuditJobLedgerAdminSnapshot,
  getAuditJobLedgerRecordById,
  getAuditJobLedgerStateCounts,
  queryAuditJobLedgerRecords,
} from '@/lib/audit-jobs/mock-provider'
import type {
  AuditJobLedgerAdminRecord,
  AuditJobLedgerAdminSnapshot,
  AuditJobLedgerPanel,
  AuditJobLedgerQueryState,
  AuditJobLedgerRecordKind,
  AuditJobLedgerState,
} from '@/lib/audit-jobs/types'

const stateStyles: Record<AuditJobLedgerState, string> = {
  read_only: 'border-sky-200 bg-sky-50 text-sky-800',
  complete: 'border-green-200 bg-green-50 text-green-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  blocked: 'border-red-200 bg-red-50 text-red-800',
  deferred: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  missing_evidence: 'border-amber-200 bg-amber-50 text-amber-900',
  invalid_ledger: 'border-red-200 bg-red-50 text-red-800',
  future_boundary_required: 'border-purple-200 bg-purple-50 text-purple-800',
}

const recordKindLabels: Record<AuditJobLedgerRecordKind, string> = {
  audit_event: 'Audit Event',
  job_run: 'Job Run',
  promotion_gate: 'Promotion Gate',
  evidence_binding: 'Evidence Binding',
  trace_id: 'Trace ID',
}

export function AuditJobLedgerAdminView() {
  const snapshot = useMemo(() => getAuditJobLedgerAdminSnapshot(), [])
  const [query, setQuery] = useState<AuditJobLedgerQueryState>(defaultAuditJobLedgerQuery)
  const records = useMemo(() => queryAuditJobLedgerRecords(snapshot, query), [snapshot, query])
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const selectedRecord = getAuditJobLedgerRecordById(snapshot, selectedRecordId) ?? records[0] ?? null
  const stateCounts = useMemo(() => getAuditJobLedgerStateCounts(records), [records])

  return (
    <div className="space-y-6" data-v2-phase="V2.9.4" data-provider-mode={AUDIT_JOB_LEDGER_PROVIDER_MODE}>
      <header className="card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Read-only governance view</p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">Audit Jobs / Production Promotion</h1>
            <p className="mt-2 max-w-4xl text-sm text-neutral-600">
              Fixture-backed Admin prototype for {snapshot.activeGovernanceLane}. Source data is the validated local combined V2.8 ledger, rendered without live APIs or provider calls.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {snapshot.futureActions.map((action) => (
              <button
                key={action.id}
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-500"
                title={action.reason}
              >
                <Lock className="h-4 w-4" />
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <ReadOnlySafetyBanner snapshot={snapshot} />
      </header>

      <SummaryStrip snapshot={snapshot} />
      <PanelGrid panels={snapshot.viewerModel.panels} />
      <OperationalCoverage snapshot={snapshot} />

      <section className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Ledger Explorer</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Search, filter, and sort local audit events, job runs, promotion gates, evidence bindings, and trace IDs.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600 sm:grid-cols-4">
            <MiniCount label="Complete" value={stateCounts.complete ?? 0} />
            <MiniCount label="Deferred" value={stateCounts.deferred ?? 0} />
            <MiniCount label="Blocked" value={stateCounts.blocked ?? 0} />
            <MiniCount label="Records" value={records.length} />
          </div>
        </div>

        <LedgerFilters query={query} onChange={setQuery} />

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.55fr)]">
          <LedgerRecordTable records={records} selectedRecordId={selectedRecord?.id ?? null} onSelect={setSelectedRecordId} />
          <DetailPanel record={selectedRecord} snapshot={snapshot} />
        </div>
      </section>
    </div>
  )
}

function ReadOnlySafetyBanner({ snapshot }: { snapshot: AuditJobLedgerAdminSnapshot }) {
  const boundary = snapshot.viewerModel.securityBoundary

  return (
    <div className="mt-5 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <div className="font-semibold">No write actions. Fixture-backed local viewer only.</div>
            <div className="mt-1">
              Google/Search Console/indexing deferred hard stop. Deployment closed. Contact-form POST closed after V2.8.19 verification.
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <BoundaryPill label="Local" value={boundary.localOnly ? 'yes' : 'no'} />
          <BoundaryPill label="Writes" value={boundary.openFlags.length === 0 ? 'closed' : 'open'} />
          <BoundaryPill label="Open flags" value={String(boundary.openFlags.length)} />
          <BoundaryPill label="Provider" value={AUDIT_JOB_LEDGER_PROVIDER_MODE} />
        </div>
      </div>
    </div>
  )
}

function SummaryStrip({ snapshot }: { snapshot: AuditJobLedgerAdminSnapshot }) {
  const summary = snapshot.viewerModel.summary

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Audit Events" value={summary.counts.auditEvents} detail={summary.v2Reference ?? 'V2 reference missing'} icon={<FileSearch className="h-5 w-5" />} />
      <MetricCard label="Job Runs" value={summary.counts.jobRuns} detail={summary.releaseState} icon={<TableProperties className="h-5 w-5" />} />
      <MetricCard label="Promotion Gates" value={summary.counts.promotionGates} detail={`${summary.counts.blockers} blockers`} icon={<CheckCircle2 className="h-5 w-5" />} />
      <MetricCard label="Trace IDs" value={summary.counts.traceEntries} detail={`${snapshot.viewerModel.traceIds.correlationIds.length} correlation`} icon={<Database className="h-5 w-5" />} />
    </section>
  )
}

function PanelGrid({ panels }: { panels: AuditJobLedgerPanel[] }) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {panels.map((panel) => (
        <div key={panel.id} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-sm font-semibold text-neutral-900">{panel.title}</h2>
            <StateBadge state={panel.state} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-600">
            {Object.entries(panel.counts).map(([key, value]) => (
              <span key={key} className="rounded-full bg-neutral-100 px-2 py-1">
                {key}: {value}
              </span>
            ))}
          </div>
          <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sky-700">
            <Lock className="h-3.5 w-3.5" />
            {panel.safetyLabel}
          </div>
        </div>
      ))}
    </section>
  )
}

function OperationalCoverage({ snapshot }: { snapshot: AuditJobLedgerAdminSnapshot }) {
  const warning = snapshot.viewerModel.warnings[0]
  const nextGateLabels = snapshot.viewerModel.nextGates.map((gate) => gate.label)

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-900">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 className="h-4 w-4" />
          Runtime QA
        </div>
        <p className="mt-2 text-sm">Runtime QA revalidation is complete from the local V2.8.19 ledger evidence.</p>
      </div>
      <div className="rounded-lg border border-neutral-200 bg-white p-4 text-neutral-800">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Database className="h-4 w-4" />
          Resource Registry / Provider Profile
        </div>
        <p className="mt-2 text-sm">Registry and provider profile evidence is visible as read-only promotion context.</p>
      </div>
      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-indigo-900">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <AlertTriangle className="h-4 w-4" />
          Indexing Deferred
        </div>
        <p className="mt-2 text-sm">{warning?.message ?? 'Indexing state unavailable.'}</p>
      </div>
      <div className="rounded-lg border border-neutral-200 bg-white p-4 text-neutral-800">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Eye className="h-4 w-4" />
          Outbound Link Manager
        </div>
        <p className="mt-2 text-sm">OLM publish gate evidence is carried into promotion governance with no live outbound checks.</p>
      </div>
      <div className="rounded-lg border border-neutral-200 bg-white p-4 text-neutral-800">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4" />
          Backup Center
        </div>
        <p className="mt-2 text-sm">Backup evidence is bound from the V2.9.1 production promotion planning package.</p>
      </div>
      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-purple-900">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Ban className="h-4 w-4" />
          Blockers and Next Gates
        </div>
        <ul className="mt-2 space-y-1 text-sm">
          {nextGateLabels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function LedgerFilters({
  query,
  onChange,
}: {
  query: AuditJobLedgerQueryState
  onChange: (query: AuditJobLedgerQueryState) => void
}) {
  return (
    <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(260px,1fr)_180px_180px_190px_120px]">
      <label className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2">
        <Search className="h-4 w-4 text-neutral-500" />
        <input
          value={query.search}
          onChange={(event) => onChange({ ...query, search: event.target.value })}
          placeholder="Search trace, evidence, gates"
          className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
        />
      </label>

      <Select
        icon={<Filter className="h-4 w-4" />}
        value={query.kind}
        onChange={(value) => onChange({ ...query, kind: value as AuditJobLedgerQueryState['kind'] })}
      >
        <option value="all">All records</option>
        <option value="audit_event">Audit events</option>
        <option value="job_run">Job runs</option>
        <option value="promotion_gate">Promotion gates</option>
        <option value="evidence_binding">Evidence</option>
        <option value="trace_id">Trace IDs</option>
      </Select>

      <Select
        icon={<AlertTriangle className="h-4 w-4" />}
        value={query.state}
        onChange={(value) => onChange({ ...query, state: value as AuditJobLedgerQueryState['state'] })}
      >
        <option value="all">All states</option>
        <option value="complete">Complete</option>
        <option value="deferred">Deferred</option>
        <option value="blocked">Blocked</option>
        <option value="warning">Warning</option>
        <option value="future_boundary_required">Future boundary</option>
      </Select>

      <Select
        icon={<TableProperties className="h-4 w-4" />}
        value={query.sortField}
        onChange={(value) => onChange({ ...query, sortField: value as AuditJobLedgerQueryState['sortField'] })}
      >
        <option value="timestamp">Time</option>
        <option value="label">Label</option>
        <option value="kind">Kind</option>
        <option value="state">State</option>
      </Select>

      <button
        type="button"
        onClick={() => onChange({ ...query, sortDirection: query.sortDirection === 'asc' ? 'desc' : 'asc' })}
        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:border-primary-200 hover:bg-primary-50"
      >
        {query.sortDirection === 'asc' ? 'Ascending' : 'Descending'}
      </button>
    </div>
  )
}

function LedgerRecordTable({
  records,
  selectedRecordId,
  onSelect,
}: {
  records: AuditJobLedgerAdminRecord[]
  selectedRecordId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200">
      <div className="max-h-[660px] overflow-auto">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="sticky top-0 bg-neutral-50">
            <tr>
              <Th>Record</Th>
              <Th>Kind</Th>
              <Th>State</Th>
              <Th>Evidence</Th>
              <Th>Trace</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {records.map((record) => {
              const selected = record.id === selectedRecordId
              return (
                <tr
                  key={record.id}
                  className={selected ? 'bg-sky-50 align-top' : 'align-top hover:bg-neutral-50'}
                >
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => onSelect(record.id)} className="text-left">
                      <span className="font-medium text-neutral-900">{record.label}</span>
                      <span className="mt-1 block max-w-xl truncate text-xs text-neutral-500">{record.sourceId}</span>
                    </button>
                  </td>
                  <Td>{recordKindLabels[record.kind]}</Td>
                  <Td><StateBadge state={record.state} /></Td>
                  <Td>{record.evidenceRefs.length}</Td>
                  <Td>{record.traceRefs.length}</Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DetailPanel({
  record,
  snapshot,
}: {
  record: AuditJobLedgerAdminRecord | null
  snapshot: AuditJobLedgerAdminSnapshot
}) {
  if (!record) {
    return (
      <aside className="rounded-lg border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
        Select a ledger row to inspect local evidence and trace context.
      </aside>
    )
  }

  return (
    <aside className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{recordKindLabels[record.kind]}</p>
          <h2 className="mt-1 text-lg font-semibold text-neutral-900">{record.label}</h2>
        </div>
        <StateBadge state={record.state} />
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <ReadOnlyDetail label="Source ID" value={record.sourceId} />
        <ReadOnlyDetail label="Status" value={record.statusText} />
        <ReadOnlyDetail label="Timestamp" value={formatDateTime(record.timestamp)} />
        <ReadOnlyDetail label="Description" value={record.description || 'No description recorded.'} />
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-neutral-900">Evidence</h3>
        <TokenList values={record.evidenceRefs} emptyLabel="No direct evidence refs." />
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-neutral-900">Trace Context</h3>
        <TokenList values={record.traceRefs} emptyLabel="No direct trace refs." />
      </div>

      <div className="mt-5 rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
        <div className="flex items-center gap-2 font-semibold">
          <Lock className="h-4 w-4" />
          Read-only detail panel
        </div>
        <p className="mt-1">
          This view reads {snapshot.fixturePath} through the local Admin fixture provider and exposes no mutation handler.
        </p>
      </div>
    </aside>
  )
}

function MetricCard({ label, value, detail, icon }: { label: string; value: number; detail: string; icon: ReactNode }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="rounded-lg bg-sky-50 p-2 text-sky-700">{icon}</div>
        <div className="text-2xl font-bold text-neutral-900">{value}</div>
      </div>
      <div className="mt-3 text-sm font-semibold text-neutral-900">{label}</div>
      <div className="mt-1 break-words text-xs text-neutral-500">{detail}</div>
    </div>
  )
}

function StateBadge({ state }: { state: AuditJobLedgerState }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${stateStyles[state]}`}>
      {state.replace(/_/g, ' ')}
    </span>
  )
}

function BoundaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-sky-200 bg-white/80 px-2 py-1">
      <div className="font-semibold">{label}</div>
      <div className="break-words">{value}</div>
    </div>
  )
}

function MiniCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
      <div className="text-base font-bold text-neutral-900">{value}</div>
      <div>{label}</div>
    </div>
  )
}

function Select({
  icon,
  value,
  onChange,
  children,
}: {
  icon: ReactNode
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2">
      <span className="text-neutral-500">{icon}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
      >
        {children}
      </select>
    </label>
  )
}

function ReadOnlyDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 break-words text-sm text-neutral-800">{value}</div>
    </div>
  )
}

function TokenList({ values, emptyLabel }: { values: string[]; emptyLabel: string }) {
  if (values.length === 0) {
    return <p className="mt-2 text-sm text-neutral-500">{emptyLabel}</p>
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {values.slice(0, 12).map((value) => (
        <span key={value} className="max-w-full break-words rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
          {value}
        </span>
      ))}
      {values.length > 12 && (
        <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-700">+{values.length - 12} more</span>
      )}
    </div>
  )
}

function Th({ children }: { children: ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">{children}</th>
}

function Td({ children }: { children: ReactNode }) {
  return <td className="px-4 py-3 text-neutral-700">{children}</td>
}

function formatDateTime(value: string | null) {
  if (!value) return 'not timestamped'
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
