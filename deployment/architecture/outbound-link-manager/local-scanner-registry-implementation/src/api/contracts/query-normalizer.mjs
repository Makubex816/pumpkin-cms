import { normalizeFilters, normalizeSort } from './filter-sort-model.mjs';
import { normalizePagination } from './pagination.mjs';

export function normalizeApiQuery({ query = {}, defaultTenantKey = null, defaultSiteKey = null } = {}) {
  const tenantKey = String(query.tenantKey ?? query.tenant ?? defaultTenantKey ?? '').trim();
  const siteKey = String(query.siteKey ?? query.site ?? defaultSiteKey ?? '').trim();
  return {
    tenantKey,
    siteKey,
    filters: normalizeFilters({
      ...query,
      tenantKey,
      siteKey
    }),
    sort: normalizeSort(query),
    pagination: normalizePagination(query)
  };
}

export function normalizeActor(actor = {}) {
  const role = actor.role ?? 'Viewer';
  const assignedTenants = actor.assignedTenants ?? actor.tenantKeys ?? [];
  return {
    actorId: actor.actorId ?? 'local-api-fixture-actor',
    role,
    assignedTenants: Array.isArray(assignedTenants) ? assignedTenants : [assignedTenants],
    assignedSites: Array.isArray(actor.assignedSites ?? []) ? actor.assignedSites ?? [] : [actor.assignedSites],
    mode: actor.mode ?? 'local-offline'
  };
}

