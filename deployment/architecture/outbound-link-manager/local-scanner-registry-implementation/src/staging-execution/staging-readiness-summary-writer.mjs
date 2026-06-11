import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';
import { stagingExecutionBoundaries, stagingExecutionSchemaVersion } from './staging-execution-store.mjs';

export async function writeStagingReadinessSummary({ outputRoot, manifest, checks }) {
  const entries = Object.entries(checks).map(([name, value]) => ({
    name,
    status: value?.status ?? value,
    ready: (value?.status ?? value) === 'passed'
  }));
  const failed = entries.filter((entry) => !entry.ready);
  const summary = {
    schemaVersion: stagingExecutionSchemaVersion,
    summaryType: 'pumpkin-outbound-link-staging-readiness-summary',
    status: failed.length === 0 ? 'passed' : 'failed',
    stagingExecutionRunId: manifest.stagingExecutionRunId,
    readbackRunId: manifest.readbackRunId,
    applyPlanId: manifest.applyPlanId,
    providerProfileId: manifest.providerProfileId,
    providerMode: manifest.providerMode,
    tenantKey: manifest.tenantKey,
    siteKey: manifest.siteKey,
    readiness: {
      localStagingSimulatedExecution: failed.length === 0,
      liveReadonlyReady: false,
      liveWriteReady: false,
      productionMigrationReady: false,
      nextGate: 'Phase 2H-21 scoped staging persistence execution preflight'
    },
    checks: entries,
    summary: {
      checkCount: entries.length,
      failureCount: failed.length
    },
    boundaries: stagingExecutionBoundaries()
  };
  await writeJson(path.join(outputRoot, 'staging-readiness-summary.json'), summary);
  return summary;
}

