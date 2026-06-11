import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { runScan } from '../src/scan-runs/scan-run-writer.mjs';
import { createEmptyLocalStore } from '../src/store/local-store-initializer.mjs';
import { writeLocalStore } from '../src/store/local-store-writer.mjs';
import { mergeScanIntoStore } from '../src/store/store-merger.mjs';
import { runRenderFixture } from '../src/rendering/render-output-writer.mjs';
import { runMigrationDryRun } from '../src/migration/migration-dry-runner.mjs';
import { runApplyPlanDryRun } from '../src/apply-plan/apply-plan-dry-runner.mjs';
import { validateProviderProfile } from '../src/providers/provider-profile-validator.mjs';
import { runStagingExecution, runStagingReadback } from '../src/staging-execution/staging-apply-executor.mjs';
import { validateStagingExecution } from '../src/staging-execution/staging-execution-validator.mjs';
import { getOutboundLinkProviderState } from '../src/api/services/outbound-link-provider-state-service.mjs';
import { readJson } from '../src/utils/json-writer.mjs';
import { packageRoot, tmpRoot } from '../src/utils/safe-paths.mjs';

const fixedNow = new Date('2026-06-10T00:00:00.000Z');
const testRoot = path.join(tmpRoot, 'test-staging-persistence-integration');
const migrationProfilePath = 'fixtures/migration-production-provider-profile.fixture.json';
const applyPlanProfilePath = 'fixtures/provider-profile-staging-simulated.fixture.json';
const stagingExecutionProfilePath = 'fixtures/staging-execution-profile.fixture.json';

test.before(async () => {
  await fs.rm(testRoot, { recursive: true, force: true });
});

test('staging execution profile validates with local staging approval only', async () => {
  const profile = await readJson(path.join(packageRoot, stagingExecutionProfilePath));
  const validation = validateProviderProfile(profile);
  assert.equal(validation.status, 'passed');
  assert.equal(validation.profile.providerMode, 'staging-simulated');
  assert.equal(validation.profile.approvals.stagingWriteApproved, true);
  assert.equal(validation.profile.capabilities.canExecuteStagingWrites, true);
  assert.equal(validation.profile.capabilities.canPerformLiveWrites, false);
});

test('staging-simulated execution writes provider store, readback, replay, and readiness evidence', async () => {
  const applyPlanPath = await buildApplyPlan('execution');
  const execution = await runStagingExecution({
    applyPlanPath,
    profilePath: stagingExecutionProfilePath,
    outputPath: '.tmp/test-staging-persistence-integration/execution',
    overwrite: true
  });
  assert.equal(execution.validation.status, 'passed');
  assert.equal(execution.summary.recordCount, 48);
  assert.equal(execution.readback.status, 'passed');
  assert.equal(execution.comparison.status, 'passed');
  assert.equal(execution.replayValidation.status, 'passed');
  assert.equal(execution.traceAuditRollback.status, 'passed');
  assert.equal(execution.providerState.status, 'passed');
  assert.equal(execution.resourceRegistry.status, 'passed');
  assert.equal(execution.backupPreExecution.status, 'passed');
  assert.equal(execution.readiness.status, 'passed');

  for (const file of [
    'staging-execution-manifest.json',
    'staging-execution-records.json',
    'staging-provider-store/staging-provider-store-index.json',
    'provider-state-report.json',
    'readback-result.json',
    'execution-readback-comparison.json',
    'dry-run-replay-validation.json',
    'trace-audit-rollback-persistence.json',
    'resource-registry-refresh-candidate.json',
    'backup-pre-execution-verification.json',
    'staging-readiness-summary.json',
    'checksums.sha256',
    'VALIDATION_RESULT.json',
    'VALIDATION_RESULT.md'
  ]) {
    await fs.access(path.join(execution.outputRoot, file));
  }
});

test('staging execution validator and readback command accept generated evidence', async () => {
  const applyPlanPath = await buildApplyPlan('validate-execution');
  const executionPath = '.tmp/test-staging-persistence-integration/validate-execution';
  await runStagingExecution({
    applyPlanPath,
    profilePath: stagingExecutionProfilePath,
    outputPath: executionPath,
    overwrite: true
  });
  const validation = await validateStagingExecution({ executionPath });
  assert.equal(validation.status, 'passed');
  assert.equal(validation.summary.failureCount, 0);

  const readback = await runStagingReadback({
    executionPath,
    outputPath: '.tmp/test-staging-persistence-integration/readback-command'
  });
  assert.equal(readback.result.status, 'passed');
  assert.equal(readback.summary.readbackRecordCount, 48);
});

test('provider state API boundary returns local staging readiness only', async () => {
  const applyPlanPath = await buildApplyPlan('api-provider-state');
  const execution = await runStagingExecution({
    applyPlanPath,
    profilePath: stagingExecutionProfilePath,
    outputPath: '.tmp/test-staging-persistence-integration/api-provider-state-execution',
    overwrite: true
  });
  const response = await getOutboundLinkProviderState({
    executionPath: '.tmp/test-staging-persistence-integration/api-provider-state-execution',
    query: { tenantKey: 'fixture-tenant', siteKey: 'fixture-site' },
    actor: { actorId: 'local-test', role: 'SuperAdmin' }
  });
  assert.equal(response.ok, true);
  assert.equal(response.data.providerState.stagingExecutionRunId, execution.summary.stagingExecutionRunId);
  assert.equal(response.meta.liveProviderWrites, false);
  assert.equal(response.meta.protectedConfigReads, false);
});

