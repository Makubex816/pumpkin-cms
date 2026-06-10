import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { runLiveCosmosReadonlyExport } from '../src/connectors/cosmos/live-cosmos-export-runner.mjs';
import { createIceBackupFromLiveCosmosExport } from '../src/ice/ice-live-cosmos-backup-runner.mjs';
import { createRestorePlan } from '../src/restore/restore-plan-runner.mjs';
import { validateBackupBundle } from '../src/validators/backup-validator.mjs';
import { readJson } from '../src/utils/json-writer.mjs';
import { packageRoot } from '../src/utils/safe-paths.mjs';

const fixedDate = new Date('2026-01-01T00:00:00.000Z');
const testBundleNames = [
  'test-live-cosmos-export',
  'test-live-cosmos-export-backup',
  'test-live-cosmos-export-restore-plan'
];

after(async () => {
  await Promise.all(testBundleNames.map((name) => clean(name)));
  await fs.rm(path.join(packageRoot, '.tmp', 'test-live-cosmos-export-backup-expected-counts.json'), { force: true });
});

test('live Cosmos export runner writes tenant-scoped read-only portable JSON with fake data-plane client', async () => {
  await clean('test-live-cosmos-export');
  const client = new FakeReadOnlyCosmosClient(fakeRecords());

  const result = await runLiveCosmosReadonlyExport({
    outputPath: '.tmp/test-live-cosmos-export',
    overwrite: true,
    client,
    now: fixedDate,
    expectedTotalDocuments: 6
  });

  assert.equal(result.status, 'exported-and-validated');
  assert.equal(result.dataPlaneAccess.status, 'available');
  assert.equal(result.totalRecordCount, 6);
  assert.equal(client.writeAttempted, false);
  const manifest = await readJson(path.join(result.outputRoot, 'export-manifest.json'));
  assert.equal(manifest.mode, 'live-readonly-portable-json');
  assert.equal(manifest.fakeOnly, false);
  assert.equal(manifest.liveCosmosExportPerformed, true);
  assert.equal(manifest.cosmosWritesPerformed, false);
  assert.equal(manifest.totalRecordCount, 6);
});

test('Ice backup candidate accepts live Cosmos export as database proof and restore-plan stays dry-run only', async () => {
  await clean('test-live-cosmos-export');
  await clean('test-live-cosmos-export-backup');
  await clean('test-live-cosmos-export-restore-plan');
  const exportResult = await runLiveCosmosReadonlyExport({
    outputPath: '.tmp/test-live-cosmos-export',
    overwrite: true,
    client: new FakeReadOnlyCosmosClient(fakeRecords()),
    now: fixedDate,
    expectedTotalDocuments: 6
  });

  const backup = await createIceBackupFromLiveCosmosExport({
    exportPath: exportResult.outputRoot,
    outputPath: '.tmp/test-live-cosmos-export-backup',
    overwrite: true,
    now: fixedDate,
    expectedTotalDocuments: 6
  });
  assert.equal(backup.validation.status, 'passed');
  assert.equal(backup.validation.mode, 'database-backup-proof');
  assert.equal(backup.componentStatus.database.recordCount, 6);
  assert.equal(backup.componentStatus.media.status, 'partial');

  const validation = await validateBackupBundle({
    bundlePath: backup.bundleRoot,
    mode: 'database-backup-proof'
  });
  assert.equal(validation.status, 'passed');

  const restore = await createRestorePlan({
    bundlePath: backup.bundleRoot,
    outputPath: '.tmp/test-live-cosmos-export-restore-plan',
    expectedCountsPath: backup.expectedCountsPath,
    mode: 'database-backup-proof',
    overwrite: true,
    now: fixedDate
  });
  assert.equal(restore.plan.status, 'passed');
  assert.equal(restore.plan.dryRunOnly, true);
  assert.equal(restore.plan.restoreExecuted, false);
  assert.equal(restore.plan.inventoryCounts.cosmosRecords, 6);
  assert(
    restore.plan.plannedSteps.some((step) => step.stepId === 'plan-cosmos-portable-json-restore' && step.status === 'complete')
  );
  assert(
    restore.plan.plannedSteps.some((step) => step.stepId === 'plan-media-blob-restore' && step.status === 'blocked')
  );
});

async function clean(name) {
  await fs.rm(path.join(packageRoot, '.tmp', name), { recursive: true, force: true });
}

function fakeRecords() {
  return {
    tenants: [
      { id: 'tenant-ice', documentType: 'tenant', tenantKey: 'ice-rink-rentals', name: 'Ice Rink Rentals' }
    ],
    sites: [
      { id: 'site-ice', documentType: 'site', tenantKey: 'ice-rink-rentals', siteKey: 'ice-rink-rentals', name: 'Ice site' }
    ],
    pages: [
      { id: 'page-home', documentType: 'page', tenantKey: 'ice-rink-rentals', siteKey: 'ice-rink-rentals', pageSlug: 'home', title: 'Home' }
    ],
    routes: [
      { id: 'route-home', documentType: 'route', tenantKey: 'ice-rink-rentals', siteKey: 'ice-rink-rentals', route: '/', pageSlug: 'home' }
    ],
    forms: [],
    mediaAssets: [
      { id: 'media-hero', documentType: 'mediaAsset', tenantKey: 'ice-rink-rentals', siteKey: 'ice-rink-rentals', fileName: 'hero.jpg' }
    ],
    themes: [
      { id: 'theme-active', documentType: 'theme', tenantKey: 'ice-rink-rentals', siteKey: 'ice-rink-rentals', name: 'Ice theme' }
    ],
    publishRuns: [],
    importRuns: [],
    users: []
  };
}

class FakeReadOnlyCosmosClient {
  constructor(recordsByContainer) {
    this.recordsByContainer = recordsByContainer;
    this.writeAttempted = false;
  }

  async verifyAccess() {
    return { status: 'available', authMode: 'fake-rbac', tokenPrinted: false, tokenPersisted: false };
  }

  async queryTenantCount({ containerName, tenantKey }) {
    return this.records(containerName).filter((record) => record.tenantKey === tenantKey).length;
  }

  async queryTenantDocuments({ containerName, tenantKey }) {
    return this.records(containerName)
      .filter((record) => record.tenantKey === tenantKey)
      .map((record) => structuredClone(record));
  }

  async createDocument() {
    this.writeAttempted = true;
    throw new Error('fake client is read-only');
  }

  records(containerName) {
    return this.recordsByContainer[containerName] ?? [];
  }
}
