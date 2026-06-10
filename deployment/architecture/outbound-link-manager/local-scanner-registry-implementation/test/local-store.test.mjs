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
import { exportLocalStore } from '../src/store/store-exporter.mjs';
import { setLinkStatus } from '../src/lifecycle/link-status-service.mjs';
import { setInstanceStatus } from '../src/lifecycle/instance-status-service.mjs';
import { validateLocalStore } from '../src/validators/local-store-validator.mjs';
import { readJson, writeJson } from '../src/utils/json-writer.mjs';
import { packageRoot, tmpRoot } from '../src/utils/safe-paths.mjs';

const fixedNow = new Date('2026-06-10T00:00:00.000Z');
const testRoot = path.join(tmpRoot, 'test-local-store');

test('init empty store', async () => {
  const outputPath = '.tmp/test-local-store/init-empty';
  await writeFixtureStore(outputPath);
  const store = await readLocalStore(outputPath);
  assert.equal(store.tenant_id, 'fixture-tenant');
  assert.equal(store.site_id, 'fixture-site');
  assert.equal(store.links.length, 0);
  assert.equal(store.instances.length, 0);
  assert.equal(store.policies.length, 1);
  const validation = await validateLocalStore({ storePath: outputPath });
  assert.equal(validation.status, 'passed');
});

test('merge first scan into empty store', async () => {
  const mergedPath = await buildMergedTenantBundleStore('merge-first');
  const store = await readLocalStore(mergedPath);
  assert.equal(store.links.length, 5);
  assert.equal(store.instances.length, 5);
  assert.equal(store.scanRuns.length, 1);
  assert.equal(store.auditLogs.some((log) => log.action === 'scan_merged'), true);
  assert.equal(store.links.every((link) => link.last_detected_at === fixedNow.toISOString()), true);
});

test('merge duplicate scan idempotently', async () => {
  const firstPath = await buildMergedTenantBundleStore('merge-idempotent-first');
  await runScanToTmp('tenant-bundle.fixture.json', 'merge-idempotent-scan-again');
  const secondPath = '.tmp/test-local-store/merge-idempotent-second';
  const result = await mergeScanIntoStore({
    storePath: firstPath,
    scanPath: '.tmp/test-local-store/merge-idempotent-scan-again',
    outputPath: secondPath,
    overwrite: true,
    now: fixedNow
  });
  const store = await readLocalStore(secondPath);
  assert.equal(result.summary.linkCount, 5);
  assert.equal(store.links.length, 5);
  assert.equal(store.instances.length, 5);
  assert.equal(store.scanRuns.length, 1);
  assert.equal(store.links.every((link) => link.detection_count === 2), true);
});

test('merge same URL multiple instances', async () => {
  const storePath = await buildMergedStoreFromFixture('same-url-multiple-pages.fixture.json', 'same-url-pages');
  const store = await readLocalStore(storePath);
  assert.equal(store.links.length, 1);
  assert.equal(store.instances.length, 2);
  assert.deepEqual(new Set(store.instances.map((item) => item.page_id)), new Set(['home', 'about']));
});

test('set global link status and write audit log', async () => {
  const mergedPath = await buildMergedTenantBundleStore('set-link-base');
  const disabledPath = '.tmp/test-local-store/set-link-disabled';
  const result = await setLinkStatus({
    storePath: mergedPath,
    outputPath: disabledPath,
    linkDomain: 'partner.example',
    status: 'disabled',
    reason: 'local fixture test',
    overwrite: true,
    now: fixedNow
  });
  assert.equal(result.link.status, 'disabled');
  const store = await readLocalStore(disabledPath);
  assert.equal(store.auditLogs.at(-1).action, 'link_status_changed');
  assert.equal(store.auditLogs.at(-1).reason, 'local fixture test');
  assert.equal((await validateLocalStore({ storePath: disabledPath })).status, 'passed');
});

