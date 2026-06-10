#!/usr/bin/env node
import path from 'node:path';
import { runScan } from './scan-runs/scan-run-writer.mjs';
import { validateScanOutput } from './validators/outbound-link-validator.mjs';
import { readJson } from './utils/json-writer.mjs';
import { resolveFixturePath, resolveTmpRenderPath, resolveTmpScanPath, toPackageRelative } from './utils/safe-paths.mjs';
import { createEmptyLocalStore } from './store/local-store-initializer.mjs';
import { writeLocalStore } from './store/local-store-writer.mjs';
import { mergeScanIntoStore } from './store/store-merger.mjs';
import { exportLocalStore } from './store/store-exporter.mjs';
import { inspectLocalStore } from './store/store-inspector.mjs';
import { cloneStore, readLocalStore } from './store/local-store-reader.mjs';
import { normalizePolicy } from './policies/policy-normalizer.mjs';
import { applyPolicyToStore } from './policies/policy-applier.mjs';
import { appendAuditLog } from './audit/audit-log-writer.mjs';
import { setLinkStatus } from './lifecycle/link-status-service.mjs';
import { setInstanceStatus } from './lifecycle/instance-status-service.mjs';
import { validateLocalStore } from './validators/local-store-validator.mjs';
import { runRenderFixture } from './rendering/render-output-writer.mjs';
import { validateRenderOutput } from './validators/render-output-validator.mjs';

const version = '0.3.0';

async function main() {
  const [command, ...args] = process.argv.slice(2);
  try {
    switch (command ?? 'help') {
      case 'help':
        printHelp();
        break;
      case 'version':
        console.log(version);
        break;
      case 'scan':
        await scanCommand(args);
        break;
      case 'validate':
        await validateCommand(args);
        break;
      case 'inspect':
        await inspectCommand(args);
        break;
      case 'init-store':
        await initStoreCommand(args);
        break;
      case 'merge-scan':
        await mergeScanCommand(args);
        break;
      case 'set-link-status':
        await setLinkStatusCommand(args);
        break;
      case 'set-instance-status':
        await setInstanceStatusCommand(args);
        break;
      case 'set-policy':
        await setPolicyCommand(args);
        break;
      case 'export-store':
        await exportStoreCommand(args);
        break;
      case 'validate-store':
        await validateStoreCommand(args);
        break;
      case 'inspect-store':
        await inspectStoreCommand(args);
        break;
      case 'render-fixture':
        await renderFixtureCommand(args);
        break;
      case 'validate-render':
        await validateRenderCommand(args);
        break;
      case 'inspect-render':
        await inspectRenderCommand(args);
        break;
      default:
        throw new Error(`unknown command: ${command}`);
    }
  } catch (error) {
    console.error(`error: ${error.message}`);
    process.exitCode = 1;
  }
}

function parseArgs(args) {
  const parsed = { _: [] };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('--')) {
      parsed._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (key === 'overwrite') {
      parsed[key] = true;
      continue;
    }
    parsed[key] = args[index + 1];
    index += 1;
  }
  return parsed;
}

async function scanCommand(args) {
  const options = parseArgs(args);
  const result = await runScan({
    fixturePath: required(options.fixture, '--fixture is required'),
    outputPath: required(options.out, '--out is required'),
    overwrite: options.overwrite === true
  });
  const validation = await validateScanOutput({ scanPath: options.out });
  console.log(`scan: ${validation.status}`);
  console.log(`output: ${toPackageRelative(result.outputRoot)}`);
  console.log(`links: ${result.scanResult.summary.outboundLinkCount}`);
  console.log(`instances: ${result.scanResult.summary.instanceCount}`);
  console.log(`ignored: ${result.scanResult.summary.ignoredLinkCount}`);
}

