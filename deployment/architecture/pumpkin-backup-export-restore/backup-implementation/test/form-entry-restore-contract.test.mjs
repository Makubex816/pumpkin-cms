import { createHash } from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFormEntryRestoreRecords } from '../lib/form-entry-restore-contract.mjs';

const legacyEntry = {
  id: 'entry-1',
  tenantId: 'tenant-a',
  submissionId: 'submission-1',
  correlationId: 'correlation-1',
  idempotencyKey: 'idempotency-1',
  metadata: { leadPersistenceStatus: 'persisted', notificationDeliveryStatus: 'not_configured' }
};

test('restore retains legacy tenant scope, stable identities, idempotency, and notification state', () => {
  const result = validateFormEntryRestoreRecords([structuredClone(legacyEntry)]);
  assert.deepEqual(result, { ok: true, errors: [], count: 1, uniqueTenantSubmissionCount: 1 });
});

test('restore blocks a duplicate legacy lead in the same tenant', () => {
  const result = validateFormEntryRestoreRecords([
    structuredClone(legacyEntry),
    { ...structuredClone(legacyEntry), id: 'entry-2' }
  ]);
  assert.equal(result.ok, false);
  assert(result.errors.some((error) => error.includes('duplicates tenant/submission identity')));
});

test('restore accepts realistic public identity/storage invariants and legacy defaults together', () => {
  const legacyWithDefaultedPublicFields = {
    ...structuredClone(legacyEntry),
    id: 'entry-legacy',
    submissionId: 'submission-legacy',
    tenantUid: '',
    publicationId: '',
    releaseId: '',
    formMappingId: '',
    fieldContractVersion: '',
    publicIdempotencyIdentity: '',
    publicPayloadDigest: ''
  };
  const result = validateFormEntryRestoreRecords([buildPublicEntry(), legacyWithDefaultedPublicFields]);
  assert.equal(result.ok, true);
  assert.equal(result.count, 2);
  assert.equal(result.uniqueTenantSubmissionCount, 2);
});

test('restore blocks duplicate public idempotency identity', () => {
  const first = buildPublicEntry();
  const duplicate = { ...structuredClone(first), correlationId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' };
  const result = validateFormEntryRestoreRecords([first, duplicate]);
  assert.equal(result.ok, false);
  assert(result.errors.some((error) => error.includes('duplicates public idempotency identity')));
});

test('restore blocks conflicting digest for the same public idempotency identity', () => {
  const first = buildPublicEntry();
  const conflict = {
    ...structuredClone(first),
    correlationId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    publicPayloadDigest: sha256('different-canonical-form-payload')
  };
  const result = validateFormEntryRestoreRecords([first, conflict]);
  assert.equal(result.ok, false);
  assert(result.errors.some((error) => error.includes('conflicts with existing public idempotency payload digest')));
});

test('restore permits independently derived identities in another mapping scope', () => {
  const first = buildPublicEntry();
  const otherMapping = buildPublicEntry({
    submissionId: '22222222-2222-4222-8222-222222222222',
    correlationId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    formMappingId: 'quote-form'
  });
  assert.equal(validateFormEntryRestoreRecords([first, otherMapping]).ok, true);
});

test('restore rejects incomplete public context and noncanonical SHA-256 values', () => {
  const partial = {
    ...structuredClone(legacyEntry),
    publicationId: 'publication-1',
    publicPayloadDigest: 'NOT-A-DIGEST'
  };
  const result = validateFormEntryRestoreRecords([partial]);
  assert.equal(result.ok, false);
  assert(result.errors.some((error) => error.includes('tenantUid is required for public form restore')));
  assert(result.errors.some((error) => error.includes('fieldContractVersion is required for public form restore')));
  assert(result.errors.some((error) => error.includes('lowercase SHA-256 digest')));
});

test('restore rejects wrong idempotency key, storage id, or canonical public identity', () => {
  const invalid = {
    ...buildPublicEntry(),
    id: sha256('wrong-storage-scope'),
    idempotencyKey: 'different-idempotency-key',
    publicIdempotencyIdentity: sha256('wrong-public-scope')
  };
  const result = validateFormEntryRestoreRecords([invalid]);
  assert.equal(result.ok, false);
  assert(result.errors.some((error) => error.includes('idempotencyKey must match submissionId')));
  assert(result.errors.some((error) => error.includes('id must equal SHA-256')));
  assert(result.errors.some((error) => error.includes('does not match canonical public submission scope')));
});

test('restore rejects submission tickets and signing material at any nesting level', () => {
  const unsafe = {
    ...buildPublicEntry(),
    metadata: {
      leadPersistenceStatus: 'persisted',
      notificationDeliveryStatus: 'not_configured',
      submissionTicket: 'must-not-be-backed-up',
      signingMaterial: { privateKey: 'must-not-be-backed-up' }
    }
  };
  const result = validateFormEntryRestoreRecords([unsafe]);
  assert.equal(result.ok, false);
  assert(result.errors.some((error) => error.includes('metadata.submissionTicket is forbidden')));
  assert(result.errors.some((error) => error.includes('metadata.signingMaterial is forbidden')));
});

function buildPublicEntry({
  tenantId = 'synthetic-validation-tenant',
  tenantUid = '4f932b7a-f1bb-4bf3-a787-f31db43c2c77',
  publicationId = 'pub-synthetic-swa-v2',
  releaseId = 'release-synthetic-swa-v2',
  formMappingId = 'contact-form',
  fieldContractVersion = 'contact-v1',
  submissionId = '11111111-1111-4111-8111-111111111111',
  correlationId = '99999999-9999-4999-8999-999999999999'
} = {}) {
  return {
    id: sha256(`${tenantUid}\n${submissionId}`),
    tenantId,
    tenantUid,
    submissionId,
    correlationId,
    idempotencyKey: submissionId,
    publicationId,
    releaseId,
    formMappingId,
    fieldContractVersion,
    publicIdempotencyIdentity: sha256(`${tenantUid}\n${publicationId}\n${formMappingId}\n${submissionId}`),
    publicPayloadDigest: sha256('canonical-public-form-payload-v1'),
    metadata: { leadPersistenceStatus: 'persisted', notificationDeliveryStatus: 'not_configured' }
  };
}

function sha256(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}
