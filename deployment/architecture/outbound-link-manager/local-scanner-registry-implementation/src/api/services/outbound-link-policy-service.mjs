import { createSuccessEnvelope } from '../contracts/response-envelope.mjs';
import { mapPolicyDto } from './outbound-link-detail-service.mjs';
import { withLocalStoreEnvelope } from './outbound-link-query-service.mjs';

export async function listOutboundLinkPolicies({ storePath, query = {}, actor = {} }) {
  return withLocalStoreEnvelope({
    storePath,
    query,
    actor,
    handler: ({ store, normalizedQuery }) => createSuccessEnvelope({
      data: {
        activePolicyId: store.policiesEnvelope?.active_policy_id ?? null,
        items: store.policies.map(mapPolicyDto)
      },
      meta: {
        mode: 'local-offline',
        totalItems: store.policies.length,
        localOnly: true
      },
      tenantKey: normalizedQuery.tenantKey,
      siteKey: normalizedQuery.siteKey,
      message: 'Outbound link policies listed from local store.'
    })
  });
}

