export type OutboundLinkStatus = 'active' | 'disabled' | 'pending_review' | 'domain_blocked' | 'policy_conflict'
export type OutboundLinkInstanceStatus = 'enabled' | 'disabled' | 'stale' | 'pending_review'
export type OutboundLinkRenderAction = 'active_link' | 'plain_text' | 'hidden' | 'fallback'
export type OutboundLinkSortField = 'domain' | 'status' | 'lastDetectedAt' | 'instanceCount'
export type OutboundLinkSortDirection = 'asc' | 'desc'
export type OutboundLinkSeverity = 'low' | 'medium' | 'high' | 'critical'
export type OutboundLinkQuickFilter = 'all' | 'pending' | 'blocked' | 'disabled' | 'stale' | 'broken' | 'new' | 'policy_violations'
export type OutboundLinkWriteProviderMode =
  | 'local-api-fake-provider'
  | 'local-simulation'
  | 'fake-provider'
  | 'offline-bundle'
  | 'local-dev'
  | 'local-file-backed'
  | 'staging-simulated'
  | 'live-readonly'
  | 'live-write-approved'
  | 'production-runtime'
export type OutboundLinkWriteAction =
  | 'approveReviewDecision'
  | 'blockReviewDecision'
  | 'ignoreReviewDecision'
  | 'setLinkStatus'
  | 'setInstanceStatus'
  | 'setPolicy'
  | 'createScanRun'
  | 'bulkDomainDisable'
  | 'bulkDomainRequireReview'
  | 'bulkPageInstanceUpdate'
  | 'restorePriorStatus'

export interface OutboundLinkApiError {
  code: string
  message: string
  path: string | null
}

export interface OutboundLinkPaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface OutboundLinkApiMeta {
  mode: string
  localOnly: boolean
  externalHttpCrawling: boolean
  cmsApiCalls: boolean
  cmsWrites: boolean
  protectedConfigReads: boolean
  stagingBacked: boolean
  readOnly: boolean
  writeActionsAllowed: boolean
  providerProfileId?: string | null
  providerMode?: string | null
  providerState?: string | null
  sourceEvidence?: string | null
  approvalManifestId?: string | null
  firstWriteBatchId?: string | null
  expectedRecordCount?: number | null
  readbackRecordCount?: number | null
  pagination?: OutboundLinkPaginationMeta | null
  filters?: Record<string, string | null>
  sort?: {
    field: string
    direction: string
  } | null
}

export interface OutboundLinkApiEnvelope<T> {
  ok: boolean
  status: number
  code: string
  message: string
  data: T | null
  errors: OutboundLinkApiError[]
  meta: OutboundLinkApiMeta
  tenantKey: string | null
  siteKey: string | null
  requestId: string
}

export interface OutboundLinkRecord {
  id: string
  tenantKey: string
  siteKey: string
  originalUrl: string
  normalizedUrl: string
  domain: string
  status: OutboundLinkStatus
  severity: OutboundLinkSeverity
  riskReason: string
  policyStatus: string
  policyExplanation: string
  policyRuleReference: string
  renderAction: OutboundLinkRenderAction
  sourceContent: string
  sourceType: string
  owner: string
  isBroken: boolean
  isSuspicious: boolean
  isNew: boolean
  hasPolicyViolation: boolean
  createdAt: string
  updatedAt: string
  firstDetectedAt: string
  lastDetectedAt: string
  createdBy: string
  disabledBy: string | null
  disabledAt: string | null
  disabledReason: string | null
  instanceCount: number
  activeInstanceCount: number
  staleInstanceCount: number
  pendingReviewCount: number
}

export interface OutboundLinkInstanceRecord {
  id: string
  tenantKey: string
  siteKey: string
  outboundLinkId: string
  pageId: string | null
  contentType: string
  contentBlockId: string | null
  fieldName: string
  anchorText: string | null
  locationPath: string
  isEnabled: boolean
  status: OutboundLinkInstanceStatus
  sourceContent: string
  owner: string
  firstDetectedAt: string
  lastDetectedAt: string
  domain: string
  normalizedUrl: string
  renderAction: OutboundLinkRenderAction
}

export interface OutboundLinkPolicyRecord {
  id: string
  tenantKey: string
  siteKey: string
  name: string
  defaultDisabledBehavior: string
  defaultRel: string[]
  externalTargetBehavior: string
  allowedDomains: string[]
  blockedDomains: string[]
  pendingReviewDomains: string[]
  reviewRequiredForNewDomains: boolean
  source: string
}

export interface OutboundLinkScanRunRecord {
  id: string
  tenantKey: string
  siteKey: string
  status: string
  mode: string
  startedAt: string
  completedAt: string | null
  pagesScanned: number
  linksFound: number
  newLinksFound: number
  staleInstancesFound: number
}

export interface OutboundLinkAuditLogRecord {
  id: string
  tenantKey: string
  siteKey: string
  action: string
  recordType: string
  recordId: string
  actor: string
  reason: string | null
  createdAt: string
  mode: string
}

