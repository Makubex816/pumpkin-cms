#!/usr/bin/env node
import path from 'node:path';
import { runScan } from './scan-runs/scan-run-writer.mjs';
import { validateScanOutput } from './validators/outbound-link-validator.mjs';
import { readJson, writeJson } from './utils/json-writer.mjs';
import { resolveFixturePath, resolveTmpOutputPath, resolveTmpRenderPath, resolveTmpScanPath, toPackageRelative } from './utils/safe-paths.mjs';
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
import { exportBackupCenter } from './integrations/backup-center-export-writer.mjs';
import { validateBackupCenterExport } from './integrations/backup-center-export-validator.mjs';
import { exportTenantBundle } from './integrations/tenant-bundle-export-writer.mjs';
import { validateTenantBundle } from './integrations/tenant-bundle-validator.mjs';
import { createOnboardingImport } from './integrations/onboarding-import-writer.mjs';
import { validateOnboardingImport } from './integrations/onboarding-import-validator.mjs';
import { simulateRestoreValidation } from './integrations/restore-validation-simulator.mjs';
import { listOutboundLinks } from './api/services/outbound-link-query-service.mjs';
import { getOutboundLink } from './api/services/outbound-link-detail-service.mjs';
import { listOutboundLinkInstances } from './api/services/outbound-link-instance-service.mjs';
import { listOutboundLinkPolicies } from './api/services/outbound-link-policy-service.mjs';
import { listOutboundLinkScanRuns } from './api/services/outbound-link-scan-run-service.mjs';
import { listOutboundLinkAuditLogs } from './api/services/outbound-link-audit-service.mjs';
import { getOutboundLinkDashboardSummary } from './api/services/outbound-link-dashboard-service.mjs';
import { requestWriteAction } from './api/services/write-action-guard-service.mjs';
import { validateApiResponse } from './validators/api-response-validator.mjs';
import { simulateAction } from './actions/action-simulation-runner.mjs';
import { validateActionResult } from './actions/action-result-validator.mjs';
import { runApiWritePreflight } from './api/write-guard/local-api-write-guard-adapter.mjs';
import { validateApiWritePreflight } from './api/write-guard/write-action-preflight-validator.mjs';
import { inspectMigrationDryRun, runMigrationDryRun } from './migration/migration-dry-runner.mjs';
import { validateMigrationDryRun } from './migration/schema-contract-validator.mjs';
import { checkProviderCapabilities } from './providers/provider-capability-checker.mjs';
import { inspectApplyPlan, runApplyPlanDryRun } from './apply-plan/apply-plan-dry-runner.mjs';
import { validateApplyPlan } from './apply-plan/apply-plan-validator.mjs';
import { inspectStagingExecution, runStagingExecution, runStagingReadback } from './staging-execution/staging-apply-executor.mjs';
import { validateStagingExecution } from './staging-execution/staging-execution-validator.mjs';
import { getOutboundLinkProviderState } from './api/services/outbound-link-provider-state-service.mjs';

