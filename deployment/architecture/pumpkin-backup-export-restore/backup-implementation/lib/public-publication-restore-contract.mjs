import {
  assertNoForbiddenRestoreMaterial,
  findForbiddenRestoreMaterialPaths
} from './restore-material-boundary.mjs';

export const publicPublicationRestoreContractVersion = '1.0.0';
export const publicPublicationRestoreKind = 'pumpkin.public-publications';
export const publicPublicationHeldState = 'held_pending_revalidation';

export function createPublicPublicationRestoreEnvelope(
  publications = [],
  { exportedAt = new Date().toISOString() } = {}
) {
  if (!Array.isArray(publications)) throw new TypeError('publications must be an array');
  if (!isIsoDate(exportedAt)) throw new TypeError('exportedAt must be an ISO-8601 timestamp');

  const heldPublications = publications.map((publication, index) => {
    assertNoForbiddenRestoreMaterial(publication, `publications[${index}]`);
    const clone = structuredClone(publication);
    const sourceStatus = String(publication?.status || 'unknown');
    const sourceTicketKeyIdPresent = nonempty(publication?.ticketKeyId);
    const { _etag: ignoredEtag, ...portable } = clone;
    void ignoredEtag;

    return {
      ...portable,
      status: publicPublicationHeldState,
      active: false,
      indexingState: 'disabled',
      allowedHostnames: canonicalHostnamesFromPublication(publication),
      ticketKeyId: '',
      activatedAtUtc: null,
      activatedBy: '',
      restoreState: publicPublicationHeldState,
      revalidationRequired: true,
      restoreMetadata: {
        sourceStatus,
        sourceActive: sourceStatus === 'active' || publication?.active === true,
        sourceTicketKeyIdPresent,
        activationAllowed: false,
        revalidatedAt: null
      }
    };
  });

  return {
    schemaVersion: publicPublicationRestoreContractVersion,
    kind: publicPublicationRestoreKind,
    exportedAt,
    restorePolicy: {
      activeOnRestore: false,
      restoreState: publicPublicationHeldState,
      revalidationRequired: true,
      ticketMaterialIncluded: false,
      signingMaterialIncluded: false,
      ticketKeyRebindingRequired: true
    },
    publications: heldPublications
  };
}

export function validatePublicPublicationRestoreEnvelope(envelope) {
  const errors = [];
  if (!isPlainObject(envelope)) {
    return { ok: false, errors: ['public publication restore envelope is required'], count: 0, uniqueTenantPublicationCount: 0 };
  }

  if (envelope.schemaVersion !== publicPublicationRestoreContractVersion) {
    errors.push('public publication restore envelope schemaVersion is unsupported');
  }
  if (envelope.kind !== publicPublicationRestoreKind) {
    errors.push('public publication restore envelope kind is unsupported');
  }
  if (!isIsoDate(envelope.exportedAt)) {
    errors.push('public publication restore envelope exportedAt must be an ISO-8601 timestamp');
  }
  if (
    envelope.restorePolicy?.activeOnRestore !== false ||
    envelope.restorePolicy?.restoreState !== publicPublicationHeldState ||
    envelope.restorePolicy?.revalidationRequired !== true ||
    envelope.restorePolicy?.ticketMaterialIncluded !== false ||
    envelope.restorePolicy?.signingMaterialIncluded !== false ||
    envelope.restorePolicy?.ticketKeyRebindingRequired !== true
  ) {
    errors.push('public publication restore envelope policy must hold activation and exclude ticket/signing material');
  }

  const recordResult = validatePublicPublicationRestoreRecords(envelope.publications);
  errors.push(...recordResult.errors);
  return {
    ok: errors.length === 0,
    errors,
    count: recordResult.count,
    uniqueTenantPublicationCount: recordResult.uniqueTenantPublicationCount
  };
}

