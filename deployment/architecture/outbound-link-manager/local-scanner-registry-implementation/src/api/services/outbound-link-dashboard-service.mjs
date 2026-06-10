import { createSuccessEnvelope } from '../contracts/response-envelope.mjs';
import { withLocalStoreEnvelope } from './outbound-link-query-service.mjs';

export async function getOutboundLinkDashboardSummary({ storePath, query = {}, actor = {} }) {
  return withLocalStoreEnvelope({
    storePath,
    query,
    actor,
    handler: ({ store, normalizedQuery }) => {
      const domains = [...new Set(store.links.map((link) => link.domain))].sort();
      return createSuccessEnvelope({
        data: {
          linkCount: store.links.length,
          instanceCount: store.instances.length,
          policyCount: store.policies.length,
          scanRunCount: store.scanRuns.length,
          auditLogCount: store.auditLogs.length,
          domainCount: domains.length,
          domains,
          linksByStatus: countBy(store.links, 'status'),
          instancesByStatus: countBy(store.instances, 'status'),
          pendingReviewCount: store.links.filter((link) => link.status === 'pending_review').length,
          disabledLinkCount: store.links.filter((link) => link.status === 'disabled').length,
          domainBlockedLinkCount: store.links.filter((link) => link.status === 'domain_blocked').length,
          staleInstanceCount: store.instances.filter((instance) => instance.status === 'stale').length
        },
        meta: {
          mode: 'local-offline',
          localOnly: true,
          externalHttpCrawling: false,
          cmsApiCalls: false,
          cmsWrites: false,
          protectedConfigReads: false
        },
        tenantKey: normalizedQuery.tenantKey,
        siteKey: normalizedQuery.siteKey,
        message: 'Outbound link dashboard summary read from local store.'
      });
    }
  });
}

function countBy(records, field) {
  const counts = {};
  for (const record of records) {
    const key = record[field] ?? 'unknown';
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