test('set instance status and write audit log', async () => {
  const mergedPath = await buildMergedTenantBundleStore('set-instance-base');
  const store = await readLocalStore(mergedPath);
  const target = store.instances.find((instance) => instance.status === 'enabled');
  const outputPath = '.tmp/test-local-store/set-instance-plain-text';
  const result = await setInstanceStatus({
    storePath: mergedPath,
    outputPath,
    instanceId: target.id,
    status: 'plain_text',
    reason: 'local fixture test',
    overwrite: true,
    now: fixedNow
  });
  assert.equal(result.instance.status, 'plain_text');
  assert.equal(result.instance.is_enabled, false);
  const nextStore = await readLocalStore(outputPath);
  assert.equal(nextStore.auditLogs.at(-1).action, 'instance_status_changed');
});

test('apply blocked domain policy', async () => {
  const mergedPath = await buildMergedTenantBundleStore('policy-base');
  const outputPath = '.tmp/test-local-store/policy-blocked';
  const policy = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'set-policy',
    '--store',
    mergedPath,
    '--policy',
    'fixtures/policy-blocked-domain.fixture.json',
    '--out',
    outputPath,
    '--overwrite'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(policy.status, 0, policy.stderr);
  assert.match(policy.stdout, /validation: passed/);
  const store = await readLocalStore(outputPath);
  const blockedLink = store.links.find((link) => link.domain === 'partner.example');
  assert.equal(blockedLink.status, 'domain_blocked');
  const blockedInstances = store.instances.filter((instance) => instance.outbound_link_id === blockedLink.id);
  assert.equal(blockedInstances.every((instance) => instance.status !== 'enabled'), true);
});

test('export store for tenant bundle compatibility', async () => {
  const mergedPath = await buildMergedTenantBundleStore('export-base');
  const exportPath = '.tmp/test-local-store/exported-store';
  const result = await exportLocalStore({
    storePath: mergedPath,
    outputPath: exportPath,
    overwrite: true,
    now: fixedNow
  });
  assert.equal(result.summary.linkCount, 5);
  const manifest = await readJson(path.join(result.outputRoot, 'EXPORT_MANIFEST.json'));
  assert.equal(manifest.boundaries.backup_zip_created, false);
  const tenantBundleLinks = await readJson(path.join(result.outputRoot, 'tenant-bundle/outbound-links/outbound-links.json'));
  const backupLinks = await readJson(path.join(result.outputRoot, 'backup-candidate/cms-content/outbound-links.json'));
  assert.equal(tenantBundleLinks.outbound_links.length, 5);
  assert.equal(backupLinks.outbound_links.length, 5);
});

test('validate store catches orphan instance', async () => {
  const storePath = await buildMergedTenantBundleStore('invalid-orphan-base');
  const invalidPath = path.join(testRoot, 'invalid-orphan');
  await copyDirectory(path.join(packageRoot, storePath), invalidPath);
  const instancesPath = path.join(invalidPath, 'outbound-link-instances.json');
  const envelope = await readJson(instancesPath);
  envelope.outbound_link_instances[0].outbound_link_id = 'missing';
  await writeJson(instancesPath, envelope);
  const validation = await validateLocalStore({ storePath: '.tmp/test-local-store/invalid-orphan' });
  assert.equal(validation.status, 'failed');
  assert.equal(validation.failures.some((failure) => failure.code === 'INSTANCE_LINK_REFERENCE_MISSING'), true);
});

test('validate store catches bad status', async () => {
  const storePath = await buildMergedTenantBundleStore('invalid-status-base');
  const invalidPath = path.join(testRoot, 'invalid-status');
  await copyDirectory(path.join(packageRoot, storePath), invalidPath);
  const linksPath = path.join(invalidPath, 'outbound-links.json');
  const envelope = await readJson(linksPath);
  envelope.outbound_links[0].status = 'mystery';
  await writeJson(linksPath, envelope);
  const validation = await validateLocalStore({ storePath: '.tmp/test-local-store/invalid-status' });
  assert.equal(validation.status, 'failed');
  assert.equal(validation.failures.some((failure) => failure.code === 'OUTBOUND_LINK_STATUS_INVALID'), true);
});

test('validate store catches tenant mismatch', async () => {
  const storePath = await buildMergedTenantBundleStore('invalid-tenant-base');
  const invalidPath = path.join(testRoot, 'invalid-tenant');
  await copyDirectory(path.join(packageRoot, storePath), invalidPath);
  const linksPath = path.join(invalidPath, 'outbound-links.json');
  const envelope = await readJson(linksPath);
  envelope.outbound_links[0].tenant_id = 'other-tenant';
  await writeJson(linksPath, envelope);
  const validation = await validateLocalStore({ storePath: '.tmp/test-local-store/invalid-tenant' });
  assert.equal(validation.status, 'failed');
  assert.equal(validation.failures.some((failure) => failure.code === 'TENANT_SCOPE_MISMATCH'), true);
});

