import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRestorePlan } from '../src/restore/restore-plan-runner.mjs';
import { createStandardBackup } from '../src/standard-backup-runner.mjs';
import { validateBackupBundle, writeValidationReports, hasSecretLikeValue } from '../src/validators/backup-validator.mjs';
import { listFilesRecursive } from '../src/utils/file-hash.mjs';
import { readJson, writeJson } from '../src/utils/json-writer.mjs';
import { packageRoot } from '../src/utils/safe-paths.mjs';

const fixedDate = new Date('2026-01-01T00:00:00.000Z');
const tenantAnswers = 'fixtures/tenant-standard-backup.answers.json';
const platformAnswers = 'fixtures/platform-standard-backup.answers.json';
const iceConnectorAnswers = 'fixtures/ice-cosmos-media-standard-backup.answers.json';
const testBundleNames = [
  'test-tenant',
  'test-platform',
  'test-missing-manifest',
  'test-invalid-manifest-json',
  'test-missing-required-file',
  'test-missing-restore-instructions',
  'test-checksum',
  'test-extra-file',
  'test-manifest-listed-missing',
  'test-escrow-payload',
  'test-secret-like',
  'test-path-traversal',
  'test-scope-mismatch',
  'test-missing-config-inventory',
  'test-malformed-checksum',
  'test-checksum-self',
  'test-config-not-redacted',
  'test-report-output',
  'test-cli-invalid',
  'test-restore-tenant-bundle',
  'test-restore-tenant-plan',
  'test-restore-platform-bundle',
  'test-restore-platform-plan',
  'test-restore-invalid-bundle',
  'test-restore-invalid-plan',
  'test-restore-checksum-bundle',
  'test-restore-checksum-plan',
  'test-restore-escrow-bundle',
  'test-restore-escrow-plan',
  'test-restore-output-safety-bundle',
  'test-restore-secret-scan-bundle',
  'test-restore-secret-scan-plan',
  'test-restore-cli-bundle',
  'test-restore-cli-plan',
  'test-ice-fake-complete',
  'test-ice-fake-complete-restore-bundle',
  'test-ice-fake-complete-plan',
  'test-proof-missing-baseline',
  'test-proof-missing-cosmos',
  'test-proof-missing-media',
  'test-proof-secret-like'
];

after(async () => {
  await Promise.all(testBundleNames.map((name) => clean(name)));
});

async function clean(name) {
  await fs.rm(path.join(packageRoot, '.tmp', name), { recursive: true, force: true });
}

async function createTenantBundle(name) {
  await clean(name);
  return createStandardBackup({
    answersPath: tenantAnswers,
    outputPath: `.tmp/${name}`,
    scopeOverride: 'tenant',
    overwrite: true,
    now: fixedDate
  });
}

async function createPlatformBundle(name) {
  await clean(name);
  return createStandardBackup({
    answersPath: platformAnswers,
    outputPath: `.tmp/${name}`,
    scopeOverride: 'platform',
    overwrite: true,
    now: fixedDate
  });
}

async function createIceFakeCompleteBundle(name) {
  await clean(name);
  return createStandardBackup({
    answersPath: iceConnectorAnswers,
    outputPath: `.tmp/${name}`,
    scopeOverride: 'tenant',
    overwrite: true,
    now: fixedDate,
    connectors: {
      fakeCosmos: true,
      fakeMediaCopy: true,
      tenantWebsiteBundle: true
    }
  });
}

async function expectFailure(name, mutate, expectedCode) {
  const result = await createTenantBundle(name);
  await mutate(result.bundleRoot);
  const validation = await validateBackupBundle({ bundlePath: result.bundleRoot });
  assert.equal(validation.status, 'failed');
  assert(
    validation.failures.some((failure) => failure.code === expectedCode),
    `expected ${expectedCode}; saw ${validation.failures.map((failure) => failure.code).join(', ')}`
  );
  return validation;
}

