import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';

export async function validateRollbackIntegration({ outputRoot, migration, applyPlanRecords, applyPlanId, profile }) {
  const rollbackPackage = migration.rollbackPackage ?? null;
  const failures = [];
  if (!rollbackPackage) {
    failures.push(failure('ROLLBACK_PACKAGE_MISSING', 'rollback package is required', 'ROLLBACK_PACKAGE.json'));
  }
  if (rollbackPackage?.executableAgainstLiveSystems !== false) {
    failures.push(failure('ROLLBACK_PACKAGE_EXECUTABLE_UNSAFE', 'rollback package must not be executable against live systems', 'ROLLBACK_PACKAGE.json/executableAgainstLiveSystems'));
  }
  const rollbackPlanId = rollbackPackage?.rollbackPlanId ?? null;
  if (!rollbackPlanId) {
    failures.push(failure('ROLLBACK_PLAN_ID_MISSING', 'rollbackPlanId is required', 'ROLLBACK_PACKAGE.json/rollbackPlanId'));
  }
  if (rollbackPlanId && !applyPlanRecords.some((record) => record.rollbackPlanId === rollbackPlanId)) {
    failures.push(failure('ROLLBACK_PLAN_NOT_REFERENCED', 'apply-plan records must reference rollbackPlanId', 'apply-plan-records.json'));
  }
  const result = {
    schemaVersion: '0.1.0',
    validationType: 'pumpkin-outbound-link-rollback-apply-plan-integration',
    applyPlanId,
    migrationRunId: migration.manifest.migrationRunId,
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    status: failures.length === 0 ? 'passed' : 'failed',
    rollbackPlanId,
    checkedRecordCount: applyPlanRecords.length,
    failures,
    summary: {
      failureCount: failures.length
    },
    boundaries: {
      rollbackExecuted: false,
      liveProviderWrites: false
    }
  };
  await writeJson(path.join(outputRoot, 'rollback-integration-result.json'), result);
  return result;
}

function failure(code, message, path) {
  return { code, message, path };
}
