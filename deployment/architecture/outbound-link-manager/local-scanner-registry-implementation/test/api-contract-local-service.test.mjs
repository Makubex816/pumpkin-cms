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
import { listOutboundLinks } from '../src/api/services/outbound-link-query-service.mjs';
import { getOutboundLink } from '../src/api/services/outbound-link-detail-service.mjs';
import { listOutboundLinkInstances } from '../src/api/services/outbound-link-instance-service.mjs';
import { listOutboundLinkPolicies } from '../src/api/services/outbound-link-policy-service.mjs';
import { listOutboundLinkScanRuns } from '../src/api/services/outbound-link-scan-run-service.mjs';
import { listOutboundLinkAuditLogs } from '../src/api/services/outbound-link-audit-service.mjs';
import { getOutboundLinkDashboardSummary } from '../src/api/services/outbound-link-dashboard-service.mjs';
import { requestBulkAction, requestSetLinkStatus } from '../src/api/services/write-action-guard-service.mjs';
import { validateApiResponse } from '../src/validators/api-response-validator.mjs';
import { readJson, writeJson } from '../src/utils/json-writer.mjs';
import { packageRoot, tmpRoot } from '../src/utils/safe-paths.mjs';

const fixedNow = new Date('2026-06-10T00:00:00.000Z');
const testRoot = path.join(tmpRoot, 'test-api-contract-local-service');
const storePath = '.tmp/test-api-contract-local-service/local-store-merged';
const query = {
  tenantKey: 'fixture-tenant',
  siteKey: 'fixture-site',
  page: 1,
  pageSize: 10
};
const superAdmin = {
  role: 'SuperAdmin',
  assignedTenants: []
};
const viewer = {
  role: 'Viewer',
  assignedTenants: ['fixture-tenant'],
  assignedSites: ['fixture-site']
};
const tenantAdmin = {
  role: 'TenantAdmin',
  assignedTenants: ['fixture-tenant'],
  assignedSites: ['fixture-site']
};

test.before(async () => {
  await fs.rm(testRoot, { recursive: true, force: true });
  await buildApiFixtureStore();
});

test('list links returns expected records', async () => {
  const response = await listOutboundLinks({ storePath, query, actor: superAdmin });
  assert.equal(response.ok, true);
  assert.equal(response.code, 'OK');
  assert.equal(response.data.items.length, 5);
  assert.equal(response.meta.pagination.totalItems, 5);
  assert.equal(response.tenantKey, 'fixture-tenant');
  assert.equal(response.siteKey, 'fixture-site');
});

test('filter by domain returns expected records', async () => {
  const response = await listOutboundLinks({
    storePath,
    query: { ...query, domain: 'partner.example' },
    actor: superAdmin
  });
  assert.equal(response.ok, true);
  assert.equal(response.data.items.length, 1);
  assert.equal(response.data.items[0].domain, 'partner.example');
});

test('pagination returns expected metadata', async () => {
  const response = await listOutboundLinks({
    storePath,
    query: { ...query, pageSize: 2 },
    actor: superAdmin
  });
  assert.equal(response.ok, true);
  assert.equal(response.data.items.length, 2);
  assert.equal(response.meta.pagination.totalItems, 5);
  assert.equal(response.meta.pagination.totalPages, 3);
  assert.equal(response.meta.pagination.hasNextPage, true);
});

test('sort by domain works', async () => {
  const response = await listOutboundLinks({
    storePath,
    query: { ...query, sort: 'domain', sortDirection: 'asc' },
    actor: superAdmin
  });
  const domains = response.data.items.map((item) => item.domain);
  assert.deepEqual(domains, [...domains].sort());
});

test('get link detail returns instances', async () => {
  const list = await listOutboundLinks({ storePath, query: { ...query, domain: 'partner.example' }, actor: superAdmin });
  const response = await getOutboundLink({
    storePath,
    linkId: list.data.items[0].id,
    query,
    actor: superAdmin
  });
  assert.equal(response.ok, true);
  assert.equal(response.data.link.domain, 'partner.example');
  assert.equal(response.data.instances.length, 1);
  assert.equal(response.data.activePolicy.id, 'policy_test_default');
});

test('list instances works', async () => {
  const response = await listOutboundLinkInstances({
    storePath,
    query: { ...query, pageId: 'home' },
    actor: superAdmin
  });
  assert.equal(response.ok, true);
  assert.equal(response.data.items.length, 2);
  assert.equal(response.data.items.every((instance) => instance.pageId === 'home'), true);
});

test('list policies works', async () => {
  const response = await listOutboundLinkPolicies({ storePath, query, actor: superAdmin });
  assert.equal(response.ok, true);
  assert.equal(response.data.items.length, 1);
  assert.equal(response.data.activePolicyId, 'policy_test_default');
});

test('list scan runs works', async () => {
  const response = await listOutboundLinkScanRuns({ storePath, query, actor: superAdmin });
  assert.equal(response.ok, true);
  assert.equal(response.data.items.length, 1);
  assert.equal(response.data.items[0].status, 'completed');
});

test('list audit logs works', async () => {
  const response = await listOutboundLinkAuditLogs({ storePath, query, actor: superAdmin });
  assert.equal(response.ok, true);
  assert.equal(response.data.items.some((item) => item.action === 'scan_merged'), true);
});

test('dashboard summary returns counts', async () => {
  const response = await getOutboundLinkDashboardSummary({ storePath, query, actor: superAdmin });
  assert.equal(response.ok, true);
  assert.equal(response.data.linkCount, 5);
  assert.equal(response.data.instanceCount, 5);
  assert.equal(response.data.domainCount, 3);
});

