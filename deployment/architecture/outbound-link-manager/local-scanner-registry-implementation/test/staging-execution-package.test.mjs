import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { buildStagingExecutionPackage } from '../src/execution-package/staging-execution-package-builder.mjs';
import { inspectStagingExecutionPackage, validateStagingExecutionPackage } from '../src/execution-package/execution-package-validator.mjs';
import { readJson } from '../src/utils/json-writer.mjs';
import { packageRoot, tmpRoot } from '../src/utils/safe-paths.mjs';

const testRoot = path.join(tmpRoot, 'test-staging-execution-package');

test.before(async () => {
  await fs.rm(testRoot, { recursive: true, force: true });
});

test('execution package builder creates required files and validates', async () => {
  const result = await buildStagingExecutionPackage({
    sourcePath: 'fixtures/execution-package-source.fixture.json',
    outputPath: '.tmp/test-staging-execution-package/package',
    overwrite: true
  });
  assert.equal(result.validation.status, 'passed');
  assert.equal(result.summary.expectedRecordCount, 48);
  assert.equal(result.summary.providerMode, 'staging-simulated');
  assert.equal(result.summary.futureExplicitStagingWriteApprovalRequired, true);
  assert.equal(result.summary.realStagingProviderWritePerformed, false);

  for (const file of [
    'EXECUTION_PACKAGE_MANIFEST.json',
    'STAGING_TARGET_WORKSHEET.md',
    'PROVIDER_CAPABILITY_REVIEW.md',
    'RESOURCE_REGISTRY_REVIEW.md',
    'BACKUP_CENTER_PRE_EXECUTION_REVIEW.md',
    'FIRST_WRITE_BATCH_PLAN.md',
    'APPROVAL_MANIFEST.json',
    'OPERATOR_CHECKLIST.md',
    'READBACK_VERIFICATION_PLAN.md',
    'ABORT_ROLLBACK_CHECKLIST.md',
    'NO_GO_CONDITIONS.md',
    'VALIDATION_RESULT.json',
    'VALIDATION_RESULT.md',
    'checksums.sha256'
  ]) {
    await fs.access(path.join(result.outputRoot, file));
  }
});

test('approval manifest requires future approval and records no write', async () => {
  const packagePath = '.tmp/test-staging-execution-package/package';
  const approval = await readJson(path.join(packageRoot, packagePath, 'APPROVAL_MANIFEST.json'));
  assert.equal(approval.futureExplicitStagingWriteApprovalRequired, true);
  assert.equal(approval.futureApprovalGranted, false);
  assert.equal(approval.realStagingProviderWritePerformed, false);
  assert.equal(approval.productionDatabaseMigrationPerformed, false);
  assert.equal(approval.firstWriteBatch.expectedRecordCount, 48);
  assert.equal(approval.firstWriteBatch.targetEntities.some((item) => item.targetEntity === 'outbound_links' && item.expectedCount === 5), true);
});

test('first-write, readback, rollback, and no-go files contain required execution gates', async () => {
  const packagePath = path.join(packageRoot, '.tmp/test-staging-execution-package/package');
  const firstWrite = await fs.readFile(path.join(packagePath, 'FIRST_WRITE_BATCH_PLAN.md'), 'utf8');
  const readback = await fs.readFile(path.join(packagePath, 'READBACK_VERIFICATION_PLAN.md'), 'utf8');
  const rollback = await fs.readFile(path.join(packagePath, 'ABORT_ROLLBACK_CHECKLIST.md'), 'utf8');
  const noGo = await fs.readFile(path.join(packagePath, 'NO_GO_CONDITIONS.md'), 'utf8');
  assert.match(firstWrite, /Target entity/);
  assert.match(firstWrite, /outbound_links/);
  assert.match(readback, /expected record count: 48/);
  assert.match(rollback, /Abort triggers/);
  assert.match(noGo, /future explicit staging write approval is missing/);
});

test('missing runtime QA evidence fails validation', async () => {
  const result = await buildStagingExecutionPackage({
    sourcePath: 'fixtures/execution-package-missing-runtime-qa.fixture.json',
    outputPath: '.tmp/test-staging-execution-package/missing-runtime-qa',
    overwrite: true
  });
  assert.equal(result.validation.status, 'failed');
  assert.equal(result.validation.failures.some((failure) => failure.code === 'RUNTIME_QA_EVIDENCE_MISSING'), true);
});

test('missing Backup Center evidence fails validation', async () => {
  const result = await buildStagingExecutionPackage({
    sourcePath: 'fixtures/execution-package-missing-backup-check.fixture.json',
    outputPath: '.tmp/test-staging-execution-package/missing-backup',
    overwrite: true
  });
  assert.equal(result.validation.status, 'failed');
  assert.equal(result.validation.failures.some((failure) => failure.code === 'BACKUP_PRE_EXECUTION_MISSING'), true);
});

test('CLI validator and inspector accept generated package', async () => {
  const validation = await validateStagingExecutionPackage({
    packagePath: '.tmp/test-staging-execution-package/package'
  });
  assert.equal(validation.status, 'passed');
  const inspection = await inspectStagingExecutionPackage({
    packagePath: '.tmp/test-staging-execution-package/package'
  });
  assert.equal(inspection.status, 'passed');
  assert.equal(inspection.futureExplicitStagingWriteApprovalRequired, true);
  assert.equal(inspection.realStagingProviderWritePerformed, false);
});

test('execution package source does not include external calls or protected config reads', async () => {
  const sourceRoot = path.join(packageRoot, 'src/execution-package');
  const files = await fs.readdir(sourceRoot);
  const source = (await Promise.all(
    files.filter((file) => file.endsWith('.mjs')).map((file) => fs.readFile(path.join(sourceRoot, file), 'utf8'))
  )).join('\n');
  assert.equal(/fetch\(|node:http|node:https|axios|HttpClient|CosmosClient|BlobServiceClient/i.test(source), false);
  assert.equal(/process\.env|appsettings|local\.settings|connectionString|ConnectionString|listKeys/i.test(source), false);
});
