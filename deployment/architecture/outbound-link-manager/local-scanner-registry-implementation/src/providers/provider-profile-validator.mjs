import { providerModes, normalizeProviderProfile, providerProfileSchemaVersion } from './provider-profile-model.mjs';

const secretPatterns = [
  /AccountKey=/i,
  /SharedAccessSignature/i,
  /DefaultEndpointsProtocol=/i,
  /\bBearer\s+[A-Za-z0-9._-]{10,}/,
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/,
  /-----BEGIN [A-Z ]+ PRIVATE KEY-----/
];

export function validateProviderProfile(rawProfile) {
  const profile = normalizeProviderProfile(rawProfile);
  const failures = [];
  if (profile.schemaVersion !== providerProfileSchemaVersion) {
    failures.push(failure('PROVIDER_PROFILE_SCHEMA_UNSUPPORTED', 'provider profile schemaVersion is not supported', 'schemaVersion'));
  }
  if (!providerModes.includes(profile.providerMode)) {
    failures.push(failure('PROVIDER_MODE_UNKNOWN', `unknown provider mode: ${profile.providerMode}`, 'providerMode'));
  }
  if (!profile.providerProfileId) {
    failures.push(failure('PROVIDER_PROFILE_ID_MISSING', 'providerProfileId is required', 'providerProfileId'));
  }
  if (profile.targetProvider.partitionKey !== '/tenantKey') {
    failures.push(failure('PROVIDER_PARTITION_KEY_INVALID', 'target provider partitionKey must be /tenantKey', 'targetProvider.partitionKey'));
  }
  if (profile.targetProvider.credentialValueIncluded !== false) {
    failures.push(failure('PROVIDER_CREDENTIAL_VALUE_INCLUDED', 'credential values must not be included', 'targetProvider.credentialValueIncluded'));
  }
  if (profile.capabilities.canPerformLiveWrites !== false || profile.capabilities.liveProviderWrites !== false) {
    failures.push(failure('PROVIDER_LIVE_WRITE_CAPABILITY_FORBIDDEN', 'live write capability is forbidden in this phase', 'capabilities'));
  }
  for (const [field, value] of Object.entries(profile.boundaries)) {
    if (field === 'localOnly' || field === 'simulatedOnly' || field === 'dryRunOnly') continue;
    if (value !== false) {
      failures.push(failure('PROVIDER_BOUNDARY_UNSAFE', `${field} must be false`, `boundaries.${field}`));
    }
  }
  scanSecretLikeValues(profile, failures);
  return {
    schemaVersion: providerProfileSchemaVersion,
    validationType: 'pumpkin-outbound-link-provider-profile-validation',
    status: failures.length === 0 ? 'passed' : 'failed',
    profile,
    summary: {
      failureCount: failures.length
    },
    failures
  };
}

function scanSecretLikeValues(value, failures, pathName = '$') {
  if (value === null || value === undefined) return;
  if (typeof value === 'string') {
    if (secretPatterns.some((pattern) => pattern.test(value)) || hasUnredactedRiskyQueryValue(value)) {
      failures.push(failure('SECRET_LIKE_VALUE_DETECTED', 'secret-like value detected in provider profile', pathName));
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanSecretLikeValues(item, failures, `${pathName}[${index}]`));
    return;
  }
  if (typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      scanSecretLikeValues(nested, failures, `${pathName}.${key}`);
    }
  }
}

function hasUnredactedRiskyQueryValue(value) {
  const matches = String(value ?? '').matchAll(/(?:[?&])(?:token|key|api_key|apikey|signature|sig|auth|password|access_token|code)=([^&\s]+)/gi);
  for (const match of matches) {
    if (decodeURIComponent(match[1]).toLowerCase() !== 'redacted') {
      return true;
    }
  }
  return false;
}

function failure(code, message, pathValue) {
  return { code, message, path: pathValue };
}
