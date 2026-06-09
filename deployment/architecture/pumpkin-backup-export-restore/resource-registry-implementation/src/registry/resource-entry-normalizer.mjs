import { findSecretLikeData } from '../utils/secret-scan.mjs';

export const registryContractVersion = '0.1.0';

const allowedStatus = new Set(['planned', 'provisioned', 'verified', 'attached', 'blocked', 'retired']);
const allowedEnvironment = new Set(['local', 'dev', 'staging', 'production']);

export function normalizeResourceRegistry(input = {}, { sessionMetadata = null } = {}) {
  const registry = {
    schemaVersion: registryContractVersion,
    registryId: stringOrDefault(input.registryId, 'pumpkin-resource-registry-local'),
    generatedAt: stringOrDefault(input.generatedAt, new Date().toISOString()),
    environment: allowedEnvironment.has(input.environment) ? input.environment : 'local',
    valuesIncluded: false,
    sessionMetadata: normalizeSessionMetadata(sessionMetadata),
    resources: array(input.resources).map(normalizeResourceEntry),
    credentialReferences: array(input.credentialReferences).map(normalizeCredentialReferenceSummary),
    tenantMappings: array(input.tenantMappings).map(normalizeTenantMapping),
    runtimeProfiles: array(input.runtimeProfiles).map(normalizeRuntimeProfile),
    validation: {
      status: 'not-run',
      valuesIncluded: false
    }
  };
  const validation = validateRedactedRegistry(registry);
  if (validation.status !== 'passed') {
    throw new Error(`redacted registry failed validation: ${validation.failures.map((failure) => failure.code).join(', ')}`);
  }
  return registry;
}

export function validateRedactedRegistry(registry) {
  const failures = [];
  if (registry?.schemaVersion !== registryContractVersion) {
    failures.push(failure('SCHEMA_VERSION_INVALID', 'schemaVersion', 'registry schema version is invalid'));
  }
  if (registry?.valuesIncluded !== false) {
    failures.push(failure('VALUES_INCLUDED', 'valuesIncluded', 'redacted registry must not include values'));
  }
  for (const hit of findSecretLikeData(registry)) {
    failures.push(failure(hit.kind === 'field' ? 'FORBIDDEN_FIELD' : 'SECRET_LIKE_VALUE', hit.path, 'redacted registry contains forbidden secret-like data'));
  }
  const resourceIds = new Set();
  for (const [index, resource] of array(registry?.resources).entries()) {
    if (!resource.resourceId) {
      failures.push(failure('RESOURCE_ID_MISSING', `resources[${index}].resourceId`, 'resourceId is required'));
    }
    if (resourceIds.has(resource.resourceId)) {
      failures.push(failure('RESOURCE_ID_DUPLICATE', `resources[${index}].resourceId`, 'resourceId must be unique'));
    }
    resourceIds.add(resource.resourceId);
    if (!allowedStatus.has(resource.status)) {
      failures.push(failure('RESOURCE_STATUS_INVALID', `resources[${index}].status`, 'resource status is invalid'));
    }
    if (!allowedEnvironment.has(resource.environment)) {
      failures.push(failure('RESOURCE_ENVIRONMENT_INVALID', `resources[${index}].environment`, 'resource environment is invalid'));
    }
  }
  for (const [index, credential] of array(registry?.credentialReferences).entries()) {
    if (credential.valueIncluded !== false) {
      failures.push(failure('CREDENTIAL_VALUE_INCLUDED', `credentialReferences[${index}].valueIncluded`, 'credential reference must not include values'));
    }
  }
  return {
    status: failures.length === 0 ? 'passed' : 'failed',
    failures
  };
}

function normalizeResourceEntry(resource = {}) {
  return {
    resourceId: stringOrDefault(resource.resourceId, null),
    resourceType: stringOrDefault(resource.resourceType, 'unknown'),
    displayName: stringOrDefault(resource.displayName, resource.resourceId ?? 'unnamed-resource'),
    environment: allowedEnvironment.has(resource.environment) ? resource.environment : 'local',
    status: allowedStatus.has(resource.status) ? resource.status : 'planned',
    tenantKeys: arrayOfStrings(resource.tenantKeys),
    siteKeys: arrayOfStrings(resource.siteKeys),
    provider: stringOrDefault(resource.provider, 'unknown'),
    nonSecretIdentifiers: plainObject(resource.nonSecretIdentifiers),
    credentialRefs: arrayOfStrings(resource.credentialRefs),
    runtimeProfiles: arrayOfStrings(resource.runtimeProfiles),
    owner: plainObject(resource.owner),
    audit: plainObject(resource.audit),
    rotation: plainObject(resource.rotation),
    cleanup: plainObject(resource.cleanup)
  };
}

