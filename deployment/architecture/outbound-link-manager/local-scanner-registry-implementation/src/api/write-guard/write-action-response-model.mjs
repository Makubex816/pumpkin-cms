import path from 'node:path';
import { toPackageRelative } from '../../utils/safe-paths.mjs';

export function buildApiWriteResponse({
  apiRequest,
  actionResult,
  traceLog,
  publishingImpact = null,
  auditLog = null,
  rollbackPlan = null,
  providerBlock = null,
  outputRoot
}) {
  const applied = actionResult?.status === 'simulated';
  const blocked = !applied;
  const status = applied ? 200 : 403;
  const code = applied ? 'OK' : providerBlock?.code ?? 'OUTBOUND_LINK_WRITE_NOT_APPROVED';
  const message = applied
    ? 'Scoped local/fake write action completed in sandbox provider mode.'
    : providerBlock?.message ?? 'Scoped write action was blocked by guards.';
  return {
    schemaVersion: '0.1.0',
    responseType: 'pumpkin-outbound-link-api-write-action-response',
    ok: applied,
    status,
    code,
    message,
    requestId: apiRequest.requestId,
    actionId: apiRequest.actionId,
    correlationId: apiRequest.correlationId,
    tenantKey: apiRequest.tenantKey,
    siteKey: apiRequest.siteKey,
    actorId: apiRequest.actor.actorId,
    actorEmail: apiRequest.actor.actorEmail,
    actorRole: apiRequest.actor.actorRole,
    providerMode: apiRequest.providerMode,
    approvalRequired: true,
    approvalState: applied ? 'approved-local-fake' : 'blocked',
    approvalReference: apiRequest.approvalReference,
    liveWriteAllowed: false,
    simulatedOnly: true,
    applied,
    outboundLinkId: traceLog.outboundLinkId,
    outboundLinkInstanceId: traceLog.outboundLinkInstanceId,
    policyId: traceLog.policyId,
    policyVersion: traceLog.policyVersion,
    scanRunId: traceLog.scanRunId,
    reviewDecisionId: traceLog.reviewDecisionId,
    bulkActionId: traceLog.bulkActionId,
    affectedPageIds: traceLog.affectedPageIds,
    affectedInstanceIds: traceLog.affectedInstanceIds,
    beforeStateHash: traceLog.beforeStateHash,
    afterStateHash: traceLog.afterStateHash,
    publishingImpact,
    auditEventIds: traceLog.auditEventIds,
    auditLog,
    rollbackPlanId: traceLog.rollbackPlanId,
    rollbackPlan,
    traceLog,
    errors: blocked ? [{
      code,
      message,
      path: providerBlock ? 'providerMode' : 'approval'
    }] : [],
    meta: {
      mode: 'local-api-write-guard',
      localOnly: true,
      providerMode: apiRequest.providerMode,
      action: apiRequest.action,
      localAction: apiRequest.localAction,
      outputRoot: toPackageRelative(outputRoot),
      artifacts: {
        apiWriteResponse: toPackageRelative(path.join(outputRoot, 'API_WRITE_RESPONSE.json')),
        traceLog: toPackageRelative(path.join(outputRoot, 'TRACE_LOG.json')),
        actionResult: actionResult?.artifacts?.actionResult ?? null,
        publishingImpact: actionResult?.artifacts?.publishingImpact ?? null,
        rollbackPlan: actionResult?.artifacts?.rollbackPlan ?? null,
        sandboxStore: actionResult?.artifacts?.sandboxStore ?? null
      },
      boundaries: {
        externalHttpCrawling: false,
        cmsApiCalls: false,
        cmsWrites: false,
        protectedConfigReads: false,
        liveProviderWrites: false,
        productionDatabaseMigration: false
      }
    }
  };
}
