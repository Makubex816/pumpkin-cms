import combinedLedgerFixture from '../../../../../deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/fixtures/valid-v2-8-combined-promotion-ledger.fixture.json'
import type {
  AuditJobLedgerAdminRecord,
  AuditJobLedgerAdminSnapshot,
  AuditJobLedgerAuditEvent,
  AuditJobLedgerEvidenceBinding,
  AuditJobLedgerFutureAction,
  AuditJobLedgerHealthMessage,
  AuditJobLedgerJobRun,
  AuditJobLedgerNextGate,
  AuditJobLedgerPanel,
  AuditJobLedgerPromotionGate,
  AuditJobLedgerQueryState,
  AuditJobLedgerRecordKind,
  AuditJobLedgerSafety,
  AuditJobLedgerState,
  AuditJobLedgerTraceEntry,
  AuditJobLedgerTraceModel,
  AuditJobLedgerViewerModel,
} from './types'

export const AUDIT_JOB_LEDGER_ADMIN_ROUTE = '/dashboard/audit-jobs'
export const AUDIT_JOB_LEDGER_ACTIVE_GOVERNANCE_LANE = 'V2.9 - Audit Jobs / Production Promotion Governance'
export const AUDIT_JOB_LEDGER_FIXTURE_PATH = 'deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/fixtures/valid-v2-8-combined-promotion-ledger.fixture.json'
export const AUDIT_JOB_LEDGER_PROVIDER_MODE = 'admin-local-fixture-readonly'
export const AUDIT_JOB_LEDGER_REQUIRED_PANEL_TITLES = [
  'Release Summary',
  'Promotion Gates',
  'Job Runs',
  'Audit Events',
  'Evidence Bindings',
  'Trace Explorer',
  'Runtime QA',
  'Resource Registry / Provider Profile',
  'Outbound Link Manager',
  'Backup Center',
  'Indexing Deferred',
  'Blockers and Next Gates',
] as const

const panelDefinitions = [
  ['release-summary', 'Release Summary'],
  ['promotion-gates', 'Promotion Gates'],
  ['job-runs', 'Job Runs'],
  ['audit-events', 'Audit Events'],
  ['evidence-bindings', 'Evidence Bindings'],
  ['trace-explorer', 'Trace Explorer'],
  ['runtime-qa', 'Runtime QA'],
  ['resource-registry-provider-profile', 'Resource Registry / Provider Profile'],
  ['outbound-link-manager', 'Outbound Link Manager'],
  ['backup-center', 'Backup Center'],
  ['indexing-deferred', 'Indexing Deferred'],
  ['blockers-next-gates', 'Blockers and Next Gates'],
] as const

const writeBoundaryFlags = [
  'deployment',
  'redeployment',
  'dnsChange',
  'customDomainMutation',
  'searchConsoleAction',
  'googleSitemapSubmission',
  'googleUrlInspectionApi',
  'googleIndexingApi',
  'indexingRequest',
  'crawlOrOutboundCheck',
  'contactFormSubmission',
  'contactEndpointPost',
  'cmsWrite',
  'mediaAssetWrite',
  'providerWrite',
  'azureMutation',
  'azureInfrastructureCreation',
  'azureInfrastructureMutation',
  'azureAppSettingsMutation',
  'rbacAssignment',
  'protectedConfigRead',
  'tokenUseOrPrint',
  'deploymentTokenUsed',
  'deploymentTokenPrintedOrExported',
  'oauthTokenUsedOrPrinted',
  'keyVaultSecretQuery',
  'keysListKeys',
  'connectionStringGenerated',
  'sasGenerated',
  'secretExport',
  'externalNetworkUsed',
  'writesPerformed',
] as const

export const defaultAuditJobLedgerQuery: AuditJobLedgerQueryState = {
  search: '',
  kind: 'all',
  state: 'all',
  sortField: 'timestamp',
  sortDirection: 'desc',
}

interface RawLedger {
  v2Reference?: string
  laneId?: string
  tenantKey?: string
  siteKey?: string
  securityBoundary?: Record<string, boolean | string | undefined>
  auditEvents?: RawAuditEvent[]
  jobRuns?: RawJobRun[]
  promotionGates?: RawPromotionGate[]
  evidenceBindings?: RawEvidenceBinding[]
}

