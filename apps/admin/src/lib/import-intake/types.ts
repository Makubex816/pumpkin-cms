export type ImportIntakeAdminProviderMode =
  | 'admin-local-import-package-fixture-readonly'
  | 'admin-api-import-intake-readonly'

export type ImportIntakeEnvelopeProviderMode = 'api-local-import-package-fixture-readonly'

export type ImportIntakePackageState =
  | 'read_only'
  | 'candidate'
  | 'ready'
  | 'production_published'
  | 'paused'
  | 'paused_no_import'
  | 'blocked'
  | 'warning'
  | 'complete'
  | 'deferred'
  | 'future_boundary_required'

export type ImportIntakeSortField = 'tenantKey' | 'domain' | 'tenantLifecycleState' | 'importMode' | 'noGoCount'
export type ImportIntakeSortDirection = 'asc' | 'desc'

export interface ImportIntakeSecurityBoundary {
  localOnly: boolean
  noWriteBoundarySatisfied: boolean
  openFlags: string[]
  closedFlags: string[]
}

export interface ImportIntakeRedactionPolicy {
  secretsPolicy: string
  protectedConfigPolicy: string
  piiPolicy: string
}

export interface ImportIntakeHealthMessage {
  code: string
  state: ImportIntakePackageState | string
  severity: 'info' | 'warning' | 'error' | string
  message: string
}

export interface ImportIntakeNoGoCondition {
  code: string
  severity: 'blocked' | 'warning' | 'error' | string
  displayState: string
  message: string
  blocksFutureImport: boolean
}

export interface ImportIntakeNextGate {
  id: string
  state: ImportIntakePackageState | string
  label: string
}

export interface ImportIntakeFutureAction {
  id: string
  label: string
  disabled: true
  reason: string
}

export interface ImportIntakePreviewModel {
  schemaVersion: 'pumpkin.importIntakePreview.sharedModel.v1'
  providerMode: ImportIntakeEnvelopeProviderMode
  readOnly: true
  packageId: string
  packageType: string
  tenantKey: string
  siteKey: string
  domain: string
  tenantLifecycleState: ImportIntakePackageState | string
  importMode: string
  readyForFutureImportExecution: boolean
  routes: string[]
  contentRefs: string[]
  mediaRefs: string[]
  formConfigRefs: string[]
  resourceRegistryRefs: string[]
  providerProfileRefs: string[]
  backupEvidenceRefs: string[]
  runtimeQaRefs: string[]
  outboundLinkRefs: string[]
  auditJobRefs: string[]
  noGoConditions: ImportIntakeNoGoCondition[]
  rollbackPlanId: string
  validationRefs: string[]
  warnings: ImportIntakeHealthMessage[]
  blockers: ImportIntakeHealthMessage[]
  nextGates: ImportIntakeNextGate[]
  futureActions: ImportIntakeFutureAction[]
  securityBoundary: ImportIntakeSecurityBoundary
  redactionPolicy: ImportIntakeRedactionPolicy
  generatedAt: string
}

export interface ImportIntakeReadOnlyApiEnvelope {
  schemaVersion: 'pumpkin.importIntakePreview.readonlyApiEnvelope.v1'
  ok: boolean
  status: string | number
  code: string
  message: string
  requestId: string
  correlationId: string
  providerMode: ImportIntakeEnvelopeProviderMode
  readOnly: true
  data: ImportIntakePreviewModel
  warnings: ImportIntakeHealthMessage[]
  errors: Array<{ code: string; message: string; path?: string | null }>
  securityBoundary: ImportIntakeSecurityBoundary
  source: {
    kind: string
    fixturePath: string
    packagePreviewPath?: string | null
  }
  tenantKey: string
  siteKey: string
  meta: {
    mode: string
    localOnly: boolean
    readOnly: boolean
    providerMode?: string | null
    sourceProviderMode?: string | null
    contractSchemaVersion: string
    externalHttpCrawling: boolean
    cmsApiCalls: boolean
    cmsWrites: boolean
    providerWrites: boolean
    protectedConfigReads: boolean
    writeActionsAllowed: boolean
    deployment: boolean
    searchConsoleIndexing: boolean
    googleIndexingState: string
  }
}

export interface ImportIntakePackageSummary {
  packageId: string
  packageType: string
  tenantKey: string
  siteKey: string
  domain: string
  tenantLifecycleState: string
  importMode: string
  readyForFutureImportExecution: boolean
  rollbackPlanId: string
  readOnly: true
  counts: {
    routes: number
    contentRefs: number
    mediaRefs: number
    formConfigRefs: number
    resourceRegistryRefs: number
    providerProfileRefs: number
    backupEvidenceRefs: number
    runtimeQaRefs: number
    outboundLinkRefs: number
    auditJobRefs: number
    noGoConditions: number
    warnings: number
    blockers: number
    nextGates: number
  }
}

export interface ImportIntakeAdminPackage {
  summary: ImportIntakePackageSummary
  preview: ImportIntakePreviewModel
  envelope: ImportIntakeReadOnlyApiEnvelope
  searchText: string
}

export interface ImportIntakeAdminContractMetadata {
  envelopeSchemaVersion: 'pumpkin.importIntakePreview.readonlyApiEnvelope.v1'
  sharedModelSchemaVersion: 'pumpkin.importIntakePreview.sharedModel.v1'
  adminProviderMode: ImportIntakeAdminProviderMode
  envelopeProviderModes: ImportIntakeEnvelopeProviderMode[]
  requestIds: string[]
  correlationIds: string[]
  sourceFixturePaths: string[]
  readOnly: true
  apiEndpointCount?: number
  apiBaseUrl?: string | null
  adapterValidation: {
    ok: boolean
    issues: string[]
  }
}

export interface ImportIntakeAdminApiFallback {
  attemptedProviderMode: 'admin-api-import-intake-readonly'
  reason: string
}

export interface ImportIntakeQueryState {
  search: string
  tenantKey: 'all' | string
  lifecycleState: 'all' | string
  importMode: 'all' | string
  noGoState: 'all' | 'blocked' | 'clear'
  packageType: 'all' | string
  sortField: ImportIntakeSortField
  sortDirection: ImportIntakeSortDirection
}

export interface ImportIntakeAdminSnapshot {
  activeGovernanceLane: string
  route: '/dashboard/import-intake'
  providerMode: ImportIntakeAdminProviderMode
  fixturePaths: string[]
  contract: ImportIntakeAdminContractMetadata
  packages: ImportIntakeAdminPackage[]
  futureActions: ImportIntakeFutureAction[]
  fallback: ImportIntakeAdminApiFallback | null
}
