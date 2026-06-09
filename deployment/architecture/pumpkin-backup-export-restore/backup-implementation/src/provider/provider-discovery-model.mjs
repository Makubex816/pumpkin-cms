export const providerMetadataContractVersion = '0.1.0';

export const providerTypes = Object.freeze([
  'cosmos',
  'mongo',
  'azure-sql',
  'file-backed',
  'local-provider',
  'api-backed',
  'unknown',
  'unsupported',
  'missing'
]);

export const providerStatuses = Object.freeze([
  'configured',
  'discovered',
  'missing',
  'unknown',
  'blocked',
  'future-target',
  'unsupported',
  'mismatch'
]);

const allowedTargetProviders = Object.freeze(['cosmos', 'mongo', 'azure-sql', null]);
const allowedMetadataKeys = new Set([
  'contractVersion',
  'tenantKey',
  'siteKey',
  'environment',
  'profile',
  'providerType',
  'providerStatus',
  'sourceResolutionStatus',
  'selectedTargetProvider',
  'targetProviderReason',
  'accountName',
  'resourceGroup',
  'subscriptionHint',
  'databaseName',
  'containerNames',
  'backupPolicyMode',
  'portableExportSupported',
  'platformBackupEvidenceSupported',
  'readOnlyDiscoveryAllowed',
  'liveConnectorExecutionAllowed',
  'redactionStatus',
  'secretsIncluded',
  'blockers',
  'warnings',
  'evidence',
  'generatedAt'
]);

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

export function buildProviderMetadataResponse(input = {}) {
  const validation = validateProviderMetadata(input);
  if (validation.status !== 'passed') {
    throw new Error(`provider metadata failed validation: ${validation.failures.map((failure) => failure.code).join(', ')}`);
  }
  return validation.metadata;
}

export function validateProviderMetadata(input = {}) {
  const failures = [];
  const forbidden = findForbiddenMetadata(input);
  for (const hit of forbidden) {
    failures.push({
      code: hit.kind === 'field' ? 'FORBIDDEN_FIELD' : 'FORBIDDEN_VALUE',
      path: hit.path,
      message: hit.kind === 'field' ? 'forbidden metadata field is not allowed' : 'secret-like metadata value is not allowed'
    });
  }

  for (const key of Object.keys(input)) {
    if (!allowedMetadataKeys.has(key)) {
      failures.push({
        code: 'UNKNOWN_FIELD',
        path: key,
        message: 'provider metadata allows only the non-secret contract fields'
      });
    }
  }

  const metadata = normalizeProviderMetadata(input);

  if (!providerTypes.includes(metadata.providerType)) {
    failures.push({ code: 'INVALID_PROVIDER_TYPE', path: 'providerType', message: 'providerType is not supported' });
  }
  if (!providerStatuses.includes(metadata.providerStatus)) {
    failures.push({ code: 'INVALID_PROVIDER_STATUS', path: 'providerStatus', message: 'providerStatus is not supported' });
  }
  if (!allowedTargetProviders.includes(metadata.selectedTargetProvider)) {
    failures.push({ code: 'INVALID_TARGET_PROVIDER', path: 'selectedTargetProvider', message: 'selected target provider is not supported' });
  }
  if (metadata.secretsIncluded !== false) {
    failures.push({ code: 'SECRETS_INCLUDED', path: 'secretsIncluded', message: 'provider metadata must not include secrets' });
  }
  if (metadata.redactionStatus !== 'passed') {
    failures.push({ code: 'REDACTION_NOT_PASSED', path: 'redactionStatus', message: 'provider metadata redaction must pass' });
  }
  if (metadata.providerStatus === 'missing' && metadata.liveConnectorExecutionAllowed === true) {
    failures.push({ code: 'MISSING_SOURCE_EXPORT_ALLOWED', path: 'liveConnectorExecutionAllowed', message: 'missing provider source cannot allow live export' });
  }
  if (metadata.providerStatus === 'future-target' && metadata.liveConnectorExecutionAllowed === true) {
    failures.push({ code: 'FUTURE_TARGET_EXPORT_ALLOWED', path: 'liveConnectorExecutionAllowed', message: 'future target provider cannot allow live export' });
  }

  return {
    status: failures.length === 0 ? 'passed' : 'failed',
    metadata,
    failures
  };
}

export function buildProviderConnectorReadiness(metadata) {
  if (metadata.secretsIncluded !== false || metadata.redactionStatus !== 'passed') {
    return readiness('blocked', 'redaction-or-secret-boundary-failed', metadata);
  }
  if (metadata.providerStatus === 'missing' || metadata.providerType === 'missing') {
    return readiness('blocked', 'database-source-missing', metadata);
  }
  if (metadata.providerStatus === 'blocked') {
    return readiness('blocked', 'provider-source-blocked', metadata);
  }
  if (isProvisionedFutureTargetCosmos(metadata)) {
    return {
      exportReadiness: 'metadata-endpoint-runtime-wiring-required',
      reason: 'cosmos-future-target-provisioned-not-runtime-configured',
      providerType: metadata.providerType,
      providerStatus: metadata.providerStatus,
      sourceResolutionStatus: metadata.sourceResolutionStatus,
      selectedTargetProvider: metadata.selectedTargetProvider,
      cosmosProvisioningRequired: false,
      liveDatabaseExportAllowed: false,
      nextAction: 'metadata-endpoint-runtime-wiring-approval-required'
    };
  }
  if (metadata.providerStatus === 'future-target') {
    return readiness('provisioning-required', 'provider-is-future-target-only', metadata);
  }
  if (metadata.providerStatus === 'mismatch') {
    return readiness('blocked', 'provider-source-scope-mismatch', metadata);
  }
  if (metadata.providerType === 'cosmos' && ['configured', 'discovered'].includes(metadata.providerStatus)) {
    return {
      exportReadiness: 'ready-for-future-cosmos-preflight',
      reason: 'cosmos-provider-source-resolved',
      providerType: metadata.providerType,
      providerStatus: metadata.providerStatus,
      selectedTargetProvider: metadata.selectedTargetProvider,
      cosmosProvisioningRequired: false,
      liveDatabaseExportAllowed: false,
      nextAction: 'live-readonly-provider-verification-or-export-preflight-approval-required'
    };
  }
  if (metadata.providerType === 'local-provider' || metadata.providerType === 'file-backed') {
    return readiness('blocked', 'local-provider-is-not-production-restore-proof', metadata);
  }
  return readiness('blocked', 'provider-not-ready-for-export', metadata);
}

