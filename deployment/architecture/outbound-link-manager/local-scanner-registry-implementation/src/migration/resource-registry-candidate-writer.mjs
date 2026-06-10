import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';
import { productionEntities } from './target-entity-router.mjs';

export async function writeResourceRegistryCandidate({ migrationRoot, mapped }) {
  const candidate = {
    schemaVersion: '0.1.0',
    candidateType: 'pumpkin-resource-registry-outbound-link-provider-update',
    migrationRunId: mapped.migrationRunId,
    tenantKey: mapped.tenantKey,
    siteKey: mapped.siteKey,
    providerMode: mapped.providerMode,
    targetProvider: {
      providerType: mapped.profile.targetProvider.providerType,
      environment: mapped.profile.targetProvider.environment,
      accountReference: mapped.profile.targetProvider.accountReference,
      databaseName: mapped.profile.targetProvider.databaseName,
      partitionKey: mapped.profile.targetProvider.partitionKey,
      credentialReferenceId: mapped.profile.targetProvider.credentialReferenceId,
      credentialValueIncluded: false
    },
    containers: Object.fromEntries(productionEntities.map((entity) => [
      entity,
      mapped.profile.targetContainers?.[entity] ?? entity.replaceAll('_', '-')
    ])),
    requiredProfiles: [
      'local-dev',
      'fake-provider',
      'offline-bundle',
      'local-file-backed',
      'local-api-fake-provider',
      'live-readonly',
      'live-write-approved',
      'production-runtime'
    ],
    boundaries: {
      registryWritePerformed: false,
      secretValuesIncluded: false,
      productionWrites: false,
      liveProviderWrites: false
    }
  };
  await writeJson(path.join(migrationRoot, 'RESOURCE_REGISTRY_UPDATE_CANDIDATE.json'), candidate);
  return candidate;
}
