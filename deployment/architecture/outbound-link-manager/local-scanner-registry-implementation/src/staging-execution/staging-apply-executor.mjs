import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson, pathExists } from '../utils/json-writer.mjs';
import { resolveFixturePath, resolveTmpOutputPath, toPackageRelative } from '../utils/safe-paths.mjs';
import { validateApplyPlan } from '../apply-plan/apply-plan-validator.mjs';
import { validateProviderProfile } from '../providers/provider-profile-validator.mjs';
import { evaluateNoLiveWriteGate } from '../providers/no-live-write-gate.mjs';
import { redactedProviderProfile } from '../providers/provider-capability-checker.mjs';
import {
  buildStagingExecutionRecords,
  countByEntity,
  stagingExecutionBoundaries,
  stagingExecutionSchemaVersion,
  writeStagingExecutionRecords,
  writeStagingProviderStore
} from './staging-execution-store.mjs';
import { verifyStagingReadback } from './staging-readback-verifier.mjs';
import { compareExecutionReadback } from './execution-readback-comparator.mjs';
import { validateDryRunReplay } from './dry-run-replay-validator.mjs';
import { validateTraceAuditRollbackPersistence } from './trace-audit-rollback-persistence-validator.mjs';
import { writeProviderStateReport } from './provider-state-report-writer.mjs';
import { writeResourceRegistryRefreshCandidate } from './resource-registry-refresh-writer.mjs';
import { verifyBackupPreExecution } from './backup-pre-execution-verifier.mjs';
import { writeStagingReadinessSummary } from './staging-readiness-summary-writer.mjs';
import { writeStagingExecutionManifest } from './staging-execution-manifest-writer.mjs';
import { writeStagingExecutionChecksums } from './staging-execution-checksum-writer.mjs';
import { validateStagingExecution } from './staging-execution-validator.mjs';

const checksumFiles = [
  'staging-execution-manifest.json',
  'staging-execution-records.json',
  'staging-provider-store/staging-provider-store-index.json',
  'staging-provider-store/outbound_links.json',
  'staging-provider-store/outbound_link_instances.json',
  'staging-provider-store/outbound_link_policies.json',
  'staging-provider-store/outbound_link_scan_runs.json',
  'staging-provider-store/outbound_link_audit_logs.json',
  'staging-provider-store/outbound_link_render_decisions.json',
  'staging-provider-store/outbound_link_review_decisions.json',
  'staging-provider-store/outbound_link_bulk_actions.json',
  'staging-provider-store/outbound_link_rollback_plans.json',
  'staging-provider-store/outbound_link_trace_logs.json',
  'provider-state-report.json',
  'readback-result.json',
  'execution-readback-comparison.json',
  'dry-run-replay-validation.json',
  'trace-audit-rollback-persistence.json',
  'resource-registry-refresh-candidate.json',
  'backup-pre-execution-verification.json',
  'staging-readiness-summary.json',
  'provider-profile.json',
  'provider-gate-report.json'
];