async function updateJson(relativeOrAbsolutePath, updater) {
  const filePath = path.isAbsolute(relativeOrAbsolutePath)
    ? relativeOrAbsolutePath
    : path.join(packageRoot, relativeOrAbsolutePath);
  const value = await readJson(filePath);
  updater(value);
  await writeJson(filePath, value);
}

test('tenant standard backup generation writes hardened manifest, reports, checksums, escrow marker, and passes validator', async () => {
  const result = await createTenantBundle('test-tenant');
  assert.equal(result.validation.status, 'passed');
  const manifest = await readJson(path.join(result.bundleRoot, 'manifest.json'));
  assert.equal(manifest.manifestVersion, '0.2.0');
  assert.equal(manifest.bundleContractVersion, '0.2.0');
  assert.equal(manifest.validatorContractVersion, '0.2.0');
  assert.equal(manifest.backupMode, 'standard');
  assert.equal(manifest.bundleFormat, 'folder');
  assert.equal(manifest.includesEscrow, false);
  assert.equal(manifest.scope.scopeType, 'tenant');
  assert.equal(manifest.scope.tenantKey, 'example-tenant');
  assert.equal(manifest.contentFileCount, manifest.files.length);
  await fs.access(path.join(result.bundleRoot, 'checksums.sha256'));
  await fs.access(path.join(result.bundleRoot, 'escrow', 'ESCROW_NOT_INCLUDED.md'));
  await fs.access(path.join(result.bundleRoot, 'validation-result.json'));
  await fs.access(path.join(result.bundleRoot, 'VALIDATION_RESULT.md'));
});

test('platform standard backup generation passes hardened validator with no tenant key', async () => {
  const result = await createPlatformBundle('test-platform');
  assert.equal(result.validation.status, 'passed');
  const manifest = await readJson(path.join(result.bundleRoot, 'manifest.json'));
  assert.equal(manifest.scope.scopeType, 'platform');
  assert.equal(manifest.scope.tenantKey, null);
  assert.equal(manifest.tenantKey, null);
  const tenants = await readJson(path.join(result.bundleRoot, 'cms-content', 'tenants.json'));
  assert.equal(tenants.length, 2);
});

test('validator fails when manifest is missing', async () => {
  await expectFailure('test-missing-manifest', async (bundleRoot) => {
    await fs.rm(path.join(bundleRoot, 'manifest.json'));
  }, 'MANIFEST_MISSING');
});

test('validator fails when manifest JSON is invalid', async () => {
  await expectFailure('test-invalid-manifest-json', async (bundleRoot) => {
    await fs.writeFile(path.join(bundleRoot, 'manifest.json'), '{\n', 'utf8');
  }, 'MANIFEST_PARSE_ERROR');
});

test('validator fails when a non-restore required file is missing', async () => {
  await expectFailure('test-missing-required-file', async (bundleRoot) => {
    await fs.rm(path.join(bundleRoot, 'media', 'MEDIA_BLOBS_NOT_INCLUDED.md'));
  }, 'REQUIRED_FILE_MISSING');
});

test('validator fails when restore instructions are missing', async () => {
  await expectFailure('test-missing-restore-instructions', async (bundleRoot) => {
    await fs.rm(path.join(bundleRoot, 'RESTORE_INSTRUCTIONS.md'));
  }, 'RESTORE_INSTRUCTIONS_MISSING');
});

test('validator fails when a checksum mismatches', async () => {
  await expectFailure('test-checksum', async (bundleRoot) => {
    await fs.appendFile(path.join(bundleRoot, 'BACKUP_SUMMARY.md'), '\nChanged after checksum.\n', 'utf8');
  }, 'CHECKSUM_MISMATCH');
});

test('validator fails when an extra generated file is not listed in manifest', async () => {
  await expectFailure('test-extra-file', async (bundleRoot) => {
    await writeJson(path.join(bundleRoot, 'cms-content', 'extra.json'), { schemaVersion: '0.2.0', fake: true });
  }, 'FILE_NOT_IN_MANIFEST');
});