interface RawAuditEvent {
  auditEventId: string
  eventType: string
  outcome: string
  occurredAt: string
  actor: string
  boundaryClass: string
  mutationClass: string
  evidenceRefs?: string[]
  traceIds?: Record<string, string>
  securityBoundary?: Record<string, boolean | string | undefined>
}

interface RawJobRun {
  jobRunId: string
  jobType: string
  status: string
  outcome: string
  startedAt: string
  completedAt: string
  auditEventIds?: string[]
  inputRefs?: string[]
  outputRefs?: string[]
  validationRefs?: string[]
  securityBoundary?: Record<string, boolean | string | undefined>
}

interface RawPromotionGate {
  gateId: string
  gateType: string
  state: string
  result: string
  blockers?: string[]
  requiredEvidence?: string[]
  actualEvidence?: string[]
  approvalReference?: string
  rollbackPlanId?: string
}

interface RawEvidenceBinding {
  evidenceId: string
  evidenceType: string
  sourceRef: string
  safePath: string
  summary: string
  artifactHash?: string
}

let cachedSnapshot: AuditJobLedgerAdminSnapshot | null = null

export function getAuditJobLedgerAdminSnapshot(): AuditJobLedgerAdminSnapshot {
  if (cachedSnapshot) return cachedSnapshot

  const viewerModel = createAuditJobLedgerViewerModel(combinedLedgerFixture as unknown as RawLedger)
  cachedSnapshot = {
    activeGovernanceLane: AUDIT_JOB_LEDGER_ACTIVE_GOVERNANCE_LANE,
    fixturePath: AUDIT_JOB_LEDGER_FIXTURE_PATH,
    route: AUDIT_JOB_LEDGER_ADMIN_ROUTE,
    viewerModel,
    records: createAdminRecords(viewerModel),
    futureActions: createFutureActions(),
  }

  return cachedSnapshot
}

export function queryAuditJobLedgerRecords(
  snapshot: AuditJobLedgerAdminSnapshot,
  query: AuditJobLedgerQueryState,
): AuditJobLedgerAdminRecord[] {
  const normalizedSearch = normalizeSearch(query.search)

  return snapshot.records
    .filter((record) => query.kind === 'all' || record.kind === query.kind)
    .filter((record) => query.state === 'all' || record.state === query.state)
    .filter((record) => normalizedSearch.length === 0 || record.searchText.includes(normalizedSearch))
    .sort((first, second) => compareRecords(first, second, query))
}

export function getAuditJobLedgerRecordById(snapshot: AuditJobLedgerAdminSnapshot, id: string | null) {
  if (!id) return null
  return snapshot.records.find((record) => record.id === id) ?? null
}

export function getAuditJobLedgerStateCounts(records: AuditJobLedgerAdminRecord[]) {
  return records.reduce<Record<string, number>>((counts, record) => {
    counts[record.state] = (counts[record.state] ?? 0) + 1
    return counts
  }, {})
}

