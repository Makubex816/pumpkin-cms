import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';
import { countByEntity, stagingExecutionBoundaries, stagingExecutionSchemaVersion } from './staging-execution-store.mjs';

export async function writeResourceRegistryRefreshCandidate({ outputRoot, manifest, profile, executionRecords, providerStateReport }) {
  const candidate = {
    schemaVersion: stagingExecutionSchemaVersion,
    candidateType: 'pumpkin-outbound-link-resource-registry-refresh-candidate',
    status: providerStateReport.status,
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    tenantKey: manifest.tenantKey,
    siteKey: manifest.siteKey,
    stagingExecutionRunId: manifest.stagingExecutionRunId,
    applyPlanId: manifest.applyPlanId,
    targetProvider: {
      providerType: profile.targetProvider.providerType,
      environment: profile.targetProvider.environment,
      accountReference: profile.targetProvider.accountReference,
      databaseName: profile.targetProvider.databaseName,
      partitionKey: profile.targetProvider.partitionKey,
      credentialReferenceId: profile.targetProvider.credentialReferenceId,
      credentialValueIncluded: false
    },
    simulatedStore: {
      type: 'local-tmp-staging-provider-store',
      recordCount: executionRecords.length,
      countsByEntity: countByEntity(executionRecords)
    },
    boundaries: {
      ...stagingExecutionBoundaries(),
      registryWritePerformed: false
    }
  };
  await writeJson(path.join(outputRoot, 'resource-registry-refresh-candidate.json'), candidate);
  return candidate;
}

