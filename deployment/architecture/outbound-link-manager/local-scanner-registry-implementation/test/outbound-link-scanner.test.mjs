import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { runScan } from '../src/scan-runs/scan-run-writer.mjs';
import { readJson, writeJson } from '../src/utils/json-writer.mjs';
import { packageRoot, tmpRoot } from '../src/utils/safe-paths.mjs';
import { validateScanOutput } from '../src/validators/outbound-link-validator.mjs';
import { normalizeOutboundUrl } from '../src/registry/url-normalizer.mjs';

const testRoot = path.join(tmpRoot, 'test-outbound-link-scanner');
const fixedNow = new Date('2026-06-10T00:00:00.000Z');

test('no-link fixture produces zero outbound links and zero instances', async () => {
  const result = await scanFixtureToTmp('no-links.fixture.json', 'no-links');
  assert.equal(result.scanResult.outbound_links.length, 0);
  assert.equal(result.scanResult.outbound_link_instances.length, 0);
  const validation = await validateScanOutput({ scanPath: '.tmp/test-outbound-link-scanner/no-links' });
  assert.equal(validation.status, 'passed');
});

test('single-link fixture produces one normalized link and one instance while ignoring internal/contact links', async () => {
  const result = await scanFixtureToTmp('single-link.fixture.json', 'single-link');
  assert.equal(result.scanResult.outbound_links.length, 1);
  assert.equal(result.scanResult.outbound_link_instances.length, 1);
  assert.equal(result.scanResult.outbound_links[0].normalized_url, 'https://example.com/resources/rink-safety');
  assert.equal(result.scanResult.outbound_links[0].status, 'active');
  const ignored = await readJson(path.join(result.outputRoot, 'ignored-links.json'));
  assert.equal(ignored.ignored_links.some((item) => item.reason === 'internal_relative_url'), true);
  assert.equal(ignored.ignored_links.some((item) => item.reason === 'contact_link_not_web_outbound'), true);
});

test('duplicate URL fixture collapses registry to one link and creates multiple instances', async () => {
  const result = await scanFixtureToTmp('duplicate-url-multiple-fields.fixture.json', 'duplicate');
  assert.equal(result.scanResult.outbound_links.length, 1);
  assert.equal(result.scanResult.outbound_link_instances.length, 3);
  assert.equal(new Set(result.scanResult.outbound_link_instances.map((item) => item.location_path)).size, 3);
});

test('same URL across pages creates one link and multiple page-scoped instances', async () => {
  const result = await scanFixtureToTmp('same-url-multiple-pages.fixture.json', 'same-url-pages');
  assert.equal(result.scanResult.outbound_links.length, 1);
  assert.equal(result.scanResult.outbound_link_instances.length, 2);
  assert.deepEqual(new Set(result.scanResult.outbound_link_instances.map((item) => item.page_id)), new Set(['home', 'about']));
});

test('tenant bundle fixture scans page, navigation, footer, and theme fields', async () => {
  const result = await scanFixtureToTmp('tenant-bundle.fixture.json', 'tenant-bundle');
  assert.equal(result.scanResult.outbound_links.length, 5);
  assert.equal(result.scanResult.outbound_link_instances.length, 5);
  assert.equal(result.scanResult.ignoredLinks.some((item) => item.reason === 'internal_relative_url'), true);
});

test('import package unreviewed domain is marked pending review', async () => {
  const result = await scanFixtureToTmp('import-package-unreviewed-domain.fixture.json', 'import-package');
  assert.equal(result.scanResult.outbound_links.length, 1);
  assert.equal(result.scanResult.outbound_links[0].domain, 'vendor.example');
  assert.equal(result.scanResult.outbound_links[0].status, 'pending_review');
});

test('disabled global link remains disabled and creates disabled instance', async () => {
  const result = await scanFixtureToTmp('disabled-global-link.fixture.json', 'disabled-global');
  assert.equal(result.scanResult.outbound_links[0].status, 'disabled');
  assert.equal(result.scanResult.outbound_link_instances[0].status, 'disabled');
  assert.equal(result.scanResult.outbound_link_instances[0].is_enabled, false);
});

test('disabled specific instance preserves plain-text instance status while global link stays active', async () => {
  const result = await scanFixtureToTmp('disabled-specific-instance.fixture.json', 'disabled-instance');
  assert.equal(result.scanResult.outbound_links[0].status, 'active');
  assert.equal(result.scanResult.outbound_link_instances[0].status, 'plain_text');
  assert.equal(result.scanResult.outbound_link_instances[0].is_enabled, false);
});

test('blocked domain fixture marks link as domain_blocked and instance pending review', async () => {
  const result = await scanFixtureToTmp('blocked-domain.fixture.json', 'blocked-domain');
  assert.equal(result.scanResult.outbound_links[0].status, 'domain_blocked');
  assert.equal(result.scanResult.outbound_link_instances[0].status, 'pending_review');
});

