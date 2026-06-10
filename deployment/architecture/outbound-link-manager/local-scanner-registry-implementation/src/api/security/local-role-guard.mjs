import { createErrorEnvelope } from '../contracts/response-envelope.mjs';
import { errorCodes } from '../contracts/error-codes.mjs';
import { normalizeActor } from '../contracts/query-normalizer.mjs';

const readRoles = new Set([
  'SuperAdmin',
  'TenantAdmin',
  'Operator',
  'ContentEditor',
  'Viewer',
  'BackupOperator'
]);

export function assertLocalRoleAllowed({ actor, tenantKey, siteKey, capability = 'read' }) {
  const normalizedActor = normalizeActor(actor);
  if (readRoles.has(normalizedActor.role)) {
    return { ok: true, actor: normalizedActor };
  }
  return {
    ok: false,
    actor: normalizedActor,
    envelope: createErrorEnvelope({
      code: errorCodes.OUTBOUND_LINK_FORBIDDEN_ROLE,
      tenantKey,
      siteKey,
      errors: [{
        code: errorCodes.OUTBOUND_LINK_FORBIDDEN_ROLE,
        message: `role ${normalizedActor.role} cannot perform ${capability}`
      }],
      meta: {
        capability,
        mode: 'local-offline'
      }
    })
  };
}

export function roleCanReadAllTenants(actor) {
  return normalizeActor(actor).role === 'SuperAdmin';
}

