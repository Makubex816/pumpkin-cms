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
import { runMigrationDryRun, inspectMigrationDryRun } from '../src/migration/migration-dry-runner.mjs';
import { validateMigrationDryRun } from '../src/migration/schema-contract-validator.mjs';
import { readJson, writeJson } from '../src/utils/json-writer.mjs';
import { packageRoot, tmpRoot } from '../src/utils/safe-paths.mjs';

const fixedNow = new Date('2026-06-10T00:00:00.000Z');
const testRoot = path.join(tmpRoot, 'test-migration-dry-run');
const profilePath = 'fixtures/migration-production-provider-profile.fixture.json';

test.before(async () => {
  await fs.rm(testRoot, { recursive: true, force: true });
});

test('migration dry-run generates production records and validates', async () => {
  const { storePath, renderPath } = await buildStoreAndRender('generates');
  const outputPath = '.tmp/test-migration-dry-run/generates-migration';
  const result = await runMigrationDryRun({
    storePath,
    renderedPath: renderPath,
    profilePath,
    outputPath,
    overwrite: true
  });

  assert.equal(result.validation.status, 'passed');
  assert.equal(result.summary.migrationRunId, 'olmr_phase_2h17_fixture');
  assert.equal(result.manifest.summary.countsByEntity.outbound_links, 5);
  assert.equal(result.manifest.summary.countsByEntity.outbound_link_instances, 5);
  assert.equal(result.manifest.summary.countsByEntity.outbound_link_render_decisions, 5);
  assert.equal(result.manifest.summary.countsByEntity.outbound_link_rollback_plans, 1);
  assert.equal(result.manifest.summary.countsByEntity.outbound_link_trace_logs > 0, true);

  for (const file of [
    'production-records/outbound_links.json',
    'production-records/outbound_link_instances.json',
    'production-records/outbound_link_policies.json',
    'production-records/outbound_link_scan_runs.json',
    'production-records/outbound_link_audit_logs.json',
    'production-records/outbound_link_render_decisions.json',
    'production-records/outbound_link_review_decisions.json',
    'production-records/outbound_link_bulk_actions.json',
    'production-records/outbound_link_rollback_plans.json',
    'production-records/outbound_link_trace_logs.json',
    'migration-manifest.json',
    'checksums.sha256',
    'ROLLBACK_PACKAGE.md',
    'RESOURCE_REGISTRY_UPDATE_CANDIDATE.json',
    'BACKUP_BEFORE_MIGRATION_REQUIREMENTS.md',
    'VALIDATION_RESULT.json',
    'VALIDATION_RESULT.md'
  ]) {
    await fs.access(path.join(result.outputRoot, file));
  }
});

test('validate migration dry-run command accepts generated output', async () => {
  const { storePath, renderPath } = await buildStoreAndRender('validates');
  const outputPath = '.tmp/test-migration-dry-run/validates-migration';
  await runMigrationDryRun({ storePath, renderedPath: renderPath, profilePath, outputPath, overwrite: true });
  const validation = await validateMigrationDryRun({ migrationPath: outputPath });
  assert.equal(validation.status, 'passed');
  assert.equal(validation.summary.failureCount, 0);
});

test('deterministic IDs and checksums remain stable across rerun', async () => {
  const { storePath, renderPath } = await buildStoreAndRender('deterministic');
  const firstPath = '.tmp/test-migration-dry-run/deterministic-a';
  const secondPath = '.tmp/test-migration-dry-run/deterministic-b';
  await runMigrationDryRun({ storePath, renderedPath: renderPath, profilePath, outputPath: firstPath, overwrite: true });
  await runMigrationDryRun({ storePath, renderedPath: renderPath, profilePath, outputPath: secondPath, overwrite: true });

  const firstLinks = await readJson(path.join(testRoot, 'deterministic-a/production-records/outbound_links.json'));
  const secondLinks = await readJson(path.join(testRoot, 'deterministic-b/production-records/outbound_links.json'));
  assert.deepEqual(
    firstLinks.records.map((record) => record.targetRecordId),
    secondLinks.records.map((record) => record.targetRecordId)
  );

  const firstChecksums = await fs.readFile(path.join(testRoot, 'deterministic-a/checksums.sha256'), 'utf8');
  const secondChecksums = await fs.readFile(path.join(testRoot, 'deterministic-b/checksums.sha256'), 'utf8');
  assert.equal(firstChecksums, secondChecksums);
});

