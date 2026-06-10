import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { runScan } from '../src/scan-runs/scan-run-writer.mjs';
import { createEmptyLocalStore } from '../src/store/local-store-initializer.mjs';
import { writeLocalStore } from '../src/store/local-store-writer.mjs';
import { readLocalStore } from '../src/store/local-store-reader.mjs';
import { mergeScanIntoStore } from '../src/store/store-merger.mjs';
import { runApiWritePreflight, runApiWritePreflightFromRaw } from '../src/api/write-guard/local-api-write-guard-adapter.mjs';
import { validateApiWritePreflight } from '../src/api/write-guard/write-action-preflight-validator.mjs';
import { readJson } from '../src/utils/json-writer.mjs';
import { tmpRoot } from '../src/utils/safe-paths.mjs';

const fixedNow = new Date('2026-06-10T00:00:00.000Z');
const testRoot = path.join(tmpRoot, 'test-api-write-guard-bridge');

test.before(async () => {
  await fs.rm(testRoot, { recursive: true, force: true });
});

test('api write bridge applies approved local/fake review decision with trace fields', async () => {
  const storePath = await buildMergedStore('approve-review');
  const out = '.tmp/test-api-write-guard-bridge/approve-review';
  const { response, traceLog } = await runApiWritePreflight({
    storePath,
    requestPath: 'fixtures/api-write-preflight-approve-review.fixture.json',
    outputPath: out,
    overwrite: true
  });
  assert.equal(response.ok, true);
  assert.equal(response.applied, true);
  assert.equal(response.liveWriteAllowed, false);
  assert.equal(response.requestId, 'olwr_fixture_approve_review');
  assert.equal(response.actionId, 'olwa_fixture_approve_review');
  assert.equal(response.correlationId, 'olwc_fixture_approve_review');
  assert.equal(response.actorEmail, 'tenant-admin@example.test');
  assert.equal(response.reviewDecisionId.startsWith('olrd_'), true);
  assert.equal(response.auditEventIds.length > 0, true);
  assert.equal(response.rollbackPlanId.startsWith('olrp_'), true);
  assert.notEqual(response.beforeStateHash, response.afterStateHash);
  assert.equal(traceLog.providerMode, 'local-api-fake-provider');

  const validation = await validateApiWritePreflight({ resultPath: out });
  assert.equal(validation.status, 'passed');
});

test('api write bridge bulk action records bulk id and publishing impact', async () => {
  const storePath = await buildMergedStore('bulk-domain-disable');
  const out = '.tmp/test-api-write-guard-bridge/bulk-domain-disable';
  const { response } = await runApiWritePreflight({
    storePath,
    requestPath: 'fixtures/api-write-preflight-bulk-domain-disable.fixture.json',
    outputPath: out,
    overwrite: true
  });
  assert.equal(response.ok, true);
  assert.equal(response.bulkActionId.startsWith('olba_'), true);
  assert.equal(response.publishingImpact.summary.affectedLinkCount, 3);
  assert.equal(response.publishingImpact.summary.affectedInstanceCount, 3);
  assert.deepEqual(response.publishingImpact.groupings.domains, ['example.com']);
  assert.equal((await validateApiWritePreflight({ resultPath: out })).status, 'passed');
});

test('bulk action without approval reference is blocked by local guards', async () => {
  const storePath = await buildMergedStore('bulk-missing-approval');
  const out = '.tmp/test-api-write-guard-bridge/bulk-missing-approval';
  const { response } = await runApiWritePreflightFromRaw({
    storePath,
    outputPath: out,
    overwrite: true,
    rawRequest: {
      action: 'bulkDomainDisable',
      tenantKey: 'fixture-tenant',
      siteKey: 'fixture-site',
      providerMode: 'local-api-fake-provider',
      reason: 'missing approval fixture',
      now: '2026-06-10T13:20:00.000Z',
      actor: {
        actorId: 'local-api-tenant-admin',
        actorRole: 'TenantAdmin',
        assignedTenants: ['fixture-tenant'],
        assignedSites: ['fixture-site']
      },
      target: { domain: 'example.com' }
    }
  });
  assert.equal(response.ok, false);
  assert.equal(response.applied, false);
  assert.equal(response.traceLog.blockReason.includes('APPROVAL_REFERENCE_REQUIRED'), true);
});