function createAuditJobLedgerViewerModel(ledger: RawLedger): AuditJobLedgerViewerModel {
  const auditEvents = ledger.auditEvents ?? []
  const jobRuns = ledger.jobRuns ?? []
  const promotionGates = ledger.promotionGates ?? []
  const evidenceBindings = ledger.evidenceBindings ?? []
  const evidenceById = new Map(evidenceBindings.map((evidence) => [evidence.evidenceId, evidence]))

  const auditEventViewModels = auditEvents.map((event) => createAuditEventViewModel(event, evidenceById))
  const jobRunViewModels = jobRuns.map((jobRun) => createJobRunViewModel(jobRun, evidenceById))
  const promotionGateViewModels = promotionGates.map((gate) => createPromotionGateViewModel(gate, evidenceById))
  const evidenceViewModels = evidenceBindings.map(createEvidenceBindingViewModel)
  const traceModel = createTraceModel(auditEvents)
  const hasDeployment = auditEvents.some((event) => event.eventType === 'production_static_release_deployed' && event.outcome === 'passed')
  const hasRoutesPassed = auditEvents.some((event) => event.eventType === 'production_route_verification_passed' && event.outcome === 'passed')
  const hasContactVerified = auditEvents.some((event) => event.eventType === 'contact_form_live_submission_verified' && event.outcome === 'passed')
  const hasIndexingDeferred = auditEvents.some((event) => event.eventType === 'indexing_deferred_hard_stop')
    || promotionGates.some((gate) => gate.gateType === 'indexing_state_explicit' && gate.result === 'deferred_non_blocking')
  const hasFutureBoundary = auditEvents.some((event) => event.eventType === 'future_boundary_created')
    || promotionGates.some((gate) => gate.gateType === 'future_boundary_created')
  const blockedGates = promotionGateViewModels.filter((gate) => gate.state === 'blocked' || gate.result.startsWith('blocked'))
  const missingEvidenceGates = promotionGateViewModels.filter((gate) => gate.missingEvidenceRefs.length > 0)
  const releaseState: AuditJobLedgerState = hasDeployment && hasRoutesPassed && hasContactVerified ? 'complete' : 'warning'
  const indexingState: AuditJobLedgerState = hasIndexingDeferred ? 'deferred' : 'warning'
  const boundaryState: AuditJobLedgerState = isNoWriteBoundarySatisfied(ledger.securityBoundary) ? 'read_only' : 'warning'
  const warnings = createWarnings({ hasIndexingDeferred, missingEvidenceGates, boundaryState })
  const blockers = createBlockers({ blockedGates, missingEvidenceGates })
  const nextGates = createNextGates({ hasFutureBoundary, hasIndexingDeferred })

  const summary = {
    status: 'read_only' as const,
    v2Reference: ledger.v2Reference ?? null,
    laneId: ledger.laneId ?? null,
    tenantKey: ledger.tenantKey ?? null,
    siteKey: ledger.siteKey ?? null,
    releaseState,
    indexingState,
    boundaryState,
    counts: {
      auditEvents: auditEventViewModels.length,
      jobRuns: jobRunViewModels.length,
      promotionGates: promotionGateViewModels.length,
      evidenceBindings: evidenceViewModels.length,
      traceEntries: traceModel.entries.length,
      warnings: warnings.length,
      blockers: blockers.length,
      nextGates: nextGates.length,
    },
  }

  const panels = createPanels({
    summary,
    auditEvents: auditEventViewModels,
    jobRuns: jobRunViewModels,
    promotionGates: promotionGateViewModels,
    evidenceBindings: evidenceViewModels,
    traceModel,
    hasIndexingDeferred,
    hasFutureBoundary,
    blockedGates,
    warnings,
    blockers,
    nextGates,
  })

  return {
    ok: true,
    viewerModelVersion: 'audit-job-ledger-viewer.v1',
    summary,
    panels,
    auditEvents: auditEventViewModels,
    jobRuns: jobRunViewModels,
    promotionGates: promotionGateViewModels,
    evidenceBindings: evidenceViewModels,
    traceIds: traceModel,
    warnings,
    blockers,
    nextGates,
    securityBoundary: createSecurityBoundaryView(ledger.securityBoundary),
    validation: {
      ok: true,
      failureCount: 0,
      failures: [],
    },
  }
}

function createAuditEventViewModel(
  event: RawAuditEvent,
  evidenceById: Map<string, RawEvidenceBinding>,
): AuditJobLedgerAuditEvent {
  return {
    id: event.auditEventId,
    type: event.eventType,
    outcome: event.outcome,
    occurredAt: event.occurredAt,
    actor: event.actor,
    boundaryClass: event.boundaryClass,
    mutationClass: event.mutationClass,
    evidenceRefs: event.evidenceRefs ?? [],
    evidenceSummaries: (event.evidenceRefs ?? []).map((id) => evidenceById.get(id)?.summary ?? null).filter(isString),
    traceIdCount: Object.keys(event.traceIds ?? {}).length,
    correlationId: event.traceIds?.correlationId ?? null,
    boundaryGateId: event.traceIds?.boundaryGateId ?? null,
    readOnlySafety: createCompactSafety(event.securityBoundary),
  }
}

