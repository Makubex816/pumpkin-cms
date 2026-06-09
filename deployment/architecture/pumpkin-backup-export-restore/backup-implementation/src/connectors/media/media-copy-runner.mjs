import fs from 'node:fs/promises';
import path from 'node:path';
import { sha256File } from '../../utils/file-hash.mjs';
import { writeJson } from '../../utils/json-writer.mjs';
import {
  loadFakeMediaCopyFixtures,
  readFakeMediaSourceText,
  resolveSafeBlobDestination,
  selectFakeMediaAssets
} from './fake-media-copy-adapter.mjs';
import { buildMediaCopyManifest } from './media-copy-manifest.mjs';
import { writeMediaBlobChecksums } from './media-checksum-writer.mjs';

export async function writeFakeMediaCopy({ bundleRoot, request, createdAt }) {
  const fixtures = await loadFakeMediaCopyFixtures();
  const { assets, planItems } = selectFakeMediaAssets({
    inventory: fixtures.inventory,
    copyPlan: fixtures.copyPlan,
    scope: request.scope
  });

  const mapDir = path.join(bundleRoot, 'media', 'blob-map');
  await fs.mkdir(mapDir, { recursive: true });

  await writeJson(path.join(mapDir, 'blob-inventory.json'), {
    schemaVersion: '0.2.0',
    connectorContractVersion: '0.1.0',
    provider: 'azure-blob',
    mode: 'fake-inventory',
    generatedAt: createdAt,
    fakeOnly: true,
    liveBlobListingPerformed: false,
    source: fixtures.inventory.source,
    assets
  });
  await writeJson(path.join(mapDir, 'blob-copy-plan.json'), {
    schemaVersion: '0.2.0',
    connectorContractVersion: '0.1.0',
    provider: 'azure-blob',
    mode: 'fake-copy-plan',
    generatedAt: createdAt,
    fakeOnly: true,
    liveBlobDownloadPerformed: false,
    copyItems: planItems
  });

  const copiedItems = [];
  for (const item of planItems) {
    const text = await readFakeMediaSourceText(item.sourceFixturePath);
    const destination = resolveSafeBlobDestination({ bundleRoot, blobName: item.blobName });
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, text, 'utf8');
    const relativePath = `media/blobs/${item.blobName}`;
    copiedItems.push({
      mediaAssetId: item.mediaAssetId,
      blobName: item.blobName,
      bundlePath: relativePath,
      sha256: await sha256File(destination),
      byteSize: Buffer.byteLength(text, 'utf8')
    });
  }

  const blobMap = buildMediaCopyManifest({
    scope: request.scope,
    inventory: fixtures.inventory,
    assets,
    planItems,
    copiedItems,
    createdAt
  });
  await writeJson(path.join(mapDir, 'blob-map.json'), blobMap);
  const checksumPath = await writeMediaBlobChecksums({
    bundleRoot,
    blobRelativePaths: copiedItems.map((item) => item.bundlePath)
  });
  await fs.writeFile(
    path.join(bundleRoot, 'media', 'MEDIA_BLOBS_INCLUDED_FAKE.md'),
    [
      '# Fake Media Blobs Included',
      '',
      'This local connector foundation copied fake text fixtures only.',
      '',
      '- No live Azure Blob listing was run.',
      '- No live blob download was run.',
      '- No storage keys, connection strings, or SAS URLs were used.',
      '- No media was uploaded or restored.',
      '',
      `Copied fake blobs: ${copiedItems.length}`,
      ''
    ].join('\n'),
    'utf8'
  );

  return {
    entries: [
      entry('media/blob-map/blob-inventory.json', 'media-blob-map'),
      entry('media/blob-map/blob-copy-plan.json', 'media-blob-map'),
      entry('media/blob-map/blob-map.json', 'media-blob-map'),
      entry(checksumPath, 'media-blob-map'),
      entry('media/MEDIA_BLOBS_INCLUDED_FAKE.md', 'media-blob-copy'),
      ...copiedItems.map((item) => entry(item.bundlePath, 'media-blob-copy'))
    ],
    component: {
      provider: 'azure-blob',
      mode: 'full-copy',
      status: 'complete',
      fakeOnly: true,
      liveBlobListingPerformed: false,
      liveBlobDownloadPerformed: false,
      blobMapPath: 'media/blob-map/blob-map.json',
      blobInventoryPath: 'media/blob-map/blob-inventory.json',
      copiedBlobCount: copiedItems.length
    },
    blobMap
  };
}

function entry(pathValue, kind) {
  return {
    path: pathValue,
    kind,
    required: true,
    sensitivity: 'redacted',
    schemaRef: null
  };
}
