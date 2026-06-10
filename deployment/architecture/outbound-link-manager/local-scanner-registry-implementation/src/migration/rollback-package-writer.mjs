import fs from 'node:fs/promises';
import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';

export async function writeRollbackPackage({ migrationRoot, mapped }) {
  const rollbackPlan = mapped.recordsByEntity.outbound_link_rollback_plans[0] ?? null;
  const packageJson = {
    schemaVersion: '0.1.0',
    packageType: 'pumpkin-outbound-link-migration-dry-run-rollback-package',
    migrationRunId: mapped.migrationRunId,
    tenantKey: mapped.tenantKey,
    siteKey: mapped.siteKey,
    rollbackPlanId: rollbackPlan?.rollbackPlanId ?? null,
    executableAgainstLiveSystems: false,
    rollbackExecutionImplemented: false,
    summary: rollbackPlan?.summary ?? {},
    boundaries: {
      localOnly: true,
      dryRunOnly: true,
      liveProviderWrites: false
    }
  };
  await writeJson(path.join(migrationRoot, 'ROLLBACK_PACKAGE.json'), packageJson);
  await fs.writeFile(path.join(migrationRoot, 'ROLLBACK_PACKAGE.md'), renderRollbackPackage(packageJson), 'utf8');
  return packageJson;
}

function renderRollbackPackage(packageJson) {
  const counts = Object.entries(packageJson.summary.entityCounts ?? {})
    .map(([entity, count]) => `| ${entity} | ${count} |`)
    .join('\n');
  return `# Migration Dry-Run Rollback Package

Migration run: ${packageJson.migrationRunId}

Rollback plan: ${packageJson.rollbackPlanId}

Executable against live systems: no

| Entity | Candidate Records |
| --- | ---: |
${counts}

This is a dry-run rollback package. It does not execute against production systems and does not authorize future live rollback.
`;
}
