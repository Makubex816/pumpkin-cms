import fs from 'node:fs/promises';
import path from 'node:path';
import { findSecretLikeData } from '../utils/secret-scan.mjs';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { packageRoot, resolveFixturePath, resolveTmpOutputPath } from '../utils/safe-paths.mjs';

export const operationalBindingSchemaVersion = '0.1.0';

export const canonicalProviderModes = [
  'local-dev',
  'fake-provider',
  'offline-bundle',
  'local-file-backed',
  'local-api-fake-provider',
  'staging-simulated',
  'live-readonly',
  'live-write-approved',
  'production-runtime'
];

const requiredBindingTargets = [
  'Outbound Link Manager',
  'Backup Center',
  'Resource Registry',
  'Runtime QA',
  'Admin/API',
  'Azure Staging Foundation'
];

const placeholderPattern = /(^|[\s:_-])(tbd|todo|placeholder|example)([\s:_-]|$)|<[^>]+>/i;
const subscriptionIdPattern = /\/subscriptions\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

const repoRoot = path.resolve(packageRoot, '../../../..');

export async function runOperationalBindingValidation({ fixturePath, outputPath, overwrite = false }) {
  const resolvedFixturePath = resolveFixturePath(fixturePath);
  const outputRoot = resolveTmpOutputPath(outputPath);
  if (overwrite) {
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(outputRoot, { recursive: true });
  const document = await readJson(resolvedFixturePath);
  const validation = await validateOperationalBindings(document);
  await writeJson(path.join(outputRoot, 'OPERATIONAL_BINDING_VALIDATION_RESULT.json'), validation);
  await fs.writeFile(
    path.join(outputRoot, 'OPERATIONAL_BINDING_VALIDATION_RESULT.md'),
    renderOperationalBindingValidationMarkdown(validation),
    'utf8'
  );
  return { outputRoot, validation };
}

export async function validateOperationalBindings(document = {}) {
  const failures = [];
  const warnings = [];

  if (document.schemaVersion !== operationalBindingSchemaVersion) {
    failures.push(failure('SCHEMA_VERSION_INVALID', 'schemaVersion', 'schemaVersion must match the operational binding schema'));
  }
  requireString(document.controlLayerId, 'controlLayerId', failures);
  requireArray(document.evidenceRefs, 'evidenceRefs', failures);
  requireArray(document.environmentModeMatrix, 'environmentModeMatrix', failures);
  requireArray(document.providerProfiles, 'providerProfiles', failures);
  requireArray(document.resourceBindings, 'resourceBindings', failures);

  scanForForbiddenData(document, failures);
  validateEnvironmentModes(document.environmentModeMatrix, failures);
  validateProviderProfiles(document.providerProfiles, failures);
  validateResourceBindings(document.resourceBindings, failures);
  await validateEvidenceRefs(document, failures, warnings);

  return {
    schemaVersion: operationalBindingSchemaVersion,
    validationType: 'pumpkin-resource-registry-provider-profile-operational-bindings',
    status: failures.length === 0 ? 'passed' : 'failed',
    summary: {
      failureCount: failures.length,
      warningCount: warnings.length,
      environmentModeCount: array(document.environmentModeMatrix).length,
      providerProfileCount: array(document.providerProfiles).length,
      resourceBindingCount: array(document.resourceBindings).length,
      evidenceRefCount: countEvidenceRefs(document)
    },
    failures,
    warnings
  };
}

export function renderOperationalBindingValidationMarkdown(validation) {
  const lines = [
    '# Operational Binding Validation Result',
    '',
    `Status: ${validation.status}`,
    '',
    '## Counts',
    '',
    `- Environment modes: ${validation.summary.environmentModeCount}`,
    `- Provider profiles: ${validation.summary.providerProfileCount}`,
    `- Resource bindings: ${validation.summary.resourceBindingCount}`,
    `- Evidence refs: ${validation.summary.evidenceRefCount}`,
    `- Failures: ${validation.summary.failureCount}`,
    `- Warnings: ${validation.summary.warningCount}`,
    '',
    '## Failures',
    '',
    '| Code | Path | Message |',
    '| --- | --- | --- |'
  ];
  if (validation.failures.length === 0) {
    lines.push('| none | none | No failures. |');
  } else {
    for (const item of validation.failures) {
      lines.push(`| ${item.code} | ${item.path} | ${item.message} |`);
    }
  }
  lines.push('', '## Warnings', '', '| Code | Path | Message |', '| --- | --- | --- |');
  if (validation.warnings.length === 0) {
    lines.push('| none | none | No warnings. |');
  } else {
    for (const item of validation.warnings) {
      lines.push(`| ${item.code} | ${item.path} | ${item.message} |`);
    }
  }
  lines.push('');
  return lines.join('\n');
}

function validateEnvironmentModes(modes, failures) {
  const seen = new Set();
  for (const [index, modeEntry] of array(modes).entries()) {
    const pathName = `environmentModeMatrix[${index}]`;
    if (!canonicalProviderModes.includes(modeEntry.mode)) {
      failures.push(failure('PROVIDER_MODE_UNKNOWN', `${pathName}.mode`, 'unknown provider mode'));
    }
    if (seen.has(modeEntry.mode)) {
      failures.push(failure('PROVIDER_MODE_DUPLICATE', `${pathName}.mode`, 'provider mode must be listed once'));
    }
    seen.add(modeEntry.mode);
    if (modeEntry.protectedConfigReads !== false) {
      failures.push(failure('PROTECTED_CONFIG_READS_NOT_FALSE', `${pathName}.protectedConfigReads`, 'mode must not require protected config reads'));
    }
    if (modeEntry.azureMutations !== false) {
      failures.push(failure('AZURE_MUTATIONS_NOT_FALSE', `${pathName}.azureMutations`, 'mode must not allow Azure mutations'));
    }
    if (modeEntry.providerWritesAllowed !== false && modeEntry.mode !== 'staging-simulated') {
      failures.push(failure('PROVIDER_WRITES_ALLOWED', `${pathName}.providerWritesAllowed`, 'mode must not allow provider writes in V2.5.1'));
    }
    if (modeEntry.mode === 'production-runtime' && modeEntry.state !== 'blocked') {
      failures.push(failure('PRODUCTION_RUNTIME_NOT_BLOCKED', `${pathName}.state`, 'production-runtime mode must remain blocked'));
    }
  }
  for (const requiredMode of canonicalProviderModes) {
    if (!seen.has(requiredMode)) {
      failures.push(failure('PROVIDER_MODE_MISSING', 'environmentModeMatrix', `missing provider mode: ${requiredMode}`));
    }
  }
}

function validateProviderProfiles(profiles, failures) {
  const seenModes = new Set();
  const seenIds = new Set();
  for (const [index, profile] of array(profiles).entries()) {
    const pathName = `providerProfiles[${index}]`;
    requireString(profile.providerProfileId, `${pathName}.providerProfileId`, failures);
    requireString(profile.providerType, `${pathName}.providerType`, failures);
    requireString(profile.providerMode, `${pathName}.providerMode`, failures);
    requireString(profile.environmentName, `${pathName}.environmentName`, failures);
    requireString(profile.tenantScope, `${pathName}.tenantScope`, failures);
    requireString(profile.siteScope, `${pathName}.siteScope`, failures);
    requireString(profile.resourceScope, `${pathName}.resourceScope`, failures);
    requireString(profile.accountOrHost, `${pathName}.accountOrHost`, failures);
    requireString(profile.databaseOrNamespace, `${pathName}.databaseOrNamespace`, failures);
    requireString(profile.authSessionMode, `${pathName}.authSessionMode`, failures);
    requireString(profile.readbackMethod, `${pathName}.readbackMethod`, failures);
    requireString(profile.rollbackMethod, `${pathName}.rollbackMethod`, failures);
    requireArray(profile.evidenceRefs, `${pathName}.evidenceRefs`, failures);

    if (seenIds.has(profile.providerProfileId)) {
      failures.push(failure('PROVIDER_PROFILE_ID_DUPLICATE', `${pathName}.providerProfileId`, 'providerProfileId must be unique'));
    }
    seenIds.add(profile.providerProfileId);

    if (!canonicalProviderModes.includes(profile.providerMode)) {
      failures.push(failure('PROVIDER_MODE_UNKNOWN', `${pathName}.providerMode`, 'unknown provider mode'));
    } else {
      seenModes.add(profile.providerMode);
    }

    if (profile.credentialReference?.valueIncluded !== false) {
      failures.push(failure('CREDENTIAL_VALUE_INCLUDED', `${pathName}.credentialReference.valueIncluded`, 'credential values must not be included'));
    }
    if (profile.globalActivation !== false) {
      failures.push(failure('GLOBAL_PROVIDER_ACTIVATION_FORBIDDEN', `${pathName}.globalActivation`, 'provider profiles must not be globally activated'));
    }
    if (profile.capabilities?.protectedConfigReads !== false) {
      failures.push(failure('PROVIDER_PROTECTED_CONFIG_READS_NOT_FALSE', `${pathName}.capabilities.protectedConfigReads`, 'provider profile must not read protected config'));
    }
    if (profile.capabilities?.secretValuesIncluded !== false) {
      failures.push(failure('PROVIDER_SECRET_VALUES_NOT_FALSE', `${pathName}.capabilities.secretValuesIncluded`, 'provider profile must not include secret values'));
    }
    if (profile.capabilities?.azureMutations !== false) {
      failures.push(failure('PROVIDER_AZURE_MUTATIONS_NOT_FALSE', `${pathName}.capabilities.azureMutations`, 'provider profile must not mutate Azure'));
    }
    if (profile.providerMode === 'production-runtime') {
      validateProductionRuntimeProfile(profile, pathName, failures);
    }
    if (profile.providerMode === 'live-write-approved') {
      validateLiveWriteApprovedProfile(profile, pathName, failures);
    }
    if (profile.providerProfileId === 'olm-staging-cosmos-nosql-v1') {
      validateOlmStagingProfile(profile, pathName, failures);
    }
  }
  for (const requiredMode of canonicalProviderModes) {
    if (!seenModes.has(requiredMode)) {
      failures.push(failure('PROVIDER_MODE_PROFILE_MISSING', 'providerProfiles', `missing provider profile for mode: ${requiredMode}`));
    }
  }
}

function validateProductionRuntimeProfile(profile, pathName, failures) {
  if (profile.state !== 'blocked') {
    failures.push(failure('PRODUCTION_RUNTIME_PROFILE_NOT_BLOCKED', `${pathName}.state`, 'production-runtime profile must be blocked'));
  }
  if (profile.environmentName !== 'production') {
    failures.push(failure('PRODUCTION_RUNTIME_ENVIRONMENT_INVALID', `${pathName}.environmentName`, 'production-runtime profile must be production-scoped'));
  }
  if (profile.capabilities?.productionWritesAllowed !== false) {
    failures.push(failure('PRODUCTION_WRITES_ALLOWED', `${pathName}.capabilities.productionWritesAllowed`, 'production writes must remain blocked'));
  }
  if (profile.capabilities?.liveProviderWritesAllowed !== false) {
    failures.push(failure('PRODUCTION_LIVE_WRITES_ALLOWED', `${pathName}.capabilities.liveProviderWritesAllowed`, 'live writes must remain blocked'));
  }
}

function validateLiveWriteApprovedProfile(profile, pathName, failures) {
  if (profile.globalActivation !== false) {
    failures.push(failure('LIVE_WRITE_GLOBAL_ACTIVATION', `${pathName}.globalActivation`, 'live-write-approved must be scoped, not global'));
  }
  if (profile.capabilities?.liveProviderWritesAllowed !== false) {
    failures.push(failure('LIVE_WRITE_PROVIDER_WRITES_ALLOWED', `${pathName}.capabilities.liveProviderWritesAllowed`, 'V2.5.1 must not allow live provider writes'));
  }
  if (profile.state !== 'scoped-only' && profile.state !== 'blocked') {
    failures.push(failure('LIVE_WRITE_STATE_INVALID', `${pathName}.state`, 'live-write-approved must be scoped-only or blocked'));
  }
  if (profile.state === 'scoped-only') {
    requireString(profile.scopedApproval?.approvalManifestId, `${pathName}.scopedApproval.approvalManifestId`, failures);
    requireString(profile.scopedApproval?.firstWriteBatchId, `${pathName}.scopedApproval.firstWriteBatchId`, failures);
    if (profile.scopedApproval?.additionalWritesRequireApproval !== true) {
      failures.push(failure('ADDITIONAL_WRITES_NOT_GATED', `${pathName}.scopedApproval.additionalWritesRequireApproval`, 'additional writes must require a future approval'));
    }
  }
}

function validateOlmStagingProfile(profile, pathName, failures) {
  if (profile.environmentName !== 'staging') {
    failures.push(failure('OLM_STAGING_PROFILE_NOT_STAGING', `${pathName}.environmentName`, 'olm-staging-cosmos-nosql-v1 must remain staging scoped'));
  }
  if (profile.providerType !== 'azure-cosmos-nosql') {
    failures.push(failure('OLM_STAGING_PROVIDER_TYPE_INVALID', `${pathName}.providerType`, 'OLM staging provider type must be azure-cosmos-nosql'));
  }
  if (profile.providerMode !== 'live-write-approved') {
    failures.push(failure('OLM_STAGING_PROVIDER_MODE_INVALID', `${pathName}.providerMode`, 'OLM staging profile must remain live-write-approved scoped-only'));
  }
  if (profile.databaseOrNamespace !== 'pumpkincms-olm-staging') {
    failures.push(failure('OLM_STAGING_DATABASE_INVALID', `${pathName}.databaseOrNamespace`, 'OLM staging database mismatch'));
  }
}

function validateResourceBindings(bindings, failures) {
  const seenTargets = new Set();
  const seenIds = new Set();
  for (const [index, binding] of array(bindings).entries()) {
    const pathName = `resourceBindings[${index}]`;
    requireString(binding.bindingId, `${pathName}.bindingId`, failures);
    requireString(binding.target, `${pathName}.target`, failures);
    requireString(binding.environmentName, `${pathName}.environmentName`, failures);
    requireString(binding.resourceType, `${pathName}.resourceType`, failures);
    requireString(binding.status, `${pathName}.status`, failures);
    requireArray(binding.evidenceRefs, `${pathName}.evidenceRefs`, failures);
    if (seenIds.has(binding.bindingId)) {
      failures.push(failure('RESOURCE_BINDING_ID_DUPLICATE', `${pathName}.bindingId`, 'bindingId must be unique'));
    }
    seenIds.add(binding.bindingId);
    seenTargets.add(binding.target);
    if (array(binding.credentialReferences).some((credential) => credential.valueIncluded !== false)) {
      failures.push(failure('BINDING_CREDENTIAL_VALUE_INCLUDED', `${pathName}.credentialReferences`, 'binding credential references must not include values'));
    }
  }
  for (const target of requiredBindingTargets) {
    if (!seenTargets.has(target)) {
      failures.push(failure('RESOURCE_BINDING_TARGET_MISSING', 'resourceBindings', `missing binding target: ${target}`));
    }
  }
}

async function validateEvidenceRefs(document, failures, warnings) {
  for (const ref of collectEvidenceRefs(document)) {
    if (!ref.path) {
      failures.push(failure('EVIDENCE_REF_PATH_MISSING', ref.pathName, 'evidence reference path is required'));
      continue;
    }
    if (placeholderPattern.test(ref.path)) {
      failures.push(failure('EVIDENCE_REF_PLACEHOLDER', ref.pathName, 'evidence reference must not be placeholder/example/TBD'));
      continue;
    }
    const resolved = path.resolve(repoRoot, ref.path);
    const relative = path.relative(repoRoot, resolved);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      failures.push(failure('EVIDENCE_REF_OUTSIDE_REPO', ref.pathName, 'evidence reference must stay inside repo'));
      continue;
    }
    try {
      await fs.access(resolved);
    } catch {
      warnings.push(warning('EVIDENCE_REF_NOT_FOUND', ref.pathName, 'evidence reference was not found in this worktree'));
    }
  }
}

