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
import { validateProviderProfile } from '../src/providers/provider-profile-validator.mjs';
import { checkProviderCapabilities } from '../src/providers/provider-capability-checker.mjs';
import { runApplyPlanDryRun } from '../src/apply-plan/apply-plan-dry-runner.mjs';
import { validateApplyPlan } from '../src/apply-plan/apply-plan-validator.mjs';
import { readJson } from '../src/utils/json-writer.mjs';
import { packageRoot, tmpRoot } from '../src/utils/safe-paths.mjs';

const fixedNow = new Date('2026-06-10T00:00:00.000Z');
const testRoot = path.join(tmpRoot, 'test-staging-provider-scaffold');
const migrationProfilePath = 'fixtures/migration-production-provider-profile.fixture.json';
const stagingProfilePath = 'fixtures/provider-profile-staging-simulated.fixture.json';

test.before(async () => {
  await fs.rm(testRoot, { recursive: true, force: true });
});

test('provider profile validation passes for staging-simulated', async () => {
  const profile = await readJson(path.join(packageRoot, stagingProfilePath));
  const validation = validateProviderProfile(profile);
  assert.equal(validation.status, 'passed');
  assert.equal(validation.profile.providerMode, 'staging-simulated');
  assert.equal(validation.profile.capabilities.canPerformLiveWrites, false);
});

test('provider profile validation rejects unknown mode', () => {
  const validation = validateProviderProfile({
    schemaVersion: '0.1.0',
    providerProfileId: 'unknown-mode',
    providerMode: 'mystery-provider',
    targetProvider: {
      partitionKey: '/tenantKey',
      credentialValueIncluded: false
    }
  });
  assert.equal(validation.status, 'failed');
  assert.equal(validation.failures.some((failure) => failure.code === 'PROVIDER_MODE_UNKNOWN'), true);
});

test('provider capability checker reports no live write for staging-simulated', async () => {
  const report = await checkProviderCapabilities({
    profilePath: stagingProfilePath,
    outputPath: '.tmp/test-staging-provider-scaffold/provider-check'
  });
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.canPlanWrites, true);
  assert.equal(report.summary.canPerformLiveWrites, false);
  await fs.access(path.join(testRoot, 'provider-check/provider-capabilities.json'));
});

test('provider capability checker blocks live-readonly writes', async () => {
  const report = await checkProviderCapabilities({
    profilePath: 'fixtures/provider-profile-live-readonly.fixture.json',
    operation: 'apply-plan-dry-run'
  });
  assert.equal(report.status, 'blocked');
  assert.equal(report.gate.code, 'LIVE_READONLY_WRITE_PLAN_BLOCKED');
});

test('apply-plan dry-run generates records from migration dry-run and validates integrations', async () => {
  const migrationPath = await buildMigration('apply-plan');
  const outputPath = '.tmp/test-staging-provider-scaffold/apply-plan';
  const result = await runApplyPlanDryRun({
    migrationPath,
    profilePath: stagingProfilePath,
    outputPath,
    overwrite: true
  });
  assert.equal(result.validation.status, 'passed');
  assert.equal(result.summary.providerMode, 'staging-simulated');
  assert.equal(result.summary.recordCount, 48);
  assert.equal(result.traceContinuity.status, 'passed');
  assert.equal(result.backupCheck.status, 'passed');
  assert.equal(result.rollbackIntegration.status, 'passed');

  for (const file of [
    'apply-plan-manifest.json',
    'apply-plan-records.json',
    'provider-profile.json',
    'provider-capabilities.json',
    'trace-continuity-result.json',
    'resource-registry-update-candidate.json',
    'backup-center-pre-migration-check.json',
    'rollback-integration-result.json',
    'VALIDATION_RESULT.json',
    'VALIDATION_RESULT.md'
  ]) {
    await fs.access(path.join(result.outputRoot, file));
  }
});

test('apply-plan validator accepts generated plan', async () => {
  const migrationPath = await buildMigration('validate-apply-plan');
  const outputPath = '.tmp/test-staging-provider-scaffold/validate-apply-plan';
  await runApplyPlanDryRun({ migrationPath, profilePath: stagingProfilePath, outputPath, overwrite: true });
  const validation = await validateApplyPlan({ applyPlanPath: outputPath });
  assert.equal(validation.status, 'passed');
  assert.equal(validation.summary.failureCount, 0);
});

