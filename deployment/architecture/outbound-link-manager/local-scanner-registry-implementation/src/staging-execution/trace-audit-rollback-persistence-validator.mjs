import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';
import { stagingExecutionBoundaries, stagingExecutionSchemaVersion, stagingTraceFields } from './staging-execution-store.mjs';

export async function validateTraceAuditRollbackPersistence({ outputRoot, executionRecords, readbackRecords, providerStoreRecords }) {
  const failures = [];
  for (const record of [...executionRecords, ...readbackRecords]) {
    for (const field of stagingTraceFields) {
      if (!Object.prototype.hasOwnProperty.call(record, field)) {
        failures.push(failure('TRACE_FIELD_MISSING', `${field} is required`, `${record.stagingExecutionRecordId ?? record.readbackRecordId ?? 'unknown'}/${field}`));
      }
    }
    if (!Array.isArray(record.auditEventIds) || !Array.isArray(record.affectedPageIds) || !Array.isArray(record.affectedInstanceIds)) {
      failures.push(failure('TRACE_ARRAY_FIELD_INVALID', 'auditEventIds, affectedPageIds, and affectedInstanceIds must be arrays', record.stagingExecutionRecordId ?? record.readbackRecordId));
    }
    if (!record.rollbackPlanId) {
      failures.push(failure('ROLLBACK_PLAN_ID_MISSING', 'rollbackPlanId must persist through staging execution and readback', record.stagingExecutionRecordId ?? record.readbackRecordId));
    }
  }
  for (const entity of ['outbound_link_audit_logs', 'outbound_link_rollback_plans', 'outbound_link_trace_logs']) {
    if (!providerStoreRecords.some((record) => record.targetEntity === entity)) {
      failures.push(failure('PERSISTENCE_REQUIRED_ENTITY_MISSING', `${entity} must be present in staging provider store`, entity));
    }
  }
  const result = {
    schemaVersion: stagingExecutionSchemaVersion,
    validationType: 'pumpkin-outbound-link-trace-audit-rollback-persistence',
    status: failures.length === 0 ? 'passed' : 'failed',
    stagingExecutionRunId: executionRecords[0]?.stagingExecutionRunId ?? null,
    readbackRunId: readbackRecords[0]?.readbackRunId ?? null,
    summary: {
      executionRecordCount: executionRecords.length,
      readbackRecordCount: readbackRecords.length,
      providerStoreRecordCount: providerStoreRecords.length,
      auditStoreRecordCount: providerStoreRecords.filter((record) => record.targetEntity === 'outbound_link_audit_logs').length,
      rollbackStoreRecordCount: providerStoreRecords.filter((record) => record.targetEntity === 'outbound_link_rollback_plans').length,
      traceStoreRecordCount: providerStoreRecords.filter((record) => record.targetEntity === 'outbound_link_trace_logs').length,
      failureCount: failures.length
    },
    failures,
    boundaries: stagingExecutionBoundaries()
  };
  await writeJson(path.join(outputRoot, 'trace-audit-rollback-persistence.json'), result);
  return result;
}

function failure(code, message, pathValue) {
  return { code, message, path: pathValue };
}

