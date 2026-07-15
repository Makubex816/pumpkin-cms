const notificationStates = new Set(['not_configured', 'pending', 'sent', 'failed', 'suppressed_test', 'dead_lettered']);

export function validateFormEntryRestoreRecords(records = []) {
  const seen = new Set();
  const errors = [];
  for (const [index, entry] of records.entries()) {
    const prefix = `formEntries[${index}]`;
    for (const field of ['id', 'tenantId', 'submissionId', 'correlationId', 'idempotencyKey']) {
      if (!String(entry?.[field] || '').trim()) errors.push(`${prefix}.${field} is required`);
    }
    const identity = `${entry?.tenantId || ''}:${entry?.submissionId || ''}`;
    if (seen.has(identity)) errors.push(`${prefix} duplicates tenant/submission identity`);
    seen.add(identity);
    const delivery = entry?.metadata?.notificationDeliveryStatus || 'not_configured';
    if (!notificationStates.has(delivery)) errors.push(`${prefix}.metadata.notificationDeliveryStatus is invalid`);
    if ((entry?.metadata?.leadPersistenceStatus || 'persisted') !== 'persisted') errors.push(`${prefix}.metadata.leadPersistenceStatus must remain persisted`);
  }
  return { ok: errors.length === 0, errors, count: records.length, uniqueTenantSubmissionCount: seen.size };
}
