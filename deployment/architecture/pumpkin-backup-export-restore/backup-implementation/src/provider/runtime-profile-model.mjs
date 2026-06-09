import { resolveProviderSourceFromFixture } from './provider-resolver.mjs';
import { readJson } from '../utils/json-writer.mjs';
import { resolveFixturePath } from '../utils/safe-paths.mjs';

export const runtimeProfileContractVersion = '0.1.0';

export const runtimeProfileNames = Object.freeze([
  'local-dev',
  'offline-bundle',
  'fake-provider',
  'local-with-live-readonly',
  'live-readonly',
  'runtime-cosmos-future',
  'production-write-approved'
]);

const runtimeProfileNameSet = new Set(runtimeProfileNames);

export const runtimeProfileDefinitions = Object.freeze({
  'local-dev': Object.freeze({
    profileName: 'local-dev',
    category: 'local',
    description: 'Default local mode using fixture-backed providers only.',
    externalCallsAllowed: false,
    liveReadOnlyAllowed: false,
    fakeCompleteExportAllowed: true,
    liveDatabaseExportAllowed: false,
    runtimeSwitchAllowed: false,
    productionWritesAllowed: false,
    nextAction: 'continue-local-development-or-request-live-readonly-approval'
  }),
  'offline-bundle': Object.freeze({
    profileName: 'offline-bundle',
    category: 'local',
    description: 'Offline tenant bundle and backup artifact inspection mode.',
    externalCallsAllowed: false,
    liveReadOnlyAllowed: false,
    fakeCompleteExportAllowed: false,
    liveDatabaseExportAllowed: false,
    runtimeSwitchAllowed: false,
    productionWritesAllowed: false,
    nextAction: 'inspect-bundle-or-run-restore-validation-dry-run'
  }),
  'fake-provider': Object.freeze({
    profileName: 'fake-provider',
    category: 'local',
    description: 'Fixture-only provider proof mode for local tests.',
    externalCallsAllowed: false,
    liveReadOnlyAllowed: false,
    fakeCompleteExportAllowed: true,
    liveDatabaseExportAllowed: false,
    runtimeSwitchAllowed: false,
    productionWritesAllowed: false,
    nextAction: 'run-fake-proof-or-local-tests'
  }),
  'local-with-live-readonly': Object.freeze({
    profileName: 'local-with-live-readonly',
    category: 'read-only',
    description: 'Local tool mode prepared for separately approved live metadata reads.',
    externalCallsAllowed: false,
    liveReadOnlyAllowed: true,
    fakeCompleteExportAllowed: false,
    liveDatabaseExportAllowed: false,
    runtimeSwitchAllowed: false,
    productionWritesAllowed: false,
    nextAction: 'request-live-readonly-metadata-check-approval'
  }),
  'live-readonly': Object.freeze({
    profileName: 'live-readonly',
    category: 'read-only',
    description: 'Authenticated read-only evidence mode for future approved checks.',
    externalCallsAllowed: false,
    liveReadOnlyAllowed: true,
    fakeCompleteExportAllowed: false,
    liveDatabaseExportAllowed: false,
    runtimeSwitchAllowed: false,
    productionWritesAllowed: false,
    nextAction: 'run-approved-get-only-readiness-checks'
  }),
  'runtime-cosmos-future': Object.freeze({
    profileName: 'runtime-cosmos-future',
    category: 'future-runtime',
    description: 'Cosmos target is provisioned but not active runtime storage.',
    externalCallsAllowed: false,
    liveReadOnlyAllowed: false,
    fakeCompleteExportAllowed: false,
    liveDatabaseExportAllowed: false,
    runtimeSwitchAllowed: false,
    productionWritesAllowed: false,
    nextAction: 'data-seed-migration-preflight-required'
  }),
  'production-write-approved': Object.freeze({
    profileName: 'production-write-approved',
    category: 'future-hard-stop',
    description: 'Future-only profile; disabled in Phase 2F-12K.',
    externalCallsAllowed: false,
    liveReadOnlyAllowed: false,
    fakeCompleteExportAllowed: false,
    liveDatabaseExportAllowed: false,
    runtimeSwitchAllowed: false,
    productionWritesAllowed: false,
    nextAction: 'fresh-owner-approval-required'
  })
});

