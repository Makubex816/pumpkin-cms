import path from 'node:path';
import { findSecretLikeData } from './secret-scan.mjs';

export const allowedStatuses = new Set(['passed', 'blocked', 'skipped', 'unsupported', 'failed']);

export const requiredEvidenceFields = [
  'runId',
  'startedAt',
  'completedAt',
  'environmentMode',
  'layerRefs',
  'checkedRoutes',
  'checkedApis',
  'checkResults',
  'blockedReasons',
  'warnings',
  'artifactPaths',
  'sourceEvidenceRefs',
  'securityBoundarySummary'
];

export const defaultRequiredCheckIds = [
  'admin-outbound-links-route',
  'admin-provider-readiness-messaging',
  'admin-future-gated-actions',
  'api-olm-readonly',
  'api-olm-write-action-guard',
  'provider-profile-validation',
  'resource-registry-operational-bindings',
  'olm-staging-contract',
  'staging-cosmos-readonly-sanity',
  'backup-center-staging-proof',
  'runtime-qa-evidence-manifest',
  'no-uncontrolled-write-scan',
  'local-offline-preservation'
];

export function validateRuntimeQaEvidence(manifest, options = {}) {
  const failures = [];
  const warnings = [];

  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return validationResult('failed', [{ code: 'MANIFEST_NOT_OBJECT', path: '$', message: 'Runtime QA evidence manifest must be an object.' }], warnings);
  }

  for (const field of requiredEvidenceFields) {
    if (!(field in manifest)) {
      failures.push(failure('REQUIRED_FIELD_MISSING', field, `${field} is required.`));
    }
  }

  const secretHits = findSecretLikeData(manifest);
  for (const hit of secretHits) {
    failures.push(failure('SECRET_LIKE_DATA_FOUND', hit.path, `Secret-like data marker found in evidence manifest: ${hit.marker}.`));
  }

  requireString(manifest.runId, 'runId', failures);
  requireString(manifest.startedAt, 'startedAt', failures);
  requireString(manifest.completedAt, 'completedAt', failures);
  requireString(manifest.environmentMode, 'environmentMode', failures);
  requireArray(manifest.layerRefs, 'layerRefs', failures);
  requireArray(manifest.checkedRoutes, 'checkedRoutes', failures);
  requireArray(manifest.checkedApis, 'checkedApis', failures);
  requireArray(manifest.checkResults, 'checkResults', failures);
  requireArray(manifest.blockedReasons, 'blockedReasons', failures);
  requireArray(manifest.warnings, 'warnings', failures);
  requireArray(manifest.artifactPaths, 'artifactPaths', failures);
  requireArray(manifest.sourceEvidenceRefs, 'sourceEvidenceRefs', failures);

  const seenCheckIds = new Set();
  for (const [index, check] of array(manifest.checkResults).entries()) {
    if (!check?.id) {
      failures.push(failure('CHECK_ID_MISSING', `checkResults[${index}].id`, 'Check result ID is required.'));
      continue;
    }
    seenCheckIds.add(check.id);
    if (!allowedStatuses.has(check.status)) {
      failures.push(failure('CHECK_STATUS_INVALID', `checkResults[${index}].status`, `Invalid check status: ${check.status}.`));
    }
    if (check.status === 'failed') {
      failures.push(failure('CHECK_FAILED', `checkResults[${index}]`, `Runtime QA check failed: ${check.id}.`));
    }
  }

  const requiredCheckIds = options.requiredCheckIds ?? manifest.requiredCheckIds ?? defaultRequiredCheckIds;
  for (const checkId of requiredCheckIds) {
    if (!seenCheckIds.has(checkId)) {
      failures.push(failure('REQUIRED_CHECK_MISSING', 'checkResults', `Missing required Runtime QA check: ${checkId}.`));
    }
  }

  for (const [index, artifactPath] of array(manifest.artifactPaths).entries()) {
    if (typeof artifactPath !== 'string') {
      failures.push(failure('ARTIFACT_PATH_INVALID', `artifactPaths[${index}]`, 'Artifact path must be a string.'));
      continue;
    }
    const normalized = artifactPath.replaceAll(path.sep, '/');
    if (!normalized.includes('/.tmp/') && !normalized.startsWith('.tmp/')) {
      failures.push(failure('ARTIFACT_PATH_NOT_IGNORED_TMP', `artifactPaths[${index}]`, `Artifact path must stay under ignored .tmp output: ${artifactPath}.`));
    }
  }

  validateProviderModes(manifest.providerModes, failures, warnings);
  validateBoundarySummary(manifest.securityBoundarySummary, failures);

  if (manifest.environmentMode === 'production-runtime') {
    failures.push(failure('PRODUCTION_RUNTIME_ENVIRONMENT_BLOCKED', 'environmentMode', 'Runtime QA must not run in production-runtime mode.'));
  }

  return validationResult(failures.length === 0 ? 'passed' : 'failed', failures, warnings);
}

