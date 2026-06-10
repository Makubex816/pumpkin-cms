import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { runScan } from '../src/scan-runs/scan-run-writer.mjs';
import { createEmptyLocalStore } from '../src/store/local-store-initializer.mjs';
import { writeLocalStore } from '../src/store/local-store-writer.mjs';
import { readLocalStore } from '../src/store/local-store-reader.mjs';
import { mergeScanIntoStore } from '../src/store/store-merger.mjs';
import { setLinkStatus } from '../src/lifecycle/link-status-service.mjs';
import { runRenderFixture } from '../src/rendering/render-output-writer.mjs';
import { exportBackupCenter } from '../src/integrations/backup-center-export-writer.mjs';
import { validateBackupCenterExport } from '../src/integrations/backup-center-export-validator.mjs';
import { exportTenantBundle } from '../src/integrations/tenant-bundle-export-writer.mjs';
import { validateTenantBundle } from '../src/integrations/tenant-bundle-validator.mjs';
import { createOnboardingImport } from '../src/integrations/onboarding-import-writer.mjs';
import { validateOnboardingImport } from '../src/integrations/onboarding-import-validator.mjs';
import { simulateRestoreValidation } from '../src/integrations/restore-validation-simulator.mjs';
import { readJson } from '../src/utils/json-writer.mjs';
import { packageRoot, tmpRoot } from '../src/utils/safe-paths.mjs';

const fixedNow = new Date('2026-06-10T00:00:00.000Z');
const testRoot = path.join(tmpRoot, 'test-integration-export');

test('Backup Center export writes required files', async () => {
  const { storePath, renderPath } = await buildStoreAndRender('backup-files');
  const outputPath = '.tmp/test-integration-export/backup-files-export';
  const result = await exportBackupCenter({
    storePath,
    renderedPath: renderPath,
    outputPath,
    overwrite: true,
    now: fixedNow
  });
  const fixture = await readJson(path.join(packageRoot, 'fixtures/backup-center-export.fixture.json'));
  for (const file of fixture.required_files) {
    await fs.access(path.join(result.outputRoot, file));
  }
  assert.equal(result.validationReport.summary.renderDecisionCount, 5);
});

test('Backup Center export validates', async () => {
  const { storePath, renderPath } = await buildStoreAndRender('backup-validates');
  const outputPath = '.tmp/test-integration-export/backup-validates-export';
  await exportBackupCenter({ storePath, renderedPath: renderPath, outputPath, overwrite: true, now: fixedNow });
  const validation = await validateBackupCenterExport({ exportPath: outputPath });
  assert.equal(validation.status, 'passed');
  assert.equal(validation.summary.linkCount, 5);
  assert.equal(validation.summary.instanceCount, 5);
  assert.equal(validation.summary.renderDecisionCount, 5);
});

test('Tenant bundle export writes required files', async () => {
  const { storePath, renderPath } = await buildStoreAndRender('tenant-files');
  const outputPath = '.tmp/test-integration-export/tenant-files-export';
  const result = await exportTenantBundle({
    storePath,
    renderedPath: renderPath,
    outputPath,
    overwrite: true,
    now: fixedNow
  });
  const fixture = await readJson(path.join(packageRoot, 'fixtures/tenant-bundle-export.fixture.json'));
  for (const file of fixture.required_files) {
    await fs.access(path.join(result.outputRoot, file));
  }
});

test('Tenant bundle export validates', async () => {
  const { storePath, renderPath } = await buildStoreAndRender('tenant-validates');
  const outputPath = '.tmp/test-integration-export/tenant-validates-export';
  await exportTenantBundle({ storePath, renderedPath: renderPath, outputPath, overwrite: true, now: fixedNow });
  const validation = await validateTenantBundle({ bundlePath: outputPath });
  assert.equal(validation.status, 'passed');
  assert.equal(validation.summary.linkCount, 5);
  assert.equal(validation.summary.instanceCount, 5);
  assert.equal(validation.summary.renderDecisionCount, 5);
});

test('Onboarding import writes required files', async () => {
  const storePath = await buildTenantBundleStore('onboarding-files');
  const outputPath = '.tmp/test-integration-export/onboarding-files-import';
  const result = await createOnboardingImport({
    storePath,
    outputPath,
    overwrite: true,
    now: fixedNow
  });
  const required = [
    'outbound-links.expected.json',
    'outbound-link-policy.json',
    'external-domain-review.md',
    'outbound-link-validation-report.md'
  ];
  for (const file of required) {
    await fs.access(path.join(result.outputRoot, file));
  }
});

