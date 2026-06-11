import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';

export async function writeBackupCheckIntegration({ outputRoot, migration, profile, applyPlanId }) {
  const sourceRequirements = migration.backupRequirements ?? null;
  const missing = [];
  if (!sourceRequirements) missing.push('BACKUP_REQUIREMENTS_MISSING');
  if (!Array.isArray(sourceRequirements?.requiredFiles) || sourceRequirements.requiredFiles.length === 0) missing.push('BACKUP_REQUIRED_FILES_MISSING');
  if (!Array.isArray(sourceRequirements?.requiredChecks) || sourceRequirements.requiredChecks.length === 0) missing.push('BACKUP_REQUIRED_CHECKS_MISSING');
  const check = {
    schemaVersion: '0.1.0',
    checkType: 'pumpkin-outbound-link-backup-center-pre-migration-check',
    applyPlanId,
    migrationRunId: migration.manifest.migrationRunId,
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    tenantKey: migration.manifest.tenantKey,
    siteKey: migration.manifest.siteKey,
    status: missing.length === 0 ? 'passed' : 'failed',
    sourceRequirementsIncluded: Boolean(sourceRequirements),
    requiredFiles: sourceRequirements?.requiredFiles ?? [],
    requiredChecks: sourceRequirements?.requiredChecks ?? [],
    missing,
    boundaries: {
      backupCreated: false,
      backupMutated: false,
      liveProviderWrites: false
    }
  };
  await writeJson(path.join(outputRoot, 'backup-center-pre-migration-check.json'), check);
  return check;
}
