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
import { setInstanceStatus } from '../src/lifecycle/instance-status-service.mjs';
import { runRenderFixture } from '../src/rendering/render-output-writer.mjs';
import { validateRenderOutput } from '../src/validators/render-output-validator.mjs';
import { readJson, writeJson } from '../src/utils/json-writer.mjs';
import { packageRoot, tmpRoot } from '../src/utils/safe-paths.mjs';

const fixedNow = new Date('2026-06-10T00:00:00.000Z');
const testRoot = path.join(tmpRoot, 'test-rendering-control');

test('active link renders as active anchor', async () => {
  const storePath = await buildTenantBundleStore('active-link');
  const render = await renderToTmp('render-active-links.fixture.json', storePath, 'active-link-render');
  assert.equal(render.renderResult.summary.decisionCount, 5);
  assert.equal(render.renderResult.summary.activeAnchorCount, 5);
  assert.equal(render.renderResult.render_decisions.every((decision) => decision.render_action === 'active_anchor'), true);
});

test('active link includes rel noopener noreferrer', async () => {
  const storePath = await buildTenantBundleStore('safe-rel');
  const render = await renderToTmp('render-active-links.fixture.json', storePath, 'safe-rel-render');
  const decision = render.renderResult.render_decisions[0];
  assert.match(decision.safe_rel, /\bnoopener\b/);
  assert.match(decision.safe_rel, /\bnoreferrer\b/);
  assert.equal(decision.safe_target, '_blank');
  assert.match(decision.rendered_output, /^<a\b/);
});

test('disabled global link renders as configured disabled behavior', async () => {
  const baseStorePath = await buildTenantBundleStore('disabled-global-base');
  const disabledStorePath = '.tmp/test-rendering-control/disabled-global-store';
  await setLinkStatus({
    storePath: baseStorePath,
    outputPath: disabledStorePath,
    linkDomain: 'partner.example',
    status: 'disabled',
    reason: 'render fixture disabled global',
    overwrite: true,
    now: fixedNow
  });
  const render = await renderToTmp('render-disabled-global-link.fixture.json', disabledStorePath, 'disabled-global-render');
  const decision = render.renderResult.render_decisions[0];
  assert.equal(decision.link_status, 'disabled');
  assert.equal(decision.render_action, 'disabled_span');
  assert.doesNotMatch(decision.rendered_output, /<a\b/i);
});

test('disabled instance affects only that instance', async () => {
  const baseStorePath = await buildTenantBundleStore('disabled-instance-base');
  const baseStore = await readLocalStore(baseStorePath);
  const docsInstance = selectInstanceByDomain(baseStore, 'docs.example');
  const disabledStorePath = '.tmp/test-rendering-control/disabled-instance-store';
  await setInstanceStatus({
    storePath: baseStorePath,
    outputPath: disabledStorePath,
    instanceId: docsInstance.id,
    status: 'disabled',
    reason: 'render fixture disabled instance',
    overwrite: true,
    now: fixedNow
  });
  const render = await renderToTmp('render-active-links.fixture.json', disabledStorePath, 'disabled-instance-render');
  assert.equal(render.renderResult.summary.decisionCount, 5);
  assert.equal(render.renderResult.summary.activeAnchorCount, 4);
  const disabledDecision = render.renderResult.render_decisions.find((decision) => decision.instance_id === docsInstance.id);
  assert.equal(disabledDecision.render_action, 'disabled_span');
});

test('hidden mode hides active link markup', async () => {
  const storePath = await buildTenantBundleStore('hidden-mode');
  const render = await renderToTmp('render-hidden-mode.fixture.json', storePath, 'hidden-mode-render');
  const decision = render.renderResult.render_decisions[0];
  assert.equal(decision.render_action, 'hidden');
  assert.equal(decision.rendered_output, '');
});

test('plain text mode preserves text', async () => {
  const storePath = await buildTenantBundleStore('plain-text-mode');
  const render = await renderToTmp('render-plain-text-mode.fixture.json', storePath, 'plain-text-mode-render');
  const decision = render.renderResult.render_decisions[0];
  assert.equal(decision.render_action, 'plain_text');
  assert.equal(decision.rendered_output, 'Docs');
  assert.doesNotMatch(decision.rendered_output, /<a\b/i);
});

test('fallback mode uses safe fallback URL', async () => {
  const storePath = await buildTenantBundleStore('fallback-mode');
  const render = await renderToTmp('render-fallback-mode.fixture.json', storePath, 'fallback-mode-render');
  const decision = render.renderResult.render_decisions[0];
  assert.equal(decision.render_action, 'fallback_anchor');
  assert.equal(decision.fallback_url, 'https://example.com/safe-fallback');
  assert.match(decision.rendered_output, /https:\/\/example\.com\/safe-fallback/);
  assert.match(decision.safe_rel, /\bnoopener\b/);
});

test('domain blocked overrides link active status', async () => {
  const storePath = await buildTenantBundleStore('domain-block-base');
  const policyStorePath = await applyBlockedDomainPolicy(storePath, 'domain-block-store');
  const render = await renderToTmp('render-domain-blocked.fixture.json', policyStorePath, 'domain-block-render');
  const decision = render.renderResult.render_decisions[0];
  assert.equal(decision.policy_status, 'domain_blocked');
  assert.equal(decision.render_action, 'domain_blocked_plain_text');
  assert.doesNotMatch(decision.rendered_output, /<a\b/i);
});

