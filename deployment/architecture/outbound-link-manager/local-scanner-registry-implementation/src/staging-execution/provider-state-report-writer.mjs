import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';
import { countByEntity, stagingExecutionBoundaries, stagingExecutionSchemaVersion } from './staging-execution-store.mjs';

export async function writeProviderStateReport({ outputRoot, manifest, executionRecords, readbackResult, comparison, replayValidation }) {
  const report = {
    schemaVersion: stagingExecutionSchemaVersion,
    reportType: 'pumpkin-outbound-link-provider-state-report',
    status: [readbackResult.status, comparison.status, replayValidation.status].every((status) => status === 'passed') ? 'passed' : 'failed',
    providerProfileId: manifest.providerProfileId,
    providerMode: manifest.providerMode,
    stagingExecutionRunId: manifest.stagingExecutionRunId,
    readbackRunId: manifest.readbackRunId,
    applyPlanId: manifest.applyPlanId,
    tenantKey: manifest.tenantKey,
    siteKey: manifest.siteKey,
    state: {
      providerStore: 'staging-simulated-file-backed',
      readiness: 'local-staging-simulated-ready',
      liveReadonlyAvailable: false,
      liveWriteAvailable: false,
      productionRuntimeAvailable: false
    },
    summary: {
      totalRecords: executionRecords.length,
      countsByEntity: countByEntity(executionRecords),
      readbackStatus: readbackResult.status,
      comparisonStatus: comparison.status,
      replayStatus: replayValidation.status
    },
    boundaries: stagingExecutionBoundaries()
  };
  await writeJson(path.join(outputRoot, 'provider-state-report.json'), report);
  return report;
}

