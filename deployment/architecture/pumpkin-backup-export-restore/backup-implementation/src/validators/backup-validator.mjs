import fs from 'node:fs/promises';
import path from 'node:path';
import { computeBundleChecksums, isChecksumExcluded, readChecksums } from '../checksum-writer.mjs';
import { listFilesRecursive, sha256File } from '../utils/file-hash.mjs';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { bundleRelativePath, resolveTmpBundlePath, toPosixPath } from '../utils/safe-paths.mjs';

const requiredFiles = [
  'manifest.json',
  'checksums.sha256',
  'BACKUP_SUMMARY.md',
  'RESTORE_INSTRUCTIONS.md',
  'database/DATABASE_EXPORT_NOT_INCLUDED.md',
  'database/database-export-plan.json',
  'cms-content/tenants.json',
  'cms-content/sites.json',
  'cms-content/pages.json',
  'cms-content/routes.json',
  'cms-content/forms.json',
  'cms-content/seo.json',
  'cms-content/redirects.json',
  'cms-content/theme.json',
  'media/media-assets.json',
  'media/MEDIA_BLOBS_NOT_INCLUDED.md',
  'static/static-output-manifest.json',
  'static/STATIC_OUTPUT_NOT_INCLUDED.md',
  'config-inventory/env-inventory.redacted.json',
  'config-inventory/CONFIG_VALUES_REDACTED.md',
  'escrow/ESCROW_NOT_INCLUDED.md'
];

const volatileReportFiles = new Set(['VALIDATION_RESULT.md', 'validation-result.json']);

export async function validateBackupBundle({ bundlePath }) {
  const bundleRoot = resolveTmpBundlePath(bundlePath);
  const checks = [];
  const failures = [];
  const warnings = [];
  let manifest = null;

  await checkBundleFolder(bundleRoot, checks, failures);
  await checkRequiredFiles(bundleRoot, checks, failures);
  manifest = await checkManifest(bundleRoot, checks, failures);
  await checkManifestFiles(bundleRoot, manifest, checks, failures);
  await checkChecksums(bundleRoot, checks, failures);
  await checkEscrowAbsent(bundleRoot, checks, failures);
  await checkNoProtectedPaths(bundleRoot, checks, failures);
  await checkNoSecretLikeValues(bundleRoot, checks, failures);

  const status = failures.length === 0 ? 'passed' : 'failed';
  return {
    schemaVersion: '0.1.0',
    validator: 'pumpkin-backup-center-local-prototype',
    status,
    generatedAt: new Date().toISOString(),
    bundleFormat: 'folder',
    checks,
    warnings,
    failures
  };
}

export async function writeValidationReports({ bundleRoot, validation }) {
  await writeJson(path.join(bundleRoot, 'validation-result.json'), validation);
  await fs.writeFile(
    path.join(bundleRoot, 'VALIDATION_RESULT.md'),
    renderValidationMarkdown(validation),
    'utf8'
  );
}

function addCheck(checks, checkId, status, summary) {
  checks.push({ checkId, status, summary });
}

function addFailure(failures, code, pathValue, message) {
  failures.push({ code, path: pathValue, message });
}

async function checkBundleFolder(bundleRoot, checks, failures) {
  try {
    const stat = await fs.stat(bundleRoot);
    if (!stat.isDirectory()) {
      addFailure(failures, 'BUNDLE_NOT_FOLDER', '.', 'backup bundle must be a folder');
      addCheck(checks, 'bundle-folder', 'failed', 'Bundle path is not a folder.');
      return;
    }
    addCheck(checks, 'bundle-folder', 'passed', 'Bundle is a folder.');
  } catch {
    addFailure(failures, 'BUNDLE_MISSING', '.', 'backup bundle folder does not exist');
    addCheck(checks, 'bundle-folder', 'failed', 'Bundle folder is missing.');
  }
}

async function checkRequiredFiles(bundleRoot, checks, failures) {
  const missing = [];
  for (const relativePath of requiredFiles) {
    try {
      await fs.access(path.join(bundleRoot, relativePath));
    } catch {
      missing.push(relativePath);
      addFailure(failures, 'REQUIRED_FILE_MISSING', relativePath, 'required backup file is missing');
    }
  }
  addCheck(
    checks,
    'required-files',
    missing.length === 0 ? 'passed' : 'failed',
    missing.length === 0 ? 'All required standard backup files exist.' : `Missing required files: ${missing.join(', ')}`
  );
}

