import { createErrorEnvelope, createSuccessEnvelope } from '../contracts/response-envelope.mjs';
import { errorCodes } from '../contracts/error-codes.mjs';
import { buildLinkDtos, createListMeta, withLocalStoreEnvelope } from './outbound-link-query-service.mjs';

export async function getOutboundLink({ storePath, linkId, query = {}, actor = {} }) {
  return withLocalStoreEnvelope({
    storePath,
    query,
    actor,
    handler: ({ store, normalizedQuery }) => {
      const link = buildLinkDtos(store).find((item) => item.id === linkId);
      if (!link) {
        return createErrorEnvelope({
          code: errorCodes.OUTBOUND_LINK_NOT_FOUND,
          tenantKey: normalizedQuery.tenantKey,
          siteKey: normalizedQuery.siteKey,
          errors: [{
            code: errorCodes.OUTBOUND_LINK_NOT_FOUND,
            message: `link ${linkId} was not found`
          }]
        });
      }
      const instances = store.instances
        .filter((instance) => instance.outbound_link_id === link.id)
        .map(mapInstanceDto);
      const activePolicyId = store.policiesEnvelope?.active_policy_id ?? null;
      const activePolicy = store.policies.find((policy) => policy.id === activePolicyId) ?? store.policies[0] ?? null;
      return createSuccessEnvelope({
        data: {
          link,
          instances,
          activePolicy: activePolicy ? mapPolicyDto(activePolicy) : null
        },
        meta: createListMeta({
          normalizedQuery,
          pageInfo: {
            page: 1,
            pageSize: 1,
            totalItems: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false
          },
          mode: 'local-offline'
        }),
        tenantKey: normalizedQuery.tenantKey,
        siteKey: normalizedQuery.siteKey,
        message: 'Outbound link detail read from local store.'
      });
    }
  });
}

export function mapInstanceDto(instance, link = null) {
  return {
    id: instance.id,
    tenantKey: instance.tenant_id,
    siteKey: instance.site_id,
    tenant_id: instance.tenant_id,
    site_id: instance.site_id,
    outboundLinkId: instance.outbound_link_id,
    outbound_link_id: instance.outbound_link_id,
    pageId: instance.page_id,
    page_id: instance.page_id,
    contentType: instance.content_type,
    content_type: instance.content_type,
    contentBlockId: instance.content_block_id,
    content_block_id: instance.content_block_id,
    fieldName: instance.field_name,
    field_name: instance.field_name,
    anchorText: instance.anchor_text,
    anchor_text: instance.anchor_text,
    locationPath: instance.location_path,
    location_path: instance.location_path,
    isEnabled: instance.is_enabled,
    is_enabled: instance.is_enabled,
    status: instance.status,
    firstDetectedAt: instance.first_detected_at,
    first_detected_at: instance.first_detected_at,
    lastDetectedAt: instance.last_detected_at,
    last_detected_at: instance.last_detected_at,
    domain: link?.domain ?? null,
    normalizedUrl: link?.normalized_url ?? null
  };
}

export function mapPolicyDto(policy) {
  return {
    id: policy.id,
    tenantKey: policy.tenant_id,
    siteKey: policy.site_id,
    tenant_id: policy.tenant_id,
    site_id: policy.site_id,
    name: policy.name ?? null,
    defaultDisabledBehavior: policy.default_disabled_behavior ?? 'plain_text',
    defaultRel: policy.default_rel ?? ['noopener', 'noreferrer'],
    externalTargetBehavior: policy.external_target_behavior ?? 'blank',
    allowedDomains: policy.allowed_domains ?? [],
    blockedDomains: policy.blocked_domains ?? [],
    pendingReviewDomains: policy.pending_review_domains ?? [],
    reviewRequiredForNewDomains: policy.review_required_for_new_domains !== false,
    source: policy.source ?? 'local-store'
  };
}

