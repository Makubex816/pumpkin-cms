import path from 'node:path';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { resolveTmpOutputPath } from '../utils/safe-paths.mjs';
import { stagingExecutionBoundaries, stagingExecutionSchemaVersion } from './staging-execution-store.mjs';

export async function verifyBackupPreExecution({ outputRoot, applyPlanPath, manifest }) {
  const applyPlanRoot = resolveTmpOutputPath(applyPlanPath);
  const applyPlanValidation = await readJson(path.join(applyPlanRoot, 'VALIDATION_RESULT.json'));
  const backupCheck = await readJson(path.join(applyPlanRoot, 'backup-center-pre-migration-check.json'));
  const failures = [];
  if (applyPlanValidation.status !== 'passed') {
    failures.push(failure('APPLY_PLAN_VALIDATION_NOT_PASSED', 'apply-plan must validate before staging execution', 'VALIDATION_RESULT.json'));
  }
  if (backupCheck.status !== 'passed') {
    failures.push(failure('BACKUP_PRE_MIGRATION_CHECK_NOT_PASSED', 'Backup Center pre-migration check must pass before staging execution', 'backup-center-pre-migration-check.json'));
  }
  const result = {
    schemaVersion: stagingExecutionSchemaVersion,
    verificationType: 'pumpkin-outbound-link-backup-pre-execution-verification',
    status: failures.length === 0 ? 'passed' : 'failed',
    applyPlanId: manifest.applyPlanId,
    stagingExecutionRunId: manifest.stagingExecutionRunId,
    providerProfileId: manifest.providerProfileId,
    providerMode: manifest.providerMode,
    summary: {
      applyPlanValidationStatus: applyPlanValidation.status,
      backupCheckStatus: backupCheck.status,
      failureCount: failures.length
    },
    failures,
    boundaries: {
      ...stagingExecutionBoundaries(),
      backupCreated: false,
      liveBackupExportPerformed: false
    }
  };
  await writeJson(path.join(outputRoot, 'backup-pre-execution-verification.json'), result);
  return result;
}

function failure(code, message, pathValue) {
  return { code, message, path: pathValue };
}