test('validator fails when a manifest-listed file is missing from disk', async () => {
  await expectFailure('test-manifest-listed-missing', async (bundleRoot) => {
    await fs.rm(path.join(bundleRoot, 'media', 'media-assets.json'));
  }, 'MANIFEST_FILE_MISSING_ON_DISK');
});

test('validator rejects escrow payloads in a standard backup', async () => {
  await expectFailure('test-escrow-payload', async (bundleRoot) => {
    await fs.writeFile(path.join(bundleRoot, 'escrow', 'escrow-payload.fake'), 'not real encrypted data\n', 'utf8');
  }, 'ESCROW_PAYLOAD_PRESENT');
});

test('validator rejects secret-like values in generated bundle files', async () => {
  await expectFailure('test-secret-like', async (bundleRoot) => {
    const unsafePayload = '{"api_' + 'key":"not-a-real-but-secret-looking-value"}\n';
    await fs.writeFile(path.join(bundleRoot, 'cms-content', 'unsafe.json'), unsafePayload, 'utf8');
  }, 'SECRET_LIKE_VALUE');
});

test('validator rejects path traversal entries in manifest file list', async () => {
  await expectFailure('test-path-traversal', async (bundleRoot) => {
    await updateJson(path.join(bundleRoot, 'manifest.json'), (manifest) => {
      manifest.files.push({
        path: '../escape.txt',
        kind: 'cms-content',
        required: true,
        sensitivity: 'redacted',
        schemaRef: null
      });
      manifest.contentFileCount = manifest.files.length;
    });
  }, 'MANIFEST_FILE_PATH_INVALID');
});

test('validator rejects bad platform scope with tenant fields', async () => {
  await expectFailure('test-scope-mismatch', async (bundleRoot) => {
    await updateJson(path.join(bundleRoot, 'manifest.json'), (manifest) => {
      manifest.scope = {
        scopeType: 'platform',
        tenantKey: 'example-tenant',
        siteKey: 'example-site'
      };
    });
  }, 'SCOPE_TENANT_MISMATCH');
});

test('validator fails when redacted config inventory is missing', async () => {
  await expectFailure('test-missing-config-inventory', async (bundleRoot) => {
    await fs.rm(path.join(bundleRoot, 'config-inventory', 'env-inventory.redacted.json'));
  }, 'CONFIG_INVENTORY_MISSING');
});

test('validator fails when checksum file is malformed', async () => {
  await expectFailure('test-malformed-checksum', async (bundleRoot) => {
    await fs.writeFile(path.join(bundleRoot, 'checksums.sha256'), 'not-a-valid-checksum-line\n', 'utf8');
  }, 'CHECKSUM_PARSE_ERROR');
});

test('validator fails when checksum file includes itself', async () => {
  await expectFailure('test-checksum-self', async (bundleRoot) => {
    await fs.appendFile(path.join(bundleRoot, 'checksums.sha256'), `${'0'.repeat(64)}  checksums.sha256\n`, 'utf8');
  }, 'CHECKSUM_INCLUDES_SELF');
});

test('validator fails when config inventory includes non-redacted values', async () => {
  await expectFailure('test-config-not-redacted', async (bundleRoot) => {
    await updateJson(path.join(bundleRoot, 'config-inventory', 'env-inventory.redacted.json'), (inventory) => {
      inventory.valuesIncluded = true;
      inventory.variables[0].value = 'NOT_REDACTED_TEST_VALUE';
    });
  }, 'CONFIG_VALUES_INCLUDED');
});

test('validator report JSON and Markdown are written with hardened summary fields', async () => {
  const result = await createTenantBundle('test-report-output');
  const validation = await validateBackupBundle({ bundlePath: result.bundleRoot });
  await writeValidationReports({ bundleRoot: result.bundleRoot, validation });
  const report = await readJson(path.join(result.bundleRoot, 'validation-result.json'));
  const markdown = await fs.readFile(path.join(result.bundleRoot, 'VALIDATION_RESULT.md'), 'utf8');
  assert.equal(report.schemaVersion, '0.2.0');
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.checksumResult, 'passed');
  assert.equal(report.summary.escrowExclusionResult, 'passed');
  assert.equal(report.summary.secretLeakScanResult, 'passed');
  assert.match(markdown, /Secret-leak scan/);
  assert.match(markdown, /Manifest file list/);
});

