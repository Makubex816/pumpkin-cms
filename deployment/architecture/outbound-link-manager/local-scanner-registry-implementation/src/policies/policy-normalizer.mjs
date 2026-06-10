import { normalizeDomain } from '../registry/domain-normalizer.mjs';
import { shortHash } from '../registry/registry-builder.mjs';
import { localStoreSchemaVersion } from '../store/store-files.mjs';

export function normalizePolicy(inputPolicy, { tenantId, siteId, now = new Date() }) {
  if (!tenantId || !siteId) {
    throw new Error('tenantId and siteId are required to normalize a policy');
  }
  const timestamp = typeof now === 'string' ? now : now.toISOString();
  const raw = inputPolicy?.outbound_link_policy ?? inputPolicy?.policy ?? inputPolicy ?? {};
  const allowedDomains = normalizeDomainList(raw.allowed_domains);
  const blockedDomains = normalizeDomainList(raw.blocked_domains);
  const pendingReviewDomains = normalizeDomainList(raw.pending_review_domains);
  const reviewRequired = raw.review_required_for_new_domains !== false;
  const id = raw.id ?? buildPolicyId({
    tenantId,
    siteId,
    allowedDomains,
    blockedDomains,
    pendingReviewDomains,
    reviewRequired
  });

  return {
    schemaVersion: raw.schemaVersion ?? localStoreSchemaVersion,
    id,
    tenant_id: raw.tenant_id ?? tenantId,
    site_id: raw.site_id ?? siteId,
    name: raw.name ?? 'local outbound link policy',
    allowed_domains: allowedDomains,
    blocked_domains: blockedDomains,
    pending_review_domains: pendingReviewDomains,
    review_required_for_new_domains: reviewRequired,
    created_at: raw.created_at ?? timestamp,
    updated_at: timestamp,
    source: raw.source ?? 'local-offline-policy'
  };
}

export function buildDefaultPolicy({ tenantId, siteId, now = new Date() }) {
  return normalizePolicy({
    id: 'policy_default_local',
    name: 'default local outbound link policy',
    allowed_domains: [],
    blocked_domains: [],
    pending_review_domains: [],
    review_required_for_new_domains: false,
    source: 'local-store-default'
  }, { tenantId, siteId, now });
}

export function normalizeDomainList(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return [...new Set(value.map((item) => normalizeDomain(item)).filter(Boolean))].sort();
}

function buildPolicyId({
  tenantId,
  siteId,
  allowedDomains,
  blockedDomains,
  pendingReviewDomains,
  reviewRequired
}) {
  return `olp_${shortHash([
    tenantId,
    siteId,
    allowedDomains.join(','),
    blockedDomains.join(','),
    pendingReviewDomains.join(','),
    String(reviewRequired)
  ].join('|'))}`;
}
