import { applyInstanceFilters, applySort, instanceSortValue } from '../contracts/filter-sort-model.mjs';
import { paginateItems } from '../contracts/pagination.mjs';
import { createSuccessEnvelope } from '../contracts/response-envelope.mjs';
import { mapInstanceDto } from './outbound-link-detail-service.mjs';
import { createListMeta, withLocalStoreEnvelope } from './outbound-link-query-service.mjs';

export async function listOutboundLinkInstances({ storePath, query = {}, actor = {} }) {
  return withLocalStoreEnvelope({
    storePath,
    query,
    actor,
    handler: ({ store, normalizedQuery }) => {
      const linksById = new Map(store.links.map((link) => [link.id, link]));
      let instances = store.instances;
      if (query.linkId ?? query['link-id']) {
        const linkId = query.linkId ?? query['link-id'];
        instances = instances.filter((instance) => instance.outbound_link_id === linkId);
      }
      const filtered = applyInstanceFilters(instances, normalizedQuery.filters, store.links);
      const sorted = applySort(filtered, normalizedQuery.sort, (record, field) => instanceSortValue(record, field, linksById.get(record.outbound_link_id)));
      const paged = paginateItems(sorted.map((instance) => mapInstanceDto(instance, linksById.get(instance.outbound_link_id))), normalizedQuery.pagination);
      return createSuccessEnvelope({
        data: {
          items: paged.items
        },
        meta: createListMeta({ normalizedQuery, pageInfo: paged.pageInfo, mode: 'local-offline' }),
        tenantKey: normalizedQuery.tenantKey,
        siteKey: normalizedQuery.siteKey,
        message: 'Outbound link instances listed from local store.'
      });
    }
  });
}