export function validateRuntimeQaRegistry(registry) {
  const failures = [];
  const warnings = [];

  if (!registry || typeof registry !== 'object' || Array.isArray(registry)) {
    return validationResult('failed', [{ code: 'REGISTRY_NOT_OBJECT', path: '$', message: 'Runtime QA registry must be an object.' }], warnings);
  }

  requireString(registry.registryId, 'registryId', failures);
  requireString(registry.phase, 'phase', failures);
  requireString(registry.environmentMode, 'environmentMode', failures);
  requireArray(registry.layerRefs, 'layerRefs', failures);
  requireArray(registry.checkedRoutes, 'checkedRoutes', failures);
  requireArray(registry.checkedApis, 'checkedApis', failures);
  requireArray(registry.sourceEvidenceRefs, 'sourceEvidenceRefs', failures);
  requireArray(registry.checks, 'checks', failures);

  const checkIds = new Set(array(registry.checks).map((check) => check?.id).filter(Boolean));
  for (const checkId of registry.requiredCheckIds ?? defaultRequiredCheckIds) {
    if (!checkIds.has(checkId)) {
      failures.push(failure('REGISTRY_REQUIRED_CHECK_MISSING', 'checks', `Registry missing required check: ${checkId}.`));
    }
  }

  validateProviderModes(registry.providerModes, failures, warnings);

  return validationResult(failures.length === 0 ? 'passed' : 'failed', failures, warnings);
}

function validateProviderModes(providerModes, failures, warnings) {
  requireArray(providerModes, 'providerModes', failures);
  const modes = new Map(array(providerModes).map((entry) => [entry.mode, entry]));
  for (const mode of ['local-dev', 'fake-provider', 'offline-bundle', 'local-file-backed', 'local-api-fake-provider', 'staging-simulated', 'live-readonly', 'live-write-approved', 'production-runtime']) {
    if (!modes.has(mode)) {
      failures.push(failure('PROVIDER_MODE_MISSING', 'providerModes', `Provider mode is missing: ${mode}.`));
    }
  }

  const production = modes.get('production-runtime');
  if (production && production.state !== 'blocked') {
    failures.push(failure('PRODUCTION_RUNTIME_NOT_BLOCKED', 'providerModes.production-runtime.state', 'production-runtime must remain blocked.'));
  }

  const liveWrite = modes.get('live-write-approved');
  if (liveWrite) {
    if (!['scoped-only', 'blocked'].includes(liveWrite.state)) {
      failures.push(failure('LIVE_WRITE_APPROVED_STATE_INVALID', 'providerModes.live-write-approved.state', 'live-write-approved must remain scoped-only or blocked.'));
    }
    if (liveWrite.globalActivation !== false) {
      failures.push(failure('LIVE_WRITE_APPROVED_GLOBAL', 'providerModes.live-write-approved.globalActivation', 'live-write-approved must not be global.'));
    }
    if (liveWrite.providerWritesAllowed !== false) {
      failures.push(failure('LIVE_WRITE_APPROVED_WRITES_ENABLED', 'providerModes.live-write-approved.providerWritesAllowed', 'V2.6.1 must not enable new provider writes.'));
    }
  }

  const liveReadonly = modes.get('live-readonly');
  if (liveReadonly && liveReadonly.providerWritesAllowed !== false) {
    failures.push(failure('LIVE_READONLY_WRITES_ENABLED', 'providerModes.live-readonly.providerWritesAllowed', 'live-readonly must not allow provider writes.'));
  }

  if (warnings.length === 0 && modes.size > 0) {
    warnings.push({ code: 'PROVIDER_MODES_VALIDATED', message: `${modes.size} provider modes validated.` });
  }
}

function validateBoundarySummary(boundary, failures) {
  if (!boundary || typeof boundary !== 'object') {
    failures.push(failure('SECURITY_BOUNDARY_MISSING', 'securityBoundarySummary', 'securityBoundarySummary is required.'));
    return;
  }

  const blockedBooleans = [
    'providerDataWrites',
    'additionalOlmStagingWrites',
    'destructiveRollbackDeletion',
    'azureInfrastructureMutation',
    'rbacAssignment',
    'protectedConfigReads',
    'secretExport',
    'keysListKeys',
    'connectionStrings',
    'sasGeneration',
    'productionDatabaseMigration',
    'productionProviderWrites',
    'cmsWrites',
    'externalCrawling',
    'deployment',
    'searchConsoleIndexing',
    'livePagePublication'
  ];

  for (const field of blockedBooleans) {
    if (boundary[field] !== false) {
      failures.push(failure('SECURITY_BOUNDARY_NOT_CLOSED', `securityBoundarySummary.${field}`, `${field} must be false.`));
    }
  }
}

function requireString(value, pathName, failures) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    failures.push(failure('STRING_REQUIRED', pathName, `${pathName} must be a non-empty string.`));
  }
}

function requireArray(value, pathName, failures) {
  if (!Array.isArray(value)) {
    failures.push(failure('ARRAY_REQUIRED', pathName, `${pathName} must be an array.`));
  }
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function failure(code, pathName, message) {
  return { code, path: pathName, message };
}

function validationResult(status, failures, warnings) {
  return {
    status,
    summary: {
      failureCount: failures.length,
      warningCount: warnings.length
    },
    failures,
    warnings
  };
}