test('live-readonly, live-write-approved, invalid, and local profiles remain blocked for staging execution', async () => {
  const applyPlanPath = await buildApplyPlan('blocked');
  for (const [profilePath, expectedStatus] of [
    ['fixtures/staging-execution-live-readonly-blocked.fixture.json', 'blocked'],
    ['fixtures/staging-execution-live-write-blocked.fixture.json', 'blocked'],
    ['fixtures/staging-execution-invalid-profile.fixture.json', 'blocked'],
    ['fixtures/provider-profile-local.fixture.json', 'blocked']
  ]) {
    const result = await runStagingExecution({
      applyPlanPath,
      profilePath,
      outputPath: `.tmp/test-staging-persistence-integration/blocked-${path.basename(profilePath, '.fixture.json')}`,
      overwrite: true
    });
    assert.equal(result.validation.status, expectedStatus, profilePath);
    assert.equal(result.summary.recordCount, 0, profilePath);
  }
});

test('staging execution CLI commands work locally and blocked modes exit nonzero', async () => {
  const applyPlanPath = await buildApplyPlan('cli');
  const execute = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'staging-execute',
    '--apply-plan',
    applyPlanPath,
    '--profile',
    stagingExecutionProfilePath,
    '--out',
    '.tmp/test-staging-persistence-integration/cli-execution',
    '--overwrite'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(execute.status, 0, execute.stderr);
  assert.match(execute.stdout, /stagingExecution: passed/);

  const readback = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'staging-readback',
    '--execution',
    '.tmp/test-staging-persistence-integration/cli-execution',
    '--out',
    '.tmp/test-staging-persistence-integration/cli-readback'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(readback.status, 0, readback.stderr);
  assert.match(readback.stdout, /readback: passed/);

  const validate = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'validate-staging-execution',
    '--execution',
    '.tmp/test-staging-persistence-integration/cli-execution'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(validate.status, 0, validate.stderr);
  assert.match(validate.stdout, /validation: passed/);

  const apiState = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'api-provider-state',
    '--execution',
    '.tmp/test-staging-persistence-integration/cli-execution',
    '--tenant',
    'fixture-tenant',
    '--site',
    'fixture-site',
    '--out',
    '.tmp/test-staging-persistence-integration/cli-api-provider-state'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(apiState.status, 0, apiState.stderr);
  assert.match(apiState.stdout, /api-provider-state: ok/);

  const blocked = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'staging-execute',
    '--apply-plan',
    applyPlanPath,
    '--profile',
    'fixtures/staging-execution-live-readonly-blocked.fixture.json',
    '--out',
    '.tmp/test-staging-persistence-integration/cli-live-readonly-blocked',
    '--overwrite'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(blocked.status, 1);
  assert.match(blocked.stdout, /stagingExecution: blocked/);
});

test('staging execution source does not include external calls or protected config reads', async () => {
  const roots = [
    'src/staging-execution',
    'src/api/services/outbound-link-provider-state-service.mjs'
  ];
  const files = [];
  for (const root of roots) {
    const fullPath = path.join(packageRoot, root);
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      files.push(...(await fs.readdir(fullPath)).map((file) => path.join(fullPath, file)));
    } else {
      files.push(fullPath);
    }
  }
  const source = (await Promise.all(
    files.filter((file) => file.endsWith('.mjs')).map((file) => fs.readFile(file, 'utf8'))
  )).join('\n');
  assert.equal(/fetch\(|node:http|node:https|axios|HttpClient|CosmosClient|BlobServiceClient/i.test(source), false);
  assert.equal(/process\.env|appsettings|local\.settings|connectionString|ConnectionString|listKeys/i.test(source), false);
});

async function buildApplyPlan(name) {
  const scanPath = `.tmp/test-staging-persistence-integration/${name}-scan`;
  await runScan({
    fixturePath: 'fixtures/tenant-bundle.fixture.json',
    outputPath: scanPath,
    overwrite: true,
    now: fixedNow
  });
  const emptyPath = `.tmp/test-staging-persistence-integration/${name}-store`;
  await writeLocalStore({
    store: createEmptyLocalStore({
      tenantId: 'fixture-tenant',
      siteId: 'fixture-site',
      now: fixedNow
    }),
    outputPath: emptyPath,
    overwrite: true,
    now: fixedNow
  });
  const mergedPath = `.tmp/test-staging-persistence-integration/${name}-merged`;
  await mergeScanIntoStore({
    storePath: emptyPath,
    scanPath,
    outputPath: mergedPath,
    overwrite: true,
    now: fixedNow
  });
  const policyPath = `.tmp/test-staging-persistence-integration/${name}-policy`;
  const policy = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'set-policy',
    '--store',
    mergedPath,
    '--policy',
    'fixtures/policy-blocked-domain.fixture.json',
    '--out',
    policyPath,
    '--overwrite'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(policy.status, 0, policy.stderr);
  const renderPath = `.tmp/test-staging-persistence-integration/${name}-render`;
  await runRenderFixture({
    fixturePath: 'fixtures/render-active-links.fixture.json',
    storePath: policyPath,
    outputPath: renderPath,
    overwrite: true,
    now: fixedNow
  });
  const migrationPath = `.tmp/test-staging-persistence-integration/${name}-migration`;
  await runMigrationDryRun({
    storePath: policyPath,
    renderedPath: renderPath,
    profilePath: migrationProfilePath,
    outputPath: migrationPath,
    overwrite: true
  });
  const applyPlanPath = `.tmp/test-staging-persistence-integration/${name}-apply-plan`;
  await runApplyPlanDryRun({
    migrationPath,
    profilePath: applyPlanProfilePath,
    outputPath: applyPlanPath,
    overwrite: true
  });
  return applyPlanPath;
}

