import fs from 'node:fs/promises';
import path from 'node:path';
import { resolveProviderSourceFromFixture } from './provider-resolver.mjs';
import { writeJson } from '../utils/json-writer.mjs';

export async function writeFakeProviderSource({ bundleRoot, request, createdAt, fixturePath }) {
  const tenantKey = request.scope.tenantKey;
  const siteKey = request.scope.siteKey ?? tenantKey;
  const resolved = await resolveProviderSourceFromFixture({
    fixturePath,
    tenantKey,
    siteKey,
    environment: 'local',
    profile: 'fixture'
  });
  const outputDir = path.join(bundleRoot, 'database', 'provider-source');
  await fs.mkdir(outputDir, { recursive: true });

  const payload = {
    schemaVersion: '0.1.0',
    generatedAt: createdAt,
    fakeOnly: true,
    resolverMode: 'fixture',
    metadata: resolved.metadata,
    readiness: resolved.readiness,
    boundaries: {
      protectedConfigRead: false,
      cmsApiCalled: false,
      azureCalled: false,
      databaseExportPerformed: false,
      externalSystemMutation: false,
      secretsIncluded: false
    }
  };

  await writeJson(path.join(outputDir, 'provider-source.json'), payload);
  await fs.writeFile(
    path.join(outputDir, 'PROVIDER_SOURCE.md'),
    [
      '# Provider Source Metadata',
      '',
      'This is fixture-only non-secret provider source metadata.',
      '',
      `Provider type: ${resolved.metadata.providerType}`,
      `Provider status: ${resolved.metadata.providerStatus}`,
      `Selected target provider: ${resolved.metadata.selectedTargetProvider ?? 'none'}`,
      `Export readiness: ${resolved.readiness.exportReadiness}`,
      `Next action: ${resolved.readiness.nextAction}`,
      '',
      '- No protected config was read.',
      '- No CMS/API call was made.',
      '- No Azure command was run.',
      '- No database export was performed.',
      '- No live connector execution is allowed by this fixture.',
      ''
    ].join('\n'),
    'utf8'
  );

  return {
    entries: [
      entry('database/provider-source/provider-source.json'),
      entry('database/provider-source/PROVIDER_SOURCE.md')
    ],
    component: {
      provider: resolved.metadata.providerType,
      status: resolved.metadata.providerStatus,
      sourceResolutionStatus: resolved.metadata.sourceResolutionStatus,
      exportReadiness: resolved.readiness.exportReadiness,
      selectedTargetProvider: resolved.metadata.selectedTargetProvider,
      cosmosProvisioningRequired: resolved.readiness.cosmosProvisioningRequired,
      liveDatabaseExportAllowed: false,
      fakeOnly: true,
      metadataPath: 'database/provider-source/provider-source.json',
      reason: resolved.readiness.reason,
      nextAction: resolved.readiness.nextAction
    },
    metadata: resolved.metadata,
    readiness: resolved.readiness,
    resolved
  };
}

function entry(pathValue) {
  return {
    path: pathValue,
    kind: 'provider-source-metadata',
    required: true,
    sensitivity: 'redacted',
    schemaRef: null
  };
}
