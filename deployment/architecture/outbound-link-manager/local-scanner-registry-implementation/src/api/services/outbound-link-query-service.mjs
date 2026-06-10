import { readLocalStore } from '../../store/local-store-reader.mjs';
import { validateLocalStore } from '../../validators/local-store-validator.mjs';
import { createErrorEnvelope, createSuccessEnvelope } from '../contracts/response-envelope.mjs';
import { ApiContractError, errorCodes } from '../contracts/error-codes.mjs';
import { applyLinkFilters, applySort, linkSortValue } from '../contracts/filter-sort-model.mjs';
import { normalizeApiQuery } from '../contracts/query-normalizer.mjs';
import { paginateItems } from '../contracts/pagination.mjs';
import { assertLocalRoleAllowed } from '../security/local-role-guard.mjs';
import { assertTenantScopeAllowed } from '../security/tenant-scope-guard.mjs';

export async function listOutboundLinks({ storePath, query = {}, actor = {} }) {
  return withLocalStoreEnvelope({
    storePath,
    query,
    actor,
    handler: ({ store, normalizedQuery }) => {
      const rows = buildLinkDtos(store);
      const filtered = applyLinkFilters(rows, normalizedQuery.filters, store.instances);
      const sorted = applySort(filtered, normalizedQuery.sort, (record, field) => {
        if (field === 'instanceCount') {
          return String(record.instanceCount).padStart(8, '0');
        }
        return linkSortValue(record, field);
      });
      const paged = paginateItems(sorted, normalizedQuery.pagination);
      return createSuccessEnvelope({
        data: {
          items: paged.items
        },
        meta: createListMeta({ normalizedQuery, pageInfo: paged.pageInfo, mode: 'local-offline' }),
        tenantKey: normalizedQuery.tenantKey,
        siteKey: normalizedQuery.siteKey,
        message: 'Outbound links listed from local store.'
      });
    }
  });
}

export async function withLocalStoreEnvelope({ storePath, query = {}, actor = {}, handler }) {
  let store = null;
  let normalizedQuery = null;
  try {
    store = await readLocalStore(storePath);
    const validation = await validateLocalStore({ storePath, writeReport: false });
    if (validation.status !== 'passed') {
      return createErrorEnvelope({
        code: errorCodes.OUTBOUND_LINK_STORE_INVALID,
        tenantKey: store.tenant_id,
        siteKey: store.site_id,
        errors: validation.failures,
        meta: {
          mode: 'local-offline',
          validationSummary: validation.summary
        }
      });
    }
    normalizedQuery = normalizeApiQuery({
      query,
      defaultTenantKey: store.tenant_id,
      defaultSiteKey: store.site_id
    });
    const roleGuard = assertLocalRoleAllowed({
      actor,
      tenantKey: normalizedQuery.tenantKey,
      siteKey: normalizedQuery.siteKey
    });
    if (!roleGuard.ok) {
      return roleGuard.envelope;
    }
    const tenantGuard = assertTenantScopeAllowed({
      store,
      actor: roleGuard.actor,
      tenantKey: normalizedQuery.tenantKey,
      siteKey: normalizedQuery.siteKey
    });
    if (!tenantGuard.ok) {
      return tenantGuard.envelope;
    }
    return handler({ store, normalizedQuery, actor: tenantGuard.actor });
  } catch (error) {
    return createCaughtErrorEnvelope(error, {
      tenantKey: normalizedQuery?.tenantKey ?? store?.tenant_id ?? query.tenantKey ?? query.tenant ?? null,
      siteKey: normalizedQuery?.siteKey ?? store?.site_id ?? query.siteKey ?? query.site ?? null
    });
  }
}

export function buildLinkDtos(store) {
  const instancesByLink = groupInstancesByLink(store.instances);
  return store.links.map((link) => {
    const instances = instancesByLink.get(link.id) ?? [];
    return {
      id: link.id,
      tenantKey: link.tenant_id,
      siteKey: link.site_id,
      tenant_id: link.tenant_id,
      site_id: link.site_id,
      originalUrl: link.original_url,
      normalizedUrl: link.normalized_url,
      original_url: link.original_url,
      normalized_url: link.normalized_url,
      domain: link.domain,
      status: link.status,
      createdAt: link.created_at,
      created_at: link.created_at,
      updatedAt: link.updated_at,
      updated_at: link.updated_at,
      firstDetectedAt: firstDate(instances.map((instance) => instance.first_detected_at)) ?? link.created_at,
      first_detected_at: firstDate(instances.map((instance) => instance.first_detected_at)) ?? link.created_at,
      lastDetectedAt: lastDate(instances.map((instance) => instance.last_detected_at)) ?? link.last_detected_at ?? link.updated_at,
      last_detected_at: lastDate(instances.map((instance) => instance.last_detected_at)) ?? link.last_detected_at ?? link.updated_at,
      createdBy: link.created_by,
      disabledBy: link.disabled_by,
      disabledAt: link.disabled_at,
      disabledReason: link.disabled_reason,
      instanceCount: instances.length,
      activeInstanceCount: instances.filter((instance) => instance.status === 'enabled').length,
      staleInstanceCount: instances.filter((instance) => instance.status === 'stale').length,
      pendingReviewCount: instances.filter((instance) => instance.status === 'pending_review').length
    };
  });
}

export function createListMeta({ normalizedQuery, pageInfo, mode }) {
  return {
    mode,
    pagination: pageInfo,
    filters: serializeFilters(normalizedQuery.filters),
    sort: normalizedQuery.sort,
    localOnly: true,
    externalHttpCrawling: false,
    cmsApiCalls: false,
    cmsWrites: false,
    protectedConfigReads: false
  };
}

export function createCaughtErrorEnvelope(error, { tenantKey = null, siteKey = null } = {}) {
  if (error instanceof ApiContractError) {
    return createErrorEnvelope({
      code: error.code,
      status: error.status,
      tenantKey,
      siteKey,
      errors: [{
        code: error.code,
        message: error.message,
        details: error.details
      }],
      meta: {
        mode: 'local-offline'
      }
    });
  }
  return createErrorEnvelope({
    code: errorCodes.OUTBOUND_LINK_STORE_INVALID,
    tenantKey,
    siteKey,
    errors: [{
      code: errorCodes.OUTBOUND_LINK_STORE_INVALID,
      message: error.message
    }],
    meta: {
      mode: 'local-offline'
    }
  });
}

export function groupInstancesByLink(instances) {
  const grouped = new Map();
  for (const instance of instances) {
    const records = grouped.get(instance.outbound_link_id) ?? [];
    records.push(instance);
    grouped.set(instance.outbound_link_id, records);
  }
  return grouped;
}

function firstDate(values) {
  return values.filter(Boolean).sort()[0] ?? null;
}

function lastDate(values) {
  return values.filter(Boolean).sort().at(-1) ?? null;
}

function serializeFilters(filters) {
  return Object.fromEntries(Object.entries(filters).map(([key, value]) => [
    key,
    value instanceof Date ? value.toISOString() : value
  ]));
}