function isProvisionedFutureTargetCosmos(metadata) {
  return metadata.providerType === 'cosmos'
    && metadata.providerStatus === 'future-target'
    && metadata.sourceResolutionStatus === 'provisioned';
}

function readiness(exportReadiness, reason, metadata) {
  return {
    exportReadiness,
    reason,
    providerType: metadata.providerType,
    providerStatus: metadata.providerStatus,
    sourceResolutionStatus: metadata.sourceResolutionStatus,
    selectedTargetProvider: metadata.selectedTargetProvider,
    cosmosProvisioningRequired: metadata.selectedTargetProvider === 'cosmos' && ['missing', 'future-target'].includes(metadata.providerStatus),
    liveDatabaseExportAllowed: false,
    nextAction: nextActionFor(exportReadiness, metadata)
  };
}

function nextActionFor(exportReadiness, metadata) {
  if (exportReadiness === 'provisioning-required') {
    return 'cosmos-provisioning-preflight-required';
  }
  if (metadata.selectedTargetProvider === 'cosmos' && metadata.providerStatus === 'missing') {
    return 'cosmos-provisioning-preflight-required';
  }
  return 'provider-source-resolution-required';
}

function normalizeProviderMetadata(input) {
  return {
    contractVersion: stringOrDefault(input.contractVersion, providerMetadataContractVersion),
    tenantKey: stringOrDefault(input.tenantKey, null),
    siteKey: stringOrDefault(input.siteKey, input.tenantKey ?? null),
    environment: stringOrDefault(input.environment, 'local'),
    profile: stringOrDefault(input.profile, 'fixture'),
    providerType: stringOrDefault(input.providerType, 'unknown'),
    providerStatus: stringOrDefault(input.providerStatus, 'unknown'),
    sourceResolutionStatus: stringOrDefault(input.sourceResolutionStatus, 'unresolved'),
    selectedTargetProvider: input.selectedTargetProvider === undefined ? null : input.selectedTargetProvider,
    targetProviderReason: stringOrDefault(input.targetProviderReason, null),
    accountName: stringOrDefault(input.accountName, null),
    resourceGroup: stringOrDefault(input.resourceGroup, null),
    subscriptionHint: stringOrDefault(input.subscriptionHint, null),
    databaseName: stringOrDefault(input.databaseName, null),
    containerNames: arrayOfStrings(input.containerNames),
    backupPolicyMode: stringOrDefault(input.backupPolicyMode, 'unknown'),
    portableExportSupported: input.portableExportSupported === true,
    platformBackupEvidenceSupported: input.platformBackupEvidenceSupported === true,
    readOnlyDiscoveryAllowed: input.readOnlyDiscoveryAllowed === true,
    liveConnectorExecutionAllowed: input.liveConnectorExecutionAllowed === true,
    redactionStatus: stringOrDefault(input.redactionStatus, 'passed'),
    secretsIncluded: input.secretsIncluded === true ? true : false,
    blockers: arrayOfStrings(input.blockers),
    warnings: arrayOfStrings(input.warnings),
    evidence: normalizeEvidence(input.evidence),
    generatedAt: stringOrDefault(input.generatedAt, null)
  };
}

function normalizeEvidence(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => ({
    source: stringOrDefault(item?.source, 'unknown'),
    kind: stringOrDefault(item?.kind, 'unknown'),
    result: stringOrDefault(item?.result, 'unknown')
  }));
}

function arrayOfStrings(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => String(item));
}

function stringOrDefault(value, fallback) {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  return String(value);
}

function findForbiddenMetadata(value, path = '$') {
  const hits = [];
  if (Array.isArray(value)) {
    value.forEach((item, index) => hits.push(...findForbiddenMetadata(item, `${path}[${index}]`)));
    return hits;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (isForbiddenKey(key)) {
        hits.push({ kind: 'field', path: `${path}.${key}` });
      }
      hits.push(...findForbiddenMetadata(child, `${path}.${key}`));
    }
    return hits;
  }
  if (typeof value === 'string' && containsForbiddenValueMarker(value)) {
    hits.push({ kind: 'value', path });
  }
  return hits;
}

function isForbiddenKey(key) {
  const normalized = key.replace(/[^a-z0-9]/gi, '').toLowerCase();
  return forbiddenNormalizedKeys.has(normalized);
}

function containsForbiddenValueMarker(value) {
  return secretValueMarkers.some((marker) => value.includes(marker));
}