async function validateCommand(args) {
  const options = parseArgs(args);
  const validation = await validateScanOutput({ scanPath: required(options.scan, '--scan is required') });
  console.log(`validation: ${validation.status}`);
  console.log(`links: ${validation.summary.linkCount}`);
  console.log(`instances: ${validation.summary.instanceCount}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function inspectCommand(args) {
  const options = parseArgs(args);
  const scanRoot = resolveTmpScanPath(required(options.scan, '--scan is required'));
  const links = await readJson(path.join(scanRoot, 'outbound-links.json'));
  const instances = await readJson(path.join(scanRoot, 'outbound-link-instances.json'));
  const scanRun = await readJson(path.join(scanRoot, 'outbound-link-scan-run.json'));
  console.log(`scan: ${toPackageRelative(scanRoot)}`);
  console.log(`tenant: ${scanRun.tenant_id}`);
  console.log(`site: ${scanRun.site_id}`);
  console.log(`status: ${scanRun.status}`);
  console.log(`links: ${(links.outbound_links ?? []).length}`);
  console.log(`instances: ${(instances.outbound_link_instances ?? []).length}`);
  console.log(`staleInstances: ${scanRun.stale_instances_found}`);
}

async function initStoreCommand(args) {
  const options = parseArgs(args);
  const store = createEmptyLocalStore({
    tenantId: required(options.tenant, '--tenant is required'),
    siteId: required(options.site, '--site is required'),
    policy: options.policy ? await readJson(resolveFixturePath(options.policy)) : null
  });
  const outputRoot = await writeLocalStore({
    store,
    outputPath: required(options.out, '--out is required'),
    overwrite: options.overwrite === true
  });
  const validation = await validateLocalStore({ storePath: options.out });
  console.log(`store: ${toPackageRelative(outputRoot)}`);
  console.log(`validation: ${validation.status}`);
  console.log(`links: ${validation.summary.linkCount}`);
  console.log(`instances: ${validation.summary.instanceCount}`);
}

async function mergeScanCommand(args) {
  const options = parseArgs(args);
  const result = await mergeScanIntoStore({
    storePath: required(options.store, '--store is required'),
    scanPath: required(options.scan, '--scan is required'),
    outputPath: required(options.out, '--out is required'),
    overwrite: options.overwrite === true
  });
  const validation = await validateLocalStore({ storePath: options.out });
  console.log(`store: ${toPackageRelative(result.outputRoot)}`);
  console.log(`validation: ${validation.status}`);
  console.log(`links: ${result.summary.linkCount}`);
  console.log(`instances: ${result.summary.instanceCount}`);
  console.log(`scanRuns: ${result.summary.scanRunCount}`);
  console.log(`auditLogs: ${result.summary.auditLogCount}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function setLinkStatusCommand(args) {
  const options = parseArgs(args);
  const result = await setLinkStatus({
    storePath: required(options.store, '--store is required'),
    outputPath: required(options.out, '--out is required'),
    linkId: options['link-id'],
    linkDomain: options['link-domain'],
    normalizedUrl: options['normalized-url'],
    status: required(options.status, '--status is required'),
    reason: options.reason ?? null,
    overwrite: options.overwrite === true
  });
  const validation = await validateLocalStore({ storePath: options.out });
  console.log(`store: ${toPackageRelative(result.outputRoot)}`);
  console.log(`validation: ${validation.status}`);
  console.log(`link: ${result.link.id}`);
  console.log(`status: ${result.link.status}`);
  console.log(`auditLogs: ${result.auditLogCount}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function setInstanceStatusCommand(args) {
  const options = parseArgs(args);
  const result = await setInstanceStatus({
    storePath: required(options.store, '--store is required'),
    outputPath: required(options.out, '--out is required'),
    instanceId: required(options['instance-id'], '--instance-id is required'),
    status: required(options.status, '--status is required'),
    reason: options.reason ?? null,
    overwrite: options.overwrite === true
  });
  const validation = await validateLocalStore({ storePath: options.out });
  console.log(`store: ${toPackageRelative(result.outputRoot)}`);
  console.log(`validation: ${validation.status}`);
  console.log(`instance: ${result.instance.id}`);
  console.log(`status: ${result.instance.status}`);
  console.log(`auditLogs: ${result.auditLogCount}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function setPolicyCommand(args) {
  const options = parseArgs(args);
  const timestamp = new Date().toISOString();
  const store = cloneStore(await readLocalStore(required(options.store, '--store is required')));
  const rawPolicy = await readJson(resolveFixturePath(required(options.policy, '--policy is required')));
  const policy = normalizePolicy(rawPolicy, {
    tenantId: store.tenant_id,
    siteId: store.site_id,
    now: timestamp
  });
  if (policy.tenant_id !== store.tenant_id || policy.site_id !== store.site_id) {
    throw new Error('policy scope does not match local store');
  }
  const priorPolicyId = store.policiesEnvelope?.active_policy_id ?? null;
  const policies = [
    ...store.policies.filter((item) => item.id !== policy.id),
    policy
  ];
  const policyStore = {
    ...store,
    policies,
    policiesEnvelope: {
      ...(store.policiesEnvelope ?? {}),
      active_policy_id: policy.id
    }
  };
  const policyResult = applyPolicyToStore(policyStore, { now: timestamp });
  const audited = appendAuditLog(policyResult.store, {
    action: 'policy_set',
    recordType: 'outbound_link_policy',
    recordId: policy.id,
    actor: 'local-cli',
    reason: options.reason ?? 'set local outbound link policy',
    before: {
      active_policy_id: priorPolicyId
    },
    after: {
      active_policy_id: policy.id,
      changed_links: policyResult.changedLinkCount,
      changed_instances: policyResult.changedInstanceCount
    },
    now: timestamp
  });
  const outputRoot = await writeLocalStore({
    store: audited,
    outputPath: required(options.out, '--out is required'),
    overwrite: options.overwrite === true,
    now: timestamp
  });
  const validation = await validateLocalStore({ storePath: options.out });
  console.log(`store: ${toPackageRelative(outputRoot)}`);
  console.log(`validation: ${validation.status}`);
  console.log(`policy: ${policy.id}`);
  console.log(`changedLinks: ${policyResult.changedLinkCount}`);
  console.log(`changedInstances: ${policyResult.changedInstanceCount}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function exportStoreCommand(args) {
  const options = parseArgs(args);
  const result = await exportLocalStore({
    storePath: required(options.store, '--store is required'),
    outputPath: required(options.out, '--out is required'),
    overwrite: options.overwrite === true
  });
  console.log(`export: ${toPackageRelative(result.outputRoot)}`);
  console.log(`links: ${result.summary.linkCount}`);
  console.log(`instances: ${result.summary.instanceCount}`);
  console.log(`policies: ${result.summary.policyCount}`);
  console.log(`scanRuns: ${result.summary.scanRunCount}`);
  console.log(`auditLogs: ${result.summary.auditLogCount}`);
}

async function validateStoreCommand(args) {
  const options = parseArgs(args);
  const validation = await validateLocalStore({ storePath: required(options.store, '--store is required') });
  console.log(`validation: ${validation.status}`);
  console.log(`links: ${validation.summary.linkCount}`);
  console.log(`instances: ${validation.summary.instanceCount}`);
  console.log(`policies: ${validation.summary.policyCount}`);
  console.log(`auditLogs: ${validation.summary.auditLogCount}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function inspectStoreCommand(args) {
  const options = parseArgs(args);
  const summary = await inspectLocalStore(required(options.store, '--store is required'));
  console.log(`tenant: ${summary.tenant_id}`);
  console.log(`site: ${summary.site_id}`);
  console.log(`links: ${summary.linkCount}`);
  console.log(`instances: ${summary.instanceCount}`);
  console.log(`policies: ${summary.policyCount}`);
  console.log(`scanRuns: ${summary.scanRunCount}`);
  console.log(`auditLogs: ${summary.auditLogCount}`);
  console.log(`activePolicy: ${summary.activePolicyId}`);
  console.log(`domains: ${summary.domains.join(',')}`);
}

async function renderFixtureCommand(args) {
  const options = parseArgs(args);
  const result = await runRenderFixture({
    fixturePath: required(options.fixture, '--fixture is required'),
    storePath: required(options.store, '--store is required'),
    outputPath: required(options.out, '--out is required'),
    overwrite: options.overwrite === true
  });
  const validation = await validateRenderOutput({ renderedPath: options.out });
  console.log(`render: ${validation.status}`);
  console.log(`output: ${toPackageRelative(result.outputRoot)}`);
  console.log(`decisions: ${result.renderResult.summary.decisionCount}`);
  console.log(`activeAnchors: ${result.renderResult.summary.activeAnchorCount}`);
  console.log(`blockedOrDisabled: ${result.renderResult.summary.blockedOrDisabledCount}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function validateRenderCommand(args) {
  const options = parseArgs(args);
  const validation = await validateRenderOutput({ renderedPath: required(options.rendered, '--rendered is required') });
  console.log(`validation: ${validation.status}`);
  console.log(`decisions: ${validation.summary.decisionCount}`);
  console.log(`activeAnchors: ${validation.summary.activeAnchorCount}`);
  console.log(`blockedOrDisabled: ${validation.summary.blockedOrDisabledCount}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function inspectRenderCommand(args) {
  const options = parseArgs(args);
  const renderRoot = resolveTmpRenderPath(required(options.rendered, '--rendered is required'));
  const report = await readJson(path.join(renderRoot, 'render-report.json'));
  console.log(`tenant: ${report.tenant_id}`);
  console.log(`site: ${report.site_id}`);
  console.log(`fixture: ${report.fixtureName}`);
  console.log(`decisions: ${report.summary.decisionCount}`);
  console.log(`activeAnchors: ${report.summary.activeAnchorCount}`);
  console.log(`blockedOrDisabled: ${report.summary.blockedOrDisabledCount}`);
}

function required(value, message) {
  if (!value) {
    throw new Error(message);
  }
  return value;
}

function printHelp() {
  console.log(`Pumpkin Outbound Link Manager local scanner ${version}

Commands:
  help
  version
  scan --fixture fixtures/single-link.fixture.json --out .tmp/single-link-scan [--overwrite]
  validate --scan .tmp/single-link-scan
  inspect --scan .tmp/single-link-scan
  init-store --tenant fixture-tenant --site fixture-site --out .tmp/local-store [--overwrite]
  merge-scan --store .tmp/local-store --scan .tmp/tenant-bundle-scan --out .tmp/local-store-merged [--overwrite]
  set-link-status --store .tmp/local-store-merged --link-domain partner.example --status disabled --reason "local fixture test" --out .tmp/local-store-disabled [--overwrite]
  set-instance-status --store .tmp/local-store-merged --instance-id oli_example --status plain_text --reason "local fixture test" --out .tmp/local-store-instance-status [--overwrite]
  set-policy --store .tmp/local-store-merged --policy fixtures/policy-blocked-domain.fixture.json --out .tmp/local-store-policy [--overwrite]
  export-store --store .tmp/local-store-policy --out .tmp/local-store-export [--overwrite]
  validate-store --store .tmp/local-store-policy
  inspect-store --store .tmp/local-store-policy
  render-fixture --fixture fixtures/render-active-links.fixture.json --store .tmp/local-store-policy --out .tmp/render-active [--overwrite]
  validate-render --rendered .tmp/render-active
  inspect-render --rendered .tmp/render-active

Boundary:
  Local fixture JSON only. No external HTTP crawling, CMS/API calls, CMS writes, protected config reads, deployment, indexing, or live-page publication.
`);
}

await main();
