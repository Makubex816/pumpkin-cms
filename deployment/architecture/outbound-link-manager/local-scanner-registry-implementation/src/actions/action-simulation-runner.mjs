import fs from 'node:fs/promises';
import path from 'node:path';
import { readLocalStore, cloneStore } from '../store/local-store-reader.mjs';
import { writeLocalStore } from '../store/local-store-writer.mjs';
import { resolveFixturePath, resolveTmpOutputPath, toPackageRelative } from '../utils/safe-paths.mjs';
import { readJson, writeJson, pathExists } from '../utils/json-writer.mjs';
import { actionTypes, normalizeActionRequest } from './action-request-model.mjs';
import { evaluateActionApproval } from './action-approval-guard.mjs';
import { simulateReviewDecision } from './review-decision-simulator.mjs';
import { simulateLinkStatusAction } from './link-status-action-simulator.mjs';
import { simulateInstanceStatusAction } from './instance-status-action-simulator.mjs';
import { simulatePolicyUpdate } from './policy-update-simulator.mjs';
import { simulateScanRunCreation } from './scan-run-simulator.mjs';
import { simulateBulkActionPreflight } from './bulk-action-preflight-simulator.mjs';
import { analyzePublishingImpact, localBoundaries } from './publishing-impact-analyzer.mjs';
import { appendSimulationAudit, createActionAuditEntry, writeActionAudit } from './action-audit-writer.mjs';
import { createRollbackPlan, writeRollbackPlan } from './rollback-plan-writer.mjs';

export async function simulateAction({
  storePath,
  requestPath,
  outputPath,
  overwrite = false
}) {
  const rawRequest = await readJson(resolveFixturePath(requestPath));
  return simulateActionFromRaw({
    storePath,
    rawRequest,
    outputPath,
    overwrite
  });
}