async function checkManifest(bundleRoot, checks, failures) {
  try {
    const manifest = await readJson(path.join(bundleRoot, 'manifest.json'));
    const problems = [];
    if (manifest.manifestVersion !== '0.1.0') problems.push('manifestVersion');
    if (manifest.backupMode !== 'standard') problems.push('backupMode');
    if (manifest.bundleFormat !== 'folder') problems.push('bundleFormat');
    if (manifest.includesEscrow !== false) problems.push('includesEscrow');
    if (!Array.isArray(manifest.files)) problems.push('files');
    if (problems.length > 0) {
      addFailure(failures, 'MANIFEST_INVALID', 'manifest.json', `manifest fields invalid: ${problems.join(', ')}`);
      addCheck(checks, 'manifest-shape', 'failed', `Manifest has invalid fields: ${problems.join(', ')}.`);
    } else {
      addCheck(checks, 'manifest-shape', 'passed', 'Manifest shape is valid for the prototype.');
    }
    return manifest;
  } catch (error) {
    addFailure(failures, 'MANIFEST_PARSE_ERROR', 'manifest.json', error.message);
    addCheck(checks, 'manifest-shape', 'failed', 'Manifest JSON could not be parsed.');
    return null;
  }
}

async function checkManifestFiles(bundleRoot, manifest, checks, failures) {
  if (!manifest || !Array.isArray(manifest.files)) {
    return;
  }
  const manifestFiles = new Set(manifest.files.map((entry) => entry.path));
  const allFiles = await listFilesRecursive(bundleRoot);
  const actualContentFiles = allFiles
    .map((filePath) => bundleRelativePath(bundleRoot, filePath))
    .filter((relativePath) => relativePath !== 'manifest.json')
    .filter((relativePath) => relativePath !== 'checksums.sha256')
    .filter((relativePath) => !volatileReportFiles.has(relativePath));

  const missingFromDisk = [...manifestFiles].filter((relativePath) => !actualContentFiles.includes(relativePath));
  const missingFromManifest = actualContentFiles.filter((relativePath) => !manifestFiles.has(relativePath));
  for (const relativePath of missingFromDisk) {
    addFailure(failures, 'MANIFEST_FILE_MISSING_ON_DISK', relativePath, 'manifest file entry is missing on disk');
  }
  for (const relativePath of missingFromManifest) {
    addFailure(failures, 'FILE_NOT_IN_MANIFEST', relativePath, 'generated file is not listed in manifest');
  }
  const passed = missingFromDisk.length === 0 && missingFromManifest.length === 0;
  addCheck(
    checks,
    'manifest-file-list',
    passed ? 'passed' : 'failed',
    passed ? 'Manifest file list matches generated content files.' : 'Manifest file list differs from generated content files.'
  );
}

async function checkChecksums(bundleRoot, checks, failures) {
  try {
    const expected = await readChecksums(bundleRoot);
    const expectedByPath = new Map(expected.map((entry) => [entry.path, entry.sha256]));
    const actual = await computeBundleChecksums(bundleRoot);
    const actualPaths = new Set(actual.map((entry) => entry.path));

    for (const entry of actual) {
      const expectedHash = expectedByPath.get(entry.path);
      if (!expectedHash) {
        addFailure(failures, 'CHECKSUM_MISSING', entry.path, 'file is missing from checksums.sha256');
      } else if (expectedHash !== entry.sha256) {
        addFailure(failures, 'CHECKSUM_MISMATCH', entry.path, 'file checksum does not match checksums.sha256');
      }
    }
    for (const entry of expected) {
      if (!actualPaths.has(entry.path)) {
        addFailure(failures, 'CHECKSUM_FILE_MISSING', entry.path, 'checksums.sha256 references a missing file');
      }
    }
    addCheck(checks, 'checksums', 'passed', 'Checksum verification completed; failures list contains any mismatches.');
  } catch (error) {
    addFailure(failures, 'CHECKSUM_PARSE_ERROR', 'checksums.sha256', error.message);
    addCheck(checks, 'checksums', 'failed', 'Checksum file could not be parsed.');
  }
}

