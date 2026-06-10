import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { runLiveCosmosReadonlyExport } from '../src/connectors/cosmos/live-cosmos-export-runner.mjs';
import { runLiveMediaBlobCopyProof } from '../src/connectors/media/live-media-copy-runner.mjs';
import { createIceBackupFromLiveCosmosExport } from '../src/ice/ice-live-cosmos-backup-runner.mjs';
import { createRestorePlan } from '../src/restore/restore-plan-runner.mjs';
import { readJson } from '../src/utils/json-writer.mjs';
import { packageRoot } from '../src/utils/safe-paths.mjs';

const fixedDate = new Date('2026-01-01T00:00:00.000Z');
const testBundleNames = [
  'test-live-media-copy',
  'test-live-media-export',
  'test-live-media-complete-backup',
  'test-live-media-restore-plan'
];

after(async () => {
  await Promise.all(testBundleNames.map((name) => clean(name)));
  await fs.rm(path.join(packageRoot, '.tmp', 'test-live-media-complete-backup-expected-counts.json'), { force: true });
});

test('live media copy proof writes copied blobs, checksums, and validates with fake read-only client', async () => {
  await clean('test-live-media-copy');
  const client = new FakeBlobClient(fakeBlobs());

  const result = await runLiveMediaBlobCopyProof({
    outputPath: '.tmp/test-live-media-copy',
    overwrite: true,
    client,
    now: fixedDate,
    expectedCount: 2,
    expectedBytes: 8
  });

  assert.equal(result.status, 'copied-and-validated');
  assert.equal(result.copy.copiedBlobCount, 2);
  assert.equal(result.copy.totalCopiedBytes, 8);
  assert.equal(client.writeAttempted, false);
  const blobMap = await readJson(path.join(result.outputRoot, 'media', 'blob-map', 'blob-map.json'));
  assert.equal(blobMap.mode, 'live-readonly-full-copy');
  assert.equal(blobMap.fakeOnly, false);
  assert.equal(blobMap.azureMutationPerformed, false);
  assert.equal(blobMap.copiedBlobCount, 2);
  assert.deepEqual(
    blobMap.assets.map((asset) => asset.bundlePath),
    [
      'media/blobs/ice-rink-rentals/165568731de853fb5299a2581b72b4b06b3338e7500119c3a2854641655d6620.png',
      'media/blobs/ice-rink-rentals/c6444a73ea4d2cac11d218ef68c1b915395862b08bd2bd0f1fb3098a81d66080.png'
    ]
  );
  assert.equal(blobMap.assets[0].blobName, 'ice-rink-rentals/assets/a/a.png');
});

test('complete Ice backup candidate validates in production restore proof mode with live Cosmos and media proofs', async () => {
  await clean('test-live-media-copy');
  await clean('test-live-media-export');
  await clean('test-live-media-complete-backup');
  await clean('test-live-media-restore-plan');
  const media = await runLiveMediaBlobCopyProof({
    outputPath: '.tmp/test-live-media-copy',
    overwrite: true,
    client: new FakeBlobClient(fakeBlobs()),
    now: fixedDate,
    expectedCount: 2,
    expectedBytes: 8
  });
  const cosmos = await runLiveCosmosReadonlyExport({
    outputPath: '.tmp/test-live-media-export',
    overwrite: true,
    client: new FakeCosmosClient(fakeCosmosRecords()),
    now: fixedDate,
    expectedTotalDocuments: 6
  });

  const backup = await createIceBackupFromLiveCosmosExport({
    exportPath: cosmos.outputRoot,
    mediaProofPath: media.outputRoot,
    outputPath: '.tmp/test-live-media-complete-backup',
    overwrite: true,
    now: fixedDate,
    expectedTotalDocuments: 6,
    expectedMediaBlobCount: 2,
    expectedMediaBytes: 8
  });
  assert.equal(backup.validation.status, 'passed');
  assert.equal(backup.validation.mode, 'production-restore-proof');
  assert.equal(backup.componentStatus.database.status, 'complete');
  assert.equal(backup.componentStatus.media.status, 'complete');
  assert.equal(backup.componentStatus.media.copiedBlobCount, 2);
  assert.equal(backup.componentStatus.tenantWebsiteBundle.status, 'complete');

  const restore = await createRestorePlan({
    bundlePath: backup.bundleRoot,
    outputPath: '.tmp/test-live-media-restore-plan',
    expectedCountsPath: backup.expectedCountsPath,
    mode: 'production-restore-proof',
    overwrite: true,
    now: fixedDate
  });
  assert.equal(restore.plan.status, 'passed');
  assert.equal(restore.plan.inventoryCounts.mediaCopiedBlobs, 2);
  assert(
    restore.plan.plannedSteps.some((step) => step.stepId === 'plan-media-blob-restore' && step.status === 'complete')
  );
});

async function clean(name) {
  await fs.rm(path.join(packageRoot, '.tmp', name), { recursive: true, force: true });
}

function fakeBlobs() {
  return [
    {
      name: 'ice-rink-rentals/assets/a/a.png',
      contentType: 'image/png',
      contentLength: 3,
      lastModified: '2026-01-01T00:00:00Z',
      etag: 'etag-a',
      body: Buffer.from('one')
    },
    {
      name: 'ice-rink-rentals/assets/b/b.png',
      contentType: 'image/png',
      contentLength: 5,
      lastModified: '2026-01-01T00:00:01Z',
      etag: 'etag-b',
      body: Buffer.from('three')
    }
  ];
}

function fakeCosmosRecords() {
  return {
    tenants: [{ id: 'tenant-ice', documentType: 'tenant', tenantKey: 'ice-rink-rentals', name: 'Ice' }],
    sites: [{ id: 'site-ice', documentType: 'site', tenantKey: 'ice-rink-rentals', siteKey: 'ice-rink-rentals', name: 'Ice site' }],
    pages: [{ id: 'page-home', documentType: 'page', tenantKey: 'ice-rink-rentals', siteKey: 'ice-rink-rentals', pageSlug: 'home' }],
    routes: [{ id: 'route-home', documentType: 'route', tenantKey: 'ice-rink-rentals', siteKey: 'ice-rink-rentals', route: '/' }],
    forms: [],
    mediaAssets: [{ id: 'media-hero', documentType: 'mediaAsset', tenantKey: 'ice-rink-rentals', siteKey: 'ice-rink-rentals', fileName: 'hero.jpg' }],
    themes: [{ id: 'theme-active', documentType: 'theme', tenantKey: 'ice-rink-rentals', siteKey: 'ice-rink-rentals' }],
    publishRuns: [],
    importRuns: [],
    users: []
  };
}

class FakeBlobClient {
  constructor(blobs) {
    this.blobs = blobs;
    this.writeAttempted = false;
  }

  async verifyAccess() {
    return { status: 'available', authMode: 'fake-rbac', tokenPrinted: false, tokenPersisted: false };
  }

  async listBlobs({ prefix }) {
    return this.blobs
      .filter((blob) => blob.name.startsWith(prefix))
      .map(({ body: _body, ...metadata }) => ({ ...metadata }));
  }

  async downloadBlobToFile({ blobName, filePath }) {
    const blob = this.blobs.find((item) => item.name === blobName);
    if (!blob) throw new Error(`missing fake blob ${blobName}`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, blob.body);
    return { byteSize: blob.body.length };
  }
}

class FakeCosmosClient {
  constructor(recordsByContainer) {
    this.recordsByContainer = recordsByContainer;
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

  records(containerName) {
    return this.recordsByContainer[containerName] ?? [];
  }
}
