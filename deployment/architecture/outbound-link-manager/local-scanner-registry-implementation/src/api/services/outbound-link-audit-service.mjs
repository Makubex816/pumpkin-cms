import { createSuccessEnvelope } from '../contracts/response-envelope.mjs';
import { paginateItems } from '../contracts/pagination.mjs';
import { createListMeta, withLocalStoreEnvelope } from './outbound-link-query-service.mjs';

export async function listOutboundLinkAuditLogs({ storePath, query = {}, actor = {} }) {
  return withLocalStoreEnvelope({
    storePath,
    query,
    actor,
    handler: ({ store, normalizedQuery }) => {
      const sorted = [...store.auditLogs].sort((left, right) => String(right.created_at ?? right.id).localeCompare(String(left.created_at ?? left.id)));
      const paged = paginateItems(sorted.map(mapAuditLogDto), normalizedQuery.pagination);
      return createSuccessEnvelope({
        data: {
          items: paged.items
        },
        meta: createListMeta({ normalizedQuery, pageInfo: paged.pageInfo, mode: 'local-offline' }),
        tenantKey: normalizedQuery.tenantKey,
        siteKey: normalizedQuery.siteKey,
        message: 'Outbound link audit logs listed from local store.'
      });
    }
  });
}

function mapAuditLogDto(log) {
  return {
    id: log.id,
    tenantKey: log.tenant_id,
    siteKey: log.site_id,
    tenant_id: log.tenant_id,
    site_id: log.site_id,
    action: log.action,
    recordType: log.record_type,
    recordId: log.record_id,
    actor: log.actor,
    reason: log.reason,
    createdAt: log.created_at,
    mode: log.mode ?? 'local-offline',
    before: log.before ?? null,
    after: log.after ?? null
  };
}