test('Valid onboarding import passes', async () => {
  const fixture = await readJson(path.join(packageRoot, 'fixtures/onboarding-import-valid.fixture.json'));
  const storePath = await buildTenantBundleStore('onboarding-valid');
  const outputPath = '.tmp/test-integration-export/onboarding-valid-import';
  await createOnboardingImport({ storePath, outputPath, overwrite: true, now: fixedNow });
  const validation = await validateOnboardingImport({ importPath: outputPath });
  assert.equal(validation.status, fixture.expected_status);
  assert.equal(validation.summary.failureCount, 0);
});

test('Unreviewed domain onboarding import fails as expected', async () => {
  const fixture = await readJson(path.join(packageRoot, 'fixtures/onboarding-import-unreviewed-domain.fixture.json'));
  const storePath = await buildPendingReviewStore('onboarding-unreviewed');
  const outputPath = '.tmp/test-integration-export/onboarding-unreviewed-import';
  await createOnboardingImport({ storePath, outputPath, overwrite: true, now: fixedNow });
  const validation = await validateOnboardingImport({ importPath: outputPath });
  assert.equal(validation.status, fixture.expected_status);
  assert.equal(validation.failures.some((failure) => fixture.expected_failures.includes(failure.code)), true);
});

test('Blocked domain onboarding import fails as expected', async () => {
  const fixture = await readJson(path.join(packageRoot, 'fixtures/onboarding-import-blocked-domain.fixture.json'));
  const storePath = await buildBlockedStore('onboarding-blocked');
  const outputPath = '.tmp/test-integration-export/onboarding-blocked-import';
  await createOnboardingImport({ storePath, outputPath, overwrite: true, now: fixedNow });
  const validation = await validateOnboardingImport({ importPath: outputPath });
  assert.equal(validation.status, fixture.expected_status);
  assert.equal(validation.failures.some((failure) => fixture.expected_failures.includes(failure.code)), true);
});

test('Restore simulation preserves link count', async () => {
  const { exportPath } = await buildBackupExport('restore-link-count');
  const result = await simulateRestoreValidation({
    exportPath,
    outputPath: '.tmp/test-integration-export/restore-link-count-result',
    overwrite: true,
    now: fixedNow
  });
  assert.equal(result.result.status, 'passed');
  assert.equal(result.result.checks.link_count_preserved, true);
});

test('Restore simulation preserves instance count', async () => {
  const { exportPath } = await buildBackupExport('restore-instance-count');
  const result = await simulateRestoreValidation({
    exportPath,
    outputPath: '.tmp/test-integration-export/restore-instance-count-result',
    overwrite: true,
    now: fixedNow
  });
  assert.equal(result.result.checks.instance_count_preserved, true);
});

test('Restore simulation preserves disabled statuses', async () => {
  const storePath = await buildDisabledStore('restore-disabled');
  const renderPath = await renderStore('restore-disabled-render', storePath);
  const exportPath = '.tmp/test-integration-export/restore-disabled-backup';
  await exportBackupCenter({ storePath, renderedPath: renderPath, outputPath: exportPath, overwrite: true, now: fixedNow });
  const result = await simulateRestoreValidation({
    exportPath,
    outputPath: '.tmp/test-integration-export/restore-disabled-result',
    overwrite: true,
    now: fixedNow
  });
  assert.equal(result.result.checks.disabled_statuses_preserved, true);
  assert.equal(result.result.summary.linksByStatus.disabled, 1);
});

test('Restore simulation preserves policy state', async () => {
  const { exportPath } = await buildBackupExport('restore-policy-state');
  const result = await simulateRestoreValidation({
    exportPath,
    outputPath: '.tmp/test-integration-export/restore-policy-state-result',
    overwrite: true,
    now: fixedNow
  });
  assert.equal(result.result.checks.policy_state_preserved, true);
});

test('Integration CLI commands work without live calls', async () => {
  const { storePath, renderPath } = await buildStoreAndRender('cli-integration');
  const backup = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'export-backup',
    '--store',
    storePath,
    '--rendered',
    renderPath,
    '--out',
    '.tmp/test-integration-export/cli-backup',
    '--overwrite'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(backup.status, 0, backup.stderr);
  assert.match(backup.stdout, /validation: passed/);

  const backupValidate = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'validate-backup-export',
    '--export',
    '.tmp/test-integration-export/cli-backup'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(backupValidate.status, 0, backupValidate.stderr);

  const tenantBundle = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'export-tenant-bundle',
    '--store',
    storePath,
    '--rendered',
    renderPath,
    '--out',
    '.tmp/test-integration-export/cli-tenant-bundle',
    '--overwrite'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(tenantBundle.status, 0, tenantBundle.stderr);

  const tenantValidate = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'validate-tenant-bundle',
    '--bundle',
    '.tmp/test-integration-export/cli-tenant-bundle'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(tenantValidate.status, 0, tenantValidate.stderr);

  const onboarding = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'create-onboarding-import',
    '--store',
    storePath,
    '--out',
    '.tmp/test-integration-export/cli-onboarding',
    '--overwrite'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(onboarding.status, 0, onboarding.stderr);

  const onboardingValidate = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'validate-onboarding-import',
    '--import',
    '.tmp/test-integration-export/cli-onboarding'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(onboardingValidate.status, 0, onboardingValidate.stderr);

  const restore = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'simulate-restore-validation',
    '--export',
    '.tmp/test-integration-export/cli-backup',
    '--out',
    '.tmp/test-integration-export/cli-restore',
    '--overwrite'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(restore.status, 0, restore.stderr);
  assert.match(restore.stdout, /status: passed/);
});