function scanForForbiddenData(document, failures) {
  for (const hit of findSecretLikeData(document)) {
    failures.push(failure(hit.kind === 'field' ? 'FORBIDDEN_SECRET_FIELD' : 'SECRET_LIKE_VALUE', hit.path, 'operational bindings must not include secret-like data'));
  }
  for (const hit of findStringHits(document, placeholderPattern)) {
    failures.push(failure('PLACEHOLDER_VALUE_DETECTED', hit.path, 'operational bindings must not include placeholder/TBD/example values'));
  }
  for (const hit of findStringHits(document, subscriptionIdPattern)) {
    failures.push(failure('UNREDACTED_SUBSCRIPTION_ID', hit.path, 'subscription IDs must be redacted or omitted from operational bindings'));
  }
}

function collectEvidenceRefs(document) {
  const refs = [];
  collectFromArray(document.evidenceRefs, 'evidenceRefs', refs);
  for (const [index, profile] of array(document.providerProfiles).entries()) {
    collectFromArray(profile.evidenceRefs, `providerProfiles[${index}].evidenceRefs`, refs);
  }
  for (const [index, binding] of array(document.resourceBindings).entries()) {
    collectFromArray(binding.evidenceRefs, `resourceBindings[${index}].evidenceRefs`, refs);
  }
  return refs;
}