test('live-readonly and live-write-approved apply-plan modes remain blocked', async () => {
  const migrationPath = await buildMigration('blocked-profiles');
  const readonly = await runApplyPlanDryRun({
    migrationPath,
    profilePath: 'fixtures/provider-profile-live-readonly.fixture.json',
    outputPath: '.tmp/test-staging-provider-scaffold/live-readonly-blocked',
    overwrite: true
  });
  assert.equal(readonly.validation.status, 'blocked');
  assert.equal(readonly.validation.failures[0].code, 'LIVE_READONLY_WRITE_PLAN_BLOCKED');

  const liveWrite = await runApplyPlanDryRun({
    migrationPath,
    profilePath: 'fixtures/provider-profile-live-write-blocked.fixture.json',
    outputPath: '.tmp/test-staging-provider-scaffold/live-write-blocked',
    overwrite: true
  });
  assert.equal(liveWrite.validation.status, 'blocked');
  assert.equal(liveWrite.validation.failures[0].code, 'LIVE_WRITE_APPROVED_UNAVAILABLE');
});

test('offline profiles remain valid', async () => {
  for (const profilePath of [
    'fixtures/provider-profile-local.fixture.json',
    'fixtures/provider-profile-staging-simulated.fixture.json'
  ]) {
    const profile = await readJson(path.join(packageRoot, profilePath));
    const validation = validateProviderProfile(profile);
    assert.equal(validation.status, 'passed', profilePath);
    assert.equal(validation.profile.boundaries.protectedConfigReads, false);
  }
});

test('provider and apply-plan CLI commands work locally without live calls', async () => {
  const migrationPath = await buildMigration('cli');
  const providerCheck = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'provider-check',
    '--profile',
    stagingProfilePath,
    '--out',
    '.tmp/test-staging-provider-scaffold/cli-provider-check'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(providerCheck.status, 0, providerCheck.stderr);
  assert.match(providerCheck.stdout, /provider: passed/);

  const applyPlan = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'apply-plan-dry-run',
    '--migration',
    migrationPath,
    '--profile',
    stagingProfilePath,
    '--out',
    '.tmp/test-staging-provider-scaffold/cli-apply-plan',
    '--overwrite'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(applyPlan.status, 0, applyPlan.stderr);
  assert.match(applyPlan.stdout, /applyPlan: passed/);

  const validate = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'validate-apply-plan',
    '--apply-plan',
    '.tmp/test-staging-provider-scaffold/cli-apply-plan'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(validate.status, 0, validate.stderr);
  assert.match(validate.stdout, /validation: passed/);

  const blocked = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'apply-plan-dry-run',
    '--migration',
    migrationPath,
    '--profile',
    'fixtures/provider-profile-live-readonly.fixture.json',
    '--out',
    '.tmp/test-staging-provider-scaffold/cli-live-readonly-blocked',
    '--overwrite'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(blocked.status, 1);
  assert.match(blocked.stdout, /applyPlan: blocked/);
});

test('provider scaffold source does not include external calls or protected config reads', async () => {
  const roots = ['src/providers', 'src/apply-plan'];
  const files = (await Promise.all(roots.map(async (root) => {
    const dir = path.join(packageRoot, root);
    return (await fs.readdir(dir)).map((file) => path.join(dir, file));
  }))).flat();
  const source = (await Promise.all(
    files.filter((file) => file.endsWith('.mjs')).map((file) => fs.readFile(file, 'utf8'))
  )).join('\n');
  assert.equal(/fetch\(|node:http|node:https|axios|HttpClient|CosmosClient|BlobServiceClient/i.test(source), false);
  assert.equal(/process\.env|appsettings|local\.settings|connectionString|ConnectionString|listKeys/i.test(source), false);
});

async function buildMigration(name) {
  const scanPath = `.tmp/test-staging-provider-scaffold/${name}-scan`;
  await runScan({
    fixturePath: 'fixtures/tenant-bundle.fixture.json',
    outputPath: scanPath,
    overwrite: true,
    now: fixedNow
  });
  const emptyPath = `.tmp/test-staging-provider-scaffold/${name}-store`;
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
  const mergedPath = `.tmp/test-staging-provider-scaffold/${name}-merged`;
  await mergeScanIntoStore({
    storePath: emptyPath,
    scanPath,
    outputPath: mergedPath,
    overwrite: true,
    now: fixedNow
  });
  const policyPath = `.tmp/test-staging-provider-scaffold/${name}-policy`;
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
  const renderPath = `.tmp/test-staging-provider-scaffold/${name}-render`;
  await runRenderFixture({
    fixturePath: 'fixtures/render-active-links.fixture.json',
    storePath: policyPath,
    outputPath: renderPath,
    overwrite: true,
    now: fixedNow
  });
  const migrationPath = `.tmp/test-staging-provider-scaffold/${name}-migration`;
  await runMigrationDryRun({
    storePath: policyPath,
    renderedPath: renderPath,
    profilePath: migrationProfilePath,
    outputPath: migrationPath,
    overwrite: true
  });
  return migrationPath;
}