test('tenant mismatch fixture fails validation', async () => {
  const fixture = await readJson(path.join(packageRoot, 'fixtures/migration-invalid-tenant-mismatch.fixture.json'));
  const { storePath, renderPath } = await buildStoreAndRender('tenant-mismatch');
  const outputPath = '.tmp/test-migration-dry-run/tenant-mismatch-migration';
  const result = await runMigrationDryRun({ storePath, renderedPath: renderPath, profilePath, outputPath, overwrite: true });
  const linksPath = path.join(result.outputRoot, 'production-records/outbound_links.json');
  const envelope = await readJson(linksPath);
  envelope.records[fixture.mutation.targetIndex][fixture.mutation.field] = fixture.mutation.value;
  await writeJson(linksPath, envelope);
  const validation = await validateMigrationDryRun({ migrationPath: outputPath });
  assert.equal(validation.status, fixture.expectedStatus);
  assert.equal(validation.failures.some((failure) => failure.code === fixture.expectedFailure), true);
});

test('secret-like URL fixture fails validation', async () => {
  const fixture = await readJson(path.join(packageRoot, 'fixtures/migration-invalid-secret-like-url.fixture.json'));
  const { storePath, renderPath } = await buildStoreAndRender('secret-like-url');
  const outputPath = '.tmp/test-migration-dry-run/secret-like-url-migration';
  const result = await runMigrationDryRun({ storePath, renderedPath: renderPath, profilePath, outputPath, overwrite: true });
  const linksPath = path.join(result.outputRoot, 'production-records/outbound_links.json');
  const envelope = await readJson(linksPath);
  envelope.records[fixture.mutation.targetIndex][fixture.mutation.field] = fixture.mutation.value;
  await writeJson(linksPath, envelope);
  const validation = await validateMigrationDryRun({ migrationPath: outputPath });
  assert.equal(validation.status, fixture.expectedStatus);
  assert.equal(validation.failures.some((failure) => failure.code === fixture.expectedFailure), true);
});

test('migration CLI commands work locally without live calls', async () => {
  const { storePath, renderPath } = await buildStoreAndRender('cli');
  const outputPath = '.tmp/test-migration-dry-run/cli-migration';
  const dryRun = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'migration-dry-run',
    '--store',
    storePath,
    '--profile',
    profilePath,
    '--rendered',
    renderPath,
    '--out',
    outputPath,
    '--overwrite'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(dryRun.status, 0, dryRun.stderr);
  assert.match(dryRun.stdout, /migration: passed/);

  const validate = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'validate-migration-dry-run',
    '--migration',
    outputPath
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(validate.status, 0, validate.stderr);
  assert.match(validate.stdout, /validation: passed/);

  const inspect = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'inspect-migration-dry-run',
    '--migration',
    outputPath
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(inspect.status, 0, inspect.stderr);
  assert.match(inspect.stdout, /providerMode: local-to-production-dry-run/);
});

test('migration source does not include external calls or protected config reads', async () => {
  const sourceRoot = path.join(packageRoot, 'src/migration');
  const files = await fs.readdir(sourceRoot);
  const source = (await Promise.all(
    files.filter((file) => file.endsWith('.mjs')).map((file) => fs.readFile(path.join(sourceRoot, file), 'utf8'))
  )).join('\n');
  assert.equal(/fetch\(|node:http|node:https|axios|HttpClient|CosmosClient|BlobServiceClient/i.test(source), false);
  assert.equal(/process\.env|appsettings|local\.settings|connectionString|ConnectionString/i.test(source), false);
});

async function buildStoreAndRender(name) {
  const scanPath = `.tmp/test-migration-dry-run/${name}-scan`;
  await runScan({
    fixturePath: 'fixtures/tenant-bundle.fixture.json',
    outputPath: scanPath,
    overwrite: true,
    now: fixedNow
  });
  const emptyPath = `.tmp/test-migration-dry-run/${name}-store`;
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
  const mergedPath = `.tmp/test-migration-dry-run/${name}-merged`;
  await mergeScanIntoStore({
    storePath: emptyPath,
    scanPath,
    outputPath: mergedPath,
    overwrite: true,
    now: fixedNow
  });
  const policyPath = `.tmp/test-migration-dry-run/${name}-policy`;
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
  const renderPath = `.tmp/test-migration-dry-run/${name}-render`;
  await runRenderFixture({
    fixturePath: 'fixtures/render-active-links.fixture.json',
    storePath: policyPath,
    outputPath: renderPath,
    overwrite: true,
    now: fixedNow
  });
  return { storePath: policyPath, renderPath };
}
