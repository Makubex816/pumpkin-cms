const requiredFields = [
  'requestId',
  'actionId',
  'correlationId',
  'migrationRunId',
  'migrationRecordId',
  'providerProfileId',
  'providerMode',
  'applyPlanId',
  'applyPlanRecordId',
  'tenantKey',
  'siteKey',
  'sourceRecordId',
  'targetRecordId',
  'targetEntity',
  'outboundLinkId',
  'outboundLinkInstanceId',
  'policyId',
  'policyVersion',
  'scanRunId',
  'reviewDecisionId',
  'bulkActionId',
  'auditEventIds',
  'rollbackPlanId',
  'affectedPageIds',
  'affectedInstanceIds',
  'beforeStateHash',
  'afterStateHash',
  'migrationRecordHash',
  'performedAt',
  'outcome',
  'blockReason',
  'validationResultId'
];

export function validateTraceContinuity({ migration, applyPlanRecords }) {
  const failures = [];
  const migrationRecordHashes = new Map();
  const migrationRecordIdCounts = new Map();
  for (const [entity, records] of Object.entries(migration.recordsByEntity)) {
    for (const record of records) {
      migrationRecordHashes.set(recordHashKey({ entity, record }), record.migrationRecordHash);
      migrationRecordIdCounts.set(record.migrationRecordId, (migrationRecordIdCounts.get(record.migrationRecordId) ?? 0) + 1);
    }
  }
  const uniqueRecordHashes = new Map();
  for (const records of Object.values(migration.recordsByEntity)) {
    for (const record of records) {
      if (migrationRecordIdCounts.get(record.migrationRecordId) === 1) {
        uniqueRecordHashes.set(record.migrationRecordId, record.migrationRecordHash);
      }
    }
  }
  for (const record of applyPlanRecords) {
    for (const field of requiredFields) {
      if (!Object.prototype.hasOwnProperty.call(record, field)) {
        failures.push(failure('TRACE_CONTINUITY_FIELD_MISSING', `${field} is required`, `${record.applyPlanRecordId ?? 'unknown'}/${field}`));
      }
    }
    const expectedHash = migrationRecordHashes.get(recordHashKey({ entity: record.targetEntity, record }))
      ?? uniqueRecordHashes.get(record.migrationRecordId);
    if (expectedHash !== record.migrationRecordHash) {
      failures.push(failure('TRACE_CONTINUITY_HASH_MISMATCH', 'migrationRecordHash must match source migration record', `${record.applyPlanRecordId}/migrationRecordHash`));
    }
    if (!Array.isArray(record.auditEventIds) || !Array.isArray(record.affectedPageIds) || !Array.isArray(record.affectedInstanceIds)) {
      failures.push(failure('TRACE_CONTINUITY_ARRAY_INVALID', 'trace array fields must be arrays', record.applyPlanRecordId));
    }
  }
  return {
    schemaVersion: '0.1.0',
    validationType: 'pumpkin-outbound-link-apply-plan-trace-continuity',
    status: failures.length === 0 ? 'passed' : 'failed',
    requiredFieldCount: requiredFields.length,
    checkedRecordCount: applyPlanRecords.length,
    failures,
    summary: {
      failureCount: failures.length
    }
  };
}

function recordHashKey({ entity, record }) {
  return `${entity}:${record.migrationRecordId}:${record.targetRecordId}`;
}

function failure(code, message, path) {
  return { code, message, path };
}