const version = '0.10.0';

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
      case 'export-backup':
        await exportBackupCommand(args);
        break;
      case 'validate-backup-export':
        await validateBackupExportCommand(args);
        break;
      case 'export-tenant-bundle':
        await exportTenantBundleCommand(args);
        break;
      case 'validate-tenant-bundle':
        await validateTenantBundleCommand(args);
        break;
      case 'create-onboarding-import':
        await createOnboardingImportCommand(args);
        break;
      case 'validate-onboarding-import':
        await validateOnboardingImportCommand(args);
        break;
      case 'simulate-restore-validation':
        await simulateRestoreValidationCommand(args);
        break;
      case 'api-list-links':
        await apiListLinksCommand(args);
        break;
      case 'api-get-link':
        await apiGetLinkCommand(args);
        break;
      case 'api-list-instances':
        await apiListInstancesCommand(args);
        break;
      case 'api-list-policies':
        await apiListPoliciesCommand(args);
        break;
      case 'api-list-scan-runs':
        await apiListScanRunsCommand(args);
        break;
      case 'api-list-audit':
        await apiListAuditCommand(args);
        break;
      case 'api-dashboard-summary':
        await apiDashboardSummaryCommand(args);
        break;
      case 'api-request-write':
        await apiRequestWriteCommand(args);
        break;
      case 'validate-api-response':
        await validateApiResponseCommand(args);
        break;
      case 'simulate-action':
        await simulateActionCommand(args);
        break;
      case 'validate-action-result':
        await validateActionResultCommand(args);
        break;
      case 'api-write-preflight':
        await apiWritePreflightCommand(args);
        break;
      case 'validate-api-write-preflight':
        await validateApiWritePreflightCommand(args);
        break;
      case 'migration-dry-run':
        await migrationDryRunCommand(args);
        break;
      case 'validate-migration-dry-run':
        await validateMigrationDryRunCommand(args);
        break;
      case 'inspect-migration-dry-run':
        await inspectMigrationDryRunCommand(args);
        break;
      case 'provider-check':
        await providerCheckCommand(args);
        break;
      case 'apply-plan-dry-run':
        await applyPlanDryRunCommand(args);
        break;
      case 'validate-apply-plan':
        await validateApplyPlanCommand(args);
        break;
      case 'inspect-apply-plan':
        await inspectApplyPlanCommand(args);
        break;
      case 'staging-execute':
        await stagingExecuteCommand(args);
        break;
      case 'staging-readback':
        await stagingReadbackCommand(args);
        break;
      case 'validate-staging-execution':
        await validateStagingExecutionCommand(args);
        break;
      case 'inspect-staging-execution':
        await inspectStagingExecutionCommand(args);
        break;
      case 'api-provider-state':
        await apiProviderStateCommand(args);
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

