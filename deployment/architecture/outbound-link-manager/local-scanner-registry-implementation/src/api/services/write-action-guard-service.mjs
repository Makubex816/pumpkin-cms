import { createErrorEnvelope } from '../contracts/response-envelope.mjs';
import { errorCodes } from '../contracts/error-codes.mjs';

export async function requestSetLinkStatus(options) {
  return blockedWriteEnvelope(options, 'set-link-status');
}

export async function requestSetInstanceStatus(options) {
  return blockedWriteEnvelope(options, 'set-instance-status');
}

export async function requestSetPolicy(options) {
  return blockedWriteEnvelope(options, 'set-policy');
}

export async function requestCreateScanRun(options) {
  return blockedWriteEnvelope(options, 'create-scan-run');
}

export async function requestBulkAction(options) {
  return blockedWriteEnvelope(options, 'bulk-action');
}

export async function requestWriteAction(options) {
  const action = options?.action ?? 'unknown';
  if (action === 'set-link-status') {
    return requestSetLinkStatus(options);
  }
  if (action === 'set-instance-status') {
    return requestSetInstanceStatus(options);
  }
  if (action === 'set-policy') {
    return requestSetPolicy(options);
  }
  if (action === 'create-scan-run') {
    return requestCreateScanRun(options);
  }
  if (action === 'bulk-action') {
    return requestBulkAction(options);
  }
  return blockedWriteEnvelope(options, action);
}

function blockedWriteEnvelope(options = {}, action) {
  const query = options.query ?? {};
  const tenantKey = query.tenantKey ?? query.tenant ?? options.tenantKey ?? null;
  const siteKey = query.siteKey ?? query.site ?? options.siteKey ?? null;
  return createErrorEnvelope({
    code: errorCodes.OUTBOUND_LINK_WRITE_NOT_APPROVED,
    tenantKey,
    siteKey,
    errors: [{
      code: errorCodes.OUTBOUND_LINK_WRITE_NOT_APPROVED,
      message: `write action ${action} is blocked in Phase 2H-8`
    }],
    meta: {
      action,
      mode: 'local-offline',
      writeApproved: false,
      localStoreMutation: false,
      futureGateRequired: true
    }
  });
}

