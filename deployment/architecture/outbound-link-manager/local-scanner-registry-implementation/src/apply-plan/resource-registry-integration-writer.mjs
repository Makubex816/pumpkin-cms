import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';

export async function writeApplyPlanResourceRegistryIntegration({ outputRoot, migration, profile, applyPlanId }) {
  const sourceCandidate = migration.resourceRegistryCandidate ?? null;
  const candidate = {
    schemaVersion: '0.1.0',
    candidateType: 'pumpkin-outbound-link-staging-provider-resource-registry-integration',
    applyPlanId,
    migrationRunId: migration.manifest.migrationRunId,
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    tenantKey: migration.manifest.tenantKey,
    siteKey: migration.manifest.siteKey,
    sourceMigrationCandidateIncluded: Boolean(sourceCandidate),
    targetProvider: {
      ...(sourceCandidate?.targetProvider ?? {}),
      ...profile.targetProvider,
      credentialValueIncluded: false
    },
    containers: profile.targetContainers,
    boundaries: {
      registryWritePerformed: false,
      secretValuesIncluded: false,
      productionWrites: false,
      liveProviderWrites: false,
      protectedConfigReads: false
    }
  };
  await writeJson(path.join(outputRoot, 'resource-registry-update-candidate.json'), candidate);
  return candidate;
}