function createJobRunViewModel(jobRun: RawJobRun, evidenceById: Map<string, RawEvidenceBinding>): AuditJobLedgerJobRun {
  const evidenceRefs = unique([
    ...(jobRun.inputRefs ?? []),
    ...(jobRun.outputRefs ?? []),
    ...(jobRun.validationRefs ?? []),
  ])

  return {
    id: jobRun.jobRunId,
    type: jobRun.jobType,
    status: jobRun.status,
    outcome: jobRun.outcome,
    startedAt: jobRun.startedAt,
    completedAt: jobRun.completedAt,
    auditEventIds: jobRun.auditEventIds ?? [],
    evidenceRefs,
    evidenceCount: evidenceRefs.length,
    evidenceSummaries: evidenceRefs.map((id) => evidenceById.get(id)?.summary ?? null).filter(isString),
    readOnlySafety: createCompactSafety(jobRun.securityBoundary),
  }
}

function createPromotionGateViewModel(
  gate: RawPromotionGate,
  evidenceById: Map<string, RawEvidenceBinding>,
): AuditJobLedgerPromotionGate {
  const requiredEvidence = gate.requiredEvidence ?? []
  const actualEvidence = gate.actualEvidence ?? []
  const actual = new Set(actualEvidence)

  return {
    id: gate.gateId,
    type: gate.gateType,
    state: gate.state,
    result: gate.result,
    blockers: gate.blockers ?? [],
    requiredEvidence,
    actualEvidence,
    missingEvidenceRefs: requiredEvidence.filter((id) => !actual.has(id)),
    approvalReference: gate.approvalReference ?? null,
    rollbackPlanId: gate.rollbackPlanId ?? null,
    evidenceSummaries: actualEvidence.map((id) => evidenceById.get(id)?.summary ?? null).filter(isString),
  }
}

function createEvidenceBindingViewModel(evidence: RawEvidenceBinding): AuditJobLedgerEvidenceBinding {
  return {
    id: evidence.evidenceId,
    type: evidence.evidenceType,
    sourceRef: evidence.sourceRef,
    safePath: evidence.safePath,
    summary: evidence.summary,
    hasArtifactHash: typeof evidence.artifactHash === 'string',
  }
}

function createTraceModel(auditEvents: RawAuditEvent[]): AuditJobLedgerTraceModel {
  const entries: AuditJobLedgerTraceEntry[] = []
  const byField: Record<string, number> = {}

  for (const event of auditEvents) {
    for (const [field, value] of Object.entries(event.traceIds ?? {})) {
      const entry = {
        field,
        value,
        auditEventId: event.auditEventId,
        eventType: event.eventType,
        correlationId: event.traceIds?.correlationId ?? null,
        searchText: normalizeSearch([
          field,
          value,
          event.auditEventId,
          event.eventType,
          event.traceIds?.correlationId,
        ].filter(isString).join(' ')),
      }
      entries.push(entry)
      byField[field] = (byField[field] ?? 0) + 1
    }
  }

  return {
    entries,
    byField,
    correlationIds: unique(entries.map((entry) => entry.correlationId).filter(isString)),
    searchableFields: Object.keys(byField).sort(),
  }
}

