import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFormEntryRestoreRecords } from '../lib/form-entry-restore-contract.mjs';

const entry = {
  id: 'entry-1', tenantId: 'tenant-a', submissionId: 'submission-1', correlationId: 'correlation-1', idempotencyKey: 'idempotency-1',
  metadata: { leadPersistenceStatus: 'persisted', notificationDeliveryStatus: 'not_configured' }
};

test('restore retains tenant scope, stable identities, idempotency, and notification state', () => {
  const result = validateFormEntryRestoreRecords([structuredClone(entry)]);
  assert.deepEqual(result, { ok: true, errors: [], count: 1, uniqueTenantSubmissionCount: 1 });
});

test('restore blocks a duplicate lead in the same tenant', () => {
  const result = validateFormEntryRestoreRecords([structuredClone(entry), { ...structuredClone(entry), id: 'entry-2' }]);
  assert.equal(result.ok, false);
  assert(result.errors.some((error) => error.includes('duplicates tenant/submission identity')));
});