const forbiddenNormalizedKeys = new Set([
  'apikey',
  'apikeyhash',
  'accountkey',
  'databasekey',
  'storagekey',
  'primarykey',
  'secondarykey',
  'privatekey',
  'connectionstring',
  'endpointwithcredentials',
  'token',
  'accesstoken',
  'refreshtoken',
  'jwt',
  'password',
  'secret',
  'clientsecret',
  'sas',
  'sasurl',
  'authheader',
  'authorization',
  'cookie',
  'rawconfig',
  'configvalue',
  'protectedconfig'
]);

const secretValueMarkers = Object.freeze([
  ['Account', 'Key='].join(''),
  ['Shared', 'Access', 'Signature'].join(''),
  ['s', 'ig='].join(''),
  ['Bea', 'rer '].join(''),
  ['-----', 'BEGIN'].join(''),
  ['mongodb', '://'].join(''),
  ['Account', 'Endpoint='].join('')
]);

export function listRuntimeProfileDefinitions() {
  return runtimeProfileNames.map((name) => ({ ...runtimeProfileDefinitions[name] }));
}

export function getRuntimeProfileDefinition(profileName = 'local-dev') {
  if (!runtimeProfileNameSet.has(profileName)) {
    throw new Error(`unknown runtime profile: ${profileName}`);
  }
  return runtimeProfileDefinitions[profileName];
}

export async function resolveRuntimeProfileFromFixture({ fixturePath, providerResolution = null }) {
  const fixture = await readJson(resolveFixturePath(fixturePath));
  return resolveRuntimeProfile({
    profileName: fixture.profileName,
    tenantKey: fixture.tenantKey,
    siteKey: fixture.siteKey,
    environment: fixture.environment,
    requestedOperation: fixture.requestedOperation,
    gates: fixture.gates,
    providerResolution: providerResolution ?? await resolveProviderResolutionFromProfileFixture(fixture)
  });
}

export async function resolveRuntimeProfileWithProviderFixture({
  providerFixturePath,
  runtimeProfileName = null,
  tenantKey = null,
  siteKey = null,
  environment = null,
  providerProfile = null,
  requestedOperation = 'status-report',
  gates = {}
}) {
  const providerResolution = providerFixturePath
    ? await resolveProviderSourceFromFixture({
      fixturePath: providerFixturePath,
      tenantKey,
      siteKey,
      environment,
      profile: providerProfile
    })
    : null;
  return resolveRuntimeProfile({
    profileName: runtimeProfileName,
    tenantKey,
    siteKey,
    environment,
    requestedOperation,
    gates,
    providerResolution
  });
}

export function resolveRuntimeProfile({
  profileName = null,
  tenantKey = null,
  siteKey = null,
  environment = null,
  requestedOperation = 'status-report',
  gates = {},
  providerResolution = null
} = {}) {
  const providerMetadata = providerResolution?.metadata ?? null;
  const providerReadiness = providerResolution?.readiness ?? null;
  const classifiedProfileName = classifyProviderProfile(providerMetadata, profileName);
  const selectedProfileName = profileName ?? classifiedProfileName ?? 'local-dev';
  const definition = getRuntimeProfileDefinition(selectedProfileName);
  const normalizedGates = normalizeGates(gates);
  const provider = summarizeProvider({ providerMetadata, providerReadiness });
  const liveDatabaseExport = evaluateLiveDatabaseExportGuard({
    definition,
    provider,
    gates: normalizedGates
  });
  const fakeCompleteExport = evaluateFakeCompleteExportGuard({ definition });
  const runtimeSwitch = evaluateRuntimeSwitchGuard({ definition, provider, gates: normalizedGates });
  const productionWrites = evaluateProductionWriteGuard({ definition });

  const profile = {
    schemaVersion: runtimeProfileContractVersion,
    profileName: selectedProfileName,
    requestedProfileName: profileName,
    providerClassifiedProfileName: classifiedProfileName,
    requestedOperation,
    tenantKey: providerMetadata?.tenantKey ?? tenantKey ?? null,
    siteKey: providerMetadata?.siteKey ?? siteKey ?? tenantKey ?? null,
    environment: providerMetadata?.environment ?? environment ?? 'local',
    definition: {
      category: definition.category,
      description: definition.description
    },
    provider,
    guards: {
      liveDatabaseExport,
      fakeCompleteExport,
      runtimeSwitch,
      productionWrites
    },
    readiness: buildRuntimeReadiness({
      definition,
      provider,
      liveDatabaseExport,
      fakeCompleteExport,
      runtimeSwitch,
      productionWrites
    }),
    boundaries: {
      localFirst: true,
      offlineCapable: ['local-dev', 'offline-bundle', 'fake-provider'].includes(selectedProfileName),
      externalCallsAllowedByDefault: false,
      liveReadOnlyAllowedOnlyWithApproval: definition.liveReadOnlyAllowed,
      protectedConfigRead: false,
      cmsApiCalled: false,
      azureCalled: false,
      databaseExportPerformed: false,
      cosmosDocumentExportPerformed: false,
      blobDownloadPerformed: false,
      externalSystemMutation: false,
      secretsIncluded: false,
      productionRuntimeSwitchPerformed: false
    }
  };

  const validation = validateRuntimeProfile(profile);
  if (validation.status !== 'passed') {
    throw new Error(`runtime profile failed validation: ${validation.failures.map((failure) => failure.code).join(', ')}`);
  }
  return {
    profile,
    validation
  };
}

