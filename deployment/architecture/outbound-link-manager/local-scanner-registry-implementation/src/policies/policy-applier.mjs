import {
  manuallyPreservedInstanceStatuses,
  manuallyPreservedLinkStatuses
} from '../store/store-files.mjs';

export function getActivePolicy(store) {
  const policies = store.policies ?? [];
  if (policies.length === 0) {
    return null;
  }
  return policies.find((policy) => policy.id === store.policiesEnvelope?.active_policy_id) ?? policies[0];
}

export function applyPolicyToStore(store, { now = new Date() } = {}) {
  const policy = getActivePolicy(store);
  if (!policy) {
    return { store, changedLinkCount: 0, changedInstanceCount: 0 };
  }
  const timestamp = typeof now === 'string' ? now : now.toISOString();
  const links = [];
  let changedLinkCount = 0;

  for (const link of store.links ?? []) {
    const status = classifyLinkStatus(link, policy);
    if (status !== link.status) {
      changedLinkCount += 1;
    }
    links.push({
      ...link,
      status,
      status_source: status === link.status ? link.status_source : 'local-policy',
      updated_at: status === link.status ? link.updated_at : timestamp
    });
  }

  const linksById = new Map(links.map((link) => [link.id, link]));
  const instances = [];
  let changedInstanceCount = 0;
  for (const instance of store.instances ?? []) {
    const link = linksById.get(instance.outbound_link_id);
    const status = classifyInstanceStatus(instance, link);
    if (status !== instance.status) {
      changedInstanceCount += 1;
    }
    instances.push({
      ...instance,
      status,
      is_enabled: status === 'enabled',
      status_source: status === instance.status ? instance.status_source : 'local-policy',
      updated_at: status === instance.status ? instance.updated_at : timestamp
    });
  }

  return {
    store: {
      ...store,
      links,
      instances
    },
    changedLinkCount,
    changedInstanceCount
  };
}

export function classifyLinkStatus(link, policy) {
  if (manuallyPreservedLinkStatuses.has(link.status)) {
    return link.status;
  }
  const domain = (link.domain ?? '').toLowerCase();
  if ((policy.blocked_domains ?? []).includes(domain)) {
    return 'domain_blocked';
  }
  if (link.status === 'stale') {
    return 'stale';
  }
  if ((policy.pending_review_domains ?? []).includes(domain)) {
    return 'pending_review';
  }
  if (policy.review_required_for_new_domains === false) {
    return 'active';
  }
  return (policy.allowed_domains ?? []).includes(domain) ? 'active' : 'pending_review';
}

export function classifyInstanceStatus(instance, link) {
  if (instance.status === 'stale' || manuallyPreservedInstanceStatuses.has(instance.status)) {
    return instance.status;
  }
  if (!link) {
    return 'stale';
  }
  if (link.status === 'domain_blocked' || link.status === 'pending_review') {
    return 'pending_review';
  }
  if (link.status === 'disabled' || link.status === 'archived' || link.status === 'stale') {
    return 'disabled';
  }
  return 'enabled';
}
