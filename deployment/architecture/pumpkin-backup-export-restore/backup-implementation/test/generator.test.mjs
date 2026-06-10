import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { createCompleteStandardBackupWorkflow } from '../src/generator/complete-standard-backup-runner.mjs';
import { createDownloadPackage } from '../src/generator/download-package-writer.mjs';
import { createRestorePlan } from '../src/restore/restore-plan-runner.mjs';
import { validateBackupBundle, hasSecretLikeValue } from '../src/validators/backup-validator.mjs';
import { listFilesRecursive } from '../src/utils/file-hash.mjs';
import { readJson } from '../src/utils/json-writer.mjs';
import { packageRoot } from '../src/utils/safe-paths.mjs';

const fixedDate = new Date('2026-01-01T00:00:00.000Z');
const testNames = [
  'test-generator-fake-complete',
  'test-generator-fake-complete-restore-plan',
  'test-generator-download',
  'test-generator-cli-fake',
  'test-generator-cli-fake-restore-plan',
  'test-generator-cli-download'
];

after(async () => {
  await Promise.all(testNames.map((name) => clean(name)));
});

test('fake complete generator writes productized bundle, registry reference, restore summary, and passes validator', async () => {
  await clean('test-generator-fake-complete');
  await clean('test-generator-fake-complete-restore-plan');

  const result = await createCompleteStandardBackupWorkflow({
    profile: 'fake-complete',
    outputPath: '.tmp/test-generator-fake-complete',
    overwrite: true,
    now: fixedDate
  });

  assert.equal(result.validation.status, 'passed');
  assert.equal(result.restorePlan.status, 'passed');
  assert.equal(result.restorePlan.dryRunOnly, true);
  assert.equal(result.restorePlan.restoreExecuted, false);
  const manifest = await readJson(path.join(result.bundleRoot, 'manifest.json'));
  assert.equal(manifest.generator.phase, '2F-13');
  assert.equal(manifest.generator.profile, 'fake-complete');
  assert.equal(manifest.componentStatus.resourceRegistry.status, 'reference-included');
  assert(manifest.files.some((entry) => entry.path === 'operator/OPERATOR_SUMMARY.md'));
  assert(manifest.files.some((entry) => entry.path === 'resource-registry/resource-registry-reference.json'));
  assert(manifest.files.some((entry) => entry.path === 'RESTORE_PLAN.md'));
  await fs.access(path.join(result.bundleRoot, 'operator', 'OPERATOR_SUMMARY.md'));
  await fs.access(path.join(result.bundleRoot, 'operator', 'RETENTION_AND_CLEANUP.md'));
  await fs.access(path.join(result.bundleRoot, 'operator', 'generator-result.json'));
  await fs.access(path.join(result.bundleRoot, 'resource-registry', 'RESOURCE_REGISTRY_REFERENCE.md'));
  await fs.access(path.join(result.bundleRoot, 'VALIDATION_RESULT.json'));
  await fs.access(path.join(result.bundleRoot, 'RESTORE_PLAN.md'));
  const validation = await validateBackupBundle({
    bundlePath: result.bundleRoot,
    mode: 'production-restore-proof'
  });
  assert.equal(validation.status, 'passed');
});

test('generator refuses output outside .tmp', async () => {
  await assert.rejects(
    () =>
      createCompleteStandardBackupWorkflow({
        profile: 'fake-complete',
        outputPath: '../unsafe-generator-output',
        overwrite: true,
        now: fixedDate
      }),
    /output path must stay inside/
  );
});

test('download packaging creates a zip and package result under .tmp', async () => {
  await clean('test-generator-fake-complete');
  await clean('test-generator-download');
  const backup = await createCompleteStandardBackupWorkflow({
    profile: 'fake-complete',
    outputPath: '.tmp/test-generator-fake-complete',
    overwrite: true,
    now: fixedDate
  });

  const download = await createDownloadPackage({
    bundlePath: backup.bundleRoot,
    outputPath: '.tmp/test-generator-download',
    overwrite: true,
    now: fixedDate
  });

  assert.equal(download.status, 'packaged');
  assert.match(download.zipRelativePath, /\.zip$/);
  assert.match(download.zipSha256, /^[a-f0-9]{64}$/);
  const stat = await fs.stat(download.zipPath);
  assert(stat.size > 0);
  await fs.access(path.join(download.outputRoot, 'DOWNLOAD_PACKAGE_RESULT.json'));
  await fs.access(path.join(download.outputRoot, 'DOWNLOAD_PACKAGE_RESULT.md'));
});

test('CLI fake generator and package-download commands work without live calls', async () => {
  await clean('test-generator-cli-fake');
  await clean('test-generator-cli-fake-restore-plan');
  await clean('test-generator-cli-download');

  const generated = await runCli([
    'src/backup-cli.mjs',
    'create-complete-standard',
    '--profile',
    'fake-complete',
    '--out',
    '.tmp/test-generator-cli-fake',
    '--overwrite'
  ]);
  assert.equal(generated.code, 0, generated.stderr);
  assert.match(generated.stdout, /validation: passed/);
  assert.match(generated.stdout, /restorePlan: passed/);

  const packaged = await runCli([
    'src/backup-cli.mjs',
    'package-download',
    '--bundle',
    '.tmp/test-generator-cli-fake',
    '--out',
    '.tmp/test-generator-cli-download',
    '--overwrite'
  ]);
  assert.equal(packaged.code, 0, packaged.stderr);
  assert.match(packaged.stdout, /download-package: packaged/);
});

test('fake generator outputs and restore plan reports contain no secret-like values', async () => {
  await clean('test-generator-fake-complete');
  await clean('test-generator-fake-complete-restore-plan');
  const result = await createCompleteStandardBackupWorkflow({
    profile: 'fake-complete',
    outputPath: '.tmp/test-generator-fake-complete',
    overwrite: true,
    now: fixedDate
  });
  const restore = await createRestorePlan({
    bundlePath: result.bundleRoot,
    outputPath: '.tmp/test-generator-fake-complete-restore-plan',
    mode: 'production-restore-proof',
    overwrite: true,
    now: fixedDate
  });
  for (const root of [result.bundleRoot, restore.outputRoot]) {
    const files = await listFilesRecursive(root);
    for (const filePath of files) {
      if (filePath.endsWith('.zip')) continue;
      const text = await fs.readFile(filePath, 'utf8').catch(() => '');
      for (const line of text.split(/\r?\n/)) {
        assert.equal(hasSecretLikeValue(line), false, `secret-like value in ${filePath}`);
      }
    }
  }
});

async function clean(name) {
  await fs.rm(path.join(packageRoot, '.tmp', name), { recursive: true, force: true });
}

async function runCli(args) {
  return new Promise((resolve) => {
    execFile(process.execPath, args, { cwd: packageRoot }, (error, stdout, stderr) => {
      resolve({
        code: error?.code ?? 0,
        stdout,
        stderr
      });
    });
  });
}
