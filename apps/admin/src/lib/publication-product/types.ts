export const HOSTING_CLASSES = [
  'STATIC_PUBLISHED_SITE',
  'DYNAMIC_SCALE_TO_ZERO_FRONTEND',
  'SHARED_RUNTIME_COMPATIBILITY',
] as const

export type HostingClass = (typeof HOSTING_CLASSES)[number]

export const PUBLICATION_STATES = [
  'DRAFT',
  'PLANNED',
  'BUILDING',
  'READY',
  'DEPLOYING',
  'ACTIVE',
  'SUPERSEDED',
  'REVOKED',
  'FAILED',
  'ROLLED_BACK',
  'ARCHIVED',
] as const

export type PublicationState =
  | (typeof PUBLICATION_STATES)[number]
  | Lowercase<(typeof PUBLICATION_STATES)[number]>

export type PublicationJobState =
  | 'PENDING'
  | 'RUNNING'
  | 'PARTIAL'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'ROLLED_BACK'
  | 'pending'
  | 'running'
  | 'partial'
  | 'completed'
  | 'failed'
  | 'rolled_back'

export interface PublicationInventory {
  routes: number
  redirects: number
  media: number
  forms: number
}

export interface PublicationAuditEvent {
  eventId: string
  eventType: string
  occurredAt: string
  actorType: 'OPERATOR' | 'TENANT_ADMIN' | 'SYSTEM'
  outcome: string
  detail: string
}

export interface CredentialReferenceMetadata {
  referenceId: string
  provider: string
  status: string
  fingerprintSha256?: string
  aclStatus?: string
  portability?: string
  lastVerifiedAt?: string
}

export interface ProductReleaseSummary {
  releaseId: string
  tenantUid: string
  publicationId: string
  sourceCommit: string
  status:
    | 'DRAFT'
    | 'ACCEPTED'
    | 'SUPERSEDED'
    | 'REVOKED'
    | 'draft'
    | 'accepted'
    | 'superseded'
    | 'revoked'
  acceptedAt?: string
  supersededByReleaseId?: string
  packageLockSha256: string
  licensingStatus: string
  artifactSha256?: string
}

export interface TenantPublicationArtifactSummary {
  artifactId: string
  tenantUid: string
  publicationId: string
  releaseId: string
  artifactSha256: string
  manifestSha256: string
  status: string
  immutable: boolean
  rollbackArtifactId?: string
  predecessorArtifactId?: string
  supersededByArtifactId?: string
}

export interface PublicationJobSummary {
  jobId: string
  tenantUid: string
  publicationId: string
  artifactId: string
  state: PublicationJobState
  completedSteps: number
  totalSteps: number
  nextStep?: string
  deterministicPlanSha256: string
  canResume: boolean
  canRollback: boolean
  updatedAt: string
}

export interface TenantPublicationSummary {
  tenantUid: string
  tenantName: string
  hostingClass: HostingClass
  publicationId?: string
  publicationState: PublicationState
  publicationRevision?: number
  releaseId?: string
  artifactId?: string
  artifactSha256?: string
  manifestSha256?: string
  predecessorPublicationId?: string
  defaultHostname?: string
  indexingMode: 'HELD_NOINDEX' | 'PUBLIC_NOINDEX' | 'PUBLIC_INDEXABLE_OWNER_APPROVAL_REQUIRED'
  formMode: 'PREVIEW_NO_POST' | 'PUBLIC_FORMS_LIVE'
  formReadiness: string
  domainStage: string
  inventories: PublicationInventory
  compatibilityHolds: string[]
  auditEvents: PublicationAuditEvent[]
}

export interface TenantPublicationCenterSnapshot {
  schemaVersion: 'pub-30-a01-ui-v1'
  generatedAt: string
  authorizationScope: 'TENANT_ADMIN_OWN_TENANT' | 'SUPER_ADMIN_ALL_TENANTS'
  customerExecutionEnabled: boolean
  tenant: TenantPublicationSummary
  releases: ProductReleaseSummary[]
  artifacts: TenantPublicationArtifactSummary[]
  jobs: PublicationJobSummary[]
}

export interface SuperAdminPublicationCenterSnapshot {
  schemaVersion: 'pub-30-a01-ui-v1'
  generatedAt: string
  authorizationScope: 'SUPER_ADMIN_ALL_TENANTS'
  customerExecutionEnabled: boolean
  tenants: TenantPublicationSummary[]
  releases: ProductReleaseSummary[]
  artifacts: TenantPublicationArtifactSummary[]
  jobs: PublicationJobSummary[]
  credentialReferences: CredentialReferenceMetadata[]
}

export type PublicationAction =
  | 'PREVIEW_PLAN'
  | 'BUILD_CANDIDATE'
  | 'PROMOTE'
  | 'RESUME'
  | 'ROLLBACK'
  | 'REVOKE'

export interface PublicationActionRequest {
  action: PublicationAction
  tenantUid: string
  publicationId: string
  jobId?: string
  releaseId?: string
  artifactId?: string
  rollbackReleaseId?: string
  rollbackArtifactId?: string
  expectedRevision: number
  reason: string
  idempotencyKey: string
}

export interface PublicationActionResult {
  accepted: boolean
  action: PublicationAction
  jobId?: string
  state: PublicationJobState | PublicationState | string
  idempotentReplay: boolean
}