async function checkEscrowAbsent(bundleRoot, checks, failures) {
  const escrowDir = path.join(bundleRoot, 'escrow');
  const escrowFiles = await listFilesRecursive(escrowDir).catch(() => []);
  const disallowed = escrowFiles
    .map((filePath) => bundleRelativePath(bundleRoot, filePath))
    .filter((relativePath) => relativePath !== 'escrow/ESCROW_NOT_INCLUDED.md');

  const encryptedPayloads = disallowed.filter((relativePath) =>
    /encrypted-secrets\.|escrow-payload|decrypted|plaintext/i.test(relativePath)
  );
  for (const relativePath of disallowed) {
    addFailure(
      failures,
      encryptedPayloads.includes(relativePath) ? 'ESCROW_PAYLOAD_PRESENT' : 'UNEXPECTED_ESCROW_FILE',
      relativePath,
      'standard backups must not include escrow payload files'
    );
  }
  addCheck(
    checks,
    'escrow-absent',
    disallowed.length === 0 ? 'passed' : 'failed',
    disallowed.length === 0 ? 'Standard backup contains only ESCROW_NOT_INCLUDED.md.' : 'Standard backup contains disallowed escrow files.'
  );
}

async function checkNoProtectedPaths(bundleRoot, checks, failures) {
  const files = await listFilesRecursive(bundleRoot);
  const protectedPaths = files
    .map((filePath) => bundleRelativePath(bundleRoot, filePath))
    .filter((relativePath) => {
      const lower = relativePath.toLowerCase();
      return (
        /(^|\/)\.env(\.|$)/.test(lower) ||
        /(^|\/)appsettings\.development\.json$/.test(lower) ||
        /(^|\/)local\.settings\.json$/.test(lower) ||
        /credential|auth[-_]?header|cookie|connection[-_]?string|storage[-_]?key|private[-_]?key/.test(lower)
      );
    });
  for (const relativePath of protectedPaths) {
    addFailure(failures, 'PROTECTED_PATH_PRESENT', relativePath, 'protected or secret-risk file path is present in bundle');
  }
  addCheck(
    checks,
    'protected-paths',
    protectedPaths.length === 0 ? 'passed' : 'failed',
    protectedPaths.length === 0 ? 'No protected paths detected.' : 'Protected paths detected.'
  );
}

async function checkNoSecretLikeValues(bundleRoot, checks, failures) {
  const files = await listFilesRecursive(bundleRoot);
  const hits = [];
  for (const filePath of files) {
    const relativePath = bundleRelativePath(bundleRoot, filePath);
    if (isChecksumExcluded(relativePath)) continue;
    const text = await fs.readFile(filePath, 'utf8').catch(() => '');
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (hasSecretLikeValue(line)) {
        hits.push({ path: relativePath, line: index + 1 });
      }
    });
  }
  for (const hit of hits) {
    addFailure(failures, 'SECRET_LIKE_VALUE', hit.path, `secret-like value pattern at line ${hit.line}`);
  }
  addCheck(
    checks,
    'secret-like-values',
    hits.length === 0 ? 'passed' : 'failed',
    hits.length === 0 ? 'No secret-like values detected.' : 'Secret-like values detected.'
  );
}

export function hasSecretLikeValue(line) {
  const patterns = [
    /(authorization|cookie)\s*[:=]\s*[^\s`]+/i,
    /bearer\s+[A-Za-z0-9._-]{10,}/i,
    /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
    /["']?(password|client_secret|access_token|refresh_token|connectionstring|connection_string|storagekey|storage_key)["']?\s*[:=]\s*["'][^"'\s]{4,}/i,
    /["']?(api[_-]?key|jwt|token|secret)["']?\s*[:=]\s*["'](?!PLACEHOLDER|REDACTED|NOT_COLLECTED|EXCLUDED|NOT_INCLUDED|false|none|null)[^"'\s]{8,}/i
  ];
  return patterns.some((pattern) => pattern.test(line));
}

function renderValidationMarkdown(validation) {
  const lines = [
    '# Validation Result',
    '',
    `Status: ${validation.status}`,
    `Generated: ${validation.generatedAt}`,
    '',
    '## Checks',
    '',
    '| Check | Status | Summary |',
    '| --- | --- | --- |'
  ];
  for (const check of validation.checks) {
    lines.push(`| ${check.checkId} | ${check.status} | ${check.summary.replace(/\|/g, '/')} |`);
  }
  lines.push('', '## Failures', '');
  if (validation.failures.length === 0) {
    lines.push('None.');
  } else {
    for (const failure of validation.failures) {
      lines.push(`- ${failure.code} at ${toPosixPath(failure.path)}: ${failure.message}`);
    }
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}