function collectFromArray(values, basePath, refs) {
  for (const [index, ref] of array(values).entries()) {
    if (typeof ref === 'string') {
      refs.push({ path: ref, pathName: `${basePath}[${index}]` });
    } else {
      refs.push({ path: ref?.path, pathName: `${basePath}[${index}].path` });
    }
  }
}

function countEvidenceRefs(document) {
  return collectEvidenceRefs(document).length;
}

function findStringHits(value, pattern, pathName = '$') {
  const hits = [];
  if (typeof value === 'string') {
    if (pattern.test(value)) {
      hits.push({ path: pathName });
    }
    return hits;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => hits.push(...findStringHits(item, pattern, `${pathName}[${index}]`)));
    return hits;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      hits.push(...findStringHits(child, pattern, `${pathName}.${key}`));
    }
  }
  return hits;
}

function requireString(value, pathName, failures) {
  if (typeof value !== 'string' || value.trim() === '') {
    failures.push(failure('REQUIRED_STRING_MISSING', pathName, 'required string is missing'));
  }
}

function requireArray(value, pathName, failures) {
  if (!Array.isArray(value)) {
    failures.push(failure('REQUIRED_ARRAY_MISSING', pathName, 'required array is missing'));
  }
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function failure(code, pathValue, message) {
  return { code, path: pathValue, message };
}

function warning(code, pathValue, message) {
  return { code, path: pathValue, message };
}

