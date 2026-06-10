import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { runScan } from '../src/scan-runs/scan-run-writer.mjs';
import { createEmptyLocalStore } from '../src/store/local-store-initializer.mjs';
import { writeLocalStore } from '../src/store/local-store-writer.mjs';
import { readLocalStore } from '../src/store/local-store-reader.mjs';
import { mergeScanIntoStore } from '../src/store/store-merger.mjs';
import { simulateAction } from '../src/actions/action-simulation-runner.mjs';
import { validateActionResult } from '../src/actions/action-result-validator.mjs';
import { requestSetLinkStatus } from '../src/api/services/write-action-guard-service.mjs';
import { readJson } from '../src/utils/json-writer.mjs';
import { tmpRoot } from '../src/utils/safe-paths.mjs';

const fixedNow = new Date('2026-06-10T00:00:00.000Z');
const testRoot = path.join(tmpRoot, 'test-write-action-guards');

test.before(async () => {
  await fs.rm(testRoot, { recursive: true, force: true });
});

test('approve review simulation writes sandbox store, audit, impact, rollback, and validation', async () => {
  const storePath = await buildMergedStore('approve-review');
  const out = '.tmp/test-write-action-guards/action-approve-review';
  const { actionResult } = await simulateAction({
    storePath,
    requestPath: 'fixtures/action-approve-review.fixture.json',
    outputPath: out,
    overwrite: true
  });
  assert.equal(actionResult.ok, true);
  assert.equal(actionResult.status, 'simulated');
  assert.equal(actionResult.approval.productionWriteApproved, false);
  assert.equal(actionResult.boundaries.cmsWrites, false);

  const validation = await validateActionResult({ resultPath: out });
  assert.equal(validation.status, 'passed');

  const sandboxStore = await readLocalStore(actionResult.artifacts.sandboxStore);
  const partnerLink = sandboxStore.links.find((link) => link.domain === 'partner.example');
  assert.equal(partnerLink.review_decision, 'approved');
  assert.equal(sandboxStore.auditLogs.some((entry) => entry.action === 'approve_review'), true);

  const rollback = await readJson(path.join(testRoot, 'action-approve-review', 'ROLLBACK_PLAN.json'));
  assert.equal(rollback.executableAgainstLiveSystems, false);
  assert.equal(rollback.summary.changeCount, 1);
});

test('disable link simulation changes only the sandbox copy', async () => {
  const storePath = await buildMergedStore('disable-link');
  const beforeStore = await readLocalStore(storePath);
  const out = '.tmp/test-write-action-guards/action-disable-link';
  const { actionResult } = await simulateAction({
    storePath,
    requestPath: 'fixtures/action-disable-link.fixture.json',
    outputPath: out,
    overwrite: true
  });
  assert.equal(actionResult.status, 'simulated');
  assert.equal(actionResult.summary.changeCount, 1);

  const sandboxStore = await readLocalStore(actionResult.artifacts.sandboxStore);
  const sandboxDocs = sandboxStore.links.find((link) => link.domain === 'docs.example');
  const originalDocs = beforeStore.links.find((link) => link.domain === 'docs.example');
  assert.equal(sandboxDocs.status, 'disabled');
  assert.notEqual(originalDocs.status, 'disabled');
});

test('bulk domain disable requires approval and produces publishing impact', async () => {
  const storePath = await buildMergedStore('bulk-domain-disable');
  const out = '.tmp/test-write-action-guards/action-bulk-domain-disable';
  const { actionResult } = await simulateAction({
    storePath,
    requestPath: 'fixtures/action-bulk-domain-disable.fixture.json',
    outputPath: out,
    overwrite: true
  });
  assert.equal(actionResult.status, 'simulated');
  assert.equal(actionResult.summary.affectedLinkCount, 3);
  assert.equal(actionResult.summary.affectedInstanceCount, 3);

  const impact = await readJson(path.join(testRoot, 'action-bulk-domain-disable', 'PUBLISHING_IMPACT.json'));
  assert.deepEqual(impact.groupings.domains, ['example.com']);
  assert.equal(impact.boundaries.productionWriteApproved, false);
});

test('viewer action is blocked and does not write sandbox store', async () => {
  const storePath = await buildMergedStore('viewer-blocked');
  const out = '.tmp/test-write-action-guards/action-viewer-blocked';
  const { actionResult } = await simulateAction({
    storePath,
    requestPath: 'fixtures/action-viewer-blocked.fixture.json',
    outputPath: out,
    overwrite: true
  });
  assert.equal(actionResult.ok, false);
  assert.equal(actionResult.status, 'blocked');
  assert.equal(actionResult.approval.failures.some((item) => item.code === 'ROLE_BLOCKED'), true);
  assert.equal(actionResult.artifacts.sandboxStore, null);

  const validation = await validateActionResult({ resultPath: out });
  assert.equal(validation.status, 'passed');
});

test('production API write-action contract remains blocked', async () => {
  const storePath = await buildMergedStore('api-write-blocked');
  const response = await requestSetLinkStatus({
    storePath,
    linkId: 'fixture-link',
    status: 'disabled',
    query: {
      tenantKey: 'fixture-tenant',
      siteKey: 'fixture-site'
    },
    actor: {
      role: 'TenantAdmin',
      assignedTenants: ['fixture-tenant'],
      assignedSites: ['fixture-site']
    }
  });
  assert.equal(response.ok, false);
  assert.equal(response.code, 'OUTBOUND_LINK_WRITE_NOT_APPROVED');
});

async function buildMergedStore(name) {
  const storePath = `.tmp/test-write-action-guards/${name}-store`;
  const scanPath = `.tmp/test-write-action-guards/${name}-scan`;
  const mergedPath = `.tmp/test-write-action-guards/${name}-merged`;
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