export async function simulateActionFromRaw({
  storePath,
  rawRequest,
  outputPath,
  overwrite = false
}) {
  const outputRoot = resolveTmpOutputPath(outputPath);
  if (await pathExists(outputRoot)) {
    if (!overwrite) {
      throw new Error(`action result output already exists: ${outputPath}`);
    }
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(outputRoot, { recursive: true });

  const request = normalizeActionRequest(rawRequest);
  const baseStore = cloneStore(await readLocalStore(storePath));
  const approval = evaluateActionApproval({ store: baseStore, request });

  if (!approval.approved) {
    const impact = analyzePublishingImpact({ store: baseStore, request });
    const rollbackPlan = createRollbackPlan({ request, changes: [], impact, blocked: true });
    const actionResult = buildActionResult({
      request,
      approval,
      outputRoot,
      sandboxStorePath: null,
      impact,
      rollbackPlan,
      simulation: null,
      status: 'blocked'
    });
    await writeJson(path.join(outputRoot, 'PUBLISHING_IMPACT.json'), impact);
    await writeRollbackPlan({ outputRoot, rollbackPlan });
    await writeJson(path.join(outputRoot, 'ACTION_RESULT.json'), actionResult);
    await writeMarkdownSummary({ outputRoot, actionResult });
    return { outputRoot, actionResult };
  }

  const simulation = runSimulation({ store: baseStore, request });
  const impact = analyzePublishingImpact({
    store: simulation.nextStore,
    request,
    affectedLinkIds: simulation.affectedLinkIds,
    affectedInstanceIds: simulation.affectedInstanceIds,
    domain: request.target.domain
  });
  const auditedStore = appendSimulationAudit(simulation.nextStore, {
    request,
    recordType: simulation.recordType,
    recordId: simulation.recordId,
    before: simulation.before,
    after: simulation.after,
    impact
  });
  const sandboxStorePath = path.join(toPackageRelative(outputRoot), 'sandbox-store');
  const sandboxStoreRoot = await writeLocalStore({
    store: auditedStore,
    outputPath: sandboxStorePath,
    overwrite: true,
    now: request.now
  });
  const auditEntry = createActionAuditEntry({
    request,
    recordType: simulation.recordType,
    recordId: simulation.recordId,
    before: simulation.before,
    after: simulation.after,
    impact
  });
  const rollbackPlan = createRollbackPlan({
    request,
    changes: simulation.changes,
    impact,
    blocked: false
  });
  const actionResult = buildActionResult({
    request,
    approval,
    outputRoot,
    sandboxStorePath: sandboxStoreRoot,
    impact,
    rollbackPlan,
    simulation,
    status: 'simulated'
  });

  await writeJson(path.join(outputRoot, 'PUBLISHING_IMPACT.json'), impact);
  await writeActionAudit({ outputRoot, auditEntry });
  await writeRollbackPlan({ outputRoot, rollbackPlan });
  await writeJson(path.join(outputRoot, 'ACTION_RESULT.json'), actionResult);
  await writeMarkdownSummary({ outputRoot, actionResult });
  return { outputRoot, actionResult };
}

function runSimulation({ store, request }) {
  switch (request.action) {
    case actionTypes.APPROVE_REVIEW:
    case actionTypes.BLOCK_REVIEW:
    case actionTypes.IGNORE_REVIEW:
      return simulateReviewDecision({ store, request });
    case actionTypes.SET_LINK_STATUS:
      return simulateLinkStatusAction({ store, request });
    case actionTypes.SET_INSTANCE_STATUS:
      return simulateInstanceStatusAction({ store, request });
    case actionTypes.UPDATE_POLICY:
      return simulatePolicyUpdate({ store, request });
    case actionTypes.CREATE_SCAN_RUN:
      return simulateScanRunCreation({ store, request });
    case actionTypes.BULK_DOMAIN_DISABLE:
    case actionTypes.BULK_DOMAIN_REVIEW:
    case actionTypes.BULK_PAGE_INSTANCES:
      return simulateBulkActionPreflight({ store, request });
    default:
      throw new Error(`unsupported local action simulation: ${request.action}`);
  }
}

function buildActionResult({
  request,
  approval,
  outputRoot,
  sandboxStorePath,
  impact,
  rollbackPlan,
  simulation,
  status
}) {
  const simulated = status === 'simulated';
  return {
    schemaVersion: '0.1.0',
    resultType: 'pumpkin-outbound-link-local-write-action-result',
    ok: simulated,
    status,
    code: simulated ? 'LOCAL_ACTION_SIMULATED' : 'LOCAL_ACTION_BLOCKED',
    message: simulated
      ? 'Local sandbox write simulation completed without production writes.'
      : 'Local action request was blocked by approval guards.',
    action: request.action,
    label: request.label,
    tenantKey: request.tenantKey,
    siteKey: request.siteKey,
    operationId: request.operationId,
    requestId: request.requestId,
    generatedAt: request.now,
    actor: approval.actor,
    approval: {
      approved: approval.approved,
      localSimulationApproved: approval.localSimulationApproved,
      productionWriteApproved: false,
      futureGateRequired: true,
      failures: approval.failures
    },
    summary: {
      changeCount: rollbackPlan.summary.changeCount,
      affectedLinkCount: impact.summary.affectedLinkCount,
      affectedInstanceCount: impact.summary.affectedInstanceCount,
      affectedPageCount: impact.summary.affectedPageCount,
      sandboxStorePath: sandboxStorePath ? toPackageRelative(sandboxStorePath) : null
    },
    artifacts: {
      actionResult: toPackageRelative(path.join(outputRoot, 'ACTION_RESULT.json')),
      publishingImpact: toPackageRelative(path.join(outputRoot, 'PUBLISHING_IMPACT.json')),
      auditLog: simulated ? toPackageRelative(path.join(outputRoot, 'ACTION_AUDIT_LOG.json')) : null,
      rollbackPlan: toPackageRelative(path.join(outputRoot, 'ROLLBACK_PLAN.json')),
      sandboxStore: sandboxStorePath ? toPackageRelative(sandboxStorePath) : null
    },
    simulation: simulation ? {
      recordType: simulation.recordType,
      recordId: simulation.recordId,
      affectedLinkIds: simulation.affectedLinkIds,
      affectedInstanceIds: simulation.affectedInstanceIds
    } : null,
    boundaries: localBoundaries()
  };
}

async function writeMarkdownSummary({ outputRoot, actionResult }) {
  const lines = [
    '# Outbound Link Local Action Result',
    '',
    `- Status: ${actionResult.status}`,
    `- Code: ${actionResult.code}`,
    `- Action: ${actionResult.action}`,
    `- Tenant: ${actionResult.tenantKey}`,
    `- Site: ${actionResult.siteKey}`,
    `- Changes: ${actionResult.summary.changeCount}`,
    `- Affected links: ${actionResult.summary.affectedLinkCount}`,
    `- Affected instances: ${actionResult.summary.affectedInstanceCount}`,
    `- Sandbox store: ${actionResult.summary.sandboxStorePath ?? 'not written'}`,
    `- Production writes approved: ${actionResult.approval.productionWriteApproved}`,
    '',
    'This result is a local/offline sandbox artifact only.'
  ];
  await fs.writeFile(path.join(outputRoot, 'ACTION_RESULT.md'), `${lines.join('\n')}\n`, 'utf8');
}
