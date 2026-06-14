'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Database,
  FileSearch,
  FileText,
  Filter,
  Layers,
  LifeBuoy,
  Lock,
  Package,
  RotateCcw,
  Search,
  ShieldCheck,
  TableProperties,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getImportIntakeAdminApiSnapshotWithFallback } from '@/lib/import-intake/api-provider'
import {
  IMPORT_INTAKE_API_PROVIDER_MODE,
  defaultImportIntakeQuery,
  getImportIntakeAdminSnapshot,
  getImportIntakePackageById,
  getImportIntakePackageOptions,
  queryImportIntakePackages,
  summarizePackageReadiness,
} from '@/lib/import-intake/mock-provider'
import type {
  ImportIntakeAdminPackage,
  ImportIntakeAdminSnapshot,
  ImportIntakePackageState,
  ImportIntakePreviewModel,
  ImportIntakeQueryState,
} from '@/lib/import-intake/types'

const stateStyles: Record<string, string> = {
  read_only: 'border-sky-200 bg-sky-50 text-sky-800',
  candidate: 'border-green-200 bg-green-50 text-green-800',
  ready: 'border-green-200 bg-green-50 text-green-800',
  production_published: 'border-green-200 bg-green-50 text-green-800',
  complete: 'border-green-200 bg-green-50 text-green-800',
  paused: 'border-amber-200 bg-amber-50 text-amber-900',
  paused_no_import: 'border-amber-200 bg-amber-50 text-amber-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  blocked: 'border-red-200 bg-red-50 text-red-800',
  deferred: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  future_boundary_required: 'border-purple-200 bg-purple-50 text-purple-800',
}

export function ImportIntakeAdminView() {
  const { token } = useAuth()
  const [snapshot, setSnapshot] = useState<ImportIntakeAdminSnapshot>(() => getImportIntakeAdminSnapshot())
  const [bridgeState, setBridgeState] = useState<'fixture' | 'loading' | 'api' | 'fallback'>('fixture')
  const [query, setQuery] = useState<ImportIntakeQueryState>(defaultImportIntakeQuery)
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(() => getImportIntakeAdminSnapshot().packages[0]?.summary.packageId ?? null)
  const [comparePackageId, setComparePackageId] = useState<string | null>(() => getImportIntakeAdminSnapshot().packages[1]?.summary.packageId ?? null)

  useEffect(() => {
    const config = readApiBridgeConfig()
    if (!config.enabled) {
      const localSnapshot = getImportIntakeAdminSnapshot()
      setSnapshot(localSnapshot)
      setBridgeState('fixture')
      return
    }

    let cancelled = false
    setBridgeState('loading')

    getImportIntakeAdminApiSnapshotWithFallback({
      apiBaseUrl: config.apiBaseUrl,
      authToken: token,
    }).then((nextSnapshot) => {
      if (cancelled) return
      setSnapshot(nextSnapshot)
      setBridgeState(nextSnapshot.fallback ? 'fallback' : 'api')
    })

    return () => {
      cancelled = true
    }
  }, [token])

  const packages = useMemo(() => queryImportIntakePackages(snapshot, query), [snapshot, query])
  const packageOptions = useMemo(() => getImportIntakePackageOptions(snapshot), [snapshot])
  const selectedPackage = getImportIntakePackageById(snapshot, selectedPackageId)
    ?? packages[0]
    ?? snapshot.packages[0]
    ?? null
  const comparePackage = getImportIntakePackageById(snapshot, comparePackageId)
    ?? snapshot.packages.find((pack) => pack.summary.packageId !== selectedPackage?.summary.packageId)
    ?? null

  return (
    <div
      className="space-y-6"
      data-v2-phase="V2.11.4"
      data-provider-mode={snapshot.providerMode}
      data-api-bridge-state={bridgeState}
    >
      <header className="card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Read-only intake preview</p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">Import Intake Preview</h1>
            <p className="mt-2 max-w-4xl text-sm text-neutral-600">
              {createHeaderDescription(snapshot, bridgeState)}
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

        <ReadOnlySafetyBanner snapshot={snapshot} bridgeState={bridgeState} />
      </header>

      <SummaryStrip snapshot={snapshot} />

      <section className="card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Package Candidates</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Ice remains the candidate package; Roller remains paused and no-import.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600 sm:grid-cols-4">
            <MiniCount label="Packages" value={snapshot.packages.length} />
            <MiniCount label="Ready" value={snapshot.packages.filter((pack) => pack.summary.readyForFutureImportExecution).length} />
            <MiniCount label="Paused" value={snapshot.packages.filter((pack) => pack.summary.importMode === 'paused_no_import').length} />
            <MiniCount label="No-go" value={snapshot.packages.reduce((count, pack) => count + pack.summary.counts.noGoConditions, 0)} />
          </div>
        </div>

        <PackageFilters snapshot={snapshot} query={query} onChange={setQuery} />

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
          <PackageTable
            packages={packages}
            selectedPackageId={selectedPackage?.summary.packageId ?? null}
            onSelect={setSelectedPackageId}
          />
          <PackageSelectionPanel
            snapshot={snapshot}
            selectedPackage={selectedPackage}
            comparePackage={comparePackage}
            packageOptions={packageOptions}
            comparePackageId={comparePackage?.summary.packageId ?? ''}
            onCompareChange={setComparePackageId}
          />
        </div>
      </section>

      {selectedPackage && (
        <DetailPanelGrid pack={selectedPackage} comparePackage={comparePackage} snapshot={snapshot} />
      )}
    </div>
  )
}