test('CLI validate returns non-zero for invalid bundles and writes reports', async () => {
  const result = await createTenantBundle('test-cli-invalid');
  await fs.rm(path.join(result.bundleRoot, 'RESTORE_INSTRUCTIONS.md'));
  const outcome = await runCli(['src/backup-cli.mjs', 'validate', '--bundle', '.tmp/test-cli-invalid']);
  assert.equal(outcome.code, 1);
  assert.match(outcome.stdout, /validation: failed/);
  await fs.access(path.join(result.bundleRoot, 'validation-result.json'));
  await fs.access(path.join(result.bundleRoot, 'VALIDATION_RESULT.md'));
});

test('restore-plan passes for valid tenant standard backup and writes reports', async () => {
  const backup = await createTenantBundle('test-restore-tenant-bundle');
  await clean('test-restore-tenant-plan');
  const result = await createRestorePlan({
    bundlePath: backup.bundleRoot,
    outputPath: '.tmp/test-restore-tenant-plan',
    overwrite: true,
    now: fixedDate
  });
  assert.equal(result.plan.status, 'passed');
  assert.equal(result.plan.dryRunOnly, true);
  assert.equal(result.plan.restoreExecuted, false);
  assert.equal(result.plan.inventoryCounts.tenants, 1);
  assert.equal(result.plan.inventoryCounts.pages, 2);
  assert.equal(result.plan.inventoryCounts.routes, 2);
  assert.equal(result.plan.inventoryCounts.forms, 1);
  assert.equal(result.plan.inventoryCounts.mediaAssets, 1);
  assert.equal(result.plan.inventoryCounts.configVariables, 3);
  assert(result.plan.countComparison.comparisons.every((comparison) => comparison.status === 'passed'));
  await assertRestoreOutputFiles(result.outputRoot);
});

test('restore-plan passes for valid platform standard backup and compares platform inventory counts', async () => {
  const backup = await createPlatformBundle('test-restore-platform-bundle');
  await clean('test-restore-platform-plan');
  const result = await createRestorePlan({
    bundlePath: backup.bundleRoot,
    outputPath: '.tmp/test-restore-platform-plan',
    overwrite: true,
    now: fixedDate
  });
  assert.equal(result.plan.status, 'passed');
  assert.equal(result.plan.scope.scopeType, 'platform');
  assert.equal(result.plan.inventoryCounts.tenants, 2);
  assert.equal(result.plan.inventoryCounts.pages, 3);
  assert.equal(result.plan.inventoryCounts.routes, 3);
  assert.equal(result.plan.inventoryCounts.mediaAssets, 2);
  assert.equal(result.plan.inventoryCounts.staticEvidenceRoutes, 3);
  await assertRestoreOutputFiles(result.outputRoot);
});

test('restore-plan refuses invalid backup bundle before writing restore output', async () => {
  const backup = await createTenantBundle('test-restore-invalid-bundle');
  await clean('test-restore-invalid-plan');
  await fs.rm(path.join(backup.bundleRoot, 'RESTORE_INSTRUCTIONS.md'));
  await assert.rejects(
    () =>
      createRestorePlan({
        bundlePath: backup.bundleRoot,
        outputPath: '.tmp/test-restore-invalid-plan',
        overwrite: true,
        now: fixedDate
      }),
    /refused invalid backup bundle/
  );
  await assert.rejects(() => fs.access(path.join(packageRoot, '.tmp', 'test-restore-invalid-plan')));
});

test('restore-plan refuses checksum-tampered bundle', async () => {
  const backup = await createTenantBundle('test-restore-checksum-bundle');
  await clean('test-restore-checksum-plan');
  await fs.appendFile(path.join(backup.bundleRoot, 'BACKUP_SUMMARY.md'), '\nChanged before restore validation.\n', 'utf8');
  await assert.rejects(
    () =>
      createRestorePlan({
        bundlePath: backup.bundleRoot,
        outputPath: '.tmp/test-restore-checksum-plan',
        overwrite: true,
        now: fixedDate
      }),
    /CHECKSUM_MISMATCH/
  );
});

