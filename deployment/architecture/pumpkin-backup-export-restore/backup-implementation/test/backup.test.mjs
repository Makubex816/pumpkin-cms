import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createStandardBackup } from '../src/standard-backup-runner.mjs';
import { validateBackupBundle } from '../src/validators/backup-validator.mjs';
import { readJson } from '../src/utils/json-writer.mjs';
import { packageRoot } from '../src/utils/safe-paths.mjs';

const fixedDate = new Date('2026-01-01T00:00:00.000Z');
const testBundleNames = [
  'test-tenant',
  'test-platform',
  'test-missing-file',
  'test-checksum',
  'test-escrow-payload',
  'test-secret-like'
];

after(async () => {
  await Promise.all(testBundleNames.map((name) => clean(name)));
});

async function clean(name) {
  await fs.rm(path.join(packageRoot, '.tmp', name), { recursive: true, force: true });
}

test('tenant standard backup generation writes manifest, checksums, escrow marker, and passes validator', async () => {
  await clean('test-tenant');
  const result = await createStandardBackup({
    answersPath: 'fixtures/tenant-standard-backup.answers.json',
    outputPath: '.tmp/test-tenant',
    scopeOverride: 'tenant',
    overwrite: true,
    now: fixedDate
  });
  assert.equal(result.validation.status, 'passed');
  const manifest = await readJson(path.join(result.bundleRoot, 'manifest.json'));
  assert.equal(manifest.backupMode, 'standard');
  assert.equal(manifest.bundleFormat, 'folder');
  assert.equal(manifest.includesEscrow, false);
  assert.equal(manifest.scope.scopeType, 'tenant');
  assert.equal(manifest.scope.tenantKey, 'example-tenant');
  await fs.access(path.join(result.bundleRoot, 'checksums.sha256'));
  await fs.access(path.join(result.bundleRoot, 'escrow', 'ESCROW_NOT_INCLUDED.md'));
});

test('platform standard backup generation works with fake platform fixture', async () => {
  await clean('test-platform');
  const result = await createStandardBackup({
    answersPath: 'fixtures/platform-standard-backup.answers.json',
    outputPath: '.tmp/test-platform',
    scopeOverride: 'platform',
    overwrite: true,
    now: fixedDate
  });
  assert.equal(result.validation.status, 'passed');
  const manifest = await readJson(path.join(result.bundleRoot, 'manifest.json'));
  assert.equal(manifest.scope.scopeType, 'platform');
  const tenants = await readJson(path.join(result.bundleRoot, 'cms-content', 'tenants.json'));
  assert.equal(tenants.length, 2);
});

test('validator fails when a required file is missing', async () => {
  await clean('test-missing-file');
  const result = await createStandardBackup({
    answersPath: 'fixtures/tenant-standard-backup.answers.json',
    outputPath: '.tmp/test-missing-file',
    overwrite: true,
    now: fixedDate
  });
  await fs.rm(path.join(result.bundleRoot, 'RESTORE_INSTRUCTIONS.md'));
  const validation = await validateBackupBundle({ bundlePath: result.bundleRoot });
  assert.equal(validation.status, 'failed');
  assert(validation.failures.some((failure) => failure.code === 'REQUIRED_FILE_MISSING'));
});

test('validator fails when a checksum mismatches', async () => {
  await clean('test-checksum');
  const result = await createStandardBackup({
    answersPath: 'fixtures/tenant-standard-backup.answers.json',
    outputPath: '.tmp/test-checksum',
    overwrite: true,
    now: fixedDate
  });
  await fs.appendFile(path.join(result.bundleRoot, 'BACKUP_SUMMARY.md'), '\nChanged after checksum.\n', 'utf8');
  const validation = await validateBackupBundle({ bundlePath: result.bundleRoot });
  assert.equal(validation.status, 'failed');
  assert(validation.failures.some((failure) => failure.code === 'CHECKSUM_MISMATCH'));
});

test('validator rejects escrow payloads in a standard backup', async () => {
  await clean('test-escrow-payload');
  const result = await createStandardBackup({
    answersPath: 'fixtures/tenant-standard-backup.answers.json',
    outputPath: '.tmp/test-escrow-payload',
    overwrite: true,
    now: fixedDate
  });
  await fs.writeFile(path.join(result.bundleRoot, 'escrow', 'encrypted-secrets.fake'), 'not real encrypted data\n', 'utf8');
  const validation = await validateBackupBundle({ bundlePath: result.bundleRoot });
  assert.equal(validation.status, 'failed');
  assert(validation.failures.some((failure) => failure.code === 'ESCROW_PAYLOAD_PRESENT'));
});

test('validator rejects secret-like values in generated bundle files', async () => {
  await clean('test-secret-like');
  const result = await createStandardBackup({
    answersPath: 'fixtures/tenant-standard-backup.answers.json',
    outputPath: '.tmp/test-secret-like',
    overwrite: true,
    now: fixedDate
  });
  const unsafePayload = '{"api_' + 'key":"not-a-real-but-secret-looking-value"}\n';
  await fs.writeFile(path.join(result.bundleRoot, 'cms-content', 'unsafe.json'), unsafePayload, 'utf8');
  const validation = await validateBackupBundle({ bundlePath: result.bundleRoot });
  assert.equal(validation.status, 'failed');
  assert(validation.failures.some((failure) => failure.code === 'SECRET_LIKE_VALUE'));
});

test('output path safety rejects writes outside .tmp', async () => {
  await assert.rejects(
    () =>
      createStandardBackup({
        answersPath: 'fixtures/tenant-standard-backup.answers.json',
        outputPath: '../unsafe-output',
        overwrite: true,
        now: fixedDate
      }),
    /output path must stay inside/
  );
});

test('source does not include external HTTP call patterns or protected config reads', async () => {
  const sourceFiles = [
    'src/backup-cli.mjs',
    'src/standard-backup-runner.mjs',
    'src/standard-bundle-writer.mjs',
    'src/adapters/fake-cms-content-adapter.mjs',
    'src/adapters/fake-config-inventory-adapter.mjs'
  ];
  for (const relativePath of sourceFiles) {
    const text = await fs.readFile(path.join(packageRoot, relativePath), 'utf8');
    assert.equal(/fetch\s*\(|http\.request|https\.request|Invoke-WebRequest|appsettings\.Development|local\.settings|\.env\.local/i.test(text), false);
  }
});

test('.tmp output is ignored by package gitignore', async () => {
  const gitignore = await fs.readFile(path.join(packageRoot, '.gitignore'), 'utf8');
  assert.match(gitignore, /^\.tmp\/$/m);
  assert.match(gitignore, /^\*\.zip$/m);
  assert.match(gitignore, /^encrypted-secrets\.\*$/m);
});