function readApiBridgeConfig() {
  if (typeof window === 'undefined') {
    return { enabled: false, apiBaseUrl: undefined }
  }

  const searchParams = new URLSearchParams(window.location.search)
  const providerMode = searchParams.get('importIntakeProvider')
  const enabled = providerMode === IMPORT_INTAKE_API_PROVIDER_MODE || providerMode === 'api'

  return {
    enabled,
    apiBaseUrl: searchParams.get('importIntakeApiBaseUrl') || undefined,
  }
}

function createHeaderDescription(snapshot: ImportIntakeAdminSnapshot, bridgeState: string) {
  if (snapshot.fallback) {
    return `Fixture fallback active after ${snapshot.fallback.attemptedProviderMode}. The local V2.11.3 envelopes remain visible with no import execution, tenant creation, Roller resume, CMS/provider write, deployment, indexing, or contact-form POST.`
  }

  if (snapshot.providerMode === IMPORT_INTAKE_API_PROVIDER_MODE) {
    return `GET-only Pumpkin API bridge active for ${snapshot.activeGovernanceLane}. Endpoint envelopes are read through the shared contract adapter and all future actions remain disabled.`
  }

  if (bridgeState === 'loading') {
    return `Loading GET-only Pumpkin API bridge for ${snapshot.activeGovernanceLane}. The fixture-backed read-only preview remains the safe visible state.`
  }

  return `Fixture-backed Admin preview for ${snapshot.activeGovernanceLane}. Ice and Roller package envelopes are rendered locally with the future import execution boundary closed.`
}