test('integration source does not include external calls or protected config reads', async () => {
  const sourceFiles = await listSourceFiles(path.join(packageRoot, 'src'));
  const protectedConfigPattern = [
    '\\.env\\.local',
    'appsettings\\.Development\\.json',
    'local\\.settings\\.json'
  ].join('|');
  const forbidden = new RegExp(`(fetch\\s*\\(|node:https|node:http|https\\.request|http\\.request|axios|${protectedConfigPattern})`, 'i');
  for (const file of sourceFiles) {
    const text = await fs.readFile(file, 'utf8');
    assert.equal(forbidden.test(text), false, `forbidden pattern in ${path.relative(packageRoot, file)}`);
  }
});

async function buildBackupExport(name) {
  const { storePath, renderPath } = await buildStoreAndRender(name);
  const exportPath = `.tmp/test-integration-export/${name}-backup`;
  await exportBackupCenter({ storePath, renderedPath: renderPath, outputPath: exportPath, overwrite: true, now: fixedNow });
  return { storePath, renderPath, exportPath };
}

async function buildStoreAndRender(name) {
  const storePath = await buildTenantBundleStore(name);
  const renderPath = await renderStore(`${name}-render`, storePath);
  return { storePath, renderPath };
}

async function buildTenantBundleStore(name) {
  return buildStoreFromScanFixture({
    fixtureName: 'tenant-bundle.fixture.json',
    name,
    policy: {
      id: `policy_${name}`,
      allowed_domains: ['example.com', 'partner.example', 'docs.example'],
      blocked_domains: [],
      pending_review_domains: [],
      review_required_for_new_domains: true,
      source: 'test'
    }
  });
}

async function buildPendingReviewStore(name) {
  return buildStoreFromScanFixture({
    fixtureName: 'import-package-unreviewed-domain.fixture.json',
    name,
    policy: {
      id: `policy_${name}`,
      allowed_domains: ['example.com'],
      blocked_domains: [],
      pending_review_domains: [],
      review_required_for_new_domains: true,
      source: 'test'
    }
  });
}

async function buildBlockedStore(name) {
  return buildStoreFromScanFixture({
    fixtureName: 'tenant-bundle.fixture.json',
    name,
    policy: {
      id: `policy_${name}`,
      allowed_domains: ['example.com', 'docs.example'],
      blocked_domains: ['partner.example'],
      pending_review_domains: [],
      review_required_for_new_domains: true,
      source: 'test'
    }
  });
}

async function buildDisabledStore(name) {
  const storePath = await buildTenantBundleStore(`${name}-base`);
  const disabledPath = `.tmp/test-integration-export/${name}-disabled-store`;
  await setLinkStatus({
    storePath,
    outputPath: disabledPath,
    linkDomain: 'partner.example',
    status: 'disabled',
    reason: 'restore simulation fixture',
    overwrite: true,
    now: fixedNow
  });
  return disabledPath;
}

async function buildStoreFromScanFixture({ fixtureName, name, policy }) {
  const storePath = `.tmp/test-integration-export/${name}-store`;
  const scanPath = `.tmp/test-integration-export/${name}-scan`;
  const mergedPath = `.tmp/test-integration-export/${name}-merged`;
  const store = createEmptyLocalStore({
    tenantId: 'fixture-tenant',
    siteId: 'fixture-site',
    now: fixedNow,
    policy
  });
  await writeLocalStore({ store, outputPath: storePath, overwrite: true, now: fixedNow });
  await runScan({
    fixturePath: `fixtures/${fixtureName}`,
    outputPath: scanPath,
    overwrite: true,
    now: fixedNow
  });
  await mergeScanIntoStore({
    storePath,
    scanPath,
    outputPath: mergedPath,
    overwrite: true,
    now: fixedNow
  });
  return mergedPath;
}

async function renderStore(name, storePath) {
  const outputPath = `.tmp/test-integration-export/${name}`;
  await runRenderFixture({
    fixturePath: 'fixtures/render-active-links.fixture.json',
    storePath,
    outputPath,
    overwrite: true,
    now: fixedNow
  });
  return outputPath;
}

async function listSourceFiles(root) {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const resolved = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listSourceFiles(resolved));
    } else if (entry.name.endsWith('.mjs')) {
      files.push(resolved);
    }
  }
  return files;
}