function normalizeCredentialReferenceSummary(credential = {}) {
  return {
    credentialRefId: stringOrDefault(credential.credentialRefId, null),
    displayName: stringOrDefault(credential.displayName, credential.credentialRefId ?? 'unnamed-credential-reference'),
    purpose: stringOrDefault(credential.purpose, 'unspecified'),
    requiredFor: arrayOfStrings(credential.requiredFor),
    resourceIds: arrayOfStrings(credential.resourceIds),
    tenantKeys: arrayOfStrings(credential.tenantKeys),
    environment: allowedEnvironment.has(credential.environment) ? credential.environment : 'local',
    owner: stringOrDefault(credential.owner, 'unknown'),
    storageLocationCategory: stringOrDefault(credential.storageLocationCategory, 'not-collected'),
    escrowEligible: credential.escrowEligible === true,
    escrowStatus: stringOrDefault(credential.escrowStatus, 'not-collected'),
    rotationRequired: credential.rotationRequired === true,
    rotationCadence: credential.rotationCadence ?? null,
    lastVerifiedAt: credential.lastVerifiedAt ?? null,
    cleanupRequiredAfterBuild: credential.cleanupRequiredAfterBuild === true,
    nonEscrowReason: credential.nonEscrowReason ?? null,
    presence: stringOrDefault(credential.presence, 'UNKNOWN'),
    valueIncluded: false
  };
}

function normalizeTenantMapping(mapping = {}) {
  return {
    tenantKey: stringOrDefault(mapping.tenantKey, null),
    siteKey: stringOrDefault(mapping.siteKey, mapping.tenantKey ?? null),
    domainNames: arrayOfStrings(mapping.domainNames),
    resourceIds: arrayOfStrings(mapping.resourceIds),
    runtimeProfileIds: arrayOfStrings(mapping.runtimeProfileIds),
    credentialRefs: arrayOfStrings(mapping.credentialRefs),
    bundleRefs: arrayOfStrings(mapping.bundleRefs),
    status: stringOrDefault(mapping.status, 'planned')
  };
}

function normalizeRuntimeProfile(profile = {}) {
  return {
    runtimeProfileId: stringOrDefault(profile.runtimeProfileId, profile.profileName ?? null),
    profileName: stringOrDefault(profile.profileName, 'local-dev'),
    tenantKeys: arrayOfStrings(profile.tenantKeys),
    environment: allowedEnvironment.has(profile.environment) ? profile.environment : 'local',
    resourceIds: arrayOfStrings(profile.resourceIds),
    credentialRefs: arrayOfStrings(profile.credentialRefs),
    status: stringOrDefault(profile.status, 'planned'),
    liveDatabaseExportAllowed: profile.liveDatabaseExportAllowed === true,
    runtimeSwitchAllowed: profile.runtimeSwitchAllowed === true,
    productionWritesAllowed: profile.productionWritesAllowed === true,
    blockedReasonCodes: arrayOfStrings(profile.blockedReasonCodes)
  };
}

function normalizeSessionMetadata(sessionMetadata) {
  if (!sessionMetadata) {
    return {
      valuesIncluded: false,
      pumpkinApiUrlPresence: 'UNKNOWN',
      rollerTenantIdPresence: 'UNKNOWN',
      adminJwtPresence: 'UNKNOWN',
      rollerApiKeyPresence: 'UNKNOWN',
      vaultPassphrasePresence: 'UNKNOWN'
    };
  }
  return {
    valuesIncluded: false,
    pumpkinApiUrl: sessionMetadata.pumpkinApiUrl ?? null,
    pumpkinApiUrlPresence: sessionMetadata.pumpkinApiUrlPresence ?? 'UNKNOWN',
    rollerTenantId: sessionMetadata.rollerTenantId ?? null,
    rollerTenantIdPresence: sessionMetadata.rollerTenantIdPresence ?? 'UNKNOWN',
    adminJwtPresence: sessionMetadata.adminJwtPresence ?? 'UNKNOWN',
    rollerApiKeyPresence: sessionMetadata.rollerApiKeyPresence ?? 'UNKNOWN',
    vaultPassphrasePresence: sessionMetadata.vaultPassphrasePresence ?? 'UNKNOWN'
  };
}

function failure(code, path, message) {
  return { code, path, message };
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function arrayOfStrings(value) {
  return array(value).map((item) => String(item));
}

function plainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : {};
}

function stringOrDefault(value, fallback) {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  return String(value);
}

