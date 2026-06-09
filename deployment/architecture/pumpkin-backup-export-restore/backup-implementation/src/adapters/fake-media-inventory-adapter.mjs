import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson } from '../utils/json-writer.mjs';

export async function writeFakeMediaInventory({ bundleRoot, request, fakeMediaCopy = false }) {
  const source = await readJson(request.fixtureRefs.mediaInventory);
  const assets =
    request.scope.scopeType === 'tenant'
      ? (source.mediaAssets ?? []).filter((asset) => asset.tenantKey === request.scope.tenantKey)
      : source.mediaAssets ?? [];
  const outputDir = path.join(bundleRoot, 'media');
  await fs.mkdir(outputDir, { recursive: true });
  await writeJson(path.join(outputDir, 'media-assets.json'), {
    schemaVersion: '0.2.0',
    source: 'fake-fixture',
    mediaAssets: assets,
    blobsCopied: fakeMediaCopy,
    blobCopyMode: fakeMediaCopy ? 'fake-full-copy' : 'metadata-only'
  });
  await fs.writeFile(
    path.join(outputDir, 'MEDIA_BLOBS_NOT_INCLUDED.md'),
    buildMediaMarker({ fakeMediaCopy }),
    'utf8'
  );
  return [
    { path: 'media/media-assets.json', kind: 'media-inventory', required: true, sensitivity: 'redacted', schemaRef: null },
    { path: 'media/MEDIA_BLOBS_NOT_INCLUDED.md', kind: 'media-inventory', required: true, sensitivity: 'redacted', schemaRef: null }
  ];
}

function buildMediaMarker({ fakeMediaCopy }) {
  if (fakeMediaCopy) {
    return [
      '# Real Media Blobs Not Included',
      '',
      'This prototype may include fake text blob copies from checked-in fixtures.',
      '',
      '- No real Azure blob copy was attempted.',
      '- No signed URL was read.',
      '- No storage key, connection string, or SAS URL was used.',
      '- No media download or upload occurred.',
      ''
    ].join('\n');
  }
  return [
    '# Media Blobs Not Included',
    '',
    'This prototype writes fake media metadata only.',
    '',
    '- No blob copy was attempted.',
    '- No signed URL was read.',
    '- No media download or upload occurred.',
    ''
  ].join('\n');
}