test('restore-plan refuses escrow payload in standard backup', async () => {
  const backup = await createTenantBundle('test-restore-escrow-bundle');
  await clean('test-restore-escrow-plan');
  await fs.writeFile(path.join(backup.bundleRoot, 'escrow', 'escrow-' + 'payload.fake'), 'fake escrow payload marker\n', 'utf8');
  await assert.rejects(
    () =>
      createRestorePlan({
        bundlePath: backup.bundleRoot,
        outputPath: '.tmp/test-restore-escrow-plan',
        overwrite: true,
        now: fixedDate
      }),
    /ESCROW_PAYLOAD_PRESENT/
  );
});

test('restore-plan refuses output outside .tmp and output overlapping source bundle', async () => {
  const backup = await createTenantBundle('test-restore-output-safety-bundle');
  await assert.rejects(
    () =>
      createRestorePlan({
        bundlePath: backup.bundleRoot,
        outputPath: '../restore-outside',
        overwrite: true,
        now: fixedDate
      }),
    /output path must stay inside/
  );
  await assert.rejects(
    () =>
      createRestorePlan({
        bundlePath: backup.bundleRoot,
        outputPath: '.tmp/test-restore-output-safety-bundle/nested-plan',
        overwrite: true,
        now: fixedDate
      }),
    /must not be inside source backup bundle/
  );
});

test('restore-plan generated reports contain no secret-like values', async () => {
  const backup = await createTenantBundle('test-restore-secret-scan-bundle');
  await clean('test-restore-secret-scan-plan');
  const result = await createRestorePlan({
    bundlePath: backup.bundleRoot,
    outputPath: '.tmp/test-restore-secret-scan-plan',
    overwrite: true,
    now: fixedDate
  });
  const files = await listFilesRecursive(result.outputRoot);
  for (const filePath of files) {
    const text = await fs.readFile(filePath, 'utf8');
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      assert.equal(hasSecretLikeValue(line), false, `secret-like value in ${filePath}`);
    }
  }
});

test('fake Ice Cosmos/media connector bundle writes portable export, media copies, manifest status, and passes proof validator', async () => {
  const result = await createIceFakeCompleteBundle('test-ice-fake-complete');
  assert.equal(result.validation.status, 'passed');
  assert.equal(result.validation.mode, 'production-restore-proof');
  const manifest = await readJson(path.join(result.bundleRoot, 'manifest.json'));
  assert.equal(manifest.connectorFoundation.fakeCosmosExport, true);
  assert.equal(manifest.connectorFoundation.fakeMediaCopy, true);
  assert.equal(manifest.connectorFoundation.tenantWebsiteBundle, true);
  assert.equal(manifest.componentStatus.database.provider, 'cosmos');
  assert.equal(manifest.componentStatus.database.mode, 'portable-json');
  assert.equal(manifest.componentStatus.database.status, 'complete');
  assert.equal(manifest.componentStatus.database.recordCount, 13);
  assert.equal(manifest.componentStatus.media.provider, 'azure-blob');
  assert.equal(manifest.componentStatus.media.mode, 'full-copy');
  assert.equal(manifest.componentStatus.media.copiedBlobCount, 2);
  assert.equal(manifest.componentStatus.tenantWebsiteBundle.status, 'complete');
  await fs.access(path.join(result.bundleRoot, 'database', 'cosmos-json', 'export-manifest.json'));
  await fs.access(path.join(result.bundleRoot, 'database', 'platform-evidence', 'cosmos', 'cosmos-platform-backup-evidence.json'));
  await fs.access(path.join(result.bundleRoot, 'media', 'blob-map', 'blob-map.json'));
  await fs.access(path.join(result.bundleRoot, 'media', 'blobs', 'ice', 'hero-placeholder.txt'));
  await fs.access(path.join(result.bundleRoot, 'tenants', 'ice-rink-rentals', 'sites', 'ice-rink-rentals', 'tenant-website-bundle-manifest.json'));
});