test('viewer role and tenant mismatch are blocked', async () => {
  const storePath = await buildMergedStore('viewer-blocked');
  const viewer = await runApiWritePreflightFromRaw({
    storePath,
    outputPath: '.tmp/test-api-write-guard-bridge/viewer-blocked',
    overwrite: true,
    rawRequest: {
      action: 'setLinkStatus',
      tenantKey: 'fixture-tenant',
      siteKey: 'fixture-site',
      providerMode: 'local-api-fake-provider',
      reason: 'viewer blocked fixture',
      approvalReference: 'OLM-VIEWER-BLOCKED',
      now: '2026-06-10T13:25:00.000Z',
      actor: {
        actorId: 'local-viewer',
        actorRole: 'Viewer',
        assignedTenants: ['fixture-tenant'],
        assignedSites: ['fixture-site']
      },
      target: { domain: 'docs.example', status: 'disabled' }
    }
  });
  assert.equal(viewer.response.ok, false);
  assert.equal(viewer.response.traceLog.blockReason.includes('ROLE_BLOCKED'), true);

  const mismatch = await runApiWritePreflightFromRaw({
    storePath,
    outputPath: '.tmp/test-api-write-guard-bridge/tenant-mismatch',
    overwrite: true,
    rawRequest: {
      action: 'setLinkStatus',
      tenantKey: 'other-tenant',
      siteKey: 'fixture-site',
      providerMode: 'local-api-fake-provider',
      reason: 'tenant mismatch fixture',
      approvalReference: 'OLM-TENANT-MISMATCH',
      now: '2026-06-10T13:30:00.000Z',
      actor: {
        actorId: 'local-tenant-admin',
        actorRole: 'TenantAdmin',
        assignedTenants: ['other-tenant'],
        assignedSites: ['fixture-site']
      },
      target: { domain: 'docs.example', status: 'disabled' }
    }
  });
  assert.equal(mismatch.response.ok, false);
  assert.equal(mismatch.response.traceLog.blockReason.includes('TENANT_SCOPE_MISMATCH'), true);
});

test('live-readonly and live-write-approved provider modes remain blocked', async () => {
  const storePath = await buildMergedStore('provider-blocks');
  const liveReadonly = await runApiWritePreflight({
    storePath,
    requestPath: 'fixtures/api-write-preflight-live-readonly-blocked.fixture.json',
    outputPath: '.tmp/test-api-write-guard-bridge/live-readonly-blocked',
    overwrite: true
  });
  assert.equal(liveReadonly.response.ok, false);
  assert.equal(liveReadonly.response.code, 'OUTBOUND_LINK_WRITE_NOT_APPROVED');
  assert.equal(liveReadonly.response.traceLog.rollbackPlanId.startsWith('olrp_'), true);

  const liveWrite = await runApiWritePreflightFromRaw({
    storePath,
    outputPath: '.tmp/test-api-write-guard-bridge/live-write-approved-blocked',
    overwrite: true,
    rawRequest: {
      action: 'setLinkStatus',
      tenantKey: 'fixture-tenant',
      siteKey: 'fixture-site',
      providerMode: 'live-write-approved',
      reason: 'future live write should stay blocked',
      approvalReference: 'OLM-LIVE-WRITE-BLOCKED',
      now: '2026-06-10T13:35:00.000Z',
      actor: {
        actorId: 'local-api-tenant-admin',
        actorRole: 'TenantAdmin',
        assignedTenants: ['fixture-tenant'],
        assignedSites: ['fixture-site']
      },
      target: { domain: 'docs.example', status: 'disabled' }
    }
  });
  assert.equal(liveWrite.response.ok, false);
  assert.equal(liveWrite.response.code, 'OUTBOUND_LINK_LIVE_WRITE_BLOCKED');
});

test('trace URL redaction removes risky query values', async () => {
  const storePath = await buildMergedStore('redacted-url');
  const out = '.tmp/test-api-write-guard-bridge/redacted-url';
  const { response } = await runApiWritePreflight({
    storePath,
    requestPath: 'fixtures/api-write-preflight-redacted-url.fixture.json',
    outputPath: out,
    overwrite: true
  });
  assert.equal(response.ok, true);
  assert.match(response.traceLog.normalizedUrl, /token=redacted/);
  assert.doesNotMatch(response.traceLog.normalizedUrl, /fixture-secret/);
  assert.equal((await validateApiWritePreflight({ resultPath: out })).status, 'passed');

  const persisted = await readJson(path.join(testRoot, 'redacted-url', 'TRACE_LOG.json'));
  assert.doesNotMatch(JSON.stringify(persisted), /fixture-secret/);
});

async function buildMergedStore(name) {
  const storePath = `.tmp/test-api-write-guard-bridge/${name}-store`;
  const scanPath = `.tmp/test-api-write-guard-bridge/${name}-scan`;
  const mergedPath = `.tmp/test-api-write-guard-bridge/${name}-merged`;
  await writeFixtureStore(storePath);
  await runScan({
    fixturePath: 'fixtures/tenant-bundle.fixture.json',
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
}
