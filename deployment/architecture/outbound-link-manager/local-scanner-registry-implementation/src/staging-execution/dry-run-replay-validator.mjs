import path from 'node:path';
import { stateHash } from '../migration/deterministic-id-mapper.mjs';
import { writeJson } from '../utils/json-writer.mjs';
import { stagingExecutionBoundaries, stagingExecutionSchemaVersion, stagingTraceFields } from './staging-execution-store.mjs';

export async function validateDryRunReplay({ outputRoot, applyPlanRecords, executionRecords, readbackRecords }) {
  const failures = [];
  const executionByApplyPlanId = new Map(executionRecords.map((record) => [record.applyPlanRecordId, record]));
  const readbackByApplyPlanId = new Map(readbackRecords.map((record) => [record.applyPlanRecordId, record]));
  for (const applyPlanRecord of applyPlanRecords) {
    const executionRecord = executionByApplyPlanId.get(applyPlanRecord.applyPlanRecordId);
    const readbackRecord = readbackByApplyPlanId.get(applyPlanRecord.applyPlanRecordId);
    if (!executionRecord) {
      failures.push(failure('REPLAY_EXECUTION_RECORD_MISSING', 'execution record missing for apply-plan record', applyPlanRecord.applyPlanRecordId));
      continue;
    }
    if (!readbackRecord) {
      failures.push(failure('REPLAY_READBACK_RECORD_MISSING', 'readback record missing for apply-plan record', applyPlanRecord.applyPlanRecordId));
      continue;
    }
    const expectedApplyPlanHash = stateHash(applyPlanRecord);
    if (executionRecord.applyPlanRecordHash !== expectedApplyPlanHash || readbackRecord.applyPlanRecordHash !== expectedApplyPlanHash) {
      failures.push(failure('REPLAY_APPLY_PLAN_HASH_MISMATCH', 'apply-plan hash must carry through execution and readback', applyPlanRecord.applyPlanRecordId));
    }
    for (const field of ['migrationRunId', 'migrationRecordId', 'tenantKey', 'siteKey', 'targetEntity', 'targetRecordId', 'migrationRecordHash']) {
      if (applyPlanRecord[field] !== executionRecord[field] || applyPlanRecord[field] !== readbackRecord[field]) {
        failures.push(failure('REPLAY_TRACE_FIELD_MISMATCH', `${field} must match across apply-plan, execution, and readback`, `${applyPlanRecord.applyPlanRecordId}/${field}`));
      }
    }
    for (const field of stagingTraceFields) {
      if (!Object.prototype.hasOwnProperty.call(executionRecord, field) || !Object.prototype.hasOwnProperty.call(readbackRecord, field)) {
        failures.push(failure('REPLAY_REQUIRED_TRACE_FIELD_MISSING', `${field} is required`, `${applyPlanRecord.applyPlanRecordId}/${field}`));
      }
    }
  }
  const result = {
    schemaVersion: stagingExecutionSchemaVersion,
    validationType: 'pumpkin-outbound-link-dry-run-to-execution-replay-validation',
    status: failures.length === 0 ? 'passed' : 'failed',
    applyPlanId: applyPlanRecords[0]?.applyPlanId ?? null,
    stagingExecutionRunId: executionRecords[0]?.stagingExecutionRunId ?? null,
    readbackRunId: readbackRecords[0]?.readbackRunId ?? null,
    summary: {
      applyPlanRecordCount: applyPlanRecords.length,
      executionRecordCount: executionRecords.length,
      readbackRecordCount: readbackRecords.length,
      failureCount: failures.length
    },
    failures,
    boundaries: stagingExecutionBoundaries()
  };
  await writeJson(path.join(outputRoot, 'dry-run-replay-validation.json'), result);
  return result;
}

function failure(code, message, pathValue) {
  return { code, message, path: pathValue };
}