test('pending review blocks active anchor by default', async () => {
  const storePath = await buildPendingReviewStore('pending-review-base');
  const render = await renderToTmp('render-pending-review.fixture.json', storePath, 'pending-review-render');
  const decision = render.renderResult.render_decisions[0];
  assert.equal(decision.policy_status, 'pending_review');
  assert.equal(decision.render_action, 'pending_review_plain_text');
  assert.doesNotMatch(decision.rendered_output, /<a\b/i);
});

test('tenant mismatch fails validation', async () => {
  const storePath = await buildTenantBundleStore('invalid-tenant-base');
  const render = await renderToTmp('render-active-links.fixture.json', storePath, 'invalid-tenant-render');
  const decisionsPath = path.join(render.outputRoot, 'render-decisions.json');
  const envelope = await readJson(decisionsPath);
  envelope.render_decisions[0].tenant_id = 'other-tenant';
  await writeJson(decisionsPath, envelope);
  const validation = await validateRenderOutput({ renderedPath: '.tmp/test-rendering-control/invalid-tenant-render' });
  assert.equal(validation.status, 'failed');
  assert.equal(validation.failures.some((failure) => failure.code === 'RENDER_TENANT_SCOPE_MISMATCH'), true);
});

test('unknown instance fails validation', async () => {
  const storePath = await buildTenantBundleStore('unknown-instance-base');
  const render = await renderToTmp('render-active-links.fixture.json', storePath, 'unknown-instance-render');
  const reportPath = path.join(render.outputRoot, 'render-report.json');
  const report = await readJson(reportPath);
  report.known_instance_ids = [];
  await writeJson(reportPath, report);
  const validation = await validateRenderOutput({ renderedPath: '.tmp/test-rendering-control/unknown-instance-render' });
  assert.equal(validation.status, 'failed');
  assert.equal(validation.failures.some((failure) => failure.code === 'UNKNOWN_RENDER_INSTANCE'), true);
});

test('output outside .tmp rejected', async () => {
  const storePath = await buildTenantBundleStore('outside-output-base');
  await assert.rejects(
    () => runRenderFixture({
      fixturePath: 'fixtures/render-active-links.fixture.json',
      storePath,
      outputPath: 'not-tmp/render-output',
      overwrite: true,
      now: fixedNow
    }),
    /generated output must resolve inside \.tmp/
  );
});

test('render CLI commands work without live calls', async () => {
  const storePath = await buildTenantBundleStore('cli-render-base');
  const render = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'render-fixture',
    '--fixture',
    'fixtures/render-active-links.fixture.json',
    '--store',
    storePath,
    '--out',
    '.tmp/test-rendering-control/cli-render',
    '--overwrite'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(render.status, 0, render.stderr);
  assert.match(render.stdout, /render: passed/);

  const validate = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'validate-render',
    '--rendered',
    '.tmp/test-rendering-control/cli-render'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(validate.status, 0, validate.stderr);
  assert.match(validate.stdout, /validation: passed/);

  const inspect = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'inspect-render',
    '--rendered',
    '.tmp/test-rendering-control/cli-render'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(inspect.status, 0, inspect.stderr);
  assert.match(inspect.stdout, /decisions: 5/);
});

test('rendering source does not include external calls or protected config reads', async () => {
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

async function buildStoreFromScanFixture({ fixtureName, name, policy }) {
  const storePath = `.tmp/test-rendering-control/${name}-store`;
  const scanPath = `.tmp/test-rendering-control/${name}-scan`;
  const mergedPath = `.tmp/test-rendering-control/${name}-merged`;
  const store = createEmptyLocalStore({
    tenantId: 'fixture-tenant',
    siteId: 'fixture-site',
    now: fixedNow,
    policy
  });
  await writeLocalStore({
    store,
    outputPath: storePath,
    overwrite: true,
    now: fixedNow
  });
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

async function applyBlockedDomainPolicy(storePath, outputName) {
  const policy = await readJson(path.join(packageRoot, 'fixtures/policy-blocked-domain.fixture.json'));
  const store = await readLocalStore(storePath);
  const policyStorePath = `.tmp/test-rendering-control/${outputName}`;
  const policyCommand = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'set-policy',
    '--store',
    storePath,
    '--policy',
    'fixtures/policy-blocked-domain.fixture.json',
    '--out',
    policyStorePath,
    '--overwrite'
  ], { cwd: packageRoot, encoding: 'utf8' });
  assert.equal(policyCommand.status, 0, policyCommand.stderr);
  assert.equal(policy.tenant_id, store.tenant_id);
  return policyStorePath;
}

async function renderToTmp(fixtureName, storePath, outputName) {
  const result = await runRenderFixture({
    fixturePath: `fixtures/${fixtureName}`,
    storePath,
    outputPath: `.tmp/test-rendering-control/${outputName}`,
    overwrite: true,
    now: fixedNow
  });
  const validation = await validateRenderOutput({ renderedPath: `.tmp/test-rendering-control/${outputName}` });
  assert.equal(validation.status, 'passed', JSON.stringify(validation.failures));
  return result;
}

function selectInstanceByDomain(store, domain) {
  const link = store.links.find((item) => item.domain === domain);
  assert.ok(link, `missing link for ${domain}`);
  const instance = store.instances.find((item) => item.outbound_link_id === link.id);
  assert.ok(instance, `missing instance for ${domain}`);
  return instance;
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
