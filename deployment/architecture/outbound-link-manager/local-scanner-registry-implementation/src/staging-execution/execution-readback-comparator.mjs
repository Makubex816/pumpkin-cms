import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';
import { stagingExecutionBoundaries, stagingExecutionSchemaVersion } from './staging-execution-store.mjs';

export async function compareExecutionReadback({ outputRoot, executionRecords, readbackRecords }) {
  const failures = [];
  const readbackByExecutionId = new Map(readbackRecords.map((record) => [record.stagingExecutionRecordId, record]));
  for (const executionRecord of executionRecords) {
    const readbackRecord = readbackByExecutionId.get(executionRecord.stagingExecutionRecordId);
    if (!readbackRecord) {
      failures.push(failure('EXECUTION_READBACK_RECORD_MISSING', 'readback record is missing for execution record', executionRecord.stagingExecutionRecordId));
      continue;
    }
    for (const field of ['tenantKey', 'siteKey', 'targetEntity', 'targetRecordId', 'applyPlanRecordHash', 'stagingExecutionRecordHash', 'readbackRecordHash']) {
      if (executionRecord[field] !== readbackRecord[field]) {
        failures.push(failure('EXECUTION_READBACK_FIELD_MISMATCH', `${field} does not match`, `${executionRecord.stagingExecutionRecordId}/${field}`));
      }
    }
  }
  if (executionRecords.length !== readbackRecords.length) {
    failures.push(failure('EXECUTION_READBACK_COUNT_MISMATCH', 'execution and readback counts must match', 'records'));
  }
  const result = {
    schemaVersion: stagingExecutionSchemaVersion,
    validationType: 'pumpkin-outbound-link-execution-readback-comparison',
    status: failures.length === 0 ? 'passed' : 'failed',
    stagingExecutionRunId: executionRecords[0]?.stagingExecutionRunId ?? null,
    readbackRunId: executionRecords[0]?.readbackRunId ?? null,
    summary: {
      executionRecordCount: executionRecords.length,
      readbackRecordCount: readbackRecords.length,
      failureCount: failures.length
    },
    failures,
    boundaries: stagingExecutionBoundaries()
  };
  await writeJson(path.join(outputRoot, 'execution-readback-comparison.json'), result);
  return result;
}

function failure(code, message, pathValue) {
  return { code, message, path: pathValue };
}

