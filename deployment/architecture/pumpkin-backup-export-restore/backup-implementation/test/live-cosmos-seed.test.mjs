import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createIceCosmosSeedDryRun } from '../src/cosmos-seed/ice-seed-dry-runner.mjs';
import { runGuardedLiveCosmosSeed } from '../src/cosmos-seed/guarded-live-seed-runner.mjs';
import { createStandardBackup } from '../src/standard-backup-runner.mjs';
import { readJson } from '../src/utils/json-writer.mjs';
import { packageRoot } from '../src/utils/safe-paths.mjs';

const fixedDate = new Date('2026-01-01T00:00:00.000Z');
const iceConnectorAnswers = 'fixtures/ice-cosmos-media-standard-backup.answers.json';
const testBundleNames = [
  'test-live-cosmos-source',
  'test-live-cosmos-seed',
  'test-live-cosmos-output',
  'test-live-cosmos-blocked-source',
  'test-live-cosmos-blocked-seed',
  'test-live-cosmos-blocked-output'
];

after(async () => {
  await Promise.all(testBundleNames.map((name) => clean(name)));
});

test('guarded live seed runner creates missing approved documents and verifies readback with fake data-plane client', async () => {
  const seed = await createSeedPackage({
    sourceName: 'test-live-cosmos-source',
    seedName: 'test-live-cosmos-seed'
  });
  const client = new FakeCosmosClient();
  await clean('test-live-cosmos-output');

  const result = await runGuardedLiveCosmosSeed({
    seedPath: seed.outputRoot,
    outputPath: '.tmp/test-live-cosmos-output',
    overwrite: true,
    client,
    now: fixedDate
  });

  assert.equal(result.status, 'seeded-and-verified');
  assert.equal(result.dataPlaneAccess.status, 'available');
  assert.equal(result.execution.createdCount, 13);
  assert.equal(result.execution.skippedExistingCount, 0);
  assert.equal(result.readback.status, 'passed');
  assert.equal(result.readback.total, 13);
  assert.equal(result.boundaries.keysListed, false);
  assert.equal(result.boundaries.connectionStringsRead, false);
  assert.equal(result.boundaries.cmsRuntimeSwitchPerformed, false);
  const manifest = await readJson(path.join(result.outputRoot, 'execution-manifest.json'));
  assert.equal(manifest.status, 'seeded-and-verified');
  assert.equal(manifest.boundaries.tokensPrinted, false);
});

test('guarded live seed runner blocks before writing when data-plane access is unavailable', async () => {
  const seed = await createSeedPackage({
    sourceName: 'test-live-cosmos-blocked-source',
    seedName: 'test-live-cosmos-blocked-seed'
  });
  const client = new FakeCosmosClient({ accessBlocked: true });
  await clean('test-live-cosmos-blocked-output');

  const result = await runGuardedLiveCosmosSeed({
    seedPath: seed.outputRoot,
    outputPath: '.tmp/test-live-cosmos-blocked-output',
    overwrite: true,
    client,
    now: fixedDate
  });

  assert.equal(result.status, 'blocked');
  assert.equal(result.dataPlaneAccess.status, 'blocked');
  assert.equal(result.execution.createdCount, 0);
  assert.equal(client.createdCount, 0);
  assert(result.blockers.some((item) => item.code === 'DATA_PLANE_ACCESS_UNAVAILABLE'));
});

async function createSeedPackage({ sourceName, seedName }) {
  await clean(sourceName);
  await clean(seedName);
  const source = await createStandardBackup({
    answersPath: iceConnectorAnswers,
    outputPath: `.tmp/${sourceName}`,
    scopeOverride: 'tenant',
    overwrite: true,
    now: fixedDate
  });
  return createIceCosmosSeedDryRun({
    sourcePath: source.bundleRoot,
    outputPath: `.tmp/${seedName}`,
    overwrite: true,
    now: fixedDate
  });
}

async function clean(name) {
  await fs.rm(path.join(packageRoot, '.tmp', name), { recursive: true, force: true });
}

class FakeCosmosClient {
  constructor({ accessBlocked = false } = {}) {
    this.accessBlocked = accessBlocked;
    this.store = new Map();
    this.createdCount = 0;
  }

  async verifyAccess() {
    if (this.accessBlocked) {
      throw new Error('fake data-plane access blocked');
    }
    return { status: 'available', authMode: 'fake-rbac', tokenPrinted: false, tokenPersisted: false };
  }

  async queryTenantCount({ containerName, tenantKey }) {
    return [...this.container(containerName).values()].filter((document) => document.tenantKey === tenantKey).length;
  }

  async readDocument({ containerName, id }) {
    return this.container(containerName).get(id) ?? null;
  }

  async createDocument({ containerName, document }) {
    this.container(containerName).set(document.id, structuredClone(document));
    this.createdCount += 1;
    return document;
  }

  container(containerName) {
    if (!this.store.has(containerName)) {
      this.store.set(containerName, new Map());
    }
    return this.store.get(containerName);
  }
}
