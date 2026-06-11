import path from 'node:path';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { resolveTmpOutputPath, toPackageRelative } from '../utils/safe-paths.mjs';
import {
  copyTraceFields,
  readStagingExecutionRecords,
  readStagingProviderStore,
  stagingExecutionBoundaries,
  stagingExecutionSchemaVersion
} from './staging-execution-store.mjs';

export async function verifyStagingReadback({ executionPath, outputPath = null }) {
  const executionRoot = resolveTmpOutputPath(executionPath);
  const destinationRoot = outputPath ? resolveTmpOutputPath(outputPath) : executionRoot;
  const manifest = await readJson(path.join(executionRoot, 'staging-execution-manifest.json'));
  const executionRecords = await readStagingExecutionRecords(executionRoot);
  const providerStore = await readStagingProviderStore(executionRoot);
  const failures = [];
  const readbackRecords = executionRecords.map((executionRecord) => {
    const storedRecord = providerStore.byExecutionRecordId.get(executionRecord.stagingExecutionRecordId);
    if (!storedRecord) {
      failures.push(failure('READBACK_PROVIDER_RECORD_MISSING', 'provider store record is missing for execution record', executionRecord.stagingExecutionRecordId));
    }
    return {
      schemaVersion: stagingExecutionSchemaVersion,
      recordType: 'pumpkin-outbound-link-staging-readback-record',
      id: executionRecord.readbackRecordId,
      ...copyTraceFields(executionRecord),
      providerStoredRecordId: storedRecord?.providerStoredRecordId ?? null,
      providerStoredRecordHash: storedRecord?.providerStoredRecordHash ?? null,
      readbackStatus: storedRecord ? 'matched' : 'missing',
      outcome: storedRecord ? 'readback_verified' : 'readback_missing',
      blockReason: storedRecord ? null : 'provider store record missing',
      sourceExecutionOutcome: executionRecord.outcome,
      boundaries: stagingExecutionBoundaries()
    };
  });
  const result = {
    schemaVersion: stagingExecutionSchemaVersion,
    resultType: 'pumpkin-outbound-link-staging-readback-result',
    status: failures.length === 0 ? 'passed' : 'failed',
    stagingExecutionRunId: manifest.stagingExecutionRunId,
    readbackRunId: manifest.readbackRunId,
    applyPlanId: manifest.applyPlanId,
    providerProfileId: manifest.providerProfileId,
    providerMode: manifest.providerMode,
    tenantKey: manifest.tenantKey,
    siteKey: manifest.siteKey,
    records: readbackRecords,
    summary: {
      executionRecordCount: executionRecords.length,
      readbackRecordCount: readbackRecords.length,
      providerStoreRecordCount: providerStore.records.length,
      failureCount: failures.length
    },
    failures,
    sourceExecutionPath: toPackageRelative(executionRoot),
    boundaries: stagingExecutionBoundaries()
  };
  await writeJson(path.join(destinationRoot, 'readback-result.json'), result);
  return {
    destinationRoot,
    result,
    readbackRecords
  };
}

function failure(code, message, pathValue) {
  return { code, message, path: pathValue };
}

