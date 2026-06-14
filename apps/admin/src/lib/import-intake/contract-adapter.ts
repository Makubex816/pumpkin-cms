import type {
  ImportIntakeAdminContractMetadata,
  ImportIntakeAdminPackage,
  ImportIntakeAdminProviderMode,
  ImportIntakeFutureAction,
  ImportIntakePackageSummary,
  ImportIntakePreviewModel,
  ImportIntakeReadOnlyApiEnvelope,
} from './types'

export const IMPORT_INTAKE_READONLY_API_ENVELOPE_SCHEMA_VERSION = 'pumpkin.importIntakePreview.readonlyApiEnvelope.v1'
export const IMPORT_INTAKE_SHARED_MODEL_SCHEMA_VERSION = 'pumpkin.importIntakePreview.sharedModel.v1'
export const IMPORT_INTAKE_API_ENVELOPE_PROVIDER_MODE = 'api-local-import-package-fixture-readonly'

const blockedMetaFlags = [
  'externalHttpCrawling',
  'cmsApiCalls',
  'cmsWrites',
  'providerWrites',
  'protectedConfigReads',
  'writeActionsAllowed',
  'deployment',
  'searchConsoleIndexing',
] as const

const requiredPreviewArrayFields = [
  'routes',
  'contentRefs',
  'mediaRefs',
  'formConfigRefs',
  'resourceRegistryRefs',
  'providerProfileRefs',
  'backupEvidenceRefs',
  'runtimeQaRefs',
  'outboundLinkRefs',
  'auditJobRefs',
  'noGoConditions',
  'validationRefs',
  'warnings',
  'blockers',
  'nextGates',
  'futureActions',
] as const

export interface ImportIntakeContractAdapterOptions {
  adminProviderMode: ImportIntakeAdminProviderMode
  sourceFixturePaths: string[]
  apiEndpointCount?: number
  apiBaseUrl?: string | null
}

export interface ImportIntakeContractAdapterResult {
  packages: ImportIntakeAdminPackage[]
  contract: ImportIntakeAdminContractMetadata
}

export function createImportIntakeAdminModelFromEnvelopes(
  envelopes: ImportIntakeReadOnlyApiEnvelope[],
  options: ImportIntakeContractAdapterOptions,
): ImportIntakeContractAdapterResult {
  const issues = validateImportIntakeEnvelopes(envelopes)

  if (issues.length > 0) {
    throw new Error(`Import intake read-only contract failed: ${issues.join('; ')}`)
  }

  const packages = envelopes.map((envelope) => ({
    summary: createSummary(envelope.data),
    preview: envelope.data,
    envelope,
    searchText: normalizeSearch([
      envelope.data.packageId,
      envelope.data.packageType,
      envelope.data.tenantKey,
      envelope.data.siteKey,
      envelope.data.domain,
      envelope.data.tenantLifecycleState,
      envelope.data.importMode,
      envelope.data.rollbackPlanId,
      ...envelope.data.routes,
      ...envelope.data.contentRefs,
      ...envelope.data.mediaRefs,
      ...envelope.data.formConfigRefs,
      ...envelope.data.resourceRegistryRefs,
      ...envelope.data.providerProfileRefs,
      ...envelope.data.backupEvidenceRefs,
      ...envelope.data.runtimeQaRefs,
      ...envelope.data.outboundLinkRefs,
      ...envelope.data.auditJobRefs,
      ...envelope.data.noGoConditions.map((condition) => condition.code),
    ].join(' ')),
  }))

  return {
    packages,
    contract: {
      envelopeSchemaVersion: IMPORT_INTAKE_READONLY_API_ENVELOPE_SCHEMA_VERSION,
      sharedModelSchemaVersion: IMPORT_INTAKE_SHARED_MODEL_SCHEMA_VERSION,
      adminProviderMode: options.adminProviderMode,
      envelopeProviderModes: unique(envelopes.map((envelope) => envelope.providerMode)),
      requestIds: envelopes.map((envelope) => envelope.requestId),
      correlationIds: envelopes.map((envelope) => envelope.correlationId),
      sourceFixturePaths: options.sourceFixturePaths,
      readOnly: true,
      apiEndpointCount: options.apiEndpointCount,
      apiBaseUrl: options.apiBaseUrl ?? null,
      adapterValidation: {
        ok: true,
        issues: [],
      },
    },
  }
}

export function assertImportIntakeFutureActionsReadOnly(actions: ImportIntakeFutureAction[]) {
  const enabledActions = actions.filter((action) => action.disabled !== true)

  if (enabledActions.length > 0) {
    throw new Error(`IMPORT_INTAKE_MUTATION_ACTION_NOT_DISABLED: ${enabledActions.map((action) => action.id).join(', ')}`)
  }
}