test('restore-plan passes in production proof mode for fake complete Ice Cosmos/media bundle', async () => {
  const backup = await createIceFakeCompleteBundle('test-ice-fake-complete-restore-bundle');
  await clean('test-ice-fake-complete-plan');
  const result = await createRestorePlan({
    bundlePath: backup.bundleRoot,
    outputPath: '.tmp/test-ice-fake-complete-plan',
    mode: 'production-restore-proof',
    overwrite: true,
    now: fixedDate
  });
  assert.equal(result.plan.status, 'passed');
  assert.equal(result.plan.mode, 'production-restore-proof');
  assert.equal(result.plan.inventoryCounts.cosmosRecordSets, 9);
  assert.equal(result.plan.inventoryCounts.cosmosRecords, 13);
  assert.equal(result.plan.inventoryCounts.mediaCopiedBlobs, 2);
  assert(
    result.plan.plannedSteps.some((step) => step.stepId === 'plan-cosmos-portable-json-restore' && step.status === 'complete')
  );
  assert(
    result.plan.plannedSteps.some((step) => step.stepId === 'plan-media-blob-restore' && step.status === 'complete')
  );
  await assertRestoreOutputFiles(result.outputRoot);
});

test('proof validator fails baseline bundle when Cosmos/media proof is required', async () => {
  const result = await createTenantBundle('test-proof-missing-baseline');
  const validation = await validateBackupBundle({
    bundlePath: result.bundleRoot,
    mode: 'production-restore-proof'
  });
  assert.equal(validation.status, 'failed');
  assert(validation.failures.some((failure) => failure.code === 'COSMOS_EXPORT_MISSING'));
  assert(validation.failures.some((failure) => failure.code === 'MEDIA_BLOB_COPY_MISSING'));
});

test('proof validator fails when fake Cosmos export manifest is missing', async () => {
  const result = await createIceFakeCompleteBundle('test-proof-missing-cosmos');
  await fs.rm(path.join(result.bundleRoot, 'database', 'cosmos-json', 'export-manifest.json'));
  const validation = await validateBackupBundle({
    bundlePath: result.bundleRoot,
    mode: 'production-restore-proof'
  });
  assert.equal(validation.status, 'failed');
  assert(validation.failures.some((failure) => failure.code === 'COSMOS_EXPORT_MISSING'));
});

test('proof validator fails when a fake copied media blob is missing', async () => {
  const result = await createIceFakeCompleteBundle('test-proof-missing-media');
  await fs.rm(path.join(result.bundleRoot, 'media', 'blobs', 'ice', 'hero-placeholder.txt'));
  const validation = await validateBackupBundle({
    bundlePath: result.bundleRoot,
    mode: 'production-restore-proof'
  });
  assert.equal(validation.status, 'failed');
  assert(validation.failures.some((failure) => failure.code === 'MEDIA_BLOB_COPY_MISSING'));
});

test('validator rejects secret-like values in fake connector output', async () => {
  const result = await createIceFakeCompleteBundle('test-proof-secret-like');
  const unsafeField = 'access_' + 'token';
  await fs.appendFile(
    path.join(result.bundleRoot, 'database', 'cosmos-json', 'containers', 'pages.json'),
    `\n{"${unsafeField}":"fixture-secret-like-value"}\n`,
    'utf8'
  );
  const validation = await validateBackupBundle({
    bundlePath: result.bundleRoot,
    mode: 'production-restore-proof'
  });
  assert.equal(validation.status, 'failed');
  assert(validation.failures.some((failure) => failure.code === 'SECRET_LIKE_VALUE'));
});

test('CLI restore-plan writes dry-run output for valid bundles', async () => {
  await createTenantBundle('test-restore-cli-bundle');
  await clean('test-restore-cli-plan');
  const outcome = await runCli([
    'src/backup-cli.mjs',
    'restore-plan',
    '--bundle',
    '.tmp/test-restore-cli-bundle',
    '--out',
    '.tmp/test-restore-cli-plan',
    '--overwrite'
  ]);
  assert.equal(outcome.code, 0);
  assert.match(outcome.stdout, /restore-plan: passed/);
  await assertRestoreOutputFiles(path.join(packageRoot, '.tmp', 'test-restore-cli-plan'));
});