test('tenant admin denied for wrong tenant', async () => {
  const response = await listOutboundLinks({
    storePath,
    query,
    actor: {
      role: 'TenantAdmin',
      assignedTenants: ['other-tenant']
    }
  });
  assert.equal(response.ok, false);
  assert.equal(response.code, 'OUTBOUND_LINK_FORBIDDEN_TENANT');
});

test('viewer read-only allowed', async () => {
  const response = await listOutboundLinks({ storePath, query, actor: viewer });
  assert.equal(response.ok, true);
  assert.equal(response.data.items.length, 5);
});

test('write action guard blocks writes without mutating local store', async () => {
  const before = await readLocalStore(storePath);
  const response = await requestSetLinkStatus({ storePath, query, actor: tenantAdmin });
  const after = await readLocalStore(storePath);
  assert.equal(response.ok, false);
  assert.equal(response.code, 'OUTBOUND_LINK_WRITE_NOT_APPROVED');
  assert.equal(response.meta.localStoreMutation, false);
  assert.deepEqual(after.links, before.links);
  assert.deepEqual(after.auditLogs, before.auditLogs);
});

test('bulk write guard blocks writes', async () => {
  const response = await requestBulkAction({ storePath, query, actor: tenantAdmin });
  assert.equal(response.ok, false);
  assert.equal(response.code, 'OUTBOUND_LINK_WRITE_NOT_APPROVED');
});

test('invalid filter returns error', async () => {
  const response = await listOutboundLinks({
    storePath,
    query: { ...query, unknownFilter: 'x' },
    actor: superAdmin
  });
  assert.equal(response.ok, false);
  assert.equal(response.code, 'OUTBOUND_LINK_INVALID_FILTER');
});

test('invalid pagination returns error', async () => {
  const response = await listOutboundLinks({
    storePath,
    query: { ...query, page: 0 },
    actor: superAdmin
  });
  assert.equal(response.ok, false);
  assert.equal(response.code, 'OUTBOUND_LINK_INVALID_PAGINATION');
});

test('validator accepts valid response and rejects malformed response', async () => {
  const response = await listOutboundLinks({ storePath, query, actor: superAdmin });
  const validRoot = '.tmp/test-api-contract-local-service/validator-valid';
  await writeJson(path.join(packageRoot, validRoot, 'API_RESPONSE.json'), response);
  const valid = await validateApiResponse({ responsePath: validRoot });
  assert.equal(valid.status, 'passed');

  const malformedRoot = '.tmp/test-api-contract-local-service/validator-malformed';
  await writeJson(path.join(packageRoot, malformedRoot, 'API_RESPONSE.json'), {
    ok: true,
    status: 500,
    code: 'OK'
  });
  const malformed = await validateApiResponse({ responsePath: malformedRoot });
  assert.equal(malformed.status, 'failed');
  assert.equal(malformed.failures.some((failure) => failure.code === 'API_RESPONSE_FIELD_MISSING'), true);
});

test('CLI API commands work locally and write under .tmp', async () => {
  const list = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'api-list-links',
    '--store',
    storePath,
    '--tenant',
    'fixture-tenant',
    '--site',
    'fixture-site',
    '--out',
    '.tmp/test-api-contract-local-service/cli-list-links'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(list.status, 0, list.stderr);
  assert.match(list.stdout, /code: OK/);
  const listResponse = await readJson(path.join(testRoot, 'cli-list-links/API_RESPONSE.json'));
  assert.equal(listResponse.data.items.length, 5);

  const dashboard = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'api-dashboard-summary',
    '--store',
    storePath,
    '--tenant',
    'fixture-tenant',
    '--site',
    'fixture-site',
    '--out',
    '.tmp/test-api-contract-local-service/cli-dashboard-summary'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(dashboard.status, 0, dashboard.stderr);
  assert.match(dashboard.stdout, /code: OK/);

  const blocked = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'api-request-write',
    '--store',
    storePath,
    '--action',
    'set-link-status',
    '--tenant',
    'fixture-tenant',
    '--site',
    'fixture-site',
    '--out',
    '.tmp/test-api-contract-local-service/cli-write-blocked'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(blocked.status, 0, blocked.stderr);
  assert.match(blocked.stdout, /OUTBOUND_LINK_WRITE_NOT_APPROVED/);

  const validate = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'validate-api-response',
    '--response',
    '.tmp/test-api-contract-local-service/cli-list-links'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(validate.status, 0, validate.stderr);
  assert.match(validate.stdout, /validation: passed/);
});

test('API contract source does not include external calls or protected config reads', async () => {
  const sourceFiles = await listSourceFiles(path.join(packageRoot, 'src/api'));
  sourceFiles.push(path.join(packageRoot, 'src/validators/api-response-validator.mjs'));
  const forbidden = /(fetch\s*\(|node:https|node:http|https\.request|http\.request|axios|\.env\.local|appsettings\.Development\.json|local\.settings\.json)/i;
  for (const file of sourceFiles) {
    const text = await fs.readFile(file, 'utf8');
    assert.equal(forbidden.test(text), false, `forbidden pattern in ${path.relative(packageRoot, file)}`);
  }
});

async function buildApiFixtureStore() {
  const emptyPath = '.tmp/test-api-contract-local-service/local-store-empty';
  const scanPath = '.tmp/test-api-contract-local-service/local-scan';
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
    outputPath: emptyPath,
    overwrite: true,
    now: fixedNow
  });
  await runScan({
    fixturePath: 'fixtures/tenant-bundle.fixture.json',
    outputPath: scanPath,
    overwrite: true,
    now: fixedNow
  });
  await mergeScanIntoStore({
    storePath: emptyPath,
    scanPath,
    outputPath: storePath,
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

