import fs from 'node:fs/promises';
import path from 'node:path';
import { buildCredentialReferenceDocument } from '../credentials/credential-reference-writer.mjs';
import { collectRegistrySessionMetadata } from '../env/session-env-collector.mjs';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { resolveFixturePath, resolveTmpInputPath, resolveTmpOutputPath } from '../utils/safe-paths.mjs';
import { buildResourceToTenantMap, renderResourceToTenantMapMarkdown, renderRuntimeProfileMapMarkdown } from './resource-to-tenant-mapper.mjs';
import { normalizeResourceRegistry, validateRedactedRegistry } from './resource-entry-normalizer.mjs';

export async function writeRedactedRegistry({ fixturesPath, outputPath, env = process.env, overwrite = false, now = new Date() }) {
  const resolvedFixturePath = resolveFixturePath(fixturesPath);
  const outputRoot = resolveTmpOutputPath(outputPath);
  await prepareOutputRoot(outputRoot, overwrite);
  const fixture = await readJson(resolvedFixturePath);
  const credentialDocument = buildCredentialReferenceDocument({
    credentialReferences: fixture.credentialReferences ?? [],
    env,
    now
  });
  const registry = normalizeResourceRegistry({
    ...fixture,
    generatedAt: now.toISOString(),
    credentialReferences: credentialDocument.credentialReferences
  }, {
    sessionMetadata: collectRegistrySessionMetadata(env)
  });
  registry.validation = validateRedactedRegistry(registry);

  const registryFile = path.join(outputRoot, 'REDACTED_RESOURCE_REGISTRY.json');
  const summaryFile = path.join(outputRoot, 'RESOURCE_REGISTRY_SUMMARY.md');
  const tenantMapFile = path.join(outputRoot, 'RESOURCE_TO_TENANT_MAP.md');
  const runtimeMapFile = path.join(outputRoot, 'RUNTIME_PROFILE_MAP.md');

  await writeJson(registryFile, registry);
  await fs.writeFile(summaryFile, renderResourceRegistrySummaryMarkdown(registry), 'utf8');
  await fs.writeFile(tenantMapFile, renderResourceToTenantMapMarkdown(buildResourceToTenantMap(registry)), 'utf8');
  await fs.writeFile(runtimeMapFile, renderRuntimeProfileMapMarkdown(registry), 'utf8');

  return {
    outputRoot,
    registryFile,
    summaryFile,
    tenantMapFile,
    runtimeMapFile,
    registry,
    validation: registry.validation
  };
}

export async function validateRegistryOutput({ registryPath }) {
  const registryRoot = resolveTmpInputPath(registryPath);
  const registry = await readJson(path.join(registryRoot, 'REDACTED_RESOURCE_REGISTRY.json'));
  const validation = validateRedactedRegistry(registry);
  await writeJson(path.join(registryRoot, 'registry-validation-result.json'), validation);
  await fs.writeFile(path.join(registryRoot, 'REGISTRY_VALIDATION_RESULT.md'), renderRegistryValidationMarkdown(validation), 'utf8');
  return validation;
}

export function renderResourceRegistrySummaryMarkdown(registry) {
  const statusCounts = countBy(registry.resources, 'status');
  const lines = [
    '# Resource Registry Summary',
    '',
    `Registry ID: ${registry.registryId}`,
    `Generated: ${registry.generatedAt}`,
    `Environment: ${registry.environment}`,
    `Values included: ${registry.valuesIncluded}`,
    '',
    '## Counts',
    '',
    `- Resources: ${registry.resources.length}`,
    `- Credential references: ${registry.credentialReferences.length}`,
    `- Tenant mappings: ${registry.tenantMappings.length}`,
    `- Runtime profiles: ${registry.runtimeProfiles.length}`,
    '',
    '## Resource Status',
    ''
  ];
  for (const [status, count] of Object.entries(statusCounts)) {
    lines.push(`- ${status}: ${count}`);
  }
  lines.push(
    '',
    '## Session Presence',
    '',
    `- PUMPKIN_API_URL: ${registry.sessionMetadata.pumpkinApiUrlPresence}`,
    `- PUMPKIN_ADMIN_JWT: ${registry.sessionMetadata.adminJwtPresence} / excluded-session-token`,
    `- ROLLER_RINK_RENTALS_API_KEY: ${registry.sessionMetadata.rollerApiKeyPresence}`,
    `- ROLLER_RINK_RENTALS_TENANT_ID: ${registry.sessionMetadata.rollerTenantIdPresence}`,
    `- PUMPKIN_HANDOFF_VAULT_PASSPHRASE: ${registry.sessionMetadata.vaultPassphrasePresence}`,
    '',
    'No plaintext secret values are included in this registry.',
    ''
  );
  return `${lines.join('\n')}`;
}

export function renderRegistryValidationMarkdown(validation) {
  const lines = [
    '# Registry Validation Result',
    '',
    `Status: ${validation.status}`,
    '',
    '| Code | Path | Message |',
    '| --- | --- | --- |'
  ];
  if (validation.failures.length === 0) {
    lines.push('| none | none | No failures. |');
  } else {
    for (const failure of validation.failures) {
      lines.push(`| ${failure.code} | ${failure.path} | ${failure.message} |`);
    }
  }
  lines.push('');
  return `${lines.join('\n')}`;
}

export async function readRegistryFromOutput(registryPath) {
  const registryRoot = resolveTmpInputPath(registryPath);
  return readJson(path.join(registryRoot, 'REDACTED_RESOURCE_REGISTRY.json'));
}

function countBy(items, field) {
  return items.reduce((accumulator, item) => {
    const key = item[field] ?? 'unknown';
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});
}

async function prepareOutputRoot(outputRoot, overwrite) {
  if (overwrite) {
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(outputRoot, { recursive: true });
}
