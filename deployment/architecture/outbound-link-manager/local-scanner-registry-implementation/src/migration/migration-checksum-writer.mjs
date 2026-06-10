import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { resolveTmpOutputPath, toPackageRelative } from '../utils/safe-paths.mjs';

export async function writeMigrationChecksums({ migrationRoot, files }) {
  const checksums = [];
  for (const relativeFile of files) {
    const filePath = path.join(migrationRoot, relativeFile);
    const hash = await fileHash(filePath);
    checksums.push({ file: relativeFile.replaceAll('\\', '/'), sha256: hash });
  }
  checksums.sort((a, b) => a.file.localeCompare(b.file));
  await writeJson(path.join(migrationRoot, 'checksums.json'), {
    schemaVersion: '0.1.0',
    checksumType: 'pumpkin-outbound-link-production-migration-dry-run-checksums',
    files: checksums
  });
  await fs.writeFile(
    path.join(migrationRoot, 'checksums.sha256'),
    `${checksums.map((item) => `${item.sha256}  ${item.file}`).join('\n')}\n`,
    'utf8'
  );
  return checksums;
}

export async function validateChecksums({ migrationPath }) {
  const migrationRoot = resolveTmpOutputPath(migrationPath);
  const failures = [];
  const checksumEnvelope = await readJson(path.join(migrationRoot, 'checksums.json'));
  for (const item of checksumEnvelope.files ?? []) {
    const actual = await fileHash(path.join(migrationRoot, item.file));
    if (actual !== item.sha256) {
      failures.push({
        code: 'CHECKSUM_MISMATCH',
        path: item.file,
        message: 'checksum does not match generated file'
      });
    }
  }
  return {
    schemaVersion: '0.1.0',
    status: failures.length === 0 ? 'passed' : 'failed',
    migrationPath: toPackageRelative(migrationRoot),
    failures
  };
}

async function fileHash(filePath) {
  const bytes = await fs.readFile(filePath);
  return crypto.createHash('sha256').update(bytes).digest('hex');
}