function createPanels(context: {
  summary: AuditJobLedgerViewerModel['summary']
  auditEvents: AuditJobLedgerAuditEvent[]
  jobRuns: AuditJobLedgerJobRun[]
  promotionGates: AuditJobLedgerPromotionGate[]
  evidenceBindings: AuditJobLedgerEvidenceBinding[]
  traceModel: AuditJobLedgerTraceModel
  hasIndexingDeferred: boolean
  hasFutureBoundary: boolean
  blockedGates: AuditJobLedgerPromotionGate[]
  warnings: AuditJobLedgerHealthMessage[]
  blockers: AuditJobLedgerHealthMessage[]
  nextGates: AuditJobLedgerNextGate[]
}): AuditJobLedgerPanel[] {
  const panelStates: Record<string, AuditJobLedgerState> = {
    'release-summary': context.summary.releaseState,
    'promotion-gates': stateFromGates(context.promotionGates),
    'job-runs': 'complete',
    'audit-events': 'complete',
    'evidence-bindings': 'complete',
    'trace-explorer': context.traceModel.entries.length > 0 ? 'complete' : 'missing_evidence',
    'runtime-qa': hasEvent(context.auditEvents, 'runtime_qa_passed') ? 'complete' : 'missing_evidence',
    'resource-registry-provider-profile': hasEvent(context.auditEvents, 'resource_registry_validation_passed') && hasEvent(context.auditEvents, 'provider_profile_validation_passed') ? 'complete' : 'missing_evidence',
    'outbound-link-manager': hasEvent(context.auditEvents, 'olm_publish_gate_passed') ? 'complete' : 'missing_evidence',
    'backup-center': hasEvent(context.auditEvents, 'backup_evidence_available') ? 'complete' : 'missing_evidence',
    'indexing-deferred': context.hasIndexingDeferred ? 'deferred' : 'warning',
    'blockers-next-gates': context.blockers.length > 0 ? 'blocked' : context.hasFutureBoundary ? 'future_boundary_required' : 'warning',
  }

  return panelDefinitions.map(([id, title]) => ({
    id,
    title,
    state: panelStates[id],
    readOnly: true,
    counts: createPanelCounts(id, context),
    safetyLabel: 'read_only_no_write_actions',
  }))
}

function createAdminRecords(viewerModel: AuditJobLedgerViewerModel): AuditJobLedgerAdminRecord[] {
  const auditEventRecords = viewerModel.auditEvents.map((event) => ({
    id: `audit-event:${event.id}`,
    sourceId: event.id,
    kind: 'audit_event' as const,
    label: labelize(event.type),
    state: stateFromOutcome(event.outcome),
    statusText: event.outcome,
    timestamp: event.occurredAt,
    description: event.evidenceSummaries.join(' '),
    evidenceRefs: event.evidenceRefs,
    traceRefs: [event.correlationId, event.boundaryGateId].filter(isString),
    tags: [event.boundaryClass, event.mutationClass, event.actor],
  }))

  const jobRunRecords = viewerModel.jobRuns.map((jobRun) => ({
    id: `job-run:${jobRun.id}`,
    sourceId: jobRun.id,
    kind: 'job_run' as const,
    label: labelize(jobRun.type),
    state: stateFromOutcome(jobRun.outcome),
    statusText: jobRun.status,
    timestamp: jobRun.completedAt,
    description: jobRun.evidenceSummaries.join(' '),
    evidenceRefs: jobRun.evidenceRefs,
    traceRefs: jobRun.auditEventIds,
    tags: [jobRun.type, jobRun.status, jobRun.outcome],
  }))

  const gateRecords = viewerModel.promotionGates.map((gate) => ({
    id: `promotion-gate:${gate.id}`,
    sourceId: gate.id,
    kind: 'promotion_gate' as const,
    label: labelize(gate.type),
    state: gateState(gate),
    statusText: gate.result,
    timestamp: null,
    description: gate.evidenceSummaries.join(' ') || 'Promotion gate recorded from local fixture evidence.',
    evidenceRefs: gate.actualEvidence,
    traceRefs: [gate.approvalReference, gate.rollbackPlanId].filter(isString),
    tags: [gate.type, gate.state, gate.result],
  }))

  const evidenceRecords = viewerModel.evidenceBindings.map((evidence) => ({
    id: `evidence:${evidence.id}`,
    sourceId: evidence.id,
    kind: 'evidence_binding' as const,
    label: labelize(evidence.type),
    state: 'complete' as const,
    statusText: evidence.sourceRef,
    timestamp: null,
    description: evidence.summary,
    evidenceRefs: [evidence.id],
    traceRefs: evidence.hasArtifactHash ? ['artifactHash'] : [],
    tags: [evidence.type, evidence.sourceRef, evidence.safePath],
  }))

  const traceRecords = viewerModel.traceIds.entries.map((entry, index) => ({
    id: `trace:${entry.auditEventId}:${entry.field}:${index}`,
    sourceId: entry.value,
    kind: 'trace_id' as const,
    label: `${entry.field}: ${entry.value}`,
    state: 'complete' as const,
    statusText: entry.field,
    timestamp: null,
    description: `${entry.eventType} trace field on ${entry.auditEventId}.`,
    evidenceRefs: [],
    traceRefs: [entry.correlationId, entry.auditEventId].filter(isString),
    tags: [entry.field, entry.eventType],
  }))

  return [...auditEventRecords, ...jobRunRecords, ...gateRecords, ...evidenceRecords, ...traceRecords]
    .map((record) => ({
      ...record,
      searchText: normalizeSearch([
        record.id,
        record.sourceId,
        record.kind,
        record.label,
        record.state,
        record.statusText,
        record.description,
        ...record.evidenceRefs,
        ...record.traceRefs,
        ...record.tags,
      ].join(' ')),
    }))
}

