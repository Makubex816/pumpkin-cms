import { compactTimestamp, safeToken } from '../../actions/action-request-model.mjs';

export const providerModes = {
  LOCAL_SIMULATION: 'local-simulation',
  FAKE_PROVIDER: 'fake-provider',
  OFFLINE_BUNDLE: 'offline-bundle',
  LOCAL_API_FAKE_PROVIDER: 'local-api-fake-provider',
  LIVE_READONLY: 'live-readonly',
  LIVE_WRITE_APPROVED: 'live-write-approved'
};

export const localWriteProviderModes = new Set([
  providerModes.LOCAL_SIMULATION,
  providerModes.FAKE_PROVIDER,
  providerModes.OFFLINE_BUNDLE,
  providerModes.LOCAL_API_FAKE_PROVIDER
]);

export const apiWriteActionMap = {
  approveReviewDecision: 'approve_review',
  blockReviewDecision: 'block_review',
  ignoreReviewDecision: 'ignore_review',
  setLinkStatus: 'set_link_status',
  setInstanceStatus: 'set_instance_status',
  setPolicy: 'update_policy',
  createScanRun: 'create_scan_run',
  bulkDomainDisable: 'bulk_domain_disable',
  bulkDomainRequireReview: 'bulk_domain_review',
  bulkPageInstanceUpdate: 'bulk_page_instances',
  restorePriorStatus: 'set_link_status'
};

export const bulkApiActions = new Set([
  'bulkDomainDisable',
  'bulkDomainRequireReview',
  'bulkPageInstanceUpdate'
]);

export function normalizeApiWriteRequest(rawRequest = {}) {
  const now = rawRequest.now ?? new Date().toISOString();
  const apiAction = String(rawRequest.action ?? '').trim();
  const localAction = apiWriteActionMap[apiAction] ?? apiAction;
  const tenantKey = stringValue(rawRequest.tenantKey ?? rawRequest.tenant_id);
  const siteKey = stringValue(rawRequest.siteKey ?? rawRequest.site_id);
  const actor = normalizeApiActor(rawRequest.actor ?? {});
  const providerMode = stringValue(rawRequest.providerMode) ?? providerModes.LOCAL_API_FAKE_PROVIDER;
  const actionId = stringValue(rawRequest.actionId) ?? `olwa_${compactTimestamp(now)}_${safeToken(apiAction || localAction || 'action')}`;
  const requestId = stringValue(rawRequest.requestId) ?? `olwr_${compactTimestamp(now)}_${safeToken(apiAction || localAction || 'request')}`;
  const correlationId = stringValue(rawRequest.correlationId) ?? `olwc_${compactTimestamp(now)}_${safeToken(tenantKey || 'tenant')}`;
  const payload = {
    ...(rawRequest.payload ?? {})
  };
  if (apiAction === 'restorePriorStatus' && !payload.status) {
    payload.status = rawRequest.payload?.priorStatus ?? 'active';
  }
  return {
    schemaVersion: rawRequest.schemaVersion ?? '0.1.0',
    action: apiAction,
    localAction,
    requestId,
    actionId,
    correlationId,
    tenantKey,
    siteKey,
    actor,
    providerMode,
    reason: stringValue(rawRequest.reason),
    approvalReference: stringValue(rawRequest.approvalReference),
    policyReference: stringValue(rawRequest.policyReference),
    target: rawRequest.target ?? {},
    payload,
    now,
    execute: rawRequest.execute !== false,
    rawRequest
  };
}

export function toLocalActionRequest(apiRequest) {
  return {
    schemaVersion: '0.1.0',
    action: apiRequest.localAction,
    tenantKey: apiRequest.tenantKey,
    siteKey: apiRequest.siteKey,
    reason: apiRequest.reason,
    approvalReference: apiRequest.approvalReference,
    policyReference: apiRequest.policyReference,
    requestId: apiRequest.requestId,
    operationId: apiRequest.actionId,
    idempotencyKey: apiRequest.rawRequest.idempotencyKey ?? apiRequest.actionId,
    now: apiRequest.now,
    actor: {
      actorId: apiRequest.actor.actorId,
      role: apiRequest.actor.actorRole,
      assignedTenants: apiRequest.actor.assignedTenants,
      assignedSites: apiRequest.actor.assignedSites,
      mode: 'local-api-write-guard'
    },
    target: apiRequest.target,
    payload: apiRequest.payload,
    profile: {
      name: apiRequest.providerMode,
      localOfflineDefault: true,
      fakeProvider: apiRequest.providerMode !== providerModes.LIVE_READONLY,
      offlineBundle: apiRequest.providerMode === providerModes.OFFLINE_BUNDLE,
      localFileBackedStore: true,
      liveReadonlyExplicit: apiRequest.providerMode === providerModes.LIVE_READONLY,
      liveWriteApproved: false,
      productionWriteApproved: false
    }
  };
}

export function normalizeApiActor(actor = {}) {
  const assignedTenants = toStringArray(actor.assignedTenants ?? actor.tenantKeys ?? actor.tenantKey);
  const assignedSites = toStringArray(actor.assignedSites ?? actor.siteKeys ?? actor.siteKey);
  return {
    actorId: stringValue(actor.actorId ?? actor.id) ?? 'local-api-write-actor',
    actorEmail: stringValue(actor.actorEmail ?? actor.email) ?? null,
    actorRole: stringValue(actor.actorRole ?? actor.role) ?? 'Viewer',
    assignedTenants,
    assignedSites
  };
}

export function providerBlockFor(apiRequest) {
  if (apiRequest.providerMode === providerModes.LIVE_READONLY) {
    return {
      code: 'OUTBOUND_LINK_WRITE_NOT_APPROVED',
      message: 'live-readonly provider mode rejects write actions',
      blockReason: 'live-readonly provider mode is read-only'
    };
  }
  if (apiRequest.providerMode === providerModes.LIVE_WRITE_APPROVED) {
    return {
      code: 'OUTBOUND_LINK_LIVE_WRITE_BLOCKED',
      message: 'live-write-approved provider mode is reserved for a future explicit live-write approval',
      blockReason: 'live-write-approved is not enabled in Phase 2H-14'
    };
  }
  if (!localWriteProviderModes.has(apiRequest.providerMode)) {
    return {
      code: 'OUTBOUND_LINK_PROVIDER_NOT_CONFIGURED',
      message: `provider mode is not configured for scoped write actions: ${apiRequest.providerMode}`,
      blockReason: 'provider mode is not configured'
    };
  }
  return null;
}

function stringValue(value) {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
}

function toStringArray(value) {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : [value];
  return raw.map((item) => String(item).trim()).filter(Boolean);
}
