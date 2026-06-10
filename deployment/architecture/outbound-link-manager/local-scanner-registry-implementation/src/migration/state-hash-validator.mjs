export function validateStateHashes({ recordsByEntity }) {
  const failures = [];
  for (const [entity, records] of Object.entries(recordsByEntity)) {
    for (const record of records ?? []) {
      if (!isSha256(record.beforeStateHash)) {
        failures.push({
          code: 'BEFORE_STATE_HASH_INVALID',
          entity,
          recordId: record.id ?? null,
          message: 'beforeStateHash must be a sha256 hash'
        });
      }
      if (!isSha256(record.afterStateHash)) {
        failures.push({
          code: 'AFTER_STATE_HASH_INVALID',
          entity,
          recordId: record.id ?? null,
          message: 'afterStateHash must be a sha256 hash'
        });
      }
      if (!isSha256(record.migrationRecordHash)) {
        failures.push({
          code: 'MIGRATION_RECORD_HASH_INVALID',
          entity,
          recordId: record.id ?? null,
          message: 'migrationRecordHash must be a sha256 hash'
        });
      }
    }
  }
  return failures;
}

function isSha256(value) {
  return /^sha256:[a-f0-9]{64}$/.test(String(value ?? ''));
}
