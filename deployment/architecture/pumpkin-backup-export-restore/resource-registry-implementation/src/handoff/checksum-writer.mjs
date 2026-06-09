import fs from 'node:fs/promises';
import path from 'node:path';
import { listFilesRecursive, sha256File } from '../utils/file-hash.mjs';
import { outputRelativePath } from '../utils/safe-paths.mjs';

const checksumFileName = 'CHECKSUMS.sha256';
const generatedReportNames = new Set([
  'validation-result.json',
  'VALIDATION_RESULT.md',
  'vault-validation-result.json',
  'VAULT_VALIDATION_RESULT.md',
  'registry-validation-result.json',
  'REGISTRY_VALIDATION_RESULT.md'
]);

export async function writeChecksums({ root, fileName = checksumFileName }) {
  const files = await listChecksumCoveredFiles(root, fileName);
  const lines = [];
  for (const filePath of files) {
    const relativePath = outputRelativePath(root, filePath);
    lines.push(`${await sha256File(filePath)}  ${relativePath}`);
  }
  const checksumPath = path.join(root, fileName);
  await fs.writeFile(checksumPath, `${lines.join('\n')}\n`, 'utf8');
  return {
    checksumPath,
    entries: lines.length
  };
}

export async function validateChecksums({ root, fileName = checksumFileName }) {
  const checksumPath = path.join(root, fileName);
  const failures = [];
  let text;
  try {
    text = await fs.readFile(checksumPath, 'utf8');
  } catch (error) {
    return {
      status: 'failed',
      failures: [{ code: 'CHECKSUM_FILE_MISSING', path: fileName, message: error.message }]
    };
  }
  const parsed = parseChecksumLines(text, failures);
  for (const entry of parsed) {
    if (entry.relativePath === fileName) {
      failures.push({ code: 'CHECKSUM_INCLUDES_SELF', path: fileName, message: 'checksum file must not include itself' });
      continue;
    }
    if (!isSafeRelativePath(entry.relativePath)) {
      failures.push({ code: 'CHECKSUM_PATH_INVALID', path: entry.relativePath, message: 'checksum path must stay inside package output' });
      continue;
    }
    const filePath = path.join(root, entry.relativePath);
    try {
      const actual = await sha256File(filePath);
      if (actual !== entry.hash) {
        failures.push({ code: 'CHECKSUM_MISMATCH', path: entry.relativePath, message: 'file checksum does not match' });
      }
    } catch (error) {
      failures.push({ code: 'CHECKSUM_FILE_MISSING_ON_DISK', path: entry.relativePath, message: error.message });
    }
  }
  return {
    status: failures.length === 0 ? 'passed' : 'failed',
    failures,
    checkedFileCount: parsed.length
  };
}

export async function listChecksumCoveredFiles(root, fileName = checksumFileName) {
  const files = await listFilesRecursive(root).catch(() => []);
  return files.filter((filePath) => {
    const relativePath = outputRelativePath(root, filePath);
    const baseName = path.basename(relativePath);
    return relativePath !== fileName && !generatedReportNames.has(baseName);
  });
}

function parseChecksumLines(text, failures) {
  const entries = [];
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    const match = /^([a-f0-9]{64})  (.+)$/.exec(line);
    if (!match) {
      failures.push({ code: 'CHECKSUM_PARSE_ERROR', path: `line:${index + 1}`, message: 'checksum line is malformed' });
      continue;
    }
    entries.push({ hash: match[1], relativePath: match[2] });
  }
  return entries;
}

function isSafeRelativePath(relativePath) {
  return !relativePath.startsWith('../') && !path.isAbsolute(relativePath) && !relativePath.includes('..\\');
}