async function exportBackupCommand(args) {
  const options = parseArgs(args);
  const result = await exportBackupCenter({
    storePath: required(options.store, '--store is required'),
    renderedPath: options.rendered ?? null,
    outputPath: required(options.out, '--out is required'),
    overwrite: options.overwrite === true
  });
  const validation = await validateBackupCenterExport({ exportPath: options.out });
  console.log(`export: ${toPackageRelative(result.outputRoot)}`);
  console.log(`validation: ${validation.status}`);
  console.log(`links: ${validation.summary.linkCount}`);
  console.log(`instances: ${validation.summary.instanceCount}`);
  console.log(`renderDecisions: ${validation.summary.renderDecisionCount}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function validateBackupExportCommand(args) {
  const options = parseArgs(args);
  const validation = await validateBackupCenterExport({ exportPath: required(options.export, '--export is required') });
  console.log(`validation: ${validation.status}`);
  console.log(`links: ${validation.summary.linkCount}`);
  console.log(`instances: ${validation.summary.instanceCount}`);
  console.log(`renderDecisions: ${validation.summary.renderDecisionCount}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function exportTenantBundleCommand(args) {
  const options = parseArgs(args);
  const result = await exportTenantBundle({
    storePath: required(options.store, '--store is required'),
    renderedPath: options.rendered ?? null,
    outputPath: required(options.out, '--out is required'),
    overwrite: options.overwrite === true
  });
  const validation = await validateTenantBundle({ bundlePath: options.out });
  console.log(`bundle: ${toPackageRelative(result.outputRoot)}`);
  console.log(`validation: ${validation.status}`);
  console.log(`links: ${validation.summary.linkCount}`);
  console.log(`instances: ${validation.summary.instanceCount}`);
  console.log(`renderDecisions: ${validation.summary.renderDecisionCount}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function validateTenantBundleCommand(args) {
  const options = parseArgs(args);
  const validation = await validateTenantBundle({ bundlePath: required(options.bundle, '--bundle is required') });
  console.log(`validation: ${validation.status}`);
  console.log(`links: ${validation.summary.linkCount}`);
  console.log(`instances: ${validation.summary.instanceCount}`);
  console.log(`renderDecisions: ${validation.summary.renderDecisionCount}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function createOnboardingImportCommand(args) {
  const options = parseArgs(args);
  const result = await createOnboardingImport({
    storePath: required(options.store, '--store is required'),
    outputPath: required(options.out, '--out is required'),
    overwrite: options.overwrite === true
  });
  console.log(`import: ${toPackageRelative(result.outputRoot)}`);
  console.log(`readiness: ${result.validationReport.status}`);
  console.log(`links: ${result.validationReport.summary.linkCount}`);
  console.log(`instances: ${result.validationReport.summary.instanceCount}`);
  console.log(`failures: ${result.validationReport.summary.failureCount}`);
}

async function validateOnboardingImportCommand(args) {
  const options = parseArgs(args);
  const validation = await validateOnboardingImport({ importPath: required(options.import, '--import is required') });
  console.log(`validation: ${validation.status}`);
  console.log(`links: ${validation.summary.linkCount}`);
  console.log(`instances: ${validation.summary.instanceCount}`);
  console.log(`failures: ${validation.summary.failureCount}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function simulateRestoreValidationCommand(args) {
  const options = parseArgs(args);
  const result = await simulateRestoreValidation({
    exportPath: required(options.export, '--export is required'),
    outputPath: required(options.out, '--out is required'),
    overwrite: options.overwrite === true
  });
  console.log(`restore: ${toPackageRelative(result.outputRoot)}`);
  console.log(`status: ${result.result.status}`);
  console.log(`links: ${result.result.summary.linkCount}`);
  console.log(`instances: ${result.result.summary.instanceCount}`);
  console.log(`renderDecisions: ${result.result.summary.renderDecisionCount}`);
  if (result.result.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function apiListLinksCommand(args) {
  const options = parseArgs(args);
  const response = await listOutboundLinks({
    storePath: required(options.store, '--store is required'),
    query: collectApiQuery(options),
    actor: collectApiActor(options)
  });
  await writeApiResponse({ response, outputPath: required(options.out, '--out is required') });
  printApiResponseSummary('api-list-links', response);
}

async function apiGetLinkCommand(args) {
  const options = parseArgs(args);
  const response = await getOutboundLink({
    storePath: required(options.store, '--store is required'),
    linkId: required(options['link-id'], '--link-id is required'),
    query: collectApiQuery(options),
    actor: collectApiActor(options)
  });
  await writeApiResponse({ response, outputPath: required(options.out, '--out is required') });
  printApiResponseSummary('api-get-link', response);
}

async function apiListInstancesCommand(args) {
  const options = parseArgs(args);
  const response = await listOutboundLinkInstances({
    storePath: required(options.store, '--store is required'),
    query: collectApiQuery(options),
    actor: collectApiActor(options)
  });
  await writeApiResponse({ response, outputPath: required(options.out, '--out is required') });
  printApiResponseSummary('api-list-instances', response);
}

async function apiListPoliciesCommand(args) {
  const options = parseArgs(args);
  const response = await listOutboundLinkPolicies({
    storePath: required(options.store, '--store is required'),
    query: collectApiQuery(options),
    actor: collectApiActor(options)
  });
  await writeApiResponse({ response, outputPath: required(options.out, '--out is required') });
  printApiResponseSummary('api-list-policies', response);
}

async function apiListScanRunsCommand(args) {
  const options = parseArgs(args);
  const response = await listOutboundLinkScanRuns({
    storePath: required(options.store, '--store is required'),
    query: collectApiQuery(options),
    actor: collectApiActor(options)
  });
  await writeApiResponse({ response, outputPath: required(options.out, '--out is required') });
  printApiResponseSummary('api-list-scan-runs', response);
}

async function apiListAuditCommand(args) {
  const options = parseArgs(args);
  const response = await listOutboundLinkAuditLogs({
    storePath: required(options.store, '--store is required'),
    query: collectApiQuery(options),
    actor: collectApiActor(options)
  });
  await writeApiResponse({ response, outputPath: required(options.out, '--out is required') });
  printApiResponseSummary('api-list-audit', response);
}

async function apiDashboardSummaryCommand(args) {
  const options = parseArgs(args);
  const response = await getOutboundLinkDashboardSummary({
    storePath: required(options.store, '--store is required'),
    query: collectApiQuery(options),
    actor: collectApiActor(options)
  });
  await writeApiResponse({ response, outputPath: required(options.out, '--out is required') });
  printApiResponseSummary('api-dashboard-summary', response);
}

async function apiRequestWriteCommand(args) {
  const options = parseArgs(args);
  const response = await requestWriteAction({
    storePath: required(options.store, '--store is required'),
    action: required(options.action, '--action is required'),
    query: collectApiQuery(options),
    actor: collectApiActor(options)
  });
  await writeApiResponse({ response, outputPath: required(options.out, '--out is required') });
  printApiResponseSummary('api-request-write', response);
}

async function validateApiResponseCommand(args) {
  const options = parseArgs(args);
  const validation = await validateApiResponse({ responsePath: required(options.response, '--response is required') });
  console.log(`validation: ${validation.status}`);
  console.log(`code: ${validation.summary.code}`);
  console.log(`failures: ${validation.summary.failureCount}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function simulateActionCommand(args) {
  const options = parseArgs(args);
  const result = await simulateAction({
    storePath: required(options.store, '--store is required'),
    requestPath: required(options.request, '--request is required'),
    outputPath: required(options.out, '--out is required'),
    overwrite: options.overwrite === true
  });
  const validation = await validateActionResult({ resultPath: options.out });
  console.log(`action: ${result.actionResult.action}`);
  console.log(`status: ${result.actionResult.status}`);
  console.log(`code: ${result.actionResult.code}`);
  console.log(`output: ${toPackageRelative(result.outputRoot)}`);
  console.log(`validation: ${validation.status}`);
  console.log(`changes: ${result.actionResult.summary.changeCount}`);
  console.log(`affectedLinks: ${result.actionResult.summary.affectedLinkCount}`);
  console.log(`affectedInstances: ${result.actionResult.summary.affectedInstanceCount}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function validateActionResultCommand(args) {
  const options = parseArgs(args);
  const validation = await validateActionResult({ resultPath: required(options.result, '--result is required') });
  console.log(`validation: ${validation.status}`);
  console.log(`action: ${validation.summary.action}`);
  console.log(`resultStatus: ${validation.summary.resultStatus}`);
  console.log(`failures: ${validation.summary.failureCount}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function apiWritePreflightCommand(args) {
  const options = parseArgs(args);
  const result = await runApiWritePreflight({
    storePath: required(options.store, '--store is required'),
    requestPath: required(options.request, '--request is required'),
    outputPath: required(options.out, '--out is required'),
    overwrite: options.overwrite === true
  });
  const validation = await validateApiWritePreflight({ resultPath: options.out });
  console.log(`apiWrite: ${result.response.ok ? 'ok' : 'blocked'}`);
  console.log(`code: ${result.response.code}`);
  console.log(`providerMode: ${result.response.providerMode}`);
  console.log(`requestId: ${result.response.requestId}`);
  console.log(`actionId: ${result.response.actionId}`);
  console.log(`correlationId: ${result.response.correlationId}`);
  console.log(`output: ${toPackageRelative(result.outputRoot)}`);
  console.log(`validation: ${validation.status}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function validateApiWritePreflightCommand(args) {
  const options = parseArgs(args);
  const validation = await validateApiWritePreflight({ resultPath: required(options.result, '--result is required') });
  console.log(`validation: ${validation.status}`);
  console.log(`requestId: ${validation.summary.requestId}`);
  console.log(`actionId: ${validation.summary.actionId}`);
  console.log(`providerMode: ${validation.summary.providerMode}`);
  console.log(`failures: ${validation.summary.failureCount}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function migrationDryRunCommand(args) {
  const options = parseArgs(args);
  const result = await runMigrationDryRun({
    storePath: required(options.store, '--store is required'),
    profilePath: required(options.profile, '--profile is required'),
    renderedPath: options.rendered ?? null,
    outputPath: required(options.out, '--out is required'),
    overwrite: options.overwrite === true
  });
  console.log(`migration: ${result.validation.status}`);
  console.log(`output: ${toPackageRelative(result.outputRoot)}`);
  console.log(`migrationRunId: ${result.summary.migrationRunId}`);
  console.log(`records: ${Object.values(result.summary.countsByEntity).reduce((sum, count) => sum + count, 0)}`);
  if (result.validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function validateMigrationDryRunCommand(args) {
  const options = parseArgs(args);
  const validation = await validateMigrationDryRun({ migrationPath: required(options.migration, '--migration is required') });
  console.log(`validation: ${validation.status}`);
  console.log(`migrationRunId: ${validation.migrationRunId}`);
  console.log(`failures: ${validation.summary.failureCount}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function inspectMigrationDryRunCommand(args) {
  const options = parseArgs(args);
  const summary = await inspectMigrationDryRun({ migrationPath: required(options.migration, '--migration is required') });
  console.log(`migration: ${summary.migrationRunId}`);
  console.log(`tenant: ${summary.tenantKey}`);
  console.log(`site: ${summary.siteKey}`);
  console.log(`providerMode: ${summary.providerMode}`);
  console.log(`status: ${summary.status}`);
  console.log(`records: ${summary.totalCandidateRecords}`);
  console.log(`failures: ${summary.failureCount}`);
}

async function providerCheckCommand(args) {
  const options = parseArgs(args);
  const result = await checkProviderCapabilities({
    profilePath: required(options.profile, '--profile is required'),
    outputPath: options.out ?? null,
    operation: options.operation ?? 'provider-check'
  });
  console.log(`provider: ${result.status}`);
  console.log(`providerProfileId: ${result.providerProfileId}`);
  console.log(`providerMode: ${result.providerMode}`);
  console.log(`liveWriteAllowed: ${result.summary.liveWriteAllowed}`);
  console.log(`canPlanWrites: ${result.summary.canPlanWrites}`);
  if (result.outputPath) {
    console.log(`output: ${result.outputPath}`);
  }
  if (result.validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function applyPlanDryRunCommand(args) {
  const options = parseArgs(args);
  const result = await runApplyPlanDryRun({
    migrationPath: required(options.migration, '--migration is required'),
    profilePath: required(options.profile, '--profile is required'),
    outputPath: required(options.out, '--out is required'),
    overwrite: options.overwrite === true
  });
  console.log(`applyPlan: ${result.validation.status}`);
  console.log(`output: ${toPackageRelative(result.outputRoot)}`);
  console.log(`applyPlanId: ${result.summary.applyPlanId}`);
  console.log(`providerProfileId: ${result.summary.providerProfileId}`);
  console.log(`providerMode: ${result.summary.providerMode}`);
  console.log(`records: ${result.summary.recordCount}`);
  if (result.validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function validateApplyPlanCommand(args) {
  const options = parseArgs(args);
  const validation = await validateApplyPlan({ applyPlanPath: required(options['apply-plan'], '--apply-plan is required') });
  console.log(`validation: ${validation.status}`);
  console.log(`applyPlanId: ${validation.applyPlanId}`);
  console.log(`providerMode: ${validation.providerMode}`);
  console.log(`failures: ${validation.summary.failureCount}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function inspectApplyPlanCommand(args) {
  const options = parseArgs(args);
  const summary = await inspectApplyPlan({ applyPlanPath: required(options['apply-plan'], '--apply-plan is required') });
  console.log(`applyPlan: ${summary.applyPlanId}`);
  console.log(`migration: ${summary.migrationRunId}`);
  console.log(`providerProfileId: ${summary.providerProfileId}`);
  console.log(`providerMode: ${summary.providerMode}`);
  console.log(`status: ${summary.status}`);
  console.log(`records: ${summary.recordCount}`);
  console.log(`failures: ${summary.failureCount}`);
}

async function stagingExecuteCommand(args) {
  const options = parseArgs(args);
  const result = await runStagingExecution({
    applyPlanPath: required(options['apply-plan'], '--apply-plan is required'),
    profilePath: required(options.profile, '--profile is required'),
    outputPath: required(options.out, '--out is required'),
    overwrite: options.overwrite === true
  });
  console.log(`stagingExecution: ${result.validation.status}`);
  console.log(`output: ${toPackageRelative(result.outputRoot)}`);
  console.log(`providerProfileId: ${result.summary.providerProfileId}`);
  console.log(`providerMode: ${result.summary.providerMode}`);
  console.log(`records: ${result.summary.recordCount}`);
  if (result.summary.stagingExecutionRunId) {
    console.log(`stagingExecutionRunId: ${result.summary.stagingExecutionRunId}`);
  }
  if (result.summary.readbackRunId) {
    console.log(`readbackRunId: ${result.summary.readbackRunId}`);
  }
  if (result.validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function stagingReadbackCommand(args) {
  const options = parseArgs(args);
  const result = await runStagingReadback({
    executionPath: required(options.execution, '--execution is required'),
    outputPath: required(options.out, '--out is required')
  });
  console.log(`readback: ${result.result.status}`);
  console.log(`output: ${toPackageRelative(result.outputRoot)}`);
  console.log(`records: ${result.summary.readbackRecordCount}`);
  if (result.result.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function validateStagingExecutionCommand(args) {
  const options = parseArgs(args);
  const validation = await validateStagingExecution({ executionPath: required(options.execution, '--execution is required') });
  console.log(`validation: ${validation.status}`);
  console.log(`stagingExecutionRunId: ${validation.stagingExecutionRunId}`);
  console.log(`providerMode: ${validation.providerMode}`);
  console.log(`failures: ${validation.summary.failureCount}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function inspectStagingExecutionCommand(args) {
  const options = parseArgs(args);
  const summary = await inspectStagingExecution({ executionPath: required(options.execution, '--execution is required') });
  console.log(`stagingExecution: ${summary.stagingExecutionRunId}`);
  console.log(`readback: ${summary.readbackRunId}`);
  console.log(`applyPlan: ${summary.applyPlanId}`);
  console.log(`providerProfileId: ${summary.providerProfileId}`);
  console.log(`providerMode: ${summary.providerMode}`);
  console.log(`status: ${summary.status}`);
  console.log(`records: ${summary.recordCount}`);
  console.log(`failures: ${summary.failureCount}`);
}

async function apiProviderStateCommand(args) {
  const options = parseArgs(args);
  const response = await getOutboundLinkProviderState({
    executionPath: required(options.execution, '--execution is required'),
    query: collectApiQuery(options),
    actor: collectApiActor(options)
  });
  await writeApiResponse({ response, outputPath: required(options.out, '--out is required') });
  printApiResponseSummary('api-provider-state', response);
}

async function writeApiResponse({ response, outputPath }) {
  const outputRoot = resolveTmpOutputPath(outputPath);
  await writeJson(path.join(outputRoot, 'API_RESPONSE.json'), response);
  return outputRoot;
}

function collectApiQuery(options) {
  return {
    tenantKey: options.tenant ?? options.tenantKey,
    siteKey: options.site ?? options.siteKey,
    domain: options.domain,
    status: options.status,
    pageId: options['page-id'] ?? options.pageId,
    anchorText: options['anchor-text'] ?? options.anchorText,
    firstDetectedFrom: options['first-detected-from'] ?? options.firstDetectedFrom,
    lastDetectedTo: options['last-detected-to'] ?? options.lastDetectedTo,
    reviewRequired: options['review-required'] ?? options.reviewRequired,
    page: options.page,
    pageSize: options['page-size'] ?? options.pageSize,
    sort: options.sort,
    sortDirection: options['sort-direction'] ?? options.sortDirection,
    linkId: options['link-id'] ?? options.linkId
  };
}

function collectApiActor(options) {
  return {
    actorId: options.actor ?? 'local-cli',
    role: options.role ?? 'SuperAdmin',
    assignedTenants: splitCsv(options['assigned-tenants'] ?? options.assignedTenants ?? options.tenant),
    assignedSites: splitCsv(options['assigned-sites'] ?? options.assignedSites ?? options.site),
    mode: 'local-offline'
  };
}

function splitCsv(value) {
  if (!value) {
    return [];
  }
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

function printApiResponseSummary(label, response) {
  const itemCount = Array.isArray(response.data?.items)
    ? response.data.items.length
    : response.data?.link
      ? 1
      : response.data
        ? 1
        : 0;
  console.log(`${label}: ${response.ok ? 'ok' : 'blocked'}`);
  console.log(`code: ${response.code}`);
  console.log(`status: ${response.status}`);
  console.log(`items: ${itemCount}`);
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
  export-backup --store .tmp/local-store-policy --rendered .tmp/render-active --out .tmp/backup-center-export [--overwrite]
  validate-backup-export --export .tmp/backup-center-export
  export-tenant-bundle --store .tmp/local-store-policy --rendered .tmp/render-active --out .tmp/tenant-bundle-export [--overwrite]
  validate-tenant-bundle --bundle .tmp/tenant-bundle-export
  create-onboarding-import --store .tmp/local-store-policy --out .tmp/onboarding-import [--overwrite]
  validate-onboarding-import --import .tmp/onboarding-import
  simulate-restore-validation --export .tmp/backup-center-export --out .tmp/restore-validation [--overwrite]
  api-list-links --store .tmp/local-store-policy --tenant fixture-tenant --site fixture-site --out .tmp/api-list-links
  api-get-link --store .tmp/local-store-policy --link-id ol_example --tenant fixture-tenant --site fixture-site --out .tmp/api-get-link
  api-list-instances --store .tmp/local-store-policy --tenant fixture-tenant --site fixture-site --out .tmp/api-list-instances
  api-list-policies --store .tmp/local-store-policy --tenant fixture-tenant --site fixture-site --out .tmp/api-list-policies
  api-list-scan-runs --store .tmp/local-store-policy --tenant fixture-tenant --site fixture-site --out .tmp/api-list-scan-runs
  api-list-audit --store .tmp/local-store-policy --tenant fixture-tenant --site fixture-site --out .tmp/api-list-audit
  api-dashboard-summary --store .tmp/local-store-policy --tenant fixture-tenant --site fixture-site --out .tmp/api-dashboard-summary
  api-request-write --store .tmp/local-store-policy --action set-link-status --tenant fixture-tenant --site fixture-site --out .tmp/api-write-blocked
  validate-api-response --response .tmp/api-list-links
  simulate-action --store .tmp/local-store-policy --request fixtures/action-approve-review.fixture.json --out .tmp/action-approve-review [--overwrite]
  validate-action-result --result .tmp/action-approve-review
  api-write-preflight --store .tmp/local-store-policy --request fixtures/api-write-preflight-approve-review.fixture.json --out .tmp/api-write-preflight-approve-review [--overwrite]
  validate-api-write-preflight --result .tmp/api-write-preflight-approve-review
  migration-dry-run --store .tmp/local-store-policy --profile fixtures/migration-production-provider-profile.fixture.json --out .tmp/phase-2h17-migration-dry-run [--rendered .tmp/render-active] [--overwrite]
  validate-migration-dry-run --migration .tmp/phase-2h17-migration-dry-run
  inspect-migration-dry-run --migration .tmp/phase-2h17-migration-dry-run
  provider-check --profile fixtures/provider-profile-staging-simulated.fixture.json --out .tmp/phase-2h19-staging-provider/provider-check
  apply-plan-dry-run --migration .tmp/phase-2h17-migration-dry-run --profile fixtures/provider-profile-staging-simulated.fixture.json --out .tmp/phase-2h19-staging-provider/apply-plan [--overwrite]
  validate-apply-plan --apply-plan .tmp/phase-2h19-staging-provider/apply-plan
  inspect-apply-plan --apply-plan .tmp/phase-2h19-staging-provider/apply-plan
  staging-execute --apply-plan .tmp/phase-2h20-staging-persistence-integration/apply-plan-refresh --profile fixtures/staging-execution-profile.fixture.json --out .tmp/phase-2h20-staging-persistence-integration/execution [--overwrite]
  staging-readback --execution .tmp/phase-2h20-staging-persistence-integration/execution --out .tmp/phase-2h20-staging-persistence-integration/readback
  validate-staging-execution --execution .tmp/phase-2h20-staging-persistence-integration/execution
  inspect-staging-execution --execution .tmp/phase-2h20-staging-persistence-integration/execution
  api-provider-state --execution .tmp/phase-2h20-staging-persistence-integration/execution --tenant fixture-tenant --site fixture-site --out .tmp/phase-2h20-staging-persistence-integration/api-provider-state

Boundary:
  Local fixture JSON only. No external HTTP crawling, CMS/API calls, CMS writes, protected config reads, deployment, indexing, or live-page publication.
`);
}

await main();
