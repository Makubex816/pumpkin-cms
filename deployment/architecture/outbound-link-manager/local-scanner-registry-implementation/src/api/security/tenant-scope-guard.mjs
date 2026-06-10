import { createErrorEnvelope } from '../contracts/response-envelope.mjs';
import { errorCodes } from '../contracts/error-codes.mjs';
import { normalizeActor } from '../contracts/query-normalizer.mjs';
import { roleCanReadAllTenants } from './local-role-guard.mjs';

export function assertTenantScopeAllowed({ store, actor, tenantKey, siteKey }) {
  const normalizedActor = normalizeActor(actor);
  const requestedTenant = tenantKey || store.tenant_id;
  const requestedSite = siteKey || store.site_id;

  if (requestedTenant !== store.tenant_id || requestedSite !== store.site_id) {
    return {
      ok: false,
      envelope: createScopeDeniedEnvelope({ tenantKey: requestedTenant, siteKey: requestedSite, reason: 'requested scope does not match local store' })
    };
  }

  if (roleCanReadAllTenants(normalizedActor)) {
    return { ok: true, actor: normalizedActor };
  }

  if (!normalizedActor.assignedTenants.includes(requestedTenant)) {
    return {
      ok: false,
      envelope: createScopeDeniedEnvelope({ tenantKey: requestedTenant, siteKey: requestedSite, reason: 'actor tenant assignment missing' })
    };
  }

  if (normalizedActor.assignedSites.length > 0 && !normalizedActor.assignedSites.includes(requestedSite)) {
    return {
      ok: false,
      envelope: createScopeDeniedEnvelope({ tenantKey: requestedTenant, siteKey: requestedSite, reason: 'actor site assignment missing' })
    };
  }

  return { ok: true, actor: normalizedActor };
}

function createScopeDeniedEnvelope({ tenantKey, siteKey, reason }) {
  return createErrorEnvelope({
    code: errorCodes.OUTBOUND_LINK_FORBIDDEN_TENANT,
    tenantKey,
    siteKey,
    errors: [{
      code: errorCodes.OUTBOUND_LINK_FORBIDDEN_TENANT,
      message: reason
    }],
    meta: {
      mode: 'local-offline'
    }
  });
}