export interface OutboundLinkDashboardSummary {
  linkCount: number
  instanceCount: number
  policyCount: number
  scanRunCount: number
  auditLogCount: number
  domainCount: number
  domains: string[]
  linksByStatus: Record<string, number>
  instancesByStatus: Record<string, number>
  pendingReviewCount: number
  disabledLinkCount: number
  domainBlockedLinkCount: number
  staleInstanceCount: number
  policyConflictCount: number
  brokenLinkCount: number
  suspiciousDomainCount: number
  newLinkCount: number
  lastScan: OutboundLinkLastScanSummary
  registryActivity: OutboundLinkRegistryActivitySummary
  domainHealth: OutboundLinkDomainHealthSummary
}

export interface OutboundLinkStoreSnapshot {
  tenantKey: string
  siteKey: string
  links: OutboundLinkRecord[]
  instances: OutboundLinkInstanceRecord[]
  policies: OutboundLinkPolicyRecord[]
  activePolicyId: string | null
  scanRuns: OutboundLinkScanRunRecord[]
  auditLogs: OutboundLinkAuditLogRecord[]
  dashboardSummary: OutboundLinkDashboardSummary
}

export interface OutboundLinkQueryState {
  search: string
  domain: string
  status: 'all' | OutboundLinkStatus
  quickFilter: OutboundLinkQuickFilter
  reviewOnly: boolean
  page: number
  pageSize: number
  sortField: OutboundLinkSortField
  sortDirection: OutboundLinkSortDirection
}

export interface OutboundLinkLastScanSummary {
  id: string
  status: string
  timestamp: string
  durationSeconds: number
  linksScanned: number
  newLinks: number
  violations: number
}

export interface OutboundLinkRegistryActivitySummary {
  todayDelta: number
  weekDelta: number
  monthDelta: number
  domainsAdded: number
  domainsRemoved: number
}

export interface OutboundLinkDomainHealthSummary {
  allowedDomains: number
  pendingDomains: number
  blockedDomains: number
  brokenDomains: number
  suspiciousDomains: number
}

export interface OutboundLinkListResult {
  items: OutboundLinkRecord[]
  pagination: OutboundLinkPaginationMeta
}

export interface OutboundLinkDetailResult {
  link: OutboundLinkRecord
  instances: OutboundLinkInstanceRecord[]
  activePolicy: OutboundLinkPolicyRecord | null
}

export interface OutboundLinkExportStatus {
  label: string
  status: 'included' | 'ready' | 'not_started' | 'blocked'
  detail: string
}

export interface OutboundLinkProviderReadiness {
  providerProfileId: string
  providerMode: OutboundLinkWriteProviderMode
  stagingExecutionStatus: 'passed' | 'blocked' | 'not_started'
  readbackStatus: 'passed' | 'blocked' | 'not_started'
  replayValidationStatus: 'passed' | 'blocked' | 'not_started'
  backupPreExecutionStatus: 'passed' | 'blocked' | 'not_started'
  resourceRegistryStatus: 'passed' | 'blocked' | 'not_started'
  liveReadonlyGate: 'explicit_future_gate'
  liveWriteGate: 'future_approval_required'
  productionMigrationReady: false
  evidencePath: string
  summary: string
}

export interface OutboundLinkWritePublishingImpact {
  summary: string
  affectedPageIds: string[]
  affectedInstanceIds: string[]
  renderActions: string[]
}

export interface OutboundLinkWriteTrace {
  requestId: string
  actionId: string
  correlationId: string
  tenantKey: string
  siteKey: string
  providerMode: OutboundLinkWriteProviderMode
  action: OutboundLinkWriteAction
  outcome: string
  actorIdentity: string
  actorRole: string
  reason: string
  approvalReference: string
  entityIds: string[]
  outboundLinkId: string | null
  outboundLinkInstanceId: string | null
  policyId: string | null
  scanRunId: string | null
  bulkActionId: string | null
  auditEventIds: string[]
  rollbackPlanId: string
  beforeStateHash: string
  afterStateHash: string
  affectedPageIds: string[]
  affectedInstanceIds: string[]
  localOnly: boolean
  simulatedOnly: boolean
  liveWriteAllowed: boolean
  createdAt: string
}

export interface OutboundLinkWriteActionResponse {
  ok: boolean
  status: number
  code: string
  message: string
  requestId: string
  actionId: string
  correlationId: string
  tenantKey: string
  siteKey: string
  providerMode: OutboundLinkWriteProviderMode
  action: OutboundLinkWriteAction
  outboundLinkId: string | null
  outboundLinkInstanceId: string | null
  policyId: string | null
  scanRunId: string | null
  bulkActionId: string | null
  approvalRequired: boolean
  approvalState: string
  approvalReference: string
  reason: string
  liveWriteAllowed: boolean
  simulatedOnly: boolean
  applied: boolean
  publishingImpact: OutboundLinkWritePublishingImpact
  auditEventIds: string[]
  rollbackPlanId: string
  beforeStateHash: string
  afterStateHash: string
  traceLog: OutboundLinkWriteTrace
  errors: OutboundLinkApiError[]
}
