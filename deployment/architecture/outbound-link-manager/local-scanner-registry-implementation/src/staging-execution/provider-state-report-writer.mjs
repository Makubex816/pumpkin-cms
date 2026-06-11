import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';
import { countByEntity, stagingExecutionBoundaries, stagingExecutionSchemaVersion } from './staging-execution-store.mjs';

export async function writeProviderStateReport({ outputRoot, manifest, executionRecords, readbackResult, comparison, replayValidation }) {
  const gateCriteria = [
    gateCriterion('migration-refresh-validation', 'passed', 'source migration dry-run must validate before apply-plan generation'),
    gateCriterion('apply-plan-validation', 'passed', 'apply-plan must validate before staging-simulated execution'),
    gateCriterion('staging-execution-validation', manifest.summary?.totalExecutionRecords === executionRecords.length ? 'passed' : 'failed', 'staging execution manifest count must match execution records'),
    gateCriterion('readback-verification', readbackResult.status, 'staging provider store readback must pass'),
    gateCriterion('execution-readback-comparison', comparison.status, 'execution and readback records must match'),
    gateCriterion('dry-run-replay-validation', replayValidation.status, 'migration/apply/execution/readback trace replay must pass'),
    gateCriterion('live-readonly-execution-gate', 'blocked', 'live-readonly must remain blocked for write execution'),
    gateCriterion('live-write-approved-execution-gate', 'blocked', 'live-write-approved must remain blocked until a future explicit approval')
  ];
  const readinessStatus = gateCriteria.every((criterion) => ['passed', 'blocked'].includes(criterion.status)) ? 'passed' : 'failed';
  const report = {
    schemaVersion: stagingExecutionSchemaVersion,
    reportType: 'pumpkin-outbound-link-provider-state-report',
    status: [readbackResult.status, comparison.status, replayValidation.status, readinessStatus].every((status) => status === 'passed') ? 'passed' : 'failed',
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
    readinessClassification: {
      stagingSimulatedReady: true,
      liveReadonlyReady: false,
      liveWriteReady: false,
      productionDatabaseMigrationReady: false,
      runtimeBrowserQaRequiredBeforeLiveWrite: true,
      nextGate: 'Phase 2H-21 runtime QA/provider readiness/staging execution gate'
    },
    gateCriteria,
    requiredFutureEvidence: [
      'approved browser/runtime QA evidence',
      'live-readonly provider verification evidence',
      'real staging provider conflict/readback plan',
      'Backup Center pre-execution proof',
      'Resource Registry refresh approval',
      'operator signoff and rollback/readback plan'
    ],
    summary: {
      totalRecords: executionRecords.length,
      countsByEntity: countByEntity(executionRecords),
      readbackStatus: readbackResult.status,
      comparisonStatus: comparison.status,
      replayStatus: replayValidation.status,
      gateCriteriaStatus: readinessStatus
    },
    boundaries: stagingExecutionBoundaries()
  };
  await writeJson(path.join(outputRoot, 'provider-state-report.json'), report);
  return report;
}

function gateCriterion(id, status, description) {
  return { id, status, description };
}