test('stale fixture retains prior link and marks prior instance stale', async () => {
  const result = await scanFixtureToTmp('stale-instance.fixture.json', 'stale');
  assert.equal(result.scanResult.outbound_links.length, 1);
  assert.equal(result.scanResult.outbound_links[0].status, 'stale');
  assert.equal(result.scanResult.outbound_link_instances.length, 1);
  assert.equal(result.scanResult.outbound_link_instances[0].status, 'stale');
  assert.equal(result.scanResult.scan_run.stale_instances_found, 1);
});

test('URL normalizer lowercases scheme and host, strips fragments, preserves path and query, and rejects non-web URLs', () => {
  assert.deepEqual(normalizeOutboundUrl('HTTPS://Example.COM:443/Path?B=2#frag'), {
    status: 'normalized',
    original_url: 'HTTPS://Example.COM:443/Path?B=2#frag',
    normalized_url: 'https://example.com/Path?B=2',
    domain: 'example.com'
  });
  assert.equal(normalizeOutboundUrl('/contact').reason, 'internal_relative_url');
  assert.equal(normalizeOutboundUrl('mailto:hello@example.com').reason, 'contact_link_not_web_outbound');
  assert.equal(normalizeOutboundUrl('https://user@example.com/secret').reason, 'embedded_credentials_rejected');
});

test('validator rejects malformed instance references', async () => {
  const outputRoot = path.join(testRoot, 'invalid-reference');
  await fs.rm(outputRoot, { recursive: true, force: true });
  await fs.mkdir(outputRoot, { recursive: true });
  await writeJson(path.join(outputRoot, 'outbound-links.json'), {
    schemaVersion: '0.1.0',
    tenant_id: 'fixture-tenant',
    site_id: 'fixture-site',
    outbound_links: []
  });
  await writeJson(path.join(outputRoot, 'outbound-link-instances.json'), {
    schemaVersion: '0.1.0',
    tenant_id: 'fixture-tenant',
    site_id: 'fixture-site',
    outbound_link_instances: [
      {
        schemaVersion: '0.1.0',
        id: 'bad',
        tenant_id: 'fixture-tenant',
        site_id: 'fixture-site',
        outbound_link_id: 'missing',
        page_id: 'home',
        content_type: 'page',
        content_block_id: null,
        field_name: 'url',
        anchor_text: 'Bad',
        location_path: 'pages/home/url',
        is_enabled: true,
        status: 'enabled',
        first_detected_at: '2026-06-10T00:00:00.000Z',
        last_detected_at: '2026-06-10T00:00:00.000Z'
      }
    ]
  });
  await writeJson(path.join(outputRoot, 'outbound-link-scan-run.json'), {
    schemaVersion: '0.1.0',
    id: 'scan_invalid',
    tenant_id: 'fixture-tenant',
    site_id: 'fixture-site',
    mode: 'local-fixture',
    status: 'completed',
    started_at: '2026-06-10T00:00:00.000Z',
    completed_at: '2026-06-10T00:00:00.000Z',
    pages_scanned: 1,
    links_found: 1,
    new_links_found: 0,
    stale_instances_found: 0,
    errors: []
  });
  const validation = await validateScanOutput({ scanPath: '.tmp/test-outbound-link-scanner/invalid-reference' });
  assert.equal(validation.status, 'failed');
  assert.equal(validation.failures.some((failure) => failure.code === 'INSTANCE_LINK_REFERENCE_MISSING'), true);
});

test('scan refuses output outside package .tmp', async () => {
  await assert.rejects(
    () => runScan({
      fixturePath: 'fixtures/single-link.fixture.json',
      outputPath: 'not-tmp/single',
      overwrite: true,
      now: fixedNow
    }),
    /generated output must resolve inside \.tmp/
  );
});

test('CLI scan, validate, and inspect commands work without live calls', async () => {
  const scan = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'scan',
    '--fixture',
    'fixtures/single-link.fixture.json',
    '--out',
    '.tmp/test-outbound-link-scanner/cli-single',
    '--overwrite'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(scan.status, 0, scan.stderr);
  assert.match(scan.stdout, /scan: passed/);

  const validate = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'validate',
    '--scan',
    '.tmp/test-outbound-link-scanner/cli-single'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(validate.status, 0, validate.stderr);
  assert.match(validate.stdout, /validation: passed/);

  const inspect = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'inspect',
    '--scan',
    '.tmp/test-outbound-link-scanner/cli-single'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(inspect.status, 0, inspect.stderr);
  assert.match(inspect.stdout, /links: 1/);
});

test('source does not include external HTTP client or protected config read patterns', async () => {
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

async function scanFixtureToTmp(fixtureName, outputName) {
  return runScan({
    fixturePath: `fixtures/${fixtureName}`,
    outputPath: `.tmp/test-outbound-link-scanner/${outputName}`,
    overwrite: true,
    now: fixedNow
  });
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
