import fs from 'node:fs/promises';
import path from 'node:path';
import { listFilesRecursive, sha256File } from './utils/file-hash.mjs';
import { bundleRelativePath } from './utils/safe-paths.mjs';

export const checksumExcludedPaths = new Set([
  'checksums.sha256',
  'VALIDATION_RESULT.md',
  'VALIDATION_RESULT.json',
  'validation-result.json'
]);

export function isChecksumExcluded(relativePath) {
  return checksumExcludedPaths.has(relativePath);
}

export async function computeBundleChecksums(bundleRoot) {
  const files = await listFilesRecursive(bundleRoot);
  const entries = [];
  for (const filePath of files) {
    const relativePath = bundleRelativePath(bundleRoot, filePath);
    if (isChecksumExcluded(relativePath)) {
      continue;
    }
    entries.push({
      path: relativePath,
      sha256: await sha256File(filePath)
    });
  }
  return entries;
}

export async function writeChecksums(bundleRoot) {
  const entries = await computeBundleChecksums(bundleRoot);
  const lines = entries.map((entry) => `${entry.sha256}  ${entry.path}`);
  await fs.writeFile(path.join(bundleRoot, 'checksums.sha256'), `${lines.join('\n')}\n`, 'utf8');
  return entries;
}

export async function readChecksums(bundleRoot) {
  const checksumPath = path.join(bundleRoot, 'checksums.sha256');
  const text = await fs.readFile(checksumPath, 'utf8');
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([a-f0-9]{64})\s{2}(.+)$/i);
      if (!match) {
        throw new Error(`invalid checksum line: ${line}`);
      }
      return { sha256: match[1].toLowerCase(), path: match[2] };
    });
}
