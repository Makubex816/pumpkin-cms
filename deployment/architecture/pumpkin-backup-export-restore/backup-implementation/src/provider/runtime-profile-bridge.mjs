const endpointAllowedKeys = Object.freeze([
  'tenantKey',
  'siteKey',
  'environment',
  'profile',
  'providerType',
  'providerStatus',
  'provisioningStatus',
  'runtimeStatus',
  'accountName',
  'resourceGroup',
  'subscriptionHint',
  'databaseName',
  'containerNames',
  'backupPolicyMode',
  'portableExportSupported',
  'platformBackupEvidenceSupported',
  'redactionStatus',
  'secretsIncluded'
]);

const endpointAllowedKeySet = new Set(endpointAllowedKeys);
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

export function buildRuntimeProfileBridge(resolved) {
  const endpointResponse = buildProviderMetadataEndpointResponse(resolved);
  return {
    schemaVersion: '0.1.0',
    bridgeMode: 'local-runtime-profile',
    endpointContractPath: '/api/admin/provider-metadata',
    response: endpointResponse,
    readiness: {
      exportReadiness: resolved.readiness.exportReadiness,
      reason: resolved.readiness.reason,
      cosmosProvisioningRequired: resolved.readiness.cosmosProvisioningRequired,
      liveDatabaseExportAllowed: false,
      nextAction: resolved.readiness.nextAction
    },
    boundaries: {
      protectedConfigRead: false,
      cmsApiCalled: false,
      azureCalled: false,
      databaseExportPerformed: false,
      cosmosDocumentExportPerformed: false,
      externalSystemMutation: false,
      secretsIncluded: false,
      runtimeConfigured: endpointResponse.runtimeStatus === 'runtime-configured'
    }
  };
}

export function buildProviderMetadataEndpointResponse(resolved) {
  const metadata = resolved.metadata;
  const response = {
    tenantKey: metadata.tenantKey,
    siteKey: metadata.siteKey,
    environment: metadata.environment,
    profile: metadata.profile,
    providerType: metadata.providerType,
    providerStatus: metadata.providerStatus,
    provisioningStatus: provisioningStatusFor(metadata),
    runtimeStatus: runtimeStatusFor(metadata, resolved.readiness),
    accountName: metadata.accountName,
    resourceGroup: metadata.resourceGroup,
    subscriptionHint: metadata.subscriptionHint,
    databaseName: metadata.databaseName,
    containerNames: metadata.containerNames,
    backupPolicyMode: metadata.backupPolicyMode,
    portableExportSupported: metadata.portableExportSupported,
    platformBackupEvidenceSupported: metadata.platformBackupEvidenceSupported,
    redactionStatus: metadata.redactionStatus,
    secretsIncluded: metadata.secretsIncluded
  };
  const validation = validateProviderMetadataEndpointResponse(response);
  if (validation.status !== 'passed') {
    throw new Error(`provider endpoint response failed validation: ${validation.failures.map((failure) => failure.code).join(', ')}`);
  }
  return response;
}

export function validateProviderMetadataEndpointResponse(response) {
  const failures = [];
  for (const key of Object.keys(response)) {
    if (!endpointAllowedKeySet.has(key)) {
      failures.push({ code: 'UNKNOWN_FIELD', path: key, message: 'endpoint response contains a field outside the allowlist' });
    }
    if (isForbiddenKey(key)) {
      failures.push({ code: 'FORBIDDEN_FIELD', path: key, message: 'endpoint response contains a forbidden field name' });
    }
  }
  for (const key of endpointAllowedKeys) {
    if (!Object.hasOwn(response, key)) {
      failures.push({ code: 'MISSING_FIELD', path: key, message: 'endpoint response is missing an allowlisted contract field' });
    }
  }
  const valueHits = findForbiddenValues(response);
  for (const hit of valueHits) {
    failures.push({ code: 'FORBIDDEN_VALUE', path: hit.path, message: 'endpoint response contains a secret-like value' });
  }
  if (response.secretsIncluded !== false) {
    failures.push({ code: 'SECRETS_INCLUDED', path: 'secretsIncluded', message: 'endpoint response must declare secretsIncluded false' });
  }
  if (response.providerStatus === 'future-target' && response.runtimeStatus === 'runtime-configured') {
    failures.push({ code: 'FUTURE_TARGET_RUNTIME_CONFIGURED', path: 'runtimeStatus', message: 'future target must not be runtime configured' });
  }
  return {
    status: failures.length === 0 ? 'passed' : 'failed',
    failures
  };
}

export function endpointAllowedResponseKeys() {
  return [...endpointAllowedKeys];
}

function provisioningStatusFor(metadata) {
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
  if (metadata.providerStatus === 'future-target' && metadata.sourceResolutionStatus === 'provisioned') {
    return 'metadata-endpoint-runtime-wiring-required';
  }
  if (metadata.providerStatus === 'configured' && readiness.liveDatabaseExportAllowed === true) {
    return 'runtime-configured';
  }
  if (metadata.providerStatus === 'missing') {
    return 'provider-source-missing';
  }
  return 'not-runtime-configured';
}

function findForbiddenValues(value, path = '$') {
  const hits = [];
  if (Array.isArray(value)) {
    value.forEach((item, index) => hits.push(...findForbiddenValues(item, `${path}[${index}]`)));
    return hits;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      hits.push(...findForbiddenValues(child, `${path}.${key}`));
    }
    return hits;
  }
  if (typeof value === 'string' && secretValueMarkers.some((marker) => value.includes(marker))) {
    hits.push({ path });
  }
  return hits;
}

function isForbiddenKey(key) {
  const normalized = key.replace(/[^a-z0-9]/gi, '').toLowerCase();
  return forbiddenNormalizedKeys.has(normalized);
}
