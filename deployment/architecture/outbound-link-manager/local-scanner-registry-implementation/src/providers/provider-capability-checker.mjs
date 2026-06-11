import path from 'node:path';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { resolveFixturePath, resolveTmpOutputPath, toPackageRelative } from '../utils/safe-paths.mjs';
import { validateProviderProfile } from './provider-profile-validator.mjs';
import { evaluateNoLiveWriteGate } from './no-live-write-gate.mjs';

export async function checkProviderCapabilities({ profilePath, outputPath = null, operation = 'provider-check' }) {
  const rawProfile = await readJson(resolveFixturePath(profilePath));
  const validation = validateProviderProfile(rawProfile);
  const profile = validation.profile;
  const gate = evaluateNoLiveWriteGate({ profile, operation });
  const report = {
    schemaVersion: '0.1.0',
    reportType: 'pumpkin-outbound-link-provider-capability-check',
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    operation,
    status: validation.status === 'passed' && (operation === 'provider-check' || gate.allowed) ? 'passed' : 'blocked',
    validation,
    gate,
    capabilities: profile.capabilities,
    boundaries: profile.boundaries,
    summary: {
      canPlanWrites: profile.capabilities.canPlanWrites,
      canSimulateWrites: profile.capabilities.canSimulateWrites,
      canPerformLiveWrites: false,
      canReadLive: profile.capabilities.canReadLive,
      liveWriteAllowed: false,
      productionWriteAllowed: false
    }
  };
  if (outputPath) {
    const outputRoot = resolveTmpOutputPath(outputPath);
    await writeJson(path.join(outputRoot, 'provider-profile.json'), redactedProviderProfile(profile));
    await writeJson(path.join(outputRoot, 'provider-capabilities.json'), report);
  }
  return {
    ...report,
    outputPath: outputPath ? toPackageRelative(resolveTmpOutputPath(outputPath)) : null
  };
}

export function redactedProviderProfile(profile) {
  return {
    ...profile,
    targetProvider: {
      ...profile.targetProvider,
      credentialValueIncluded: false
    },
    boundaries: {
      ...profile.boundaries,
      secretValuesIncluded: false
    }
  };
}