function createFutureActions(): AuditJobLedgerFutureAction[] {
  return [
    {
      id: 'request-indexing',
      label: 'Request indexing',
      state: 'deferred',
      disabled: true,
      reason: 'Future-gated. Google/Search Console/indexing deferred hard stop remains active.',
    },
    {
      id: 'redeploy-production',
      label: 'Redeploy production',
      state: 'blocked',
      disabled: true,
      reason: 'Future-gated. Deployment closed until a separate explicit approval.',
    },
    {
      id: 'submit-contact-check',
      label: 'Submit contact check',
      state: 'blocked',
      disabled: true,
      reason: 'Future-gated. Contact-form POST closed after V2.8.19 verification.',
    },
  ]
}

function createPanelCounts(id: string, context: {
  promotionGates: AuditJobLedgerPromotionGate[]
  jobRuns: AuditJobLedgerJobRun[]
  auditEvents: AuditJobLedgerAuditEvent[]
  evidenceBindings: AuditJobLedgerEvidenceBinding[]
  traceModel: AuditJobLedgerTraceModel
  blockedGates: AuditJobLedgerPromotionGate[]
  warnings: AuditJobLedgerHealthMessage[]
  blockers: AuditJobLedgerHealthMessage[]
  nextGates: AuditJobLedgerNextGate[]
}): Record<string, number> {
  if (id === 'promotion-gates') return { total: context.promotionGates.length, blocked: context.blockedGates.length }
  if (id === 'job-runs') return { total: context.jobRuns.length }
  if (id === 'audit-events') return { total: context.auditEvents.length }
  if (id === 'evidence-bindings') return { total: context.evidenceBindings.length }
  if (id === 'trace-explorer') return { total: context.traceModel.entries.length, correlations: context.traceModel.correlationIds.length }
  if (id === 'blockers-next-gates') return { warnings: context.warnings.length, blockers: context.blockers.length, nextGates: context.nextGates.length }
  return { total: 1 }
}

function createWarnings({
  hasIndexingDeferred,
  missingEvidenceGates,
  boundaryState,
}: {
  hasIndexingDeferred: boolean
  missingEvidenceGates: AuditJobLedgerPromotionGate[]
  boundaryState: AuditJobLedgerState
}): AuditJobLedgerHealthMessage[] {
  const warnings: AuditJobLedgerHealthMessage[] = []

  if (hasIndexingDeferred) {
    warnings.push({
      code: 'INDEXING_DEFERRED',
      state: 'deferred',
      severity: 'info',
      message: 'Google/Search Console/indexing remains deferred by hard stop.',
    })
  }

  for (const gate of missingEvidenceGates) {
    warnings.push({
      code: 'MISSING_GATE_EVIDENCE',
      state: 'missing_evidence',
      severity: 'warning',
      message: `Promotion gate ${gate.id} is missing evidence.`,
      gateId: gate.id,
    })
  }

  if (boundaryState !== 'read_only') {
    warnings.push({
      code: 'READ_ONLY_BOUNDARY_WARNING',
      state: 'warning',
      severity: 'warning',
      message: 'No-write boundary is incomplete or not fully closed.',
    })
  }

  return warnings
}

