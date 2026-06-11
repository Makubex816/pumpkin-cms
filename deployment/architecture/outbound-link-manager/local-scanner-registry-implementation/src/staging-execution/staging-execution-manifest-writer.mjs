import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';
import { countByEntity, stagingExecutionBoundaries, stagingExecutionSchemaVersion } from './staging-execution-store.mjs';

export async function writeStagingExecutionManifest({ outputRoot, applyPlanManifest, profile, executionRecords, files, statuses = {} }) {
  const manifest = {
    schemaVersion: stagingExecutionSchemaVersion,
    manifestType: 'pumpkin-outbound-link-staging-execution-manifest',
    status: Object.values(statuses).every((status) => status === 'passed') ? 'passed' : 'pending-validation',
    stagingExecutionRunId: executionRecords[0]?.stagingExecutionRunId ?? null,
    readbackRunId: executionRecords[0]?.readbackRunId ?? null,
    applyPlanId: applyPlanManifest.applyPlanId,
    migrationRunId: applyPlanManifest.migrationRunId,
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    tenantKey: applyPlanManifest.tenantKey,
    siteKey: applyPlanManifest.siteKey,
    generatedAt: profile.generatedAt ?? applyPlanManifest.generatedAt ?? '2026-06-10T00:00:00.000Z',
    summary: {
      totalExecutionRecords: executionRecords.length,
      countsByEntity: countByEntity(executionRecords),
      ...statuses
    },
    files,
    boundaries: stagingExecutionBoundaries()
  };
  await writeJson(path.join(outputRoot, 'staging-execution-manifest.json'), manifest);
  return manifest;
}