export function validateImportIntakeEnvelopes(envelopes: ImportIntakeReadOnlyApiEnvelope[]) {
  const issues: string[] = []

  if (envelopes.length < 2) {
    issues.push('Ice and Roller fixture envelopes are required')
  }

  for (const envelope of envelopes) {
    const packageId = envelope.data?.packageId ?? 'unknown-package'

    if (envelope.schemaVersion !== IMPORT_INTAKE_READONLY_API_ENVELOPE_SCHEMA_VERSION) {
      issues.push(`${packageId}: envelope schemaVersion mismatch`)
    }

    if (envelope.data?.schemaVersion !== IMPORT_INTAKE_SHARED_MODEL_SCHEMA_VERSION) {
      issues.push(`${packageId}: shared model schemaVersion mismatch`)
    }

    if (envelope.providerMode !== IMPORT_INTAKE_API_ENVELOPE_PROVIDER_MODE || envelope.data?.providerMode !== IMPORT_INTAKE_API_ENVELOPE_PROVIDER_MODE) {
      issues.push(`${packageId}: providerMode missing or unsupported`)
    }

    if (envelope.readOnly !== true || envelope.data?.readOnly !== true) {
      issues.push(`${packageId}: readOnly envelope/data flag is not true`)
    }

    if (!envelope.securityBoundary?.localOnly || !envelope.data?.securityBoundary?.localOnly) {
      issues.push(`${packageId}: localOnly boundary is not satisfied`)
    }

    if (!envelope.securityBoundary?.noWriteBoundarySatisfied || !envelope.data?.securityBoundary?.noWriteBoundarySatisfied) {
      issues.push(`${packageId}: noWriteBoundarySatisfied is not true`)
    }

    if ((envelope.securityBoundary?.openFlags ?? []).length > 0 || (envelope.data?.securityBoundary?.openFlags ?? []).length > 0) {
      issues.push(`${packageId}: security boundary has open write flags`)
    }

    if (envelope.meta?.googleIndexingState !== 'deferred_hard_stop') {
      issues.push(`${packageId}: Google indexing deferred hard stop is not preserved`)
    }

    for (const flag of blockedMetaFlags) {
      if (envelope.meta?.[flag] !== false) {
        issues.push(`${packageId}: meta flag must remain false: ${flag}`)
      }
    }

    for (const field of requiredPreviewArrayFields) {
      if (!Array.isArray(envelope.data?.[field])) {
        issues.push(`${packageId}: data.${field} must be an array`)
      }
    }

    const enabledActions = (envelope.data?.futureActions ?? []).filter((action) => action.disabled !== true)
    if (enabledActions.length > 0) {
      issues.push(`${packageId}: future actions must be disabled: ${enabledActions.map((action) => action.id).join(', ')}`)
    }
  }

  const packageIds = new Set(envelopes.map((envelope) => envelope.data.packageId))
  if (!packageIds.has('ice-rink-rentals-carryforward-v2-11-2')) {
    issues.push('Ice package preview missing')
  }

  const roller = envelopes.find((envelope) => envelope.data.tenantKey === 'roller-rink-rentals')?.data
  if (!roller) {
    issues.push('Roller package preview missing')
  } else {
    if (roller.importMode !== 'paused_no_import') issues.push('Roller preview must remain paused_no_import')
    if (roller.readyForFutureImportExecution !== false) issues.push('Roller preview must not be import-ready')
    if (roller.noGoConditions.length === 0) issues.push('Roller preview must expose a no-go condition')
  }

  return issues
}

function createSummary(preview: ImportIntakePreviewModel): ImportIntakePackageSummary {
  return {
    packageId: preview.packageId,
    packageType: preview.packageType,
    tenantKey: preview.tenantKey,
    siteKey: preview.siteKey,
    domain: preview.domain,
    tenantLifecycleState: preview.tenantLifecycleState,
    importMode: preview.importMode,
    readyForFutureImportExecution: preview.readyForFutureImportExecution,
    rollbackPlanId: preview.rollbackPlanId,
    readOnly: true,
    counts: {
      routes: preview.routes.length,
      contentRefs: preview.contentRefs.length,
      mediaRefs: preview.mediaRefs.length,
      formConfigRefs: preview.formConfigRefs.length,
      resourceRegistryRefs: preview.resourceRegistryRefs.length,
      providerProfileRefs: preview.providerProfileRefs.length,
      backupEvidenceRefs: preview.backupEvidenceRefs.length,
      runtimeQaRefs: preview.runtimeQaRefs.length,
      outboundLinkRefs: preview.outboundLinkRefs.length,
      auditJobRefs: preview.auditJobRefs.length,
      noGoConditions: preview.noGoConditions.length,
      warnings: preview.warnings.length,
      blockers: preview.blockers.length,
      nextGates: preview.nextGates.length,
    },
  }
}

function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values))
}
