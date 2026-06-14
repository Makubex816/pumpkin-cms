export type AuditJobLedgerState =
  | 'read_only'
  | 'complete'
  | 'warning'
  | 'blocked'
  | 'deferred'
  | 'missing_evidence'
  | 'invalid_ledger'
  | 'future_boundary_required'

export type AuditJobLedgerRecordKind =
  | 'audit_event'
  | 'job_run'
  | 'promotion_gate'
  | 'evidence_binding'
  | 'trace_id'

export type AuditJobLedgerSortField = 'timestamp' | 'label' | 'kind' | 'state'
export type AuditJobLedgerSortDirection = 'asc' | 'desc'

export interface AuditJobLedgerSummary {
  status: AuditJobLedgerState
  v2Reference: string | null
  laneId: string | null
  tenantKey: string | null
  siteKey: string | null
  releaseState: AuditJobLedgerState
  indexingState: AuditJobLedgerState
  boundaryState: AuditJobLedgerState
  counts: {
    auditEvents: number
    jobRuns: number
    promotionGates: number
    evidenceBindings: number
    traceEntries: number
    warnings: number
    blockers: number
    nextGates: number
  }
}

export interface AuditJobLedgerPanel {
  id: string
  title: string
  state: AuditJobLedgerState
  readOnly: true
  counts: Record<string, number>
  safetyLabel: 'read_only_no_write_actions'
}

export interface AuditJobLedgerSafety {
  localOnly: boolean
  writesPerformed: boolean | null
  externalNetworkUsed: boolean | null
  protectedConfigRead: boolean | null
}

export interface AuditJobLedgerAuditEvent {
  id: string
  type: string
  outcome: string
  occurredAt: string
  actor: string
  boundaryClass: string
  mutationClass: string
  evidenceRefs: string[]
  evidenceSummaries: string[]
  traceIdCount: number
  correlationId: string | null
  boundaryGateId: string | null
  readOnlySafety: AuditJobLedgerSafety
}

export interface AuditJobLedgerJobRun {
  id: string
  type: string
  status: string
  outcome: string
  startedAt: string
  completedAt: string
  auditEventIds: string[]
  evidenceRefs: string[]
  evidenceCount: number
  evidenceSummaries: string[]
  readOnlySafety: AuditJobLedgerSafety
}

export interface AuditJobLedgerPromotionGate {
  id: string
  type: string
  state: string
  result: string
  blockers: string[]
  requiredEvidence: string[]
  actualEvidence: string[]
  missingEvidenceRefs: string[]
  approvalReference: string | null
  rollbackPlanId: string | null
  evidenceSummaries: string[]
}

export interface AuditJobLedgerEvidenceBinding {
  id: string
  type: string
  sourceRef: string
  safePath: string
  summary: string
  hasArtifactHash: boolean
}

export interface AuditJobLedgerTraceEntry {
  field: string
  value: string
  auditEventId: string
  eventType: string
  correlationId: string | null
  searchText: string
}

export interface AuditJobLedgerTraceModel {
  entries: AuditJobLedgerTraceEntry[]
  byField: Record<string, number>
  correlationIds: string[]
  searchableFields: string[]
}

export interface AuditJobLedgerHealthMessage {
  code: string
  state: AuditJobLedgerState
  severity?: 'info' | 'warning' | 'error'
  message: string
  path?: string | null
  gateId?: string
}

export interface AuditJobLedgerNextGate {
  id: string
  state: AuditJobLedgerState
  label: string
}

export interface AuditJobLedgerSecurityBoundary {
  localOnly: boolean
  noWriteBoundarySatisfied: boolean
  openFlags: string[]
  closedFlags: string[]
}

export interface AuditJobLedgerValidationView {
  ok: boolean
  failureCount: number
  failures: AuditJobLedgerHealthMessage[]
}

export interface AuditJobLedgerViewerModel {
  ok: boolean
  viewerModelVersion: 'audit-job-ledger-viewer.v1'
  summary: AuditJobLedgerSummary
  panels: AuditJobLedgerPanel[]
  auditEvents: AuditJobLedgerAuditEvent[]
  jobRuns: AuditJobLedgerJobRun[]
  promotionGates: AuditJobLedgerPromotionGate[]
  evidenceBindings: AuditJobLedgerEvidenceBinding[]
  traceIds: AuditJobLedgerTraceModel
  warnings: AuditJobLedgerHealthMessage[]
  blockers: AuditJobLedgerHealthMessage[]
  nextGates: AuditJobLedgerNextGate[]
  securityBoundary: AuditJobLedgerSecurityBoundary
  validation: AuditJobLedgerValidationView
}

export interface AuditJobLedgerSharedViewerModel extends Omit<AuditJobLedgerViewerModel, 'viewerModelVersion'> {
  schemaVersion: 'audit-job-ledger-shared-viewer-model.v1'
  providerMode: string
  readOnly: true
  redactionPolicy: {
    rawSecretsAllowed: false
    protectedConfigAllowed: false
    tokenLikeValuesAllowed: false
    disallowedSecretClasses: string[]
  }
  generatedAt: string
  legacyViewerModelVersion: 'audit-job-ledger-viewer.v1'
}

export interface AuditJobLedgerReadOnlyApiEnvelope {
  schemaVersion: 'audit-job-ledger-readonly-api-envelope.v1'
  ok: boolean
  status: 'ok' | 'warning' | 'error'
  code: string
  message: string
  requestId: string
  correlationId: string
  providerMode: string
  readOnly: true
  data: AuditJobLedgerSharedViewerModel
  warnings: AuditJobLedgerHealthMessage[]
  errors: AuditJobLedgerHealthMessage[]
  securityBoundary: AuditJobLedgerSecurityBoundary
  source: {
    fixturePath: string
    runtimeHttpWarning: string | null
  }
  tenantKey: string | null
  siteKey: string | null
  meta: {
    generatedAt: string
    runtimeHttpWarning: string | null
    sharedViewerModelSchemaVersion: string
  }
}

export interface AuditJobLedgerAdminContractMetadata {
  envelopeSchemaVersion: 'audit-job-ledger-readonly-api-envelope.v1'
  sharedViewerModelSchemaVersion: 'audit-job-ledger-shared-viewer-model.v1'
  requestId: string
  correlationId: string
  envelopeProviderMode: string
  adminProviderMode: string
  sourceFixturePath: string
  runtimeHttpWarning: string | null
  generatedAt: string
  readOnly: true
  adapterValidation: {
    ok: boolean
    issues: string[]
  }
}

export interface AuditJobLedgerAdminRecord {
  id: string
  sourceId: string
  kind: AuditJobLedgerRecordKind
  label: string
  state: AuditJobLedgerState
  statusText: string
  timestamp: string | null
  description: string
  evidenceRefs: string[]
  traceRefs: string[]
  tags: string[]
  searchText: string
}

export interface AuditJobLedgerQueryState {
  search: string
  kind: 'all' | AuditJobLedgerRecordKind
  state: 'all' | AuditJobLedgerState
  sortField: AuditJobLedgerSortField
  sortDirection: AuditJobLedgerSortDirection
}

export interface AuditJobLedgerFutureAction {
  id: string
  label: string
  state: AuditJobLedgerState
  disabled: true
  reason: string
}

export interface AuditJobLedgerAdminSnapshot {
  activeGovernanceLane: string
  fixturePath: string
  providerMode: string
  contract: AuditJobLedgerAdminContractMetadata
  route: string
  viewerModel: AuditJobLedgerViewerModel
  records: AuditJobLedgerAdminRecord[]
  futureActions: AuditJobLedgerFutureAction[]
}