test('validate store catches secret-like value', async () => {
  const storePath = await buildMergedTenantBundleStore('invalid-secret-base');
  const invalidPath = path.join(testRoot, 'invalid-secret');
  await copyDirectory(path.join(packageRoot, storePath), invalidPath);
  const linksPath = path.join(invalidPath, 'outbound-links.json');
  const envelope = await readJson(linksPath);
  envelope.outbound_links[0].disabled_reason = ['Bearer', 'abcdefghijklmnopqrstuvwxyz'].join(' ');
  await writeJson(linksPath, envelope);
  const validation = await validateLocalStore({ storePath: '.tmp/test-local-store/invalid-secret' });
  assert.equal(validation.status, 'failed');
  assert.equal(validation.failures.some((failure) => failure.code === 'SECRET_LIKE_VALUE_DETECTED'), true);
});

test('local store CLI commands work without live calls', async () => {
  const init = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'init-store',
    '--tenant',
    'fixture-tenant',
    '--site',
    'fixture-site',
    '--out',
    '.tmp/test-local-store/cli-store',
    '--overwrite'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(init.status, 0, init.stderr);
  assert.match(init.stdout, /validation: passed/);

  const scan = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'scan',
    '--fixture',
    'fixtures/tenant-bundle.fixture.json',
    '--out',
    '.tmp/test-local-store/cli-scan',
    '--overwrite'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(scan.status, 0, scan.stderr);

  const merge = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'merge-scan',
    '--store',
    '.tmp/test-local-store/cli-store',
    '--scan',
    '.tmp/test-local-store/cli-scan',
    '--out',
    '.tmp/test-local-store/cli-merged',
    '--overwrite'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(merge.status, 0, merge.stderr);
  assert.match(merge.stdout, /links: 5/);

  const validate = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'validate-store',
    '--store',
    '.tmp/test-local-store/cli-merged'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(validate.status, 0, validate.stderr);
  assert.match(validate.stdout, /validation: passed/);

  const inspect = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'inspect-store',
    '--store',
    '.tmp/test-local-store/cli-merged'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(inspect.status, 0, inspect.stderr);
  assert.match(inspect.stdout, /links: 5/);
});

test('store source does not include external calls or protected config reads', async () => {
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

async function buildMergedTenantBundleStore(name) {
  return buildMergedStoreFromFixture('tenant-bundle.fixture.json', name);
}

async function buildMergedStoreFromFixture(fixtureName, name) {
  const storePath = `.tmp/test-local-store/${name}-store`;
  const scanPath = `.tmp/test-local-store/${name}-scan`;
  const mergedPath = `.tmp/test-local-store/${name}-merged`;
  await writeFixtureStore(storePath);
  await runScanToTmp(fixtureName, `${name}-scan`);
  await mergeScanIntoStore({
    storePath,
    scanPath,
    outputPath: mergedPath,
    overwrite: true,
    now: fixedNow
  });
  return mergedPath;
}

async function writeFixtureStore(outputPath) {
  const store = createEmptyLocalStore({
    tenantId: 'fixture-tenant',
    siteId: 'fixture-site',
    now: fixedNow,
    policy: {
      id: 'policy_test_default',
      allowed_domains: ['example.com', 'partner.example', 'docs.example'],
      blocked_domains: [],
      pending_review_domains: [],
      review_required_for_new_domains: true,
      source: 'test'
    }
  });
  await writeLocalStore({
    store,
    outputPath,
    overwrite: true,
    now: fixedNow
  });
  return outputPath;
}

async function runScanToTmp(fixtureName, outputName) {
  return runScan({
    fixturePath: `fixtures/${fixtureName}`,
    outputPath: `.tmp/test-local-store/${outputName}`,
    overwrite: true,
    now: fixedNow
  });
}

async function copyDirectory(source, target) {
  await fs.rm(target, { recursive: true, force: true });
  await fs.cp(source, target, { recursive: true });
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
