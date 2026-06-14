import type {
  AuditJobLedgerAdminContractMetadata,
  AuditJobLedgerFutureAction,
  AuditJobLedgerReadOnlyApiEnvelope,
  AuditJobLedgerViewerModel,
} from './types'

export const AUDIT_JOB_LEDGER_READONLY_API_ENVELOPE_SCHEMA_VERSION = 'audit-job-ledger-readonly-api-envelope.v1'
export const AUDIT_JOB_LEDGER_SHARED_VIEWER_MODEL_SCHEMA_VERSION = 'audit-job-ledger-shared-viewer-model.v1'
export const AUDIT_JOB_LEDGER_RUNTIME_HTTP_WARNING = 'local_next_dev_server_listened_but_timed_out'
export const AUDIT_JOB_LEDGER_ALLOWED_ENVELOPE_PROVIDER_MODES = [
  'local-fixture-readonly',
  'admin-local-fixture-readonly',
] as const

export interface AuditJobLedgerContractAdapterOptions {
  adminProviderMode: string
  expectedPanelTitles: readonly string[]
  sourceFixturePath: string
}

export interface AuditJobLedgerContractAdapterResult {
  viewerModel: AuditJobLedgerViewerModel
  contract: AuditJobLedgerAdminContractMetadata
}

export function createAuditJobLedgerAdminModelFromEnvelope(
  envelope: AuditJobLedgerReadOnlyApiEnvelope,
  options: AuditJobLedgerContractAdapterOptions,
): AuditJobLedgerContractAdapterResult {
  const issues = validateAuditJobLedgerEnvelope(envelope, options)

  if (issues.length > 0) {
    throw new Error(`Audit job ledger read-only API envelope contract failed: ${issues.join('; ')}`)
  }

  const viewerModel: AuditJobLedgerViewerModel = {
    ok: envelope.ok,
    viewerModelVersion: envelope.data.legacyViewerModelVersion,
    summary: envelope.data.summary,
    panels: envelope.data.panels,
    auditEvents: envelope.data.auditEvents,
    jobRuns: envelope.data.jobRuns,
    promotionGates: envelope.data.promotionGates,
    evidenceBindings: envelope.data.evidenceBindings,
    traceIds: envelope.data.traceIds,
    warnings: envelope.data.warnings,
    blockers: envelope.data.blockers,
    nextGates: envelope.data.nextGates,
    securityBoundary: envelope.data.securityBoundary,
    validation: envelope.data.validation,
  }

  return {
    viewerModel,
    contract: {
      envelopeSchemaVersion: envelope.schemaVersion,
      sharedViewerModelSchemaVersion: envelope.data.schemaVersion,
      requestId: envelope.requestId,
      correlationId: envelope.correlationId,
      envelopeProviderMode: envelope.providerMode,
      adminProviderMode: options.adminProviderMode,
      sourceFixturePath: options.sourceFixturePath,
      runtimeHttpWarning: envelope.meta.runtimeHttpWarning ?? envelope.source.runtimeHttpWarning ?? null,
      generatedAt: envelope.meta.generatedAt,
      readOnly: true,
      adapterValidation: {
        ok: true,
        issues: [],
      },
    },
  }
}

export function assertAuditJobLedgerFutureActionsReadOnly(actions: AuditJobLedgerFutureAction[]) {
  const enabledMutationActions = actions.filter((action) => action.disabled !== true)

  if (enabledMutationActions.length > 0) {
    throw new Error(`MUTATION_ACTION_NOT_DISABLED: ${enabledMutationActions.map((action) => action.id).join(', ')}`)
  }
}

export function validateAuditJobLedgerEnvelope(
  envelope: AuditJobLedgerReadOnlyApiEnvelope,
  options: AuditJobLedgerContractAdapterOptions,
) {
  const issues: string[] = []

  if (envelope.schemaVersion !== AUDIT_JOB_LEDGER_READONLY_API_ENVELOPE_SCHEMA_VERSION) {
    issues.push('readonly API envelope schemaVersion mismatch')
  }

  if (envelope.data?.schemaVersion !== AUDIT_JOB_LEDGER_SHARED_VIEWER_MODEL_SCHEMA_VERSION) {
    issues.push('shared viewer model schemaVersion mismatch')
  }

  if (envelope.readOnly !== true || envelope.data?.readOnly !== true) {
    issues.push('readOnly envelope/data flag is not true')
  }

  if (!envelope.providerMode || !AUDIT_JOB_LEDGER_ALLOWED_ENVELOPE_PROVIDER_MODES.includes(envelope.providerMode as never)) {
    issues.push('providerMode missing or unsupported')
  }

  if (options.adminProviderMode !== 'admin-local-fixture-readonly') {
    issues.push('Admin providerMode must remain admin-local-fixture-readonly')
  }

  if (!envelope.securityBoundary?.localOnly || !envelope.data?.securityBoundary?.localOnly) {
    issues.push('localOnly boundary is not satisfied')
  }

  if (!envelope.securityBoundary?.noWriteBoundarySatisfied || !envelope.data?.securityBoundary?.noWriteBoundarySatisfied) {
    issues.push('noWriteBoundarySatisfied is not true')
  }

  if ((envelope.securityBoundary?.openFlags ?? []).length > 0 || (envelope.data?.securityBoundary?.openFlags ?? []).length > 0) {
    issues.push('security boundary has open write flags')
  }

  if (envelope.data?.summary?.indexingState !== 'deferred') {
    issues.push('indexing deferred hard stop is not preserved')
  }

  if ((envelope.meta?.runtimeHttpWarning ?? envelope.source?.runtimeHttpWarning) !== AUDIT_JOB_LEDGER_RUNTIME_HTTP_WARNING) {
    issues.push('runtime HTTP warning carryforward is missing')
  }

  const panelTitles = new Set((envelope.data?.panels ?? []).map((panel) => panel.title))
  const missingPanels = options.expectedPanelTitles.filter((title) => !panelTitles.has(title))
  if (missingPanels.length > 0) {
    issues.push(`required panels missing: ${missingPanels.join(', ')}`)
  }

  const writablePanels = (envelope.data?.panels ?? []).filter(
    (panel) => panel.readOnly !== true || panel.safetyLabel !== 'read_only_no_write_actions',
  )
  if (writablePanels.length > 0) {
    issues.push(`panel read-only safety mismatch: ${writablePanels.map((panel) => panel.id).join(', ')}`)
  }

  const counts = envelope.data?.summary?.counts
  if (counts) {
    if (counts.auditEvents !== (envelope.data.auditEvents ?? []).length) issues.push('auditEvents count mismatch')
    if (counts.jobRuns !== (envelope.data.jobRuns ?? []).length) issues.push('jobRuns count mismatch')
    if (counts.promotionGates !== (envelope.data.promotionGates ?? []).length) issues.push('promotionGates count mismatch')
    if (counts.evidenceBindings !== (envelope.data.evidenceBindings ?? []).length) issues.push('evidenceBindings count mismatch')
    if (counts.traceEntries !== (envelope.data.traceIds?.entries ?? []).length) issues.push('traceEntries count mismatch')
    if (counts.warnings !== (envelope.data.warnings ?? []).length) issues.push('warnings count mismatch')
    if (counts.blockers !== (envelope.data.blockers ?? []).length) issues.push('blockers count mismatch')
    if (counts.nextGates !== (envelope.data.nextGates ?? []).length) issues.push('nextGates count mismatch')
  }

  return issues
}