export function validatePublicPublicationRestoreRecords(records = []) {
  if (!Array.isArray(records)) {
    return { ok: false, errors: ['publications must be an array'], count: 0, uniqueTenantPublicationCount: 0 };
  }

  const errors = [];
  const identities = new Set();
  for (const [index, publication] of records.entries()) {
    const prefix = `publications[${index}]`;
    if (!isPlainObject(publication)) {
      errors.push(`${prefix} must be an object`);
      continue;
    }

    for (const field of [
      'id',
      'publicationId',
      'tenantId',
      'tenantUid',
      'schemaVersion',
      'releaseId',
      'artifactSha256',
      'status',
      'indexingState',
      'createdAtUtc',
      'createdBy',
      'updatedAtUtc',
      'updatedBy'
    ]) {
      if (!nonempty(publication[field])) errors.push(`${prefix}.${field} is required`);
    }

    if (publication.artifactSha256 && !/^[a-f0-9]{64}$/.test(publication.artifactSha256)) {
      errors.push(`${prefix}.artifactSha256 must be a lowercase SHA-256 digest`);
    }
    if (publication.id !== publication.publicationId) {
      errors.push(`${prefix}.id must equal publicationId for /id partition restore`);
    }

    const identity = publication.publicationId || '';
    if (identities.has(identity)) errors.push(`${prefix} duplicates global publicationId`);
    identities.add(identity);

    if (publication.status !== publicPublicationHeldState) {
      errors.push(`${prefix}.status must be ${publicPublicationHeldState}`);
    }
    if (publication.active !== false) errors.push(`${prefix}.active must be false for restore`);
    if (publication.indexingState !== 'disabled') errors.push(`${prefix}.indexingState must remain disabled`);
    if (publication.restoreState !== publicPublicationHeldState) {
      errors.push(`${prefix}.restoreState must be ${publicPublicationHeldState}`);
    }
    if (publication.revalidationRequired !== true) errors.push(`${prefix}.revalidationRequired must be true`);
    if (
      !isPlainObject(publication.restoreMetadata) ||
      !nonempty(publication.restoreMetadata?.sourceStatus) ||
      publication.restoreMetadata?.activationAllowed !== false ||
      publication.restoreMetadata?.revalidatedAt !== null
    ) {
      errors.push(`${prefix}.restoreMetadata must preserve source state and prevent activation until revalidated`);
    }
    if (publication.ticketKeyId !== '') {
      errors.push(`${prefix}.ticketKeyId must be empty until a current signing key is revalidated`);
    }
    if (!Number.isInteger(publication.ticketTtlSeconds) || publication.ticketTtlSeconds <= 0) {
      errors.push(`${prefix}.ticketTtlSeconds must be a positive integer`);
    }

    validateStringArray(publication.allowedOrigins, `${prefix}.allowedOrigins`, errors, validateOrigin);
    validateStringArray(publication.allowedHostnames, `${prefix}.allowedHostnames`, errors, validateHostname);
    validateDerivedHostnames(publication, prefix, errors);
    validateFormMappings(publication.formMappings, `${prefix}.formMappings`, errors);

    if (!Number.isInteger(publication.revision) || publication.revision < 1) {
      errors.push(`${prefix}.revision must be a positive integer`);
    }
    validateTimestamp(publication.createdAtUtc, `${prefix}.createdAtUtc`, errors);
    validateTimestamp(publication.updatedAtUtc, `${prefix}.updatedAtUtc`, errors);
    validateOptionalTimestamp(publication.activeFromUtc, `${prefix}.activeFromUtc`, errors);
    validateOptionalTimestamp(publication.activeUntilUtc, `${prefix}.activeUntilUtc`, errors);
    validateOptionalTimestamp(publication.revokedAtUtc, `${prefix}.revokedAtUtc`, errors);
    if (
      publication.activeFromUtc &&
      publication.activeUntilUtc &&
      Date.parse(publication.activeFromUtc) > Date.parse(publication.activeUntilUtc)
    ) {
      errors.push(`${prefix} publication activeFromUtc must not be after activeUntilUtc`);
    }

    if (Object.hasOwn(publication, '_etag')) {
      errors.push(`${prefix}._etag must not be included in portable restore representation`);
    }
    for (const path of findForbiddenRestoreMaterialPaths(publication, prefix)) {
      errors.push(`${path} is forbidden in restore representation`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    count: records.length,
    uniqueTenantPublicationCount: identities.size
  };
}

function canonicalHostnamesFromPublication(publication) {
  const originHostnames = Array.isArray(publication?.allowedOrigins)
    ? publication.allowedOrigins.flatMap((origin) => {
      try {
        return [new URL(origin).hostname.toLowerCase()];
      } catch {
        return [];
      }
    })
    : [];
  return [...new Set(originHostnames.map((value) => String(value).trim().toLowerCase()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
}

function validateStringArray(value, path, errors, itemValidator) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${path} must be a non-empty array`);
    return;
  }
  const seen = new Set();
  for (const [index, item] of value.entries()) {
    if (!nonempty(item)) {
      errors.push(`${path}[${index}] must be a non-empty string`);
      continue;
    }
    if (!itemValidator(item)) errors.push(`${path}[${index}] is not canonical`);
    if (seen.has(item)) errors.push(`${path}[${index}] is duplicated`);
    seen.add(item);
  }
}

function validateFormMappings(value, path, errors) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${path} must be a non-empty array`);
    return;
  }
  const seen = new Set();
  for (const [index, mapping] of value.entries()) {
    if (!isPlainObject(mapping)) {
      errors.push(`${path}[${index}] must be an object`);
      continue;
    }
    for (const field of ['formMappingId', 'formDefinitionId', 'fieldContractVersion', 'formKey', 'siteKey', 'pageSlug']) {
      if (!nonempty(mapping[field])) errors.push(`${path}[${index}].${field} is required`);
    }
    if (mapping.active !== true) errors.push(`${path}[${index}].active must be true`);
    if (mapping.submitMode !== 'public-ticket') {
      errors.push(`${path}[${index}].submitMode must be public-ticket`);
    }
    if (seen.has(mapping.formMappingId)) errors.push(`${path}[${index}] duplicates formMappingId`);
    seen.add(mapping.formMappingId);
  }
}

function validateTimestamp(value, path, errors) {
  if (!isIsoDate(value)) errors.push(`${path} must be an ISO-8601 timestamp`);
}

function validateOptionalTimestamp(value, path, errors) {
  if (value !== null && value !== undefined && value !== '' && !isIsoDate(value)) {
    errors.push(`${path} must be null or an ISO-8601 timestamp`);
  }
}

function validateOrigin(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && value === url.origin;
  } catch {
    return false;
  }
}

function validateDerivedHostnames(publication, prefix, errors) {
  const expected = canonicalHostnamesFromPublication({ allowedOrigins: publication.allowedOrigins });
  const actual = Array.isArray(publication.allowedHostnames)
    ? [...publication.allowedHostnames].sort((a, b) => a.localeCompare(b))
    : [];
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    errors.push(`${prefix}.allowedHostnames must exactly match hostnames derived from allowedOrigins`);
  }
}

function validateHostname(value) {
  const hostname = String(value).trim();
  return (
    hostname === hostname.toLowerCase() &&
    hostname.length <= 253 &&
    !hostname.includes('://') &&
    !hostname.includes('/') &&
    /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(hostname)
  );
}

function nonempty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isIsoDate(value) {
  return nonempty(value) && Number.isFinite(Date.parse(value));
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
