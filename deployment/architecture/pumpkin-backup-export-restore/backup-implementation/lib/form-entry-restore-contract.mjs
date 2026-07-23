import { createHash } from 'node:crypto';
import { findForbiddenRestoreMaterialPaths } from './restore-material-boundary.mjs';

const notificationStates = new Set(['not_configured', 'pending', 'sent', 'failed', 'suppressed_test', 'dead_lettered']);
const publicContextFields = [
  'tenantUid',
  'publicationId',
  'releaseId',
  'formMappingId',
  'fieldContractVersion',
  'publicIdempotencyIdentity',
  'publicPayloadDigest'
];

export function validateFormEntryRestoreRecords(records = []) {
  if (!Array.isArray(records)) {
    return { ok: false, errors: ['formEntries must be an array'], count: 0, uniqueTenantSubmissionCount: 0 };
  }

  const seenSubmissions = new Set();
  const seenPublicIdentities = new Map();
  const errors = [];
  for (const [index, entry] of records.entries()) {
    const prefix = `formEntries[${index}]`;
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push(`${prefix} must be an object`);
      continue;
    }
    for (const field of ['id', 'tenantId', 'submissionId', 'correlationId', 'idempotencyKey']) {
      if (!String(entry?.[field] || '').trim()) errors.push(`${prefix}.${field} is required`);
    }
    const submissionIdentity = JSON.stringify([entry?.tenantId || '', entry?.submissionId || '']);
    if (seenSubmissions.has(submissionIdentity)) errors.push(`${prefix} duplicates tenant/submission identity`);
    seenSubmissions.add(submissionIdentity);

    const hasPublicContext = publicContextFields.some((field) => String(entry?.[field] || '').trim().length > 0);
    if (hasPublicContext) {
      for (const field of publicContextFields) {
        if (!String(entry?.[field] || '').trim()) errors.push(`${prefix}.${field} is required for public form restore`);
      }
      if (entry.publicPayloadDigest && !/^[a-f0-9]{64}$/.test(entry.publicPayloadDigest)) {
        errors.push(`${prefix}.publicPayloadDigest must be a lowercase SHA-256 digest`);
      }
      if (entry.publicIdempotencyIdentity && !/^[a-f0-9]{64}$/.test(entry.publicIdempotencyIdentity)) {
        errors.push(`${prefix}.publicIdempotencyIdentity must be a lowercase SHA-256 digest`);
      }
      if (entry.idempotencyKey !== entry.submissionId) {
        errors.push(`${prefix}.idempotencyKey must match submissionId for public form restore`);
      }

      const expectedStorageId = sha256(`${entry.tenantUid}\n${entry.submissionId}`);
      if (entry.id !== expectedStorageId) {
        errors.push(`${prefix}.id must equal SHA-256 of tenantUid and submissionId`);
      }
      const expectedPublicIdentity = sha256([
        entry.tenantUid,
        entry.publicationId,
        entry.formMappingId,
        entry.submissionId
      ].join('\n'));
      if (entry.publicIdempotencyIdentity !== expectedPublicIdentity) {
        errors.push(`${prefix}.publicIdempotencyIdentity does not match canonical public submission scope`);
      }

      const publicIdentity = [
        entry.tenantUid || '',
        entry.publicationId || '',
        entry.formMappingId || '',
        entry.publicIdempotencyIdentity || ''
      ];
      const publicIdentityKey = JSON.stringify(publicIdentity);
      if (seenPublicIdentities.has(publicIdentityKey)) {
        const priorDigest = seenPublicIdentities.get(publicIdentityKey);
        if (priorDigest === entry.publicPayloadDigest) {
          errors.push(`${prefix} duplicates public idempotency identity`);
        } else {
          errors.push(`${prefix} conflicts with existing public idempotency payload digest`);
        }
      } else {
        seenPublicIdentities.set(publicIdentityKey, entry.publicPayloadDigest);
      }
    }

    const delivery = entry?.metadata?.notificationDeliveryStatus || 'not_configured';
    if (!notificationStates.has(delivery)) errors.push(`${prefix}.metadata.notificationDeliveryStatus is invalid`);
    if ((entry?.metadata?.leadPersistenceStatus || 'persisted') !== 'persisted') errors.push(`${prefix}.metadata.leadPersistenceStatus must remain persisted`);
    for (const path of findForbiddenRestoreMaterialPaths(entry, prefix)) {
      errors.push(`${path} is forbidden in restore representation`);
    }
  }
  return { ok: errors.length === 0, errors, count: records.length, uniqueTenantSubmissionCount: seenSubmissions.size };
}

function sha256(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}
