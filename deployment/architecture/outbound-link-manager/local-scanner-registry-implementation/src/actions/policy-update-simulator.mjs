import { normalizePolicy } from '../policies/policy-normalizer.mjs';
import { applyPolicyToStore } from '../policies/policy-applier.mjs';

export function simulatePolicyUpdate({ store, request }) {
  const activePolicy = store.policies.find((policy) => policy.id === store.policiesEnvelope?.active_policy_id) ?? store.policies[0] ?? {};
  const rawPolicy = {
    ...activePolicy,
    ...(request.payload.policy ?? {}),
    ...(request.payload.policyPatch ?? {}),
    tenant_id: store.tenant_id,
    site_id: store.site_id,
    id: request.payload.policy?.id ?? request.payload.policyPatch?.id ?? activePolicy.id ?? 'policy_local_action_simulation',
    source: 'local-action-simulation'
  };
  const policy = normalizePolicy(rawPolicy, {
    tenantId: store.tenant_id,
    siteId: store.site_id,
    now: request.now
  });
  const policyStore = {
    ...store,
    policies: [
      ...store.policies.filter((item) => item.id !== policy.id),
      policy
    ],
    policiesEnvelope: {
      ...(store.policiesEnvelope ?? {}),
      active_policy_id: policy.id
    }
  };
  const applied = applyPolicyToStore(policyStore, { now: request.now });
  return {
    nextStore: applied.store,
    recordType: 'outbound_link_policy',
    recordId: policy.id,
    affectedLinkIds: applied.store.links
      .filter((link) => link.status_source === 'policy' || link.status === 'domain_blocked' || link.status === 'pending_review')
      .map((link) => link.id),
    affectedInstanceIds: applied.store.instances
      .filter((instance) => instance.status_source === 'policy' || instance.status !== 'enabled')
      .map((instance) => instance.id),
    changes: [{
      recordType: 'outbound_link_policy',
      recordId: policy.id,
      previousValue: activePolicy,
      newValue: policy
    }],
    before: { active_policy_id: store.policiesEnvelope?.active_policy_id ?? null, policy: activePolicy },
    after: {
      active_policy_id: policy.id,
      policy,
      changed_links: applied.changedLinkCount,
      changed_instances: applied.changedInstanceCount
    }
  };
}
