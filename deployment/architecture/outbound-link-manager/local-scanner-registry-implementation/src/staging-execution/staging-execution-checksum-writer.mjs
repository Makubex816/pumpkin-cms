import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson } from '../utils/json-writer.mjs';

export async function writeStagingExecutionChecksums({ outputRoot, files }) {
  const checksums = [];
  for (const file of files) {
    const sha256 = await fileHash(path.join(outputRoot, file));
    checksums.push({ file: file.replaceAll('\\', '/'), sha256 });
  }
  checksums.sort((a, b) => a.file.localeCompare(b.file));
  await writeJson(path.join(outputRoot, 'checksums.json'), {
    schemaVersion: '0.1.0',
    checksumType: 'pumpkin-outbound-link-staging-execution-checksums',
    files: checksums
  });
  await fs.writeFile(path.join(outputRoot, 'checksums.sha256'), `${checksums.map((item) => `${item.sha256}  ${item.file}`).join('\n')}\n`, 'utf8');
  return checksums;
}

export async function validateStagingExecutionChecksums({ outputRoot }) {
  const checksumEnvelope = await readJson(path.join(outputRoot, 'checksums.json'));
  const failures = [];
  for (const item of checksumEnvelope.files ?? []) {
    const actual = await fileHash(path.join(outputRoot, item.file));
    if (actual !== item.sha256) {
      failures.push({
        code: 'STAGING_EXECUTION_CHECKSUM_MISMATCH',
        message: 'checksum does not match generated staging execution file',
        path: item.file
      });
    }
  }
  return {
    schemaVersion: '0.1.0',
    validationType: 'pumpkin-outbound-link-staging-execution-checksum-validation',
    status: failures.length === 0 ? 'passed' : 'failed',
    summary: {
      checkedFileCount: checksumEnvelope.files?.length ?? 0,
      failureCount: failures.length
    },
    failures
  };
}

async function fileHash(filePath) {
  const bytes = await fs.readFile(filePath);
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

