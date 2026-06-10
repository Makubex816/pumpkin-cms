export type OutboundLinkStatus = 'active' | 'disabled' | 'pending_review' | 'domain_blocked'
export type OutboundLinkInstanceStatus = 'enabled' | 'disabled' | 'stale' | 'pending_review'
export type OutboundLinkRenderAction = 'active_link' | 'plain_text' | 'hidden' | 'fallback'
export type OutboundLinkSortField = 'domain' | 'status' | 'lastDetectedAt' | 'instanceCount'
export type OutboundLinkSortDirection = 'asc' | 'desc'

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
  policyStatus: string
  renderAction: OutboundLinkRenderAction
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
  reviewOnly: boolean
  page: number
  pageSize: number
  sortField: OutboundLinkSortField
  sortDirection: OutboundLinkSortDirection
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
