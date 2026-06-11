import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson, pathExists } from '../utils/json-writer.mjs';
import { resolveFixturePath, resolveTmpOutputPath, toPackageRelative } from '../utils/safe-paths.mjs';
import { resolveExecutionPackageEvidence } from './evidence-bundle-resolver.mjs';
import { validateEvidenceBundle } from './evidence-validator.mjs';
import {
  writeBackupCenterPreExecutionReview,
  writeProviderCapabilityReview,
  writeResourceRegistryReview,
  writeStagingTargetWorksheet
} from './staging-target-worksheet-writer.mjs';
import { writeApprovalManifest } from './approval-manifest-writer.mjs';
import { writeFirstWriteBatchPlan } from './first-write-batch-plan-writer.mjs';
import { writeOperatorChecklist } from './operator-checklist-writer.mjs';
import { writeReadbackPlan } from './readback-plan-writer.mjs';
import { writeAbortRollbackChecklist } from './abort-rollback-checklist-writer.mjs';
import { writeNoGoConditions } from './no-go-condition-writer.mjs';
import { validateStagingExecutionPackage, writeExecutionPackageChecksums } from './execution-package-validator.mjs';

export async function buildStagingExecutionPackage({ sourcePath, outputPath, overwrite = false }) {
  const outputRoot = resolveTmpOutputPath(outputPath);
  if (await pathExists(outputRoot)) {
    if (!overwrite) {
      throw new Error(`staging execution package output already exists: ${outputPath}`);
    }
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(outputRoot, { recursive: true });
  const source = await readJson(resolveFixturePath(sourcePath));
  const evidence = await resolveExecutionPackageEvidence({ source, outputRoot });
  const evidenceValidation = await validateEvidenceBundle({ packagePath: outputPath });

  await writeStagingTargetWorksheet({ outputRoot, source, evidence });
  await writeProviderCapabilityReview({ outputRoot, evidence });
  await writeResourceRegistryReview({ outputRoot, evidence });
  await writeBackupCenterPreExecutionReview({ outputRoot, evidence });
  const firstWriteBatch = await writeFirstWriteBatchPlan({ outputRoot, source, evidence });
  await writeOperatorChecklist({ outputRoot, evidence });
  await writeReadbackPlan({ outputRoot, evidence });
  await writeAbortRollbackChecklist({ outputRoot, evidence });
  const noGoConditions = await writeNoGoConditions({ outputRoot });
  const approvalManifest = await writeApprovalManifest({
    outputRoot,
    source,
    evidence,
    validation: evidenceValidation
  });
  const manifest = await writePackageManifest({
    outputRoot,
    source,
    evidence,
    evidenceValidation,
    approvalManifest,
    firstWriteBatch,
    noGoConditions
  });
  const validation = await validateStagingExecutionPackage({ packagePath: outputPath });
  await writeExecutionPackageChecksums({ packagePath: outputPath });
  return {
    outputRoot,
    manifest,
    approvalManifest,
    validation,
    evidenceValidation,
    summary: {
      outputPath: toPackageRelative(outputRoot),
      status: validation.status,
      packageId: manifest.packageId,
      migrationRunId: evidence.migrationRunId,
      applyPlanId: evidence.applyPlanId,
      stagingExecutionRunId: evidence.stagingExecutionRunId,
      readbackRunId: evidence.readbackRunId,
      runtimeQaRunId: evidence.runtimeQaRunId,
      providerProfileId: evidence.providerProfileId,
      providerMode: evidence.providerMode,
      expectedRecordCount: evidence.totalRecords,
      futureExplicitStagingWriteApprovalRequired: approvalManifest.futureExplicitStagingWriteApprovalRequired,
      realStagingProviderWritePerformed: approvalManifest.realStagingProviderWritePerformed
    }
  };
}

async function writePackageManifest({ outputRoot, source, evidence, evidenceValidation, approvalManifest, firstWriteBatch, noGoConditions }) {
  const manifest = {
    schemaVersion: '0.1.0',
    manifestType: 'pumpkin-outbound-link-scoped-staging-execution-package',
    phase: '2H-22',
    packageId: source.packageId ?? 'phase-2h22-scoped-staging-execution-preflight-package',
    status: evidenceValidation.status === 'passed' ? 'awaiting_future_explicit_staging_write_approval' : 'blocked_missing_required_evidence',
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
    expectedRecordCount: evidence.totalRecords,
    rollbackPlanId: evidence.rollbackPlanId,
    approvalManifestId: approvalManifest.approvalManifestId,
    futureExplicitStagingWriteApprovalRequired: true,
    realStagingProviderWritePerformed: false,
    productionDatabaseMigrationPerformed: false,
    firstWriteBatch,
    noGoConditions,
    evidence: evidence.files,
    files: [
      'EXECUTION_PACKAGE_MANIFEST.json',
      'STAGING_TARGET_WORKSHEET.md',
      'PROVIDER_CAPABILITY_REVIEW.md',
      'RESOURCE_REGISTRY_REVIEW.md',
      'BACKUP_CENTER_PRE_EXECUTION_REVIEW.md',
      'FIRST_WRITE_BATCH_PLAN.md',
      'APPROVAL_MANIFEST.json',
      'OPERATOR_CHECKLIST.md',
      'READBACK_VERIFICATION_PLAN.md',
      'ABORT_ROLLBACK_CHECKLIST.md',
      'NO_GO_CONDITIONS.md',
      'VALIDATION_RESULT.json',
      'VALIDATION_RESULT.md',
      'checksums.sha256'
    ],
    boundaries: {
      localOnly: true,
      generatedUnderTmp: true,
      realStagingProviderWrites: false,
      productionDatabaseMigration: false,
      cmsWrites: false,
      protectedConfigReads: false,
      azureMutations: false,
      externalCrawling: false,
      deployment: false,
      searchConsoleIndexing: false,
      livePagePublication: false,
      secretValuesIncluded: false
    }
  };
  await writeJson(path.join(outputRoot, 'EXECUTION_PACKAGE_MANIFEST.json'), manifest);
  return manifest;
}
