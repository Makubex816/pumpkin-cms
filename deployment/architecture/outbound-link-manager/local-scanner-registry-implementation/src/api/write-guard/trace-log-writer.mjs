import crypto from 'node:crypto';
import path from 'node:path';
import { readLocalStore } from '../../store/local-store-reader.mjs';
import { writeJson } from '../../utils/json-writer.mjs';
import { redactUrlForLog } from './url-log-redactor.mjs';

export function hashState(value) {
  return `sha256:${crypto.createHash('sha256').update(stableJson(value)).digest('hex')}`;
}

export async function createTraceLog({
  apiRequest,
  actionResult,
  outputRoot,
  baseStore,
  afterStore = null,
  publishingImpact = null,
  rollbackPlan = null,
  auditLog = null,
  providerBlock = null,
  validationResultId = null
}) {
  const simulated = actionResult?.status === 'simulated';
  const affectedInstanceIds = actionResult?.simulation?.affectedInstanceIds ?? publishingImpact?.affectedInstances?.map((item) => item.id) ?? [];
  const affectedPageIds = publishingImpact?.groupings?.pages ?? [];
  const affectedLinks = publishingImpact?.affectedLinks ?? [];
  const primaryLink = affectedLinks[0] ?? null;
  const auditEventIds = await collectAuditIds(actionResult);
  const rollbackPlanId = rollbackPlan?.rollbackPlanId
    ?? `olrp_${shortHash(`${apiRequest.actionId}|${rollbackPlan?.operationId ?? 'blocked'}|${rollbackPlan?.summary?.changeCount ?? 0}`)}`;

  return {
    schemaVersion: '0.1.0',
    traceType: 'pumpkin-outbound-link-api-write-trace',
    requestId: apiRequest.requestId,
    actionId: apiRequest.actionId,
    correlationId: apiRequest.correlationId,
    tenantKey: apiRequest.tenantKey,
    siteKey: apiRequest.siteKey,
    actorId: apiRequest.actor.actorId,
    actorEmail: apiRequest.actor.actorEmail,
    actorRole: apiRequest.actor.actorRole,
    providerMode: apiRequest.providerMode,
    approvalState: simulated ? 'approved-local-fake' : 'blocked',
    approvalReference: apiRequest.approvalReference,
    outboundLinkId: linkIdFor(actionResult),
    outboundLinkInstanceId: instanceIdFor(actionResult),
    policyId: policyIdFor(apiRequest, actionResult),
    policyVersion: apiRequest.payload?.policyVersion ?? apiRequest.payload?.policy?.version ?? null,
    scanRunId: scanRunIdFor(actionResult),
    reviewDecisionId: reviewDecisionIdFor(apiRequest),
    bulkActionId: bulkActionIdFor(apiRequest),
    auditEventIds,
    rollbackPlanId,
    affectedPageIds,
    affectedInstanceIds,
    affectedDomain: apiRequest.target?.domain ?? primaryLink?.domain ?? null,
    normalizedUrl: redactUrlForLog(apiRequest.target?.logUrl ?? apiRequest.target?.normalizedUrl ?? primaryLink?.normalizedUrl ?? null),
    beforeStateHash: hashState(baseStore),
    afterStateHash: hashState(afterStore ?? baseStore),
    performedAt: apiRequest.now,
    reason: apiRequest.reason,
    outcome: simulated ? 'applied-local-fake' : 'blocked',
    blockReason: providerBlock?.blockReason ?? actionResult?.approval?.failures?.map((item) => item.code).join(',') ?? null,
    validationResultId,
    artifacts: {
      actionResult: actionResult?.artifacts?.actionResult ?? null,
      traceLog: outputRoot ? path.join(outputRoot, 'TRACE_LOG.json') : null,
      rollbackPlan: actionResult?.artifacts?.rollbackPlan ?? null,
      sandboxStore: actionResult?.artifacts?.sandboxStore ?? null
    },
    boundaries: {
      localOnly: true,
      simulatedOnly: true,
      liveWriteAllowed: false,
      externalHttpCrawling: false,
      cmsApiCalls: false,
      cmsWrites: false,
      protectedConfigReads: false
    }
  };
}

export async function writeTraceLog({ outputRoot, traceLog }) {
  await writeJson(path.join(outputRoot, 'TRACE_LOG.json'), traceLog);
}

async function collectAuditIds(actionResult) {
  const sandboxStore = actionResult?.artifacts?.sandboxStore;
  if (!sandboxStore) {
    return [];
  }
  const store = await readLocalStore(sandboxStore);
  return store.auditLogs.map((item) => item.id).filter(Boolean).slice(-3);
}

function linkIdFor(actionResult) {
  if (actionResult?.simulation?.recordType === 'outbound_link') {
    return actionResult.simulation.recordId;
  }
  return actionResult?.simulation?.affectedLinkIds?.[0] ?? null;
}

function instanceIdFor(actionResult) {
  if (actionResult?.simulation?.recordType === 'outbound_link_instance') {
    return actionResult.simulation.recordId;
  }
  return actionResult?.simulation?.affectedInstanceIds?.[0] ?? null;
}

function policyIdFor(apiRequest, actionResult) {
  if (actionResult?.simulation?.recordType === 'outbound_link_policy') {
    return actionResult.simulation.recordId;
  }
  return apiRequest.payload?.policy?.id ?? apiRequest.payload?.policyPatch?.id ?? null;
}

function scanRunIdFor(actionResult) {
  return actionResult?.simulation?.recordType === 'outbound_link_scan_run'
    ? actionResult.simulation.recordId
    : null;
}

function reviewDecisionIdFor(apiRequest) {
  return ['approveReviewDecision', 'blockReviewDecision', 'ignoreReviewDecision'].includes(apiRequest.action)
    ? `olrd_${shortHash(apiRequest.actionId)}`
    : null;
}

function bulkActionIdFor(apiRequest) {
  return apiRequest.action.startsWith('bulk') ? `olba_${shortHash(apiRequest.actionId)}` : null;
}

function stableJson(value) {
  return JSON.stringify(sortObject(value));
}

function sortObject(value) {
  if (Array.isArray(value)) {
    return value.map(sortObject);
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((accumulator, key) => {
      accumulator[key] = sortObject(value[key]);
      return accumulator;
    }, {});
  }
  return value;
}

function shortHash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 12);
}
