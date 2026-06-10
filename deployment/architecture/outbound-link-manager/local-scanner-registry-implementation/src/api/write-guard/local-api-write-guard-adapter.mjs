import fs from 'node:fs/promises';
import path from 'node:path';
import { readLocalStore, cloneStore } from '../../store/local-store-reader.mjs';
import { resolveFixturePath, resolveTmpOutputPath } from '../../utils/safe-paths.mjs';
import { readJson, writeJson, pathExists } from '../../utils/json-writer.mjs';
import { simulateActionFromRaw } from '../../actions/action-simulation-runner.mjs';
import { normalizeApiWriteRequest, providerBlockFor, toLocalActionRequest } from './write-action-bridge-contracts.mjs';
import { createTraceLog, writeTraceLog } from './trace-log-writer.mjs';
import { buildApiWriteResponse } from './write-action-response-model.mjs';

export async function runApiWritePreflight({
  storePath,
  requestPath,
  outputPath,
  overwrite = false
}) {
  const rawRequest = await readJson(resolveFixturePath(requestPath));
  return runApiWritePreflightFromRaw({
    storePath,
    rawRequest,
    outputPath,
    overwrite
  });
}

export async function runApiWritePreflightFromRaw({
  storePath,
  rawRequest,
  outputPath,
  overwrite = false
}) {
  const outputRoot = resolveTmpOutputPath(outputPath);
  if (await pathExists(outputRoot)) {
    if (!overwrite) {
      throw new Error(`api write preflight output already exists: ${outputPath}`);
    }
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(outputRoot, { recursive: true });

  const apiRequest = normalizeApiWriteRequest(rawRequest);
  const baseStore = cloneStore(await readLocalStore(storePath));
  const providerBlock = providerBlockFor(apiRequest);

  if (providerBlock) {
    const blockedActionResult = blockedResult(apiRequest, providerBlock, outputRoot);
    const rollbackPlan = blockedRollbackPlan(apiRequest, providerBlock);
    const traceLog = await createTraceLog({
      apiRequest,
      actionResult: blockedActionResult,
      outputRoot,
      baseStore,
      rollbackPlan,
      providerBlock,
      validationResultId: validationResultId(apiRequest)
    });
    const response = buildApiWriteResponse({
      apiRequest,
      actionResult: blockedActionResult,
      traceLog,
      rollbackPlan,
      providerBlock,
      outputRoot
    });
    await writeTraceLog({ outputRoot, traceLog });
    await writeJson(path.join(outputRoot, 'ROLLBACK_PLAN.json'), rollbackPlan);
    await writeJson(path.join(outputRoot, 'API_WRITE_RESPONSE.json'), response);
    await writeJson(path.join(outputRoot, 'ACTION_RESULT.json'), blockedActionResult);
    return { outputRoot, response, traceLog };
  }

  const localRequest = toLocalActionRequest(apiRequest);
  const simulation = await simulateActionFromRaw({
    storePath,
    rawRequest: localRequest,
    outputPath,
    overwrite: true
  });
  const actionResult = simulation.actionResult;
  const publishingImpact = await readJson(path.join(outputRoot, 'PUBLISHING_IMPACT.json'));
  const rollbackPlan = await readJson(path.join(outputRoot, 'ROLLBACK_PLAN.json'));
  const auditLog = actionResult.artifacts.auditLog
    ? await readJson(path.join(outputRoot, 'ACTION_AUDIT_LOG.json'))
    : null;
  const afterStore = actionResult.artifacts.sandboxStore
    ? cloneStore(await readLocalStore(actionResult.artifacts.sandboxStore))
    : baseStore;
  const traceLog = await createTraceLog({
    apiRequest,
    actionResult,
    outputRoot,
    baseStore,
    afterStore,
    publishingImpact,
    rollbackPlan,
    auditLog,
    validationResultId: validationResultId(apiRequest)
  });
  const response = buildApiWriteResponse({
    apiRequest,
    actionResult,
    traceLog,
    publishingImpact,
    auditLog,
    rollbackPlan,
    outputRoot
  });
  await writeTraceLog({ outputRoot, traceLog });
  await writeJson(path.join(outputRoot, 'API_WRITE_RESPONSE.json'), response);
  return { outputRoot, response, traceLog };
}

function blockedResult(apiRequest, providerBlock, outputRoot) {
  return {
    schemaVersion: '0.1.0',
    resultType: 'pumpkin-outbound-link-local-write-action-result',
    ok: false,
    status: 'blocked',
    code: providerBlock.code,
    message: providerBlock.message,
    action: apiRequest.localAction,
    label: apiRequest.action,
    tenantKey: apiRequest.tenantKey,
    siteKey: apiRequest.siteKey,
    operationId: apiRequest.actionId,
    requestId: apiRequest.requestId,
    generatedAt: apiRequest.now,
    actor: {
      actorId: apiRequest.actor.actorId,
      role: apiRequest.actor.actorRole
    },
    approval: {
      approved: false,
      localSimulationApproved: false,
      productionWriteApproved: false,
      futureGateRequired: true,
      failures: [{ code: providerBlock.code, message: providerBlock.message, path: 'providerMode' }]
    },
    summary: {
      changeCount: 0,
      affectedLinkCount: 0,
      affectedInstanceCount: 0,
      affectedPageCount: 0,
      sandboxStorePath: null
    },
    artifacts: {
      actionResult: path.join(outputRoot, 'ACTION_RESULT.json'),
      publishingImpact: null,
      auditLog: null,
      rollbackPlan: null,
      sandboxStore: null
    },
    simulation: null,
    boundaries: {
      localOnly: true,
      externalHttpCrawling: false,
      cmsApiCalls: false,
      cmsWrites: false,
      protectedConfigReads: false,
      productionWriteApproved: false
    }
  };
}

function blockedRollbackPlan(apiRequest, providerBlock) {
  return {
    schemaVersion: '0.1.0',
    rollbackType: 'pumpkin-outbound-link-api-write-rollback-plan',
    rollbackPlanId: `olrp_${apiRequest.actionId.slice(-16)}`,
    action: apiRequest.action,
    tenantKey: apiRequest.tenantKey,
    siteKey: apiRequest.siteKey,
    operationId: apiRequest.actionId,
    requestId: apiRequest.requestId,
    generatedAt: apiRequest.now,
    blocked: true,
    blockReason: providerBlock.blockReason,
    executableAgainstLiveSystems: false,
    rollbackExecutionImplemented: false,
    changes: [],
    summary: {
      changeCount: 0,
      affectedLinkCount: 0,
      affectedInstanceCount: 0,
      affectedPageCount: 0
    },
    boundaries: {
      localOnly: true,
      externalHttpCrawling: false,
      cmsApiCalls: false,
      cmsWrites: false,
      protectedConfigReads: false,
      productionWriteApproved: false
    }
  };
}

function validationResultId(apiRequest) {
  return `olvr_${apiRequest.actionId.slice(-16)}`;
}
