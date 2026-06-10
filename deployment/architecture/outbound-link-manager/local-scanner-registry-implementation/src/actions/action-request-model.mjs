import { createRequestId } from '../api/contracts/response-envelope.mjs';
import { normalizeActor } from '../api/contracts/query-normalizer.mjs';

export const actionTypes = {
  APPROVE_REVIEW: 'approve_review',
  BLOCK_REVIEW: 'block_review',
  IGNORE_REVIEW: 'ignore_review',
  SET_LINK_STATUS: 'set_link_status',
  SET_INSTANCE_STATUS: 'set_instance_status',
  UPDATE_POLICY: 'update_policy',
  CREATE_SCAN_RUN: 'create_scan_run',
  BULK_DOMAIN_DISABLE: 'bulk_domain_disable',
  BULK_DOMAIN_REVIEW: 'bulk_domain_review',
  BULK_PAGE_INSTANCES: 'bulk_page_instances'
};

export const bulkActionTypes = new Set([
  actionTypes.BULK_DOMAIN_DISABLE,
  actionTypes.BULK_DOMAIN_REVIEW,
  actionTypes.BULK_PAGE_INSTANCES
]);

export const writeActionLabels = {
  [actionTypes.APPROVE_REVIEW]: 'Approve review item',
  [actionTypes.BLOCK_REVIEW]: 'Block review item',
  [actionTypes.IGNORE_REVIEW]: 'Ignore review item',
  [actionTypes.SET_LINK_STATUS]: 'Set link status',
  [actionTypes.SET_INSTANCE_STATUS]: 'Set instance status',
  [actionTypes.UPDATE_POLICY]: 'Update outbound link policy',
  [actionTypes.CREATE_SCAN_RUN]: 'Create local scan run',
  [actionTypes.BULK_DOMAIN_DISABLE]: 'Bulk disable domain links',
  [actionTypes.BULK_DOMAIN_REVIEW]: 'Bulk require domain review',
  [actionTypes.BULK_PAGE_INSTANCES]: 'Bulk update page instances'
};

export function normalizeActionRequest(rawRequest = {}) {
  const now = rawRequest.now ?? new Date().toISOString();
  const action = String(rawRequest.action ?? '').trim();
  return {
    schemaVersion: rawRequest.schemaVersion ?? '0.1.0',
    action,
    label: writeActionLabels[action] ?? action,
    tenantKey: String(rawRequest.tenantKey ?? rawRequest.tenant_id ?? '').trim(),
    siteKey: String(rawRequest.siteKey ?? rawRequest.site_id ?? '').trim(),
    reason: nullableTrim(rawRequest.reason),
    approvalReference: nullableTrim(rawRequest.approvalReference),
    policyReference: nullableTrim(rawRequest.policyReference),
    idempotencyKey: nullableTrim(rawRequest.idempotencyKey) ?? `local-${action}-${now}`,
    requestId: nullableTrim(rawRequest.requestId) ?? createRequestId(now),
    operationId: nullableTrim(rawRequest.operationId) ?? `oloa_${compactTimestamp(now)}_${safeToken(action || 'unknown')}`,
    actor: normalizeActor(rawRequest.actor ?? {}),
    target: normalizeTarget(rawRequest.target ?? {}),
    payload: rawRequest.payload ?? {},
    profile: normalizeProfile(rawRequest.profile ?? {}),
    now
  };
}

export function normalizeProfile(profile = {}) {
  return {
    name: profile.name ?? 'local-dev',
    localOfflineDefault: profile.localOfflineDefault !== false,
    fakeProvider: profile.fakeProvider !== false,
    offlineBundle: profile.offlineBundle !== false,
    localFileBackedStore: profile.localFileBackedStore !== false,
    liveReadonlyExplicit: profile.liveReadonlyExplicit === true,
    liveWriteApproved: false,
    productionWriteApproved: false
  };
}

export function normalizeTarget(target = {}) {
  return {
    linkId: nullableTrim(target.linkId ?? target.outboundLinkId ?? target.link_id),
    instanceId: nullableTrim(target.instanceId ?? target.outboundLinkInstanceId ?? target.instance_id),
    domain: nullableTrim(target.domain)?.toLowerCase() ?? null,
    normalizedUrl: nullableTrim(target.normalizedUrl ?? target.normalized_url),
    pageId: nullableTrim(target.pageId ?? target.page_id),
    status: nullableTrim(target.status),
    instanceStatus: nullableTrim(target.instanceStatus),
    decision: nullableTrim(target.decision)
  };
}

export function selectLink(store, target = {}) {
  const matches = store.links.filter((link) => {
    if (target.linkId) return link.id === target.linkId;
    if (target.normalizedUrl) return link.normalized_url === target.normalizedUrl;
    if (target.domain) return link.domain === target.domain;
    return false;
  });
  if (matches.length === 0) {
    throw new Error('no matching outbound link found for action target');
  }
  if (matches.length > 1 && !target.linkId && !target.normalizedUrl) {
    return matches[0];
  }
  if (matches.length > 1) {
    throw new Error('action target matched multiple links');
  }
  return matches[0];
}

export function selectInstance(store, target = {}) {
  const matches = store.instances.filter((instance) => {
    if (target.instanceId) return instance.id === target.instanceId;
    if (target.linkId) return instance.outbound_link_id === target.linkId;
    if (target.pageId && instance.page_id !== target.pageId) return false;
    if (target.domain) {
      const link = store.links.find((item) => item.id === instance.outbound_link_id);
      return link?.domain === target.domain;
    }
    return false;
  });
  if (matches.length === 0) {
    throw new Error('no matching outbound link instance found for action target');
  }
  if (matches.length > 1 && !target.instanceId) {
    return matches[0];
  }
  if (matches.length > 1) {
    throw new Error('action target matched multiple instances');
  }
  return matches[0];
}

export function safeToken(value) {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'action';
}

export function compactTimestamp(value) {
  return String(value).replace(/[^0-9]/g, '').slice(0, 14) || '00000000000000';
}

function nullableTrim(value) {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
}
