import { bulkActionTypes } from './action-request-model.mjs';

const mutatingRoles = new Set(['SuperAdmin', 'TenantAdmin', 'Operator']);
const policyRoles = new Set(['SuperAdmin', 'TenantAdmin']);
const blockedRoles = new Set(['Viewer', 'BackupOperator']);

export function evaluateActionApproval({ store, request }) {
  const failures = [];
  const actor = request.actor;
  const role = actor.role;

  if (!request.action) {
    failures.push(failure('ACTION_REQUIRED', 'action is required', 'action'));
  }
  if (!request.tenantKey) {
    failures.push(failure('TENANT_REQUIRED', 'tenantKey is required', 'tenantKey'));
  }
  if (!request.siteKey) {
    failures.push(failure('SITE_REQUIRED', 'siteKey is required', 'siteKey'));
  }
  if (request.tenantKey && request.tenantKey !== store.tenant_id) {
    failures.push(failure('TENANT_SCOPE_MISMATCH', 'requested tenant does not match local store', 'tenantKey'));
  }
  if (request.siteKey && request.siteKey !== store.site_id) {
    failures.push(failure('SITE_SCOPE_MISMATCH', 'requested site does not match local store', 'siteKey'));
  }
  if (!request.reason) {
    failures.push(failure('REASON_REQUIRED', 'reason is required for local write simulation', 'reason'));
  }
  if (blockedRoles.has(role)) {
    failures.push(failure('ROLE_BLOCKED', `${role} cannot simulate mutations`, 'actor.role'));
  } else if (request.action === 'update_policy' && !policyRoles.has(role)) {
    failures.push(failure('ROLE_BLOCKED', `${role} cannot simulate policy updates`, 'actor.role'));
  } else if (!mutatingRoles.has(role)) {
    failures.push(failure('ROLE_BLOCKED', `${role} is not allowed to simulate this action`, 'actor.role'));
  }
  if (role !== 'SuperAdmin') {
    if (!actor.assignedTenants.includes(request.tenantKey)) {
      failures.push(failure('ACTOR_TENANT_MISSING', 'actor is not assigned to requested tenant', 'actor.assignedTenants'));
    }
    if (actor.assignedSites.length > 0 && !actor.assignedSites.includes(request.siteKey)) {
      failures.push(failure('ACTOR_SITE_MISSING', 'actor is not assigned to requested site', 'actor.assignedSites'));
    }
  }
  if (bulkActionTypes.has(request.action) && !request.approvalReference) {
    failures.push(failure('APPROVAL_REFERENCE_REQUIRED', 'bulk actions require approvalReference', 'approvalReference'));
  }
  if (request.profile.productionWriteApproved === true || request.profile.liveWriteApproved === true) {
    failures.push(failure('PRODUCTION_WRITE_PROFILE_BLOCKED', 'production/live write approval must remain false in Phase 2H-12', 'profile'));
  }

  return {
    approved: failures.length === 0,
    failures,
    mode: 'local-offline-simulation',
    localSimulationApproved: failures.length === 0,
    productionWriteApproved: false,
    futureGateRequired: true,
    actor
  };
}

function failure(code, message, path) {
  return { code, message, path };
}