export function classifyProviderProfile(metadata, requestedProfileName = null) {
  if (requestedProfileName && !runtimeProfileNameSet.has(requestedProfileName)) {
    throw new Error(`unknown runtime profile: ${requestedProfileName}`);
  }
  if (!metadata) {
    return requestedProfileName ?? 'local-dev';
  }
  if (
    metadata.providerType === 'cosmos'
    && metadata.providerStatus === 'future-target'
    && metadata.sourceResolutionStatus === 'provisioned'
  ) {
    return 'runtime-cosmos-future';
  }
  if (metadata.providerType === 'local-provider' || metadata.providerType === 'file-backed') {
    return requestedProfileName ?? 'local-dev';
  }
  if (metadata.providerStatus === 'configured' || metadata.providerStatus === 'discovered') {
    return requestedProfileName ?? 'live-readonly';
  }
  if (metadata.providerStatus === 'missing' || metadata.providerStatus === 'blocked') {
    return requestedProfileName ?? 'local-dev';
  }
  return requestedProfileName ?? 'local-dev';
}

export function evaluateLiveDatabaseExportGuard({ definition, provider, gates = {} }) {
  const reasonCodes = [];
  if (definition.profileName === 'production-write-approved') {
    reasonCodes.push('production-write-profile-disabled-in-phase-2f12k');
  }
  if (['local-dev', 'offline-bundle', 'fake-provider'].includes(definition.profileName)) {
    reasonCodes.push('local-or-offline-profile-disallows-live-export');
  }
  if (['local-with-live-readonly', 'live-readonly'].includes(definition.profileName)) {
    reasonCodes.push('read-only-profile-disallows-live-export');
  }
  if (definition.profileName === 'runtime-cosmos-future') {
    reasonCodes.push('future-runtime-profile-not-active');
  }
  if (provider.providerStatus === 'missing' || provider.providerType === 'missing') {
    reasonCodes.push('provider-source-missing');
  }
  if (provider.providerStatus === 'blocked') {
    reasonCodes.push('provider-source-blocked');
  }
  if (provider.providerStatus === 'future-target') {
    reasonCodes.push('provider-is-future-target-not-active-runtime');
  }
  if (provider.runtimeStatus !== 'runtime-configured') {
    reasonCodes.push('runtime-not-configured');
  }
  if (gates.seedMigrationPassed !== true) {
    reasonCodes.push('seed-migration-gate-not-passed');
  }
  if (gates.runtimeSwitchApproved !== true) {
    reasonCodes.push('runtime-switch-gate-not-approved');
  }
  if (gates.liveDatabaseExportApproved !== true) {
    reasonCodes.push('live-database-export-not-approved');
  }

  return {
    status: 'blocked',
    allowed: false,
    reasonCodes: unique(reasonCodes),
    operatorMessage: 'Live database export is blocked until seed/migration, runtime configuration, runtime switch, and explicit export gates pass.'
  };
}

export function evaluateFakeCompleteExportGuard({ definition }) {
  const allowed = definition.fakeCompleteExportAllowed === true;
  return {
    status: allowed ? 'allowed-fake-only' : 'blocked',
    allowed,
    fakeOnly: true,
    reasonCodes: allowed ? [] : ['profile-disallows-fake-complete-export'],
    operatorMessage: allowed
      ? 'Fake complete connector proof is allowed for local fixture output only.'
      : 'Fake complete connector proof is blocked for this profile.'
  };
}