function createBlockers({
  blockedGates,
  missingEvidenceGates,
}: {
  blockedGates: AuditJobLedgerPromotionGate[]
  missingEvidenceGates: AuditJobLedgerPromotionGate[]
}): AuditJobLedgerHealthMessage[] {
  return [
    ...blockedGates.map((gate) => ({
      code: 'PROMOTION_GATE_BLOCKED',
      state: 'blocked' as const,
      gateId: gate.id,
      message: `Promotion gate ${gate.id} is blocked.`,
    })),
    ...missingEvidenceGates.map((gate) => ({
      code: 'MISSING_GATE_EVIDENCE',
      state: 'missing_evidence' as const,
      gateId: gate.id,
      message: `Promotion gate ${gate.id} is missing required evidence.`,
    })),
  ]
}

function createNextGates({
  hasFutureBoundary,
  hasIndexingDeferred,
}: {
  hasFutureBoundary: boolean
  hasIndexingDeferred: boolean
}): AuditJobLedgerNextGate[] {
  const nextGates: AuditJobLedgerNextGate[] = []

  if (hasFutureBoundary) {
    nextGates.push({
      id: 'future-boundary-required',
      state: 'future_boundary_required',
      label: 'Future explicit approval required before any runtime/write boundary.',
    })
  }

  if (hasIndexingDeferred) {
    nextGates.push({
      id: 'google-indexing-deferred',
      state: 'deferred',
      label: 'Google/Search Console/indexing remains deferred until a separate explicit approval.',
    })
  }

  return nextGates
}

function createSecurityBoundaryView(boundary: RawLedger['securityBoundary']) {
  const openFlags = writeBoundaryFlags.filter((flag) => boundary?.[flag] !== false)

  return {
    localOnly: boundary?.localOnly === true,
    noWriteBoundarySatisfied: openFlags.length === 0 && boundary?.localOnly === true,
    openFlags,
    closedFlags: writeBoundaryFlags.filter((flag) => boundary?.[flag] === false),
  }
}

function createCompactSafety(boundary: RawLedger['securityBoundary']): AuditJobLedgerSafety {
  return {
    localOnly: boundary?.localOnly === true,
    writesPerformed: readBoolean(boundary?.writesPerformed),
    externalNetworkUsed: readBoolean(boundary?.externalNetworkUsed),
    protectedConfigRead: readBoolean(boundary?.protectedConfigRead),
  }
}

function compareRecords(first: AuditJobLedgerAdminRecord, second: AuditJobLedgerAdminRecord, query: AuditJobLedgerQueryState) {
  const multiplier = query.sortDirection === 'asc' ? 1 : -1
  if (query.sortField === 'timestamp') {
    return multiplier * ((Date.parse(first.timestamp ?? '') || 0) - (Date.parse(second.timestamp ?? '') || 0))
  }

  return multiplier * String(first[query.sortField]).localeCompare(String(second[query.sortField]))
}

function stateFromGates(gates: AuditJobLedgerPromotionGate[]): AuditJobLedgerState {
  if (gates.some((gate) => gate.state === 'blocked' || gate.result.startsWith('blocked'))) return 'blocked'
  if (gates.some((gate) => gate.missingEvidenceRefs.length > 0)) return 'missing_evidence'
  return 'complete'
}

function gateState(gate: AuditJobLedgerPromotionGate): AuditJobLedgerState {
  if (gate.state === 'blocked' || gate.result.startsWith('blocked')) return 'blocked'
  if (gate.missingEvidenceRefs.length > 0) return 'missing_evidence'
  if (gate.result === 'deferred_non_blocking') return 'deferred'
  return 'complete'
}

function stateFromOutcome(outcome: string): AuditJobLedgerState {
  if (outcome === 'passed' || outcome === 'complete') return 'complete'
  if (outcome === 'deferred') return 'deferred'
  if (outcome === 'blocked') return 'blocked'
  return 'warning'
}

function hasEvent(events: AuditJobLedgerAuditEvent[], eventType: string) {
  return events.some((event) => event.type === eventType)
}

function isNoWriteBoundarySatisfied(boundary: RawLedger['securityBoundary']) {
  return boundary?.localOnly === true && writeBoundaryFlags.every((flag) => boundary?.[flag] === false)
}

function readBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null
}

function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

function labelize(value: string) {
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function unique(values: string[]) {
  return Array.from(new Set(values))
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}
