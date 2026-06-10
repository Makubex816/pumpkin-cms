import fs from 'node:fs/promises';
import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';

export async function writeBackupBeforeMigrationRequirements({ migrationRoot, mapped }) {
  const requirements = {
    schemaVersion: '0.1.0',
    requirementsType: 'pumpkin-outbound-link-backup-before-migration-requirements',
    migrationRunId: mapped.migrationRunId,
    tenantKey: mapped.tenantKey,
    siteKey: mapped.siteKey,
    requiredFiles: [
      'cms-content/outbound-links.json',
      'cms-content/outbound-link-instances.json',
      'cms-content/outbound-link-policies.json',
      'cms-content/outbound-link-scan-runs.json',
      'cms-content/outbound-link-audit-summary.json',
      'cms-content/outbound-link-render-decisions.json',
      'cms-content/outbound-link-validation-report.json',
      'cms-content/OUTBOUND_LINK_VALIDATION_REPORT.md'
    ],
    requiredChecks: [
      'complete tenant standard backup candidate',
      'checksum manifest',
      'restore-plan validation',
      'resource registry snapshot',
      'operator summary',
      'owner signoff'
    ],
    boundaries: {
      backupCreatedByMigrationDryRun: false,
      productionWrites: false,
      liveProviderWrites: false
    }
  };
  await writeJson(path.join(migrationRoot, 'BACKUP_BEFORE_MIGRATION_REQUIREMENTS.json'), requirements);
  await fs.writeFile(path.join(migrationRoot, 'BACKUP_BEFORE_MIGRATION_REQUIREMENTS.md'), renderBackupRequirements(requirements), 'utf8');
  return requirements;
}

function renderBackupRequirements(requirements) {
  return `# Backup Before Migration Requirements

Migration run: ${requirements.migrationRunId}

Tenant: ${requirements.tenantKey}

Site: ${requirements.siteKey}

Required files:

${requirements.requiredFiles.map((file) => `- ${file}`).join('\n')}

Required checks:

${requirements.requiredChecks.map((check) => `- ${check}`).join('\n')}

The migration dry-run does not create or mutate a live backup. A complete Backup Center proof is required before any future production migration execution.
`;
}
