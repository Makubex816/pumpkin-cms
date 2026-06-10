import path from 'node:path';
import { appendAuditLog } from '../audit/audit-log-writer.mjs';
import { writeJson } from '../utils/json-writer.mjs';
import { localBoundaries } from './publishing-impact-analyzer.mjs';

export function appendSimulationAudit(store, { request, recordType, recordId, before = null, after = null, impact = null }) {
  const auditedStore = appendAuditLog(store, {
    action: request.action,
    recordType,
    recordId,
    actor: request.actor.actorId,
    reason: request.reason,
    before,
    after: {
      ...after,
      approvalReference: request.approvalReference,
      policyReference: request.policyReference,
      operationId: request.operationId,
      requestId: request.requestId,
      affectedPageCount: impact?.summary?.affectedPageCount ?? 0,
      affectedInstanceCount: impact?.summary?.affectedInstanceCount ?? 0
    },
    now: request.now
  });
  return auditedStore;
}

export function createActionAuditEntry({ request, recordType, recordId, before = null, after = null, impact = null }) {
  return {
    schemaVersion: '0.1.0',
    auditType: 'pumpkin-outbound-link-local-action-audit-entry',
    action: request.action,
    tenantKey: request.tenantKey,
    siteKey: request.siteKey,
    outboundLinkId: recordType === 'outbound_link' ? recordId : request.target.linkId,
    outboundLinkInstanceId: recordType === 'outbound_link_instance' ? recordId : request.target.instanceId,
    domain: request.target.domain,
    previousValue: before,
    newValue: after,
    performedBy: request.actor.actorId,
    performedAt: request.now,
    reason: request.reason,
    policyReference: request.policyReference,
    approvalReference: request.approvalReference,
    affectedPageCount: impact?.summary?.affectedPageCount ?? 0,
    affectedInstanceCount: impact?.summary?.affectedInstanceCount ?? 0,
    requestId: request.requestId,
    operationId: request.operationId,
    idempotencyKey: request.idempotencyKey,
    boundaries: localBoundaries()
  };
}

export async function writeActionAudit({ outputRoot, auditEntry }) {
  await writeJson(path.join(outputRoot, 'ACTION_AUDIT_LOG.json'), auditEntry);
}
