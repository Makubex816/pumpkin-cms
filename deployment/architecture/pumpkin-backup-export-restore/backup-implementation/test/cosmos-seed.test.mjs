import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createIceCosmosSeedDryRun } from '../src/cosmos-seed/ice-seed-dry-runner.mjs';
import { validateSeedDryRunPackage } from '../src/cosmos-seed/tenant-partition-validator.mjs';
import { createStandardBackup } from '../src/standard-backup-runner.mjs';
import { readJson, writeJson } from '../src/utils/json-writer.mjs';
import { packageRoot } from '../src/utils/safe-paths.mjs';

const fixedDate = new Date('2026-01-01T00:00:00.000Z');
const iceConnectorAnswers = 'fixtures/ice-cosmos-media-standard-backup.answers.json';
const testBundleNames = [
  'test-cosmos-seed-source',
  'test-cosmos-seed-output',
  'test-cosmos-seed-bad-tenant',
  'test-cosmos-seed-forbidden-field'
];

after(async () => {
  await Promise.all(testBundleNames.map((name) => clean(name)));
});

test('Ice Cosmos seed dry-run maps backup baseline to approved containers and validates partitioning', async () => {
  const source = await createSourceBundle('test-cosmos-seed-source');
  await clean('test-cosmos-seed-output');
  const result = await createIceCosmosSeedDryRun({
    sourcePath: source.bundleRoot,
    outputPath: '.tmp/test-cosmos-seed-output',
    overwrite: true,
    now: fixedDate
  });

  assert.equal(result.validation.status, 'passed');
  assert.equal(result.manifest.dryRunOnly, true);
  assert.equal(result.manifest.liveCosmosWritesPerformed, false);
  assert.equal(result.manifest.boundaries.sessionJwtDurableEscrowIncluded, false);
  assert.equal(result.manifest.scope.tenantKey, 'ice-rink-rentals');
  assert.equal(result.manifest.target.partitionKeyPath, '/tenantKey');
  assert.equal(result.manifest.documentCounts.tenants, 1);
  assert.equal(result.manifest.documentCounts.sites, 1);
  assert.equal(result.manifest.documentCounts.pages, 3);
  assert.equal(result.manifest.documentCounts.routes, 3);
  assert.equal(result.manifest.documentCounts.forms, 1);
  assert.equal(result.manifest.documentCounts.mediaAssets, 2);
  assert.equal(result.manifest.documentCounts.themes, 1);
  assert.equal(result.manifest.documentCounts.importRuns, 1);
  assert.equal(result.manifest.totalDocuments, 13);

  const tenants = await readJson(path.join(result.outputRoot, 'seed-documents', 'tenants.json'));
  assert.equal(Object.hasOwn(tenants[0], 'apiKey'), false);
  assert.equal(Object.hasOwn(tenants[0], 'apiKeyHash'), false);
  await fs.access(path.join(result.outputRoot, 'SEED_PLAN.md'));
  await fs.access(path.join(result.outputRoot, 'READBACK_PLAN.md'));
  await fs.access(path.join(result.outputRoot, 'ROLLBACK_PLAN.md'));
  await fs.access(path.join(result.outputRoot, 'VALIDATION_RESULT.json'));
});

test('Ice Cosmos seed dry-run refuses output outside .tmp and overlapping source output', async () => {
  const source = await createSourceBundle('test-cosmos-seed-source');
  await assert.rejects(
    () =>
      createIceCosmosSeedDryRun({
        sourcePath: source.bundleRoot,
        outputPath: '../unsafe-cosmos-seed-output',
        overwrite: true,
        now: fixedDate
      }),
    /output path must stay inside/
  );
  await assert.rejects(
    () =>
      createIceCosmosSeedDryRun({
        sourcePath: source.bundleRoot,
        outputPath: '.tmp/test-cosmos-seed-source/nested',
        overwrite: true,
        now: fixedDate
      }),
    /must not overlap/
  );
});

test('Cosmos seed validator rejects tenant partition mismatch', async () => {
  const source = await createSourceBundle('test-cosmos-seed-source');
  await clean('test-cosmos-seed-bad-tenant');
  const result = await createIceCosmosSeedDryRun({
    sourcePath: source.bundleRoot,
    outputPath: '.tmp/test-cosmos-seed-bad-tenant',
    overwrite: true,
    now: fixedDate
  });
  const pagesPath = path.join(result.outputRoot, 'seed-documents', 'pages.json');
  const pages = await readJson(pagesPath);
  pages[0].tenantKey = 'other-tenant';
  await writeJson(pagesPath, pages);

  const validation = await validateSeedDryRunPackage({ seedPath: result.outputRoot });
  assert.equal(validation.status, 'failed');
  assert(validation.failures.some((failure) => failure.code === 'TENANT_KEY_INVALID'));
});

test('Cosmos seed validator rejects forbidden credential-like fields', async () => {
  const source = await createSourceBundle('test-cosmos-seed-source');
  await clean('test-cosmos-seed-forbidden-field');
  const result = await createIceCosmosSeedDryRun({
    sourcePath: source.bundleRoot,
    outputPath: '.tmp/test-cosmos-seed-forbidden-field',
    overwrite: true,
    now: fixedDate
  });
  const tenantsPath = path.join(result.outputRoot, 'seed-documents', 'tenants.json');
  const tenants = await readJson(tenantsPath);
  tenants[0].apiKey = 'REDACTED';
  await writeJson(tenantsPath, tenants);

  const validation = await validateSeedDryRunPackage({ seedPath: result.outputRoot });
  assert.equal(validation.status, 'failed');
  assert(validation.failures.some((failure) => failure.code === 'FORBIDDEN_FIELD'));
});

async function createSourceBundle(name) {
  await clean(name);
  return createStandardBackup({
    answersPath: iceConnectorAnswers,
    outputPath: `.tmp/${name}`,
    scopeOverride: 'tenant',
    overwrite: true,
    now: fixedDate
  });
}

async function clean(name) {
  await fs.rm(path.join(packageRoot, '.tmp', name), { recursive: true, force: true });
}