export function evaluateRuntimeSwitchGuard({ definition, provider, gates = {} }) {
  const reasonCodes = [];
  if (definition.runtimeSwitchAllowed !== true) {
    reasonCodes.push('profile-disallows-runtime-switch');
  }
  if (provider.runtimeStatus !== 'runtime-configured') {
    reasonCodes.push('runtime-not-configured');
  }
  if (gates.runtimeSwitchApproved !== true) {
    reasonCodes.push('runtime-switch-gate-not-approved');
  }
  return {
    status: 'blocked',
    allowed: false,
    reasonCodes: unique(reasonCodes),
    operatorMessage: 'CMS runtime switch is blocked in this phase.'
  };
}

export function evaluateProductionWriteGuard({ definition }) {
  return {
    status: 'blocked',
    allowed: false,
    reasonCodes: definition.profileName === 'production-write-approved'
      ? ['production-write-profile-hard-stopped']
      : ['profile-disallows-production-writes'],
    operatorMessage: 'Production writes require a future explicit owner approval and are not enabled by this implementation.'
  };
}

export function assertFakeCompleteExportAllowed(runtimeProfile) {
  if (runtimeProfile?.guards?.fakeCompleteExport?.allowed !== true) {
    const reasons = runtimeProfile?.guards?.fakeCompleteExport?.reasonCodes ?? ['fake-complete-export-blocked'];
    throw new Error(`fake complete export is blocked for runtime profile ${runtimeProfile?.profileName ?? 'unknown'}: ${reasons.join(', ')}`);
  }
}

export function validateRuntimeProfile(profile) {
  const failures = [];
  const forbidden = findForbiddenRuntimeProfileData(profile);
  for (const hit of forbidden) {
    failures.push({
      code: hit.kind === 'field' ? 'FORBIDDEN_FIELD' : 'FORBIDDEN_VALUE',
      path: hit.path,
      message: hit.kind === 'field' ? 'runtime profile contains a forbidden field name' : 'runtime profile contains a secret-like value'
    });
  }
  if (profile.schemaVersion !== runtimeProfileContractVersion) {
    failures.push({ code: 'SCHEMA_VERSION_INVALID', path: 'schemaVersion', message: 'runtime profile schema version is invalid' });
  }
  if (!runtimeProfileNameSet.has(profile.profileName)) {
    failures.push({ code: 'UNKNOWN_RUNTIME_PROFILE', path: 'profileName', message: 'runtime profile name is not supported' });
  }
  if (profile.guards?.liveDatabaseExport?.allowed !== false) {
    failures.push({ code: 'LIVE_DATABASE_EXPORT_ALLOWED', path: 'guards.liveDatabaseExport.allowed', message: 'live database export must remain blocked in Phase 2F-12K' });
  }
  if (profile.guards?.runtimeSwitch?.allowed !== false) {
    failures.push({ code: 'RUNTIME_SWITCH_ALLOWED', path: 'guards.runtimeSwitch.allowed', message: 'runtime switch must remain blocked in Phase 2F-12K' });
  }
  if (profile.guards?.productionWrites?.allowed !== false) {
    failures.push({ code: 'PRODUCTION_WRITES_ALLOWED', path: 'guards.productionWrites.allowed', message: 'production writes must remain blocked in Phase 2F-12K' });
  }
  if (profile.boundaries?.protectedConfigRead !== false) {
    failures.push({ code: 'PROTECTED_CONFIG_READ', path: 'boundaries.protectedConfigRead', message: 'runtime profile must not read protected config' });
  }
  if (profile.boundaries?.secretsIncluded !== false) {
    failures.push({ code: 'SECRETS_INCLUDED', path: 'boundaries.secretsIncluded', message: 'runtime profile must not include secrets' });
  }
  return {
    status: failures.length === 0 ? 'passed' : 'failed',
    failures
  };
}

async function resolveProviderResolutionFromProfileFixture(fixture) {
  if (!fixture.providerSourceFixture) {
    return null;
  }
  return resolveProviderSourceFromFixture({
    fixturePath: fixture.providerSourceFixture,
    tenantKey: fixture.tenantKey,
    siteKey: fixture.siteKey,
    environment: fixture.environment,
    profile: fixture.providerProfile
  });
}

