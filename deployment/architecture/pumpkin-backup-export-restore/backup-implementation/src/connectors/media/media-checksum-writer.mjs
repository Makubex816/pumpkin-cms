import fs from 'node:fs/promises';
import path from 'node:path';
import { sha256File } from '../../utils/file-hash.mjs';

export async function writeMediaBlobChecksums({ bundleRoot, blobRelativePaths }) {
  const outputPath = path.join(bundleRoot, 'media', 'blob-map', 'blob-checksums.sha256');
  const lines = [];
  for (const relativePath of blobRelativePaths.sort((a, b) => a.localeCompare(b))) {
    lines.push(`${await sha256File(path.join(bundleRoot, relativePath))}  ${relativePath}`);
  }
  await fs.writeFile(outputPath, `${lines.join('\n')}\n`, 'utf8');
  return 'media/blob-map/blob-checksums.sha256';
}
