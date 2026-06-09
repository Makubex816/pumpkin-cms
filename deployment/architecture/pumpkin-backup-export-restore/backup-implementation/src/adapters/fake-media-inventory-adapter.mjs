import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson } from '../utils/json-writer.mjs';

export async function writeFakeMediaInventory({ bundleRoot, request }) {
  const source = await readJson(request.fixtureRefs.mediaInventory);
  const assets =
    request.scope.scopeType === 'tenant'
      ? (source.mediaAssets ?? []).filter((asset) => asset.tenantKey === request.scope.tenantKey)
      : source.mediaAssets ?? [];
  const outputDir = path.join(bundleRoot, 'media');
  await fs.mkdir(outputDir, { recursive: true });
  await writeJson(path.join(outputDir, 'media-assets.json'), {
    source: 'fake-fixture',
    mediaAssets: assets,
    blobsCopied: false
  });
  await fs.writeFile(
    path.join(outputDir, 'MEDIA_BLOBS_NOT_INCLUDED.md'),
    [
      '# Media Blobs Not Included',
      '',
      'This prototype writes fake media metadata only.',
      '',
      '- No blob copy was attempted.',
      '- No signed URL was read.',
      '- No media download or upload occurred.',
      ''
    ].join('\n'),
    'utf8'
  );
  return [
    { path: 'media/media-assets.json', kind: 'media-inventory', required: true, sensitivity: 'redacted', schemaRef: null },
    { path: 'media/MEDIA_BLOBS_NOT_INCLUDED.md', kind: 'media-inventory', required: true, sensitivity: 'redacted', schemaRef: null }
  ];
}
