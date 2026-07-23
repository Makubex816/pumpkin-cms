function enumValues(values) {
  return Object.freeze(Object.fromEntries(values.map((value) => [value, value])));
}

export const ContractVersion = Object.freeze({
  publicationInput: 'pumpkin.tenant-publication-input.v1',
  artifactManifest: 'pumpkin.tenant-publication-artifact.v1',
  productRelease: 'pumpkin.product-release.v1',
  publicationSnapshot: 'pumpkin.tenant-publication-snapshot.v1',
  registry: 'pumpkin.immutable-publication-registry.v1',
  job: 'pumpkin.publication-job.v1',
  swaPlan: 'pumpkin.azure-swa-plan.v1',
  deploymentOperation: 'pumpkin.azure-swa-deployment-operation.v1',
  deploymentResult: 'pumpkin.azure-swa-deployment-result.v1',
  credentialReference: 'pumpkin.credential-reference.v1',
  childEnvironment: 'pumpkin.credential-child-environment-contract.v1',
});

export const HostingClass = enumValues([
  'STATIC_PUBLISHED_SITE',
  'DYNAMIC_SCALE_TO_ZERO_FRONTEND',
  'SHARED_RUNTIME_COMPATIBILITY',
]);

export const PublicationState = enumValues([
  'DRAFT',
  'PLANNED',
  'BUILDING',
  'READY',
  'DEPLOYING',
  'ACTIVE',
  'SUPERSEDED',
  'REVOKED',
  'FAILED',
  'ROLLED_BACK',
  'ARCHIVED',
]);

export const PublicationMode = enumValues([
  'HELD_NOINDEX',
  'PUBLIC_NOINDEX',
  'PUBLIC_INDEXABLE_OWNER_APPROVAL_REQUIRED',
]);

export const FormMode = enumValues([
  'PREVIEW_NO_POST',
  'PUBLIC_FORMS_LIVE',
]);

export const ProductReleaseState = enumValues([
  'DRAFT',
  'ACCEPTED',
  'SUPERSEDED',
  'REVOKED',
  'ARCHIVED',
]);

export const JobState = enumValues([
  'PLANNED',
  'RUNNING',
  'BLOCKED',
  'PARTIAL',
  'FAILED',
  'COMPLETED',
  'ROLLING_BACK',
  'ROLLED_BACK',
  'ROLLBACK_FAILED',
  'CANCELLED',
]);

export const StepState = enumValues([
  'PENDING',
  'READY',
  'RUNNING',
  'SUCCEEDED',
  'SKIPPED',
  'BLOCKED',
  'PARTIAL',
  'FAILED',
  'ROLLING_BACK',
  'ROLLED_BACK',
  'ROLLBACK_FAILED',
]);

export const DomainStage = enumValues([
  'INTAKE',
  'HELD',
  'DNS_PLANNED',
  'VALIDATION_PENDING',
  'HOSTNAME_BINDING_PENDING',
  'TLS_PENDING',
  'READY_FOR_OWNER_APPROVAL',
  'ACTIVE',
  'ROLLBACK_PLANNED',
  'REVOKED',
]);

export const Role = enumValues([
  'TenantAdmin',
  'SuperAdmin',
]);

export const QualificationClass = enumValues([
  'STATIC_READY',
  'STATIC_READY_WITH_ADAPTATION',
  'DYNAMIC_EXCEPTION_REQUIRED',
  'SHARED_COMPATIBILITY_REQUIRED',
  'BLOCKED_BY_MISSING_EVIDENCE',
]);

export const PublicationTransitions = Object.freeze({
  DRAFT: Object.freeze(['PLANNED', 'REVOKED', 'FAILED', 'ARCHIVED']),
  PLANNED: Object.freeze(['BUILDING', 'REVOKED', 'FAILED', 'ARCHIVED']),
  BUILDING: Object.freeze(['READY', 'FAILED', 'REVOKED']),
  READY: Object.freeze(['DEPLOYING', 'SUPERSEDED', 'REVOKED', 'FAILED', 'ARCHIVED']),
  DEPLOYING: Object.freeze(['ACTIVE', 'FAILED', 'ROLLED_BACK', 'REVOKED']),
  ACTIVE: Object.freeze(['SUPERSEDED', 'REVOKED', 'FAILED', 'ROLLED_BACK']),
  SUPERSEDED: Object.freeze(['ROLLED_BACK', 'ARCHIVED']),
  REVOKED: Object.freeze(['ROLLED_BACK', 'ARCHIVED']),
  FAILED: Object.freeze(['PLANNED', 'BUILDING', 'ROLLED_BACK', 'ARCHIVED']),
  ROLLED_BACK: Object.freeze(['PLANNED', 'ARCHIVED']),
  ARCHIVED: Object.freeze([]),
});

export function assertEnumValue(enumObject, value, label) {
  if (!Object.values(enumObject).includes(value)) {
    throw new ContractError('enum_value_invalid', `${label} is invalid: ${String(value)}`);
  }
  return value;
}

export function canTransitionPublication(from, to) {
  assertEnumValue(PublicationState, from, 'publication from state');
  assertEnumValue(PublicationState, to, 'publication to state');
  return PublicationTransitions[from].includes(to);
}

export function assertPublicationTransition(from, to) {
  if (!canTransitionPublication(from, to)) {
    throw new ContractError('publication_transition_invalid', `Publication cannot transition from ${from} to ${to}.`);
  }
}

export class ContractError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'ContractError';
    this.code = code;
    this.details = details;
  }
}

/**
 * @typedef {Object} ProductRelease
 * @property {string} releaseId
 * @property {string} version
 * @property {string} sourceCommit
 * @property {string} lockfileSha256
 * @property {string} state
 */

/**
 * @typedef {Object} TenantPublicationSnapshot
 * @property {string} snapshotId
 * @property {string} tenantUid
 * @property {Array<object>} pages
 * @property {Array<object>} themes
 * @property {Array<object>} media
 * @property {Array<object>} redirects
 * @property {Array<object>} forms
 */

/**
 * @typedef {Object} PublicationJob
 * @property {string} jobId
 * @property {string} tenantId
 * @property {string} planHash
 * @property {string} state
 * @property {Array<object>} steps
 * @property {Array<object>} events
 */
