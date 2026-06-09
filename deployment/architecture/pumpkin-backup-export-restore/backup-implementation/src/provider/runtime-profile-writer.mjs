import fs from 'node:fs/promises';
import path from 'node:path';
import { resolveRuntimeProfile } from './runtime-profile-model.mjs';
import { writeJson } from '../utils/json-writer.mjs';

export async function writeRuntimeProfileStatus({
  bundleRoot,
  request,
  createdAt,
  runtimeProfileName = null,
  providerResolution = null
}) {
  const tenantKey = request.scope.tenantKey;
  const siteKey = request.scope.siteKey ?? tenantKey;
  const resolved = resolveRuntimeProfile({
    profileName: runtimeProfileName,
    tenantKey,
    siteKey,
    environment: 'local',
    requestedOperation: 'standard-backup-status',
    providerResolution
  });
  const outputDir = path.join(bundleRoot, 'database', 'runtime-profile');
  await fs.mkdir(outputDir, { recursive: true });

  const payload = {
    schemaVersion: '0.2.0',
    generatedAt: createdAt,
    fakeOnly: true,
    resolverMode: 'fixture',
    runtimeProfile: resolved.profile,
    validation: resolved.validation,
    boundaries: {
      protectedConfigRead: false,
      cmsApiCalled: false,
      azureCalled: false,
      databaseExportPerformed: false,
      cosmosDocumentExportPerformed: false,
      blobDownloadPerformed: false,
      externalSystemMutation: false,
      secretsIncluded: false,
      runtimeSwitchPerformed: false
    }
  };

  await writeJson(path.join(outputDir, 'runtime-profile.json'), payload);
  await fs.writeFile(
    path.join(outputDir, 'RUNTIME_PROFILE.md'),
    [
      '# Runtime Profile',
      '',
      'This is fixture-only runtime profile metadata for Backup Center guard decisions.',
      '',
      `Profile: ${resolved.profile.profileName}`,
      `Provider type: ${resolved.profile.provider.providerType}`,
      `Provider status: ${resolved.profile.provider.providerStatus}`,
      `Runtime status: ${resolved.profile.provider.runtimeStatus}`,
      `Live database export allowed: ${resolved.profile.guards.liveDatabaseExport.allowed}`,
      `Runtime switch allowed: ${resolved.profile.guards.runtimeSwitch.allowed}`,
      `Fake complete export allowed: ${resolved.profile.guards.fakeCompleteExport.allowed}`,
      `Next action: ${resolved.profile.readiness.nextAction}`,
      '',
      '- No protected config was read.',
      '- No CMS/API call was made.',
      '- No Azure command was run.',
      '- No database export was performed.',
      '- No runtime switch was performed.',
      ''
    ].join('\n'),
    'utf8'
  );

  return {
    entries: [
      entry('database/runtime-profile/runtime-profile.json'),
      entry('database/runtime-profile/RUNTIME_PROFILE.md')
    ],
    component: {
      status: resolved.profile.readiness.status,
      profileName: resolved.profile.profileName,
      providerType: resolved.profile.provider.providerType,
      providerStatus: resolved.profile.provider.providerStatus,
      provisioningStatus: resolved.profile.provider.provisioningStatus,
      runtimeStatus: resolved.profile.provider.runtimeStatus,
      fakeOnly: true,
      liveDatabaseExportAllowed: false,
      fakeCompleteExportAllowed: resolved.profile.guards.fakeCompleteExport.allowed,
      runtimeSwitchAllowed: false,
      blockedReasonCodes: resolved.profile.readiness.blockedReasonCodes,
      nextAction: resolved.profile.readiness.nextAction,
      metadataPath: 'database/runtime-profile/runtime-profile.json'
    },
    profile: resolved.profile,
    validation: resolved.validation
  };
}

function entry(pathValue) {
  return {
    path: pathValue,
    kind: 'runtime-profile',
    required: true,
    sensitivity: 'redacted',
    schemaRef: null
  };
}
