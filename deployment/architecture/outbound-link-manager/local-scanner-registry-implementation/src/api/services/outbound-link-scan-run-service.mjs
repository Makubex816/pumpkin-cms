import { createSuccessEnvelope } from '../contracts/response-envelope.mjs';
import { paginateItems } from '../contracts/pagination.mjs';
import { createListMeta, withLocalStoreEnvelope } from './outbound-link-query-service.mjs';

export async function listOutboundLinkScanRuns({ storePath, query = {}, actor = {} }) {
  return withLocalStoreEnvelope({
    storePath,
    query,
    actor,
    handler: ({ store, normalizedQuery }) => {
      const sorted = [...store.scanRuns].sort((left, right) => String(right.started_at ?? right.id).localeCompare(String(left.started_at ?? left.id)));
      const paged = paginateItems(sorted.map(mapScanRunDto), normalizedQuery.pagination);
      return createSuccessEnvelope({
        data: {
          items: paged.items
        },
        meta: createListMeta({ normalizedQuery, pageInfo: paged.pageInfo, mode: 'local-offline' }),
        tenantKey: normalizedQuery.tenantKey,
        siteKey: normalizedQuery.siteKey,
        message: 'Outbound link scan runs listed from local store.'
      });
    }
  });
}

function mapScanRunDto(scanRun) {
  return {
    id: scanRun.id,
    tenantKey: scanRun.tenant_id,
    siteKey: scanRun.site_id,
    tenant_id: scanRun.tenant_id,
    site_id: scanRun.site_id,
    status: scanRun.status,
    mode: scanRun.mode ?? 'local-offline',
    startedAt: scanRun.started_at,
    completedAt: scanRun.completed_at ?? null,
    pagesScanned: scanRun.pages_scanned ?? 0,
    linksFound: scanRun.links_found ?? 0,
    newLinksFound: scanRun.new_links_found ?? 0,
    staleInstancesFound: scanRun.stale_instances_found ?? 0,
    errors: scanRun.errors ?? []
  };
}