test('output and validation path safety rejects paths outside .tmp and archive-style bundles', async () => {
  await assert.rejects(
    () =>
      createStandardBackup({
        answersPath: tenantAnswers,
        outputPath: '../unsafe-output',
        overwrite: true,
        now: fixedDate
      }),
    /output path must stay inside/
  );
  await assert.rejects(
    () => validateBackupBundle({ bundlePath: '../unsafe-bundle' }),
    /bundle path must stay inside/
  );
  await assert.rejects(
    () => validateBackupBundle({ bundlePath: '.tmp/test-bundle.zip' }),
    /archive outputs are blocked/
  );
});

test('source does not include external HTTP call patterns or protected config reads', async () => {
  const blockedSourcePattern = new RegExp(
    [
      'fe' + 'tch\\s*\\(',
      'http' + '\\.request',
      'https' + '\\.request',
      'Invoke-' + 'WebRequest',
      'appsettings' + '\\.Development',
      'local' + '\\.settings',
      '\\.env' + '\\.local'
    ].join('|'),
    'i'
  );
  const sourceFiles = [
    'src/backup-cli.mjs',
    'src/standard-backup-runner.mjs',
    'src/standard-bundle-writer.mjs',
    'src/adapters/fake-cms-content-adapter.mjs',
    'src/adapters/fake-config-inventory-adapter.mjs',
    'src/connectors/cosmos/fake-cosmos-export-adapter.mjs',
    'src/connectors/cosmos/cosmos-export-manifest.mjs',
    'src/connectors/cosmos/cosmos-platform-evidence-writer.mjs',
    'src/connectors/cosmos/cosmos-export-runner.mjs',
    'src/connectors/media/fake-media-copy-adapter.mjs',
    'src/connectors/media/media-copy-manifest.mjs',
    'src/connectors/media/media-checksum-writer.mjs',
    'src/connectors/media/media-copy-runner.mjs',
    'src/bundles/tenant-website-bundle-writer.mjs',
    'src/restore/restore-plan-runner.mjs',
    'src/restore/restore-plan-writer.mjs',
    'src/restore/restore-inventory-reader.mjs',
    'src/restore/restore-count-comparator.mjs',
    'src/restore/restore-target-safety.mjs'
  ];
  for (const relativePath of sourceFiles) {
    const text = await fs.readFile(path.join(packageRoot, relativePath), 'utf8');
    assert.equal(blockedSourcePattern.test(text), false);
  }
});

test('.tmp output and production backup artifacts are ignored or blocked by package gitignore', async () => {
  const gitignore = await fs.readFile(path.join(packageRoot, '.gitignore'), 'utf8');
  assert.match(gitignore, /^\.tmp\/$/m);
  assert.match(gitignore, /^\*\.zip$/m);
  assert.match(gitignore, /^\*\.bacpac$/m);
  assert.match(gitignore, /^encrypted-secrets\.\*$/m);
  assert.match(gitignore, /^escrow-payload\*$/m);
});

async function assertRestoreOutputFiles(outputRoot) {
  await fs.access(path.join(outputRoot, 'restore-plan.json'));
  await fs.access(path.join(outputRoot, 'RESTORE_PLAN.md'));
  await fs.access(path.join(outputRoot, 'RESTORE_VALIDATION_RESULT.json'));
  await fs.access(path.join(outputRoot, 'RESTORE_VALIDATION_RESULT.md'));
  await fs.access(path.join(outputRoot, 'RESTORE_TARGET_NOT_WRITTEN.md'));
  const validation = await readJson(path.join(outputRoot, 'RESTORE_VALIDATION_RESULT.json'));
  assert.equal(validation.status, 'passed');
  assert.equal(validation.dryRunOnly, true);
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