function ReadOnlySafetyBanner({
  snapshot,
  bridgeState,
}: {
  snapshot: ImportIntakeAdminSnapshot
  bridgeState: string
}) {
  const boundary = snapshot.packages[0]?.preview.securityBoundary
  const headline = snapshot.fallback
    ? 'No write actions. API bridge degraded to fixture fallback.'
    : snapshot.providerMode === IMPORT_INTAKE_API_PROVIDER_MODE
      ? 'No write actions. GET-only Pumpkin API bridge active.'
      : 'No write actions. Fixture-backed local preview only.'

  return (
    <div className="mt-5 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <div className="font-semibold">{headline}</div>
            <div className="mt-1">
              Import execution, tenant creation, Roller resume, CMS/provider writes, deployment, DNS, Google/Search Console/indexing, Azure mutation, and contact-form POST are closed.
            </div>
            {snapshot.fallback && (
              <div className="mt-1 text-xs text-sky-800">Fallback reason: {snapshot.fallback.reason}</div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <BoundaryPill label="Mode" value={snapshot.providerMode} />
          <BoundaryPill label="Bridge" value={bridgeState} />
          <BoundaryPill label="Open flags" value={String(boundary?.openFlags.length ?? 0)} />
          <BoundaryPill label="Read-only" value={snapshot.contract.readOnly ? 'yes' : 'no'} />
        </div>
      </div>
    </div>
  )
}

function SummaryStrip({ snapshot }: { snapshot: ImportIntakeAdminSnapshot }) {
  const routeCount = snapshot.packages.reduce((count, pack) => count + pack.summary.counts.routes, 0)
  const evidenceCount = snapshot.packages.reduce((count, pack) => count + pack.summary.counts.backupEvidenceRefs + pack.summary.counts.runtimeQaRefs + pack.summary.counts.auditJobRefs, 0)
  const refCount = snapshot.packages.reduce((count, pack) => count + pack.summary.counts.contentRefs + pack.summary.counts.mediaRefs + pack.summary.counts.formConfigRefs + pack.summary.counts.resourceRegistryRefs + pack.summary.counts.providerProfileRefs + pack.summary.counts.outboundLinkRefs, 0)
  const noGoCount = snapshot.packages.reduce((count, pack) => count + pack.summary.counts.noGoConditions, 0)

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Packages" value={snapshot.packages.length} detail={snapshot.contract.envelopeSchemaVersion} icon={<Package className="h-5 w-5" />} />
      <MetricCard label="Routes" value={routeCount} detail="Routes and Content" icon={<FileSearch className="h-5 w-5" />} />
      <MetricCard label="Evidence" value={evidenceCount} detail="Backup, Runtime QA, Audit Jobs" icon={<Database className="h-5 w-5" />} />
      <MetricCard label="Refs" value={refCount} detail="Media, forms, registry, profile, OLM" icon={<Layers className="h-5 w-5" />} />
      <MetricCard label="No-Go" value={noGoCount} detail="Roller paused/no-import visible" icon={<Ban className="h-5 w-5" />} />
      <MetricCard label="Future Actions" value={snapshot.futureActions.length} detail="All disabled" icon={<Lock className="h-5 w-5" />} />
      <MetricCard label="API Endpoints" value={snapshot.contract.apiEndpointCount ?? 0} detail={snapshot.contract.apiBaseUrl ?? 'fixture mode'} icon={<TableProperties className="h-5 w-5" />} />
      <MetricCard label="Provider Modes" value={snapshot.contract.envelopeProviderModes.length} detail={snapshot.providerMode} icon={<ShieldCheck className="h-5 w-5" />} />
    </section>
  )
}

function PackageFilters({
  snapshot,
  query,
  onChange,
}: {
  snapshot: ImportIntakeAdminSnapshot
  query: ImportIntakeQueryState
  onChange: (query: ImportIntakeQueryState) => void
}) {
  const tenantOptions = unique(snapshot.packages.map((pack) => pack.summary.tenantKey))
  const lifecycleOptions = unique(snapshot.packages.map((pack) => pack.summary.tenantLifecycleState))
  const importModeOptions = unique(snapshot.packages.map((pack) => pack.summary.importMode))
  const packageTypeOptions = unique(snapshot.packages.map((pack) => pack.summary.packageType))

  return (
    <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(260px,1fr)_170px_190px_190px_150px_150px_130px]">
      <label className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2">
        <Search className="h-4 w-4 text-neutral-500" />
        <input
          value={query.search}
          onChange={(event) => onChange({ ...query, search: event.target.value })}
          placeholder="Search tenant, route, evidence"
          className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
        />
      </label>

      <Select icon={<Filter className="h-4 w-4" />} value={query.tenantKey} onChange={(value) => onChange({ ...query, tenantKey: value })}>
        <option value="all">All tenants</option>
        {tenantOptions.map((value) => <option key={value} value={value}>{value}</option>)}
      </Select>

      <Select icon={<LifeBuoy className="h-4 w-4" />} value={query.lifecycleState} onChange={(value) => onChange({ ...query, lifecycleState: value })}>
        <option value="all">All lifecycle</option>
        {lifecycleOptions.map((value) => <option key={value} value={value}>{formatLabel(value)}</option>)}
      </Select>

      <Select icon={<TableProperties className="h-4 w-4" />} value={query.importMode} onChange={(value) => onChange({ ...query, importMode: value })}>
        <option value="all">All import modes</option>
        {importModeOptions.map((value) => <option key={value} value={value}>{formatLabel(value)}</option>)}
      </Select>

      <Select icon={<Ban className="h-4 w-4" />} value={query.noGoState} onChange={(value) => onChange({ ...query, noGoState: value as ImportIntakeQueryState['noGoState'] })}>
        <option value="all">All no-go</option>
        <option value="blocked">Blocked</option>
        <option value="clear">Clear</option>
      </Select>

      <Select icon={<Package className="h-4 w-4" />} value={query.packageType} onChange={(value) => onChange({ ...query, packageType: value })}>
        <option value="all">All types</option>
        {packageTypeOptions.map((value) => <option key={value} value={value}>{formatLabel(value)}</option>)}
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

function PackageTable({
  packages,
  selectedPackageId,
  onSelect,
}: {
  packages: ImportIntakeAdminPackage[]
  selectedPackageId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200">
      <div className="max-h-[520px] overflow-auto">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="sticky top-0 bg-neutral-50">
            <tr>
              <Th>Package</Th>
              <Th>Tenant</Th>
              <Th>Lifecycle</Th>
              <Th>No-go</Th>
              <Th>Ready</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {packages.map((pack) => {
              const selected = pack.summary.packageId === selectedPackageId
              return (
                <tr key={pack.summary.packageId} className={selected ? 'bg-sky-50 align-top' : 'align-top hover:bg-neutral-50'}>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => onSelect(pack.summary.packageId)} className="text-left">
                      <span className="font-medium text-neutral-900">{pack.summary.packageId}</span>
                      <span className="mt-1 block max-w-xl truncate text-xs text-neutral-500">{pack.summary.domain}</span>
                    </button>
                  </td>
                  <Td>{pack.summary.tenantKey}</Td>
                  <Td><StateBadge state={pack.summary.tenantLifecycleState} /></Td>
                  <Td>{pack.summary.counts.noGoConditions}</Td>
                  <Td>{pack.summary.readyForFutureImportExecution ? 'yes' : 'no'}</Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PackageSelectionPanel({
  snapshot,
  selectedPackage,
  comparePackage,
  packageOptions,
  comparePackageId,
  onCompareChange,
}: {
  snapshot: ImportIntakeAdminSnapshot
  selectedPackage: ImportIntakeAdminPackage | null
  comparePackage: ImportIntakeAdminPackage | null
  packageOptions: ReturnType<typeof getImportIntakePackageOptions>
  comparePackageId: string
  onCompareChange: (id: string) => void
}) {
  if (!selectedPackage) {
    return (
      <aside className="rounded-lg border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
        No import intake package matched the current filters.
      </aside>
    )
  }

  return (
    <aside className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Selected package</p>
          <h2 className="mt-1 break-words text-lg font-semibold text-neutral-900">{selectedPackage.summary.tenantKey}</h2>
        </div>
        <StateBadge state={selectedPackage.summary.importMode} />
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <ReadOnlyDetail label="Domain" value={selectedPackage.summary.domain} />
        <ReadOnlyDetail label="Readiness" value={summarizePackageReadiness(selectedPackage)} />
        <ReadOnlyDetail label="Rollback" value={selectedPackage.summary.rollbackPlanId} />
        <ReadOnlyDetail label="Source" value={selectedPackage.envelope.source.fixturePath} />
      </div>

      <label className="mt-5 flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
        <Layers className="h-4 w-4 text-neutral-500" />
        <select
          value={comparePackageId}
          onChange={(event) => onCompareChange(event.target.value)}
          className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
        >
          {packageOptions.map((option) => (
            <option key={option.packageId} value={option.packageId}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {comparePackage && (
        <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
          <CompareCell label="Selected" pack={selectedPackage} />
          <CompareCell label="Compare" pack={comparePackage} />
        </div>
      )}

      <div className="mt-5 rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
        <div className="flex items-center gap-2 font-semibold">
          <Lock className="h-4 w-4" />
          Read-only selection
        </div>
        <p className="mt-1">
          Provider mode {snapshot.providerMode}; contract adapter read-only validation is {snapshot.contract.adapterValidation.ok ? 'passing' : 'not passing'}.
        </p>
      </div>
    </aside>
  )
}

function DetailPanelGrid({
  pack,
  comparePackage,
  snapshot,
}: {
  pack: ImportIntakeAdminPackage
  comparePackage: ImportIntakeAdminPackage | null
  snapshot: ImportIntakeAdminSnapshot
}) {
  const preview = pack.preview

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <PanelSection title="Import Package Summary" state={preview.readyForFutureImportExecution ? 'ready' : preview.importMode} icon={<Package className="h-4 w-4" />}>
        <KeyValueGrid values={[
          ['Package', preview.packageId],
          ['Type', preview.packageType],
          ['Tenant', preview.tenantKey],
          ['Site', preview.siteKey],
          ['Generated', preview.generatedAt],
        ]} />
      </PanelSection>

      <PanelSection title="Tenant Lifecycle" state={preview.tenantLifecycleState} icon={<LifeBuoy className="h-4 w-4" />}>
        <KeyValueGrid values={[
          ['Domain', preview.domain],
          ['Lifecycle', preview.tenantLifecycleState],
          ['Import mode', preview.importMode],
          ['Ready', preview.readyForFutureImportExecution ? 'yes' : 'no'],
        ]} />
      </PanelSection>

      <PanelSection title="Routes and Content" state="complete" icon={<FileSearch className="h-4 w-4" />}>
        <RefList label="Routes" values={preview.routes} />
        <RefList label="Content" values={preview.contentRefs} />
      </PanelSection>

      <PanelSection title="Media References" state="complete" icon={<FileText className="h-4 w-4" />}>
        <RefList label="Media" values={preview.mediaRefs} />
      </PanelSection>

      <PanelSection title="Forms and Contact Configuration" state="complete" icon={<FileText className="h-4 w-4" />}>
        <RefList label="Forms" values={preview.formConfigRefs} />
        <ReadOnlyDetail label="Contact POST" value="closed" />
      </PanelSection>

      <PanelSection title="Resource Registry / Provider Profile" state="complete" icon={<Database className="h-4 w-4" />}>
        <RefList label="Registry" values={preview.resourceRegistryRefs} />
        <RefList label="Provider profile" values={preview.providerProfileRefs} />
      </PanelSection>

      <PanelSection title="Backup Center" state="complete" icon={<Database className="h-4 w-4" />}>
        <RefList label="Backup evidence" values={preview.backupEvidenceRefs} />
      </PanelSection>

      <PanelSection title="Runtime QA" state="complete" icon={<CheckCircle2 className="h-4 w-4" />}>
        <RefList label="Runtime QA refs" values={preview.runtimeQaRefs} />
      </PanelSection>

      <PanelSection title="Outbound Link Manager" state="complete" icon={<FileSearch className="h-4 w-4" />}>
        <RefList label="OLM refs" values={preview.outboundLinkRefs} />
      </PanelSection>

      <PanelSection title="Audit Jobs / Promotion Governance" state="complete" icon={<TableProperties className="h-4 w-4" />}>
        <RefList label="Audit Jobs refs" values={preview.auditJobRefs} />
      </PanelSection>

      <PanelSection title="No-Go Conditions" state={preview.noGoConditions.length > 0 ? 'blocked' : 'complete'} icon={<Ban className="h-4 w-4" />}>
        {preview.noGoConditions.length === 0 ? (
          <p className="text-sm text-neutral-600">No no-go conditions recorded for this preview.</p>
        ) : (
          <div className="space-y-2">
            {preview.noGoConditions.map((condition) => (
              <div key={condition.code} className="rounded-md border border-red-100 bg-red-50 p-2 text-sm text-red-900">
                <div className="font-semibold">{condition.code}</div>
                <div className="mt-1">{condition.message}</div>
              </div>
            ))}
          </div>
        )}
      </PanelSection>

      <PanelSection title="Rollback / Abort" state={preview.noGoConditions.length > 0 ? 'blocked' : 'complete'} icon={<RotateCcw className="h-4 w-4" />}>
        <ReadOnlyDetail label="Rollback plan" value={preview.rollbackPlanId} />
        <ReadOnlyDetail label="Abort state" value={preview.noGoConditions.length > 0 ? 'abort/no-import required' : 'rollback reference available'} />
      </PanelSection>

      <PanelSection title="Security and Redaction" state={preview.securityBoundary.openFlags.length === 0 ? 'read_only' : 'warning'} icon={<ShieldCheck className="h-4 w-4" />}>
        <KeyValueGrid values={[
          ['Local only', preview.securityBoundary.localOnly ? 'yes' : 'no'],
          ['No-write boundary', preview.securityBoundary.noWriteBoundarySatisfied ? 'satisfied' : 'open'],
          ['Open flags', String(preview.securityBoundary.openFlags.length)],
          ['Secrets policy', preview.redactionPolicy.secretsPolicy],
          ['Protected config', preview.redactionPolicy.protectedConfigPolicy],
        ]} />
      </PanelSection>

      <PanelSection title="Paused Tenant / Resume Governance" state={preview.importMode === 'paused_no_import' ? 'blocked' : 'complete'} icon={<AlertTriangle className="h-4 w-4" />}>
        <ReadOnlyDetail label="Paused state" value={preview.importMode === 'paused_no_import' ? 'paused no-import' : 'not paused'} />
        <ReadOnlyDetail label="Resume approval" value={preview.tenantKey === 'roller-rink-rentals' ? 'not approved' : 'not required'} />
        <RefList label="Blockers" values={preview.blockers.map((blocker) => `${blocker.code}: ${blocker.message}`)} />
      </PanelSection>

      <PanelSection title="Next Gates" state="future_boundary_required" icon={<Lock className="h-4 w-4" />}>
        <RefList label="Next gates" values={preview.nextGates.map((gate) => `${gate.id}: ${gate.label}`)} />
        <RefList label="Disabled actions" values={snapshot.futureActions.map((action) => `${action.label}: ${action.reason}`)} />
      </PanelSection>

      {comparePackage && (
        <PanelSection title="Comparison Snapshot" state="read_only" icon={<Layers className="h-4 w-4" />}>
          <KeyValueGrid values={[
            ['Selected tenant', pack.summary.tenantKey],
            ['Selected readiness', summarizePackageReadiness(pack)],
            ['Compare tenant', comparePackage.summary.tenantKey],
            ['Compare readiness', summarizePackageReadiness(comparePackage)],
          ]} />
        </PanelSection>
      )}
    </section>
  )
}

function PanelSection({
  title,
  state,
  icon,
  children,
}: {
  title: string
  state: ImportIntakePackageState | string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-neutral-500">{icon}</span>
          <h2 className="break-words text-sm font-semibold text-neutral-900">{title}</h2>
        </div>
        <StateBadge state={state} />
      </div>
      <div className="mt-4 space-y-3">{children}</div>
      <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-sky-700">
        <Lock className="h-3.5 w-3.5" />
        read_only_no_write_actions
      </div>
    </article>
  )
}

function CompareCell({ label, pack }: { label: string; pack: ImportIntakeAdminPackage }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
      <div className="font-semibold text-neutral-900">{label}</div>
      <div className="mt-1 break-words text-neutral-600">{pack.summary.tenantKey}</div>
      <div className="mt-2"><StateBadge state={pack.summary.importMode} /></div>
      <div className="mt-2 text-neutral-600">{summarizePackageReadiness(pack)}</div>
    </div>
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

function StateBadge({ state }: { state: ImportIntakePackageState | string }) {
  const style = stateStyles[state] ?? 'border-neutral-200 bg-neutral-50 text-neutral-700'
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${style}`}>
      {formatLabel(state)}
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

function KeyValueGrid({ values }: { values: Array<[string, string]> }) {
  return (
    <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
      {values.map(([label, value]) => (
        <ReadOnlyDetail key={label} label={label} value={value} />
      ))}
    </div>
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

function RefList({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</div>
      {values.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-500">None recorded.</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.slice(0, 10).map((value) => (
            <span key={value} className="max-w-full break-words rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
              {value}
            </span>
          ))}
          {values.length > 10 && (
            <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-700">+{values.length - 10} more</span>
          )}
        </div>
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

function unique(values: string[]) {
  return Array.from(new Set(values))
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ')
}