function summarizeProvider({ providerMetadata, providerReadiness }) {
  return {
    providerType: providerMetadata?.providerType ?? 'missing',
    providerStatus: providerMetadata?.providerStatus ?? 'missing',
    sourceResolutionStatus: providerMetadata?.sourceResolutionStatus ?? 'unresolved',
    selectedTargetProvider: providerMetadata?.selectedTargetProvider ?? null,
    provisioningStatus: provisioningStatusFor(providerMetadata),
    runtimeStatus: runtimeStatusFor(providerMetadata, providerReadiness),
    exportReadiness: providerReadiness?.exportReadiness ?? 'blocked',
    readinessReason: providerReadiness?.reason ?? 'provider-source-not-resolved',
    liveDatabaseExportAllowedByProvider: providerReadiness?.liveDatabaseExportAllowed === true,
    nextAction: providerReadiness?.nextAction ?? 'provider-source-resolution-required'
  };
}

function provisioningStatusFor(metadata) {
  if (!metadata) {
    return 'unresolved';
  }
  if (metadata.sourceResolutionStatus === 'provisioned') {
    return 'provisioned';
  }
  if (metadata.providerStatus === 'future-target') {
    return 'planned';
  }
  if (metadata.providerStatus === 'configured' || metadata.providerStatus === 'discovered') {
    return 'not-required';
  }
  return 'unresolved';
}

function runtimeStatusFor(metadata, readiness) {
  if (!metadata) {
    return 'provider-source-missing';
  }
  if (metadata.providerStatus === 'future-target' && metadata.sourceResolutionStatus === 'provisioned') {
    return 'metadata-endpoint-runtime-wiring-required';
  }
  if (metadata.providerStatus === 'configured' && readiness?.liveDatabaseExportAllowed === true) {
    return 'runtime-configured';
  }
  if (metadata.providerStatus === 'missing') {
    return 'provider-source-missing';
  }
  return 'not-runtime-configured';
}

function normalizeGates(gates = {}) {
  return {
    seedMigrationPassed: gates.seedMigrationPassed === true,
    runtimeSwitchApproved: gates.runtimeSwitchApproved === true,
    liveDatabaseExportApproved: gates.liveDatabaseExportApproved === true,
    productionWriteApproved: gates.productionWriteApproved === true
  };
}

function buildRuntimeReadiness({
  definition,
  provider,
  liveDatabaseExport,
  fakeCompleteExport,
  runtimeSwitch,
  productionWrites
}) {
  const blockedReasons = unique([
    ...liveDatabaseExport.reasonCodes,
    ...runtimeSwitch.reasonCodes,
    ...productionWrites.reasonCodes
  ]);
  const profileReadyForLocalUse = ['local-dev', 'offline-bundle', 'fake-provider'].includes(definition.profileName);
  const profileReadyForReadOnlyPlanning = ['local-with-live-readonly', 'live-readonly', 'runtime-cosmos-future'].includes(definition.profileName);
  return {
    status: profileReadyForLocalUse || profileReadyForReadOnlyPlanning ? 'usable-with-guards' : 'blocked',
    profileReadyForLocalUse,
    profileReadyForReadOnlyPlanning,
    fakeCompleteExportAllowed: fakeCompleteExport.allowed,
    liveDatabaseExportAllowed: liveDatabaseExport.allowed,
    runtimeSwitchAllowed: runtimeSwitch.allowed,
    productionWritesAllowed: productionWrites.allowed,
    blockedReasonCodes: blockedReasons,
    nextAction: nextActionForRuntimeProfile(definition, provider)
  };
}

function nextActionForRuntimeProfile(definition, provider) {
  if (definition.profileName === 'runtime-cosmos-future') {
    return 'data-seed-migration-preflight-required';
  }
  if (definition.profileName === 'production-write-approved') {
    return 'fresh-owner-approval-required';
  }
  if (provider.nextAction && provider.nextAction !== 'provider-source-resolution-required') {
    return provider.nextAction;
  }
  return definition.nextAction;
}

function findForbiddenRuntimeProfileData(value, path = '$') {
  const hits = [];
  if (Array.isArray(value)) {
    value.forEach((item, index) => hits.push(...findForbiddenRuntimeProfileData(item, `${path}[${index}]`)));
    return hits;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (isForbiddenKey(key)) {
        hits.push({ kind: 'field', path: `${path}.${key}` });
      }
      hits.push(...findForbiddenRuntimeProfileData(child, `${path}.${key}`));
    }
    return hits;
  }
  if (typeof value === 'string' && secretValueMarkers.some((marker) => value.includes(marker))) {
    hits.push({ kind: 'value', path });
  }
  return hits;
}

function isForbiddenKey(key) {
  const normalized = key.replace(/[^a-z0-9]/gi, '').toLowerCase();
  return forbiddenNormalizedKeys.has(normalized);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