export async function runStagingExecution({
  applyPlanPath,
  profilePath,
  outputPath,
  overwrite = false
}) {
  const outputRoot = resolveTmpOutputPath(outputPath);
  if (await pathExists(outputRoot)) {
    if (!overwrite) {
      throw new Error(`staging execution output already exists: ${outputPath}`);
    }
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(outputRoot, { recursive: true });

  const rawProfile = await readJson(resolveFixturePath(profilePath));
  const profileValidation = validateProviderProfile(rawProfile);
  const profile = profileValidation.profile;
  const gate = evaluateNoLiveWriteGate({ profile, operation: 'staging-execute' });
  await writeJson(path.join(outputRoot, 'provider-profile.json'), redactedProviderProfile(profile));
  await writeJson(path.join(outputRoot, 'provider-gate-report.json'), {
    schemaVersion: stagingExecutionSchemaVersion,
    reportType: 'pumpkin-outbound-link-staging-execution-provider-gate',
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    operation: 'staging-execute',
    status: profileValidation.status === 'passed' && gate.allowed ? 'passed' : 'blocked',
    validation: profileValidation,
    gate,
    boundaries: stagingExecutionBoundaries()
  });

  const applyPlan = await readApplyPlanPackage(applyPlanPath);
  const applyPlanValidation = await validateApplyPlan({ applyPlanPath, writeReport: false });
  if (profileValidation.status !== 'passed' || !gate.allowed || applyPlanValidation.status !== 'passed') {
    const validation = await writeBlockedStagingExecution({
      outputRoot,
      applyPlan,
      profile,
      gate,
      reason: blockReason({ profileValidation, gate, applyPlanValidation })
    });
    return {
      outputRoot,
      validation,
      summary: {
        outputPath: toPackageRelative(outputRoot),
        status: validation.status,
        providerProfileId: profile.providerProfileId,
        providerMode: profile.providerMode,
        recordCount: 0
      }
    };
  }

  const executionRecords = buildStagingExecutionRecords({
    applyPlanRecords: applyPlan.records,
    profile,
    applyPlanManifest: applyPlan.manifest
  });
  await writeStagingExecutionRecords({ outputRoot, executionRecords });
  const providerStore = await writeStagingProviderStore({ outputRoot, executionRecords });
  let manifest = await writeStagingExecutionManifest({
    outputRoot,
    applyPlanManifest: applyPlan.manifest,
    profile,
    executionRecords,
    files: checksumFiles
  });
  const readback = await verifyStagingReadback({ executionPath: outputPath });
  const comparison = await compareExecutionReadback({
    outputRoot,
    executionRecords,
    readbackRecords: readback.readbackRecords
  });
  const replayValidation = await validateDryRunReplay({
    outputRoot,
    applyPlanRecords: applyPlan.records,
    executionRecords,
    readbackRecords: readback.readbackRecords
  });
  const traceAuditRollback = await validateTraceAuditRollbackPersistence({
    outputRoot,
    executionRecords,
    readbackRecords: readback.readbackRecords,
    providerStoreRecords: providerStore.storeRecords
  });
  const providerState = await writeProviderStateReport({
    outputRoot,
    manifest,
    executionRecords,
    readbackResult: readback.result,
    comparison,
    replayValidation
  });
  const resourceRegistry = await writeResourceRegistryRefreshCandidate({
    outputRoot,
    manifest,
    profile,
    executionRecords,
    providerStateReport: providerState
  });
  const backupPreExecution = await verifyBackupPreExecution({
    outputRoot,
    applyPlanPath,
    manifest
  });
  const readiness = await writeStagingReadinessSummary({
    outputRoot,
    manifest,
    checks: {
      applyPlanValidation,
      readback: readback.result,
      comparison,
      replayValidation,
      traceAuditRollback,
      providerState,
      resourceRegistry,
      backupPreExecution
    }
  });
  manifest = await writeStagingExecutionManifest({
    outputRoot,
    applyPlanManifest: applyPlan.manifest,
    profile,
    executionRecords,
    files: checksumFiles,
    statuses: {
      readbackStatus: readback.result.status,
      comparisonStatus: comparison.status,
      replayValidationStatus: replayValidation.status,
      traceAuditRollbackStatus: traceAuditRollback.status,
      providerStateStatus: providerState.status,
      resourceRegistryStatus: resourceRegistry.status,
      backupPreExecutionStatus: backupPreExecution.status,
      stagingReadinessStatus: readiness.status
    }
  });
  await writeStagingExecutionChecksums({ outputRoot, files: checksumFiles });
  const validation = await validateStagingExecution({ executionPath: outputPath });
  return {
    outputRoot,
    manifest,
    executionRecords,
    readback: readback.result,
    comparison,
    replayValidation,
    traceAuditRollback,
    providerState,
    resourceRegistry,
    backupPreExecution,
    readiness,
    validation,
    summary: {
      outputPath: toPackageRelative(outputRoot),
      status: validation.status,
      stagingExecutionRunId: manifest.stagingExecutionRunId,
      readbackRunId: manifest.readbackRunId,
      applyPlanId: manifest.applyPlanId,
      providerProfileId: profile.providerProfileId,
      providerMode: profile.providerMode,
      recordCount: executionRecords.length,
      countsByEntity: countByEntity(executionRecords)
    }
  };
}

export async function runStagingReadback({ executionPath, outputPath }) {
  const readback = await verifyStagingReadback({ executionPath, outputPath });
  const outputRoot = resolveTmpOutputPath(outputPath);
  await writeJson(path.join(outputRoot, 'VALIDATION_RESULT.json'), {
    schemaVersion: stagingExecutionSchemaVersion,
    validationType: 'pumpkin-outbound-link-staging-readback-command-validation',
    status: readback.result.status,
    stagingExecutionRunId: readback.result.stagingExecutionRunId,
    readbackRunId: readback.result.readbackRunId,
    summary: {
      readbackRecordCount: readback.result.summary.readbackRecordCount,
      failureCount: readback.result.summary.failureCount
    },
    failures: readback.result.failures,
    boundaries: stagingExecutionBoundaries()
  });
  return {
    outputRoot,
    ...readback,
    summary: {
      outputPath: toPackageRelative(outputRoot),
      status: readback.result.status,
      readbackRecordCount: readback.result.summary.readbackRecordCount
    }
  };
}

export async function inspectStagingExecution({ executionPath }) {
  const root = resolveTmpOutputPath(executionPath);
  const manifest = await readJson(path.join(root, 'staging-execution-manifest.json'));
  const validation = await readJson(path.join(root, 'VALIDATION_RESULT.json'));
  return {
    executionPath: toPackageRelative(root),
    stagingExecutionRunId: manifest.stagingExecutionRunId,
    readbackRunId: manifest.readbackRunId,
    applyPlanId: manifest.applyPlanId,
    providerProfileId: manifest.providerProfileId,
    providerMode: manifest.providerMode,
    status: validation.status,
    recordCount: manifest.summary.totalExecutionRecords,
    failureCount: validation.summary.failureCount
  };
}

async function readApplyPlanPackage(applyPlanPath) {
  const applyPlanRoot = resolveTmpOutputPath(applyPlanPath);
  const envelope = await readJson(path.join(applyPlanRoot, 'apply-plan-records.json'));
  return {
    root: applyPlanRoot,
    manifest: await readJson(path.join(applyPlanRoot, 'apply-plan-manifest.json')),
    validation: await readJson(path.join(applyPlanRoot, 'VALIDATION_RESULT.json')),
    backupCheck: await readJson(path.join(applyPlanRoot, 'backup-center-pre-migration-check.json')),
    resourceRegistry: await readJson(path.join(applyPlanRoot, 'resource-registry-update-candidate.json')),
    rollbackIntegration: await readJson(path.join(applyPlanRoot, 'rollback-integration-result.json')),
    records: envelope.records ?? []
  };
}

async function writeBlockedStagingExecution({ outputRoot, applyPlan, profile, gate, reason }) {
  const manifest = {
    schemaVersion: stagingExecutionSchemaVersion,
    manifestType: 'pumpkin-outbound-link-staging-execution-manifest',
    status: 'blocked',
    stagingExecutionRunId: null,
    readbackRunId: null,
    applyPlanId: applyPlan.manifest?.applyPlanId ?? null,
    migrationRunId: applyPlan.manifest?.migrationRunId ?? null,
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    tenantKey: applyPlan.manifest?.tenantKey ?? null,
    siteKey: applyPlan.manifest?.siteKey ?? null,
    blockReason: reason,
    summary: {
      totalExecutionRecords: 0,
      countsByEntity: {}
    },
    boundaries: stagingExecutionBoundaries()
  };
  await writeJson(path.join(outputRoot, 'staging-execution-manifest.json'), manifest);
  await writeJson(path.join(outputRoot, 'staging-execution-records.json'), {
    schemaVersion: stagingExecutionSchemaVersion,
    collectionType: 'pumpkin-outbound-link-staging-execution-records',
    records: [],
    blocked: true,
    blockReason: reason,
    boundaries: stagingExecutionBoundaries()
  });
  await fs.mkdir(path.join(outputRoot, 'staging-provider-store'), { recursive: true });
  await writeJson(path.join(outputRoot, 'staging-provider-store/staging-provider-store-index.json'), {
    schemaVersion: stagingExecutionSchemaVersion,
    status: 'blocked',
    files: [],
    summary: { totalRecords: 0, countsByEntity: {} },
    boundaries: stagingExecutionBoundaries()
  });
  const blocked = {
    schemaVersion: stagingExecutionSchemaVersion,
    status: 'blocked',
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    applyPlanId: manifest.applyPlanId,
    summary: { failureCount: 1 },
    failures: [{ code: gate.code, message: reason, path: 'providerMode' }],
    boundaries: stagingExecutionBoundaries()
  };
  for (const file of [
    'provider-state-report.json',
    'readback-result.json',
    'execution-readback-comparison.json',
    'dry-run-replay-validation.json',
    'trace-audit-rollback-persistence.json',
    'resource-registry-refresh-candidate.json',
    'backup-pre-execution-verification.json',
    'staging-readiness-summary.json'
  ]) {
    await writeJson(path.join(outputRoot, file), blocked);
  }
  await writeJson(path.join(outputRoot, 'checksums.json'), {
    schemaVersion: stagingExecutionSchemaVersion,
    checksumType: 'pumpkin-outbound-link-staging-execution-checksums',
    files: []
  });
  await fs.writeFile(path.join(outputRoot, 'checksums.sha256'), '', 'utf8');
  const validation = {
    schemaVersion: stagingExecutionSchemaVersion,
    validationType: 'pumpkin-outbound-link-staging-execution-validation',
    status: 'blocked',
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    applyPlanId: manifest.applyPlanId,
    summary: {
      executionRecordCount: 0,
      failureCount: 1
    },
    failures: [{ code: gate.code, message: reason, path: 'providerMode' }],
    boundaries: stagingExecutionBoundaries()
  };
  await writeJson(path.join(outputRoot, 'VALIDATION_RESULT.json'), validation);
  await fs.writeFile(path.join(outputRoot, 'VALIDATION_RESULT.md'), `# Staging Execution Validation

Status: blocked

Provider mode: ${profile.providerMode}

Block reason: ${reason}

Boundary: no live writes were attempted.
`, 'utf8');
  return validation;
}

function blockReason({ profileValidation, gate, applyPlanValidation }) {
  if (profileValidation.status !== 'passed') return 'provider profile validation failed';
  if (!gate.allowed) return gate.message;
  if (applyPlanValidation.status !== 'passed') return 'apply-plan validation failed';
  return 'staging execution blocked';
}

