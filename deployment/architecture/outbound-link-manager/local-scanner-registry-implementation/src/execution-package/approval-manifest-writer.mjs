import path from 'node:path';
import { deterministicId } from '../migration/deterministic-id-mapper.mjs';
import { writeJson } from '../utils/json-writer.mjs';

export async function writeApprovalManifest({ outputRoot, source, evidence, validation }) {
  const approvalManifest = {
    schemaVersion: '0.1.0',
    manifestType: 'pumpkin-outbound-link-scoped-staging-execution-approval-manifest',
    packageId: source.packageId ?? 'phase-2h22-scoped-staging-execution-preflight-package',
    approvalManifestId: deterministicId('olapprove', [
      evidence.migrationRunId,
      evidence.applyPlanId,
      evidence.stagingExecutionRunId,
      evidence.runtimeQaRunId
    ], 16),
    status: 'awaiting_future_explicit_staging_write_approval',
    futureExplicitStagingWriteApprovalRequired: true,
    futureApprovalGranted: false,
    realStagingProviderWritePerformed: false,
    productionDatabaseMigrationPerformed: false,
    tenantKey: evidence.tenantKey,
    siteKey: evidence.siteKey,
    migrationRunId: evidence.migrationRunId,
    applyPlanId: evidence.applyPlanId,
    stagingExecutionRunId: evidence.stagingExecutionRunId,
    readbackRunId: evidence.readbackRunId,
    runtimeQaRunId: evidence.runtimeQaRunId,
    providerProfileId: evidence.providerProfileId,
    providerMode: evidence.providerMode,
    expectedEntityCounts: evidence.expectedCounts,
    firstWriteBatch: buildFirstWriteBatch({ source, evidence }),
    rollbackPlanId: evidence.rollbackPlanId,
    validationStatus: validation.status,
    noGoConditionCount: defaultNoGoConditions().length,
    requiredFutureApprovalFields: [
      'approvalReference',
      'operatorName',
      'approvedStagingTargetProviderProfileId',
      'approvedTenantKey',
      'approvedSiteKey',
      'approvedBackupCenterEvidenceId',
      'approvedRuntimeQaEvidenceId',
      'approvedAbortRollbackPlanId'
    ],
    boundaries: {
      localOnly: true,
      approvalPackageOnly: true,
      generatedUnderTmp: true,
      protectedConfigReads: false,
      realStagingProviderWrites: false,
      productionDatabaseMigration: false,
      cmsWrites: false,
      azureMutations: false,
      externalCrawling: false,
      deployment: false,
      searchConsoleIndexing: false,
      livePagePublication: false,
      secretValuesIncluded: false
    }
  };
  await writeJson(path.join(outputRoot, 'APPROVAL_MANIFEST.json'), approvalManifest);
  return approvalManifest;
}

export function buildFirstWriteBatch({ source, evidence }) {
  const targetEntities = Object.entries(evidence.expectedCounts)
    .filter(([, count]) => count > 0)
    .map(([entity, count]) => ({
      targetEntity: entity,
      expectedCount: count,
      targetContainer: (source.targetContainers ?? {})[entity] ?? entity.replaceAll('_', '-')
    }));
  return {
    batchId: deterministicId('olbatch', [evidence.applyPlanId, evidence.stagingExecutionRunId, 'first-write'], 16),
    strategy: source.firstWriteBatch?.strategy ?? 'single-tenant-site-scoped-first-write',
    maxRecords: source.firstWriteBatch?.maxRecords ?? evidence.totalRecords,
    expectedRecordCount: evidence.totalRecords,
    targetEntities,
    stopOnConflict: true,
    stopOnReadbackMismatch: true,
    requiresFutureApproval: true
  };
}

export function defaultNoGoConditions() {
  return [
    'future explicit staging write approval is missing',
    'target provider profile ID does not match approval manifest',
    'tenantKey or siteKey differs from approved scope',
    'Backup Center pre-execution evidence is missing or failed',
    'runtime QA evidence is missing or failed',
    'Resource Registry refresh candidate is missing or contains secret values',
    'rollback/readback plan is missing',
    'provider capability report indicates live/production writes outside scope',
    'protected config access is required',
    'any conflict, checksum mismatch, or readback mismatch is detected'
  ];
}
