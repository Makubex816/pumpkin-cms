import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';
import { productionEntities } from './target-entity-router.mjs';

export async function writeMigrationManifest({ migrationRoot, mapped, files }) {
  const countsByEntity = Object.fromEntries(
    productionEntities.map((entity) => [entity, mapped.recordsByEntity[entity]?.length ?? 0])
  );
  const manifest = {
    schemaVersion: '0.1.0',
    manifestType: 'pumpkin-outbound-link-production-migration-dry-run-manifest',
    migrationRunId: mapped.migrationRunId,
    tenantKey: mapped.tenantKey,
    siteKey: mapped.siteKey,
    providerMode: mapped.providerMode,
    generatedAt: mapped.profile.generatedAt,
    targetProvider: {
      providerType: mapped.profile.targetProvider.providerType,
      environment: mapped.profile.targetProvider.environment,
      accountReference: mapped.profile.targetProvider.accountReference,
      databaseName: mapped.profile.targetProvider.databaseName,
      partitionKey: mapped.profile.targetProvider.partitionKey,
      credentialReferenceId: mapped.profile.targetProvider.credentialReferenceId
    },
    summary: {
      countsByEntity,
      totalCandidateRecords: Object.values(countsByEntity).reduce((sum, count) => sum + count, 0)
    },
    files,
    boundaries: {
      localOnly: true,
      dryRunOnly: true,
      productionWrites: false,
      liveProviderWrites: false,
      cmsWrites: false,
      protectedConfigReads: false,
      externalCrawling: false
    }
  };
  await writeJson(path.join(migrationRoot, 'migration-manifest.json'), manifest);
  return manifest;
}
