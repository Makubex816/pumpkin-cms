import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson, pathExists } from '../utils/json-writer.mjs';
import { resolveFixturePath, resolveTmpOutputPath, toPackageRelative } from '../utils/safe-paths.mjs';
import { readLocalStore } from '../store/local-store-reader.mjs';
import { mapStoreToProductionRecords } from './production-record-mapper.mjs';
import { productionEntities, productionRecordFiles } from './target-entity-router.mjs';
import { writeMigrationManifest } from './migration-manifest-writer.mjs';
import { writeMigrationChecksums } from './migration-checksum-writer.mjs';
import { writeRollbackPackage } from './rollback-package-writer.mjs';
import { writeResourceRegistryCandidate } from './resource-registry-candidate-writer.mjs';
import { writeBackupBeforeMigrationRequirements } from './backup-before-migration-writer.mjs';
import { validateMigrationDryRun } from './schema-contract-validator.mjs';

export async function runMigrationDryRun({
  storePath,
  profilePath,
  outputPath,
  renderedPath = null,
  overwrite = false
}) {
  const outputRoot = resolveTmpOutputPath(outputPath);
  if (await pathExists(outputRoot)) {
    if (!overwrite) {
      throw new Error(`migration dry-run output already exists: ${outputPath}`);
    }
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(path.join(outputRoot, 'production-records'), { recursive: true });

  const store = await readLocalStore(storePath);
  const profile = await readJson(resolveFixturePath(profilePath));
  const mapped = await mapStoreToProductionRecords({ store, profile, renderedPath });
  const productionFiles = [];

  for (const entity of productionEntities) {
    const relativeFile = productionRecordFiles[entity];
    const envelope = {
      schemaVersion: '0.1.0',
      collectionType: 'pumpkin-outbound-link-production-candidate-records',
      entity,
      migrationRunId: mapped.migrationRunId,
      tenantKey: mapped.tenantKey,
      siteKey: mapped.siteKey,
      providerMode: mapped.providerMode,
      records: mapped.recordsByEntity[entity] ?? [],
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
    await writeJson(path.join(outputRoot, relativeFile), envelope);
    productionFiles.push(relativeFile);
  }

  const rollbackPackage = await writeRollbackPackage({ migrationRoot: outputRoot, mapped });
  const resourceRegistryCandidate = await writeResourceRegistryCandidate({ migrationRoot: outputRoot, mapped });
  const backupRequirements = await writeBackupBeforeMigrationRequirements({ migrationRoot: outputRoot, mapped });
  const files = [
    ...productionFiles,
    'ROLLBACK_PACKAGE.json',
    'ROLLBACK_PACKAGE.md',
    'RESOURCE_REGISTRY_UPDATE_CANDIDATE.json',
    'BACKUP_BEFORE_MIGRATION_REQUIREMENTS.json',
    'BACKUP_BEFORE_MIGRATION_REQUIREMENTS.md'
  ];
  const manifest = await writeMigrationManifest({ migrationRoot: outputRoot, mapped, files });
  files.push('migration-manifest.json');
  const checksums = await writeMigrationChecksums({ migrationRoot: outputRoot, files });
  const validation = await validateMigrationDryRun({ migrationPath: outputPath });

  return {
    outputRoot,
    mapped,
    manifest,
    checksums,
    rollbackPackage,
    resourceRegistryCandidate,
    backupRequirements,
    validation,
    summary: {
      outputPath: toPackageRelative(outputRoot),
      migrationRunId: mapped.migrationRunId,
      status: validation.status,
      countsByEntity: manifest.summary.countsByEntity
    }
  };
}

export async function inspectMigrationDryRun({ migrationPath }) {
  const migrationRoot = resolveTmpOutputPath(migrationPath);
  const manifest = await readJson(path.join(migrationRoot, 'migration-manifest.json'));
  const validation = await readJson(path.join(migrationRoot, 'VALIDATION_RESULT.json'));
  return {
    migrationPath: toPackageRelative(migrationRoot),
    migrationRunId: manifest.migrationRunId,
    tenantKey: manifest.tenantKey,
    siteKey: manifest.siteKey,
    providerMode: manifest.providerMode,
    status: validation.status,
    countsByEntity: manifest.summary.countsByEntity,
    totalCandidateRecords: manifest.summary.totalCandidateRecords,
    failureCount: validation.summary.failureCount
  };
}
