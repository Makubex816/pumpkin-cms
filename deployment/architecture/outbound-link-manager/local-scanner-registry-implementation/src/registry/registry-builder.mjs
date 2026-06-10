import crypto from 'node:crypto';

export function buildRegistry({ discoveries, priorLinks = [], policy = {}, now }) {
  const byNormalized = new Map();
  for (const prior of priorLinks) {
    if (prior?.normalized_url) {
      byNormalized.set(prior.normalized_url, { ...prior });
    }
  }

  const discoveredByNormalized = new Map();
  for (const discovery of discoveries) {
    if (!discoveredByNormalized.has(discovery.normalized_url)) {
      discoveredByNormalized.set(discovery.normalized_url, discovery);
    }
  }

  for (const discovery of discoveries) {
    if (byNormalized.has(discovery.normalized_url)) {
      const existing = byNormalized.get(discovery.normalized_url);
      byNormalized.set(discovery.normalized_url, {
        ...existing,
        original_url: existing.original_url || discovery.original_url,
        domain: discovery.domain,
        updated_at: now,
        status: classifyStatus({ domain: discovery.domain, previousStatus: existing.status, policy }),
        disabled_by: existing.disabled_by ?? null,
        disabled_at: existing.disabled_at ?? null,
        disabled_reason: existing.disabled_reason ?? null
      });
      continue;
    }

    byNormalized.set(discovery.normalized_url, {
      schemaVersion: '0.1.0',
      id: buildLinkId(discovery.tenant_id, discovery.site_id, discovery.normalized_url),
      tenant_id: discovery.tenant_id,
      site_id: discovery.site_id,
      original_url: discovery.original_url,
      normalized_url: discovery.normalized_url,
      domain: discovery.domain,
      status: classifyStatus({ domain: discovery.domain, previousStatus: null, policy }),
      created_at: now,
      updated_at: now,
      created_by: 'local-scanner',
      disabled_by: null,
      disabled_at: null,
      disabled_reason: null
    });
  }

  for (const [normalizedUrl, link] of byNormalized.entries()) {
    if (!discoveredByNormalized.has(normalizedUrl) && link.status !== 'disabled' && link.status !== 'archived') {
      byNormalized.set(normalizedUrl, {
        ...link,
        status: 'stale',
        updated_at: now
      });
    }
  }

  return [...byNormalized.values()].sort((a, b) => a.normalized_url.localeCompare(b.normalized_url));
}

export function buildLinkId(tenantId, siteId, normalizedUrl) {
  return `ol_${shortHash(`${tenantId}|${siteId}|${normalizedUrl}`)}`;
}

function classifyStatus({ domain, previousStatus, policy }) {
  if (previousStatus === 'disabled' || previousStatus === 'archived') {
    return previousStatus;
  }
  if ((policy.blocked_domains ?? []).map((item) => item.toLowerCase()).includes(domain)) {
    return 'domain_blocked';
  }
  if (previousStatus === 'stale') {
    return 'active';
  }
  if (previousStatus) {
    return previousStatus;
  }
  if (policy.review_required_for_new_domains === false) {
    return 'active';
  }
  const allowed = (policy.allowed_domains ?? []).map((item) => item.toLowerCase());
  return allowed.includes(domain) ? 'active' : 'pending_review';
}

export function shortHash(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 16);
}
