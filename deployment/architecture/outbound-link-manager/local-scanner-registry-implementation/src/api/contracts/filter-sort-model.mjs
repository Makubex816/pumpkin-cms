import { ApiContractError, errorCodes } from './error-codes.mjs';

export const allowedFilters = new Set([
  'tenantKey',
  'siteKey',
  'domain',
  'status',
  'pageId',
  'anchorText',
  'firstDetectedFrom',
  'lastDetectedTo',
  'reviewRequired'
]);

export const allowedSorts = new Set([
  'domain',
  'normalizedUrl',
  'status',
  'firstDetectedAt',
  'lastDetectedAt',
  'instanceCount'
]);

const linkStatuses = new Set([
  'active',
  'disabled',
  'pending_review',
  'domain_blocked',
  'stale',
  'broken_unverified',
  'archived',
  'enabled',
  'hidden',
  'plain_text',
  'fallback'
]);

export function normalizeFilters(query = {}) {
  const filters = {};
  for (const field of allowedFilters) {
    const value = query[field] ?? query[toKebabCase(field)];
    if (value === undefined || value === null || value === '') {
      continue;
    }
    filters[field] = normalizeFilterValue(field, value);
  }
  const unsupported = Object.keys(query).filter((field) => {
    if (['tenant', 'site', 'page', 'pageSize', 'page-size', 'sort', 'sortDirection', 'sort-direction', 'linkId', 'link-id'].includes(field)) {
      return false;
    }
    return !allowedFilters.has(field) && !allowedFilters.has(toCamelCase(field));
  });
  if (unsupported.length > 0) {
    throw new ApiContractError(errorCodes.OUTBOUND_LINK_INVALID_FILTER, {
      details: { unsupported },
      message: `unsupported filter: ${unsupported[0]}`
    });
  }
  return filters;
}

export function normalizeSort(query = {}) {
  const sortField = query.sort ?? 'domain';
  const direction = String(query.sortDirection ?? query['sort-direction'] ?? 'asc').toLowerCase();
  if (!allowedSorts.has(sortField)) {
    throw new ApiContractError(errorCodes.OUTBOUND_LINK_INVALID_SORT, {
      details: { sort: sortField },
      message: `unsupported sort: ${sortField}`
    });
  }
  if (!['asc', 'desc'].includes(direction)) {
    throw new ApiContractError(errorCodes.OUTBOUND_LINK_INVALID_SORT, {
      details: { sortDirection: direction },
      message: `unsupported sort direction: ${direction}`
    });
  }
  return { field: sortField, direction };
}

export function applyLinkFilters(records, filters, instances = []) {
  const byLinkId = groupInstancesByLink(instances);
  return records.filter((link) => {
    const linkedInstances = byLinkId.get(link.id) ?? [];
    return matchesCommonLinkFilters(link, linkedInstances, filters);
  });
}

export function applyInstanceFilters(records, filters, links = []) {
  const linksById = new Map(links.map((link) => [link.id, link]));
  return records.filter((instance) => {
    const link = linksById.get(instance.outbound_link_id);
    if (filters.domain && link?.domain !== filters.domain) {
      return false;
    }
    if (filters.status && instance.status !== filters.status) {
      return false;
    }
    if (filters.pageId && instance.page_id !== filters.pageId) {
      return false;
    }
    if (filters.anchorText && !String(instance.anchor_text ?? '').toLowerCase().includes(filters.anchorText)) {
      return false;
    }
    if (filters.firstDetectedFrom && new Date(instance.first_detected_at ?? 0) < filters.firstDetectedFrom) {
      return false;
    }
    if (filters.lastDetectedTo && new Date(instance.last_detected_at ?? 0) > filters.lastDetectedTo) {
      return false;
    }
    return true;
  });
}

export function applySort(records, sort, valueForRecord = defaultSortValue) {
  const sorted = [...records].sort((left, right) => {
    const leftValue = valueForRecord(left, sort.field);
    const rightValue = valueForRecord(right, sort.field);
    return String(leftValue ?? '').localeCompare(String(rightValue ?? ''));
  });
  return sort.direction === 'desc' ? sorted.reverse() : sorted;
}

export function linkSortValue(link, field) {
  if (field === 'normalizedUrl') {
    return link.normalized_url;
  }
  if (field === 'firstDetectedAt') {
    return link.firstDetectedAt ?? link.first_detected_at ?? link.createdAt ?? link.created_at;
  }
  if (field === 'lastDetectedAt') {
    return link.lastDetectedAt ?? link.last_detected_at ?? link.updatedAt ?? link.updated_at;
  }
  return link[field] ?? '';
}

export function instanceSortValue(instance, field, link = null) {
  if (field === 'domain') {
    return link?.domain ?? '';
  }
  if (field === 'normalizedUrl') {
    return link?.normalized_url ?? '';
  }
  if (field === 'firstDetectedAt') {
    return instance.first_detected_at;
  }
  if (field === 'lastDetectedAt') {
    return instance.last_detected_at;
  }
  return instance[field] ?? '';
}

function normalizeFilterValue(field, value) {
  if (field === 'domain') {
    return String(value).trim().toLowerCase();
  }
  if (field === 'status') {
    const status = String(value).trim();
    if (!linkStatuses.has(status)) {
      throw new ApiContractError(errorCodes.OUTBOUND_LINK_INVALID_FILTER, {
        details: { status },
        message: `unsupported status filter: ${status}`
      });
    }
    return status;
  }
  if (field === 'anchorText') {
    return String(value).trim().toLowerCase();
  }
  if (field === 'reviewRequired') {
    return ['true', '1', 'yes'].includes(String(value).toLowerCase());
  }
  if (field === 'firstDetectedFrom' || field === 'lastDetectedTo') {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new ApiContractError(errorCodes.OUTBOUND_LINK_INVALID_FILTER, {
        details: { field, value },
        message: `${field} must be a valid date`
      });
    }
    return date;
  }
  return String(value).trim();
}

function matchesCommonLinkFilters(link, linkedInstances, filters) {
  if (filters.domain && link.domain !== filters.domain) {
    return false;
  }
  if (filters.status && link.status !== filters.status) {
    return false;
  }
  if (filters.pageId && !linkedInstances.some((instance) => instance.page_id === filters.pageId)) {
    return false;
  }
  if (filters.anchorText && !linkedInstances.some((instance) => String(instance.anchor_text ?? '').toLowerCase().includes(filters.anchorText))) {
    return false;
  }
  if (filters.firstDetectedFrom) {
    const firstDetected = earliestDate(linkedInstances.map((instance) => instance.first_detected_at)) ?? link.created_at;
    if (new Date(firstDetected ?? 0) < filters.firstDetectedFrom) {
      return false;
    }
  }
  if (filters.lastDetectedTo) {
    const lastDetected = latestDate(linkedInstances.map((instance) => instance.last_detected_at)) ?? link.last_detected_at;
    if (new Date(lastDetected ?? 0) > filters.lastDetectedTo) {
      return false;
    }
  }
  if (filters.reviewRequired && !['pending_review', 'domain_blocked'].includes(link.status)) {
    return false;
  }
  return true;
}

function groupInstancesByLink(instances) {
  const grouped = new Map();
  for (const instance of instances) {
    const records = grouped.get(instance.outbound_link_id) ?? [];
    records.push(instance);
    grouped.set(instance.outbound_link_id, records);
  }
  return grouped;
}

function defaultSortValue(record, field) {
  return record[field] ?? '';
}

function earliestDate(values) {
  const sorted = values.filter(Boolean).sort();
  return sorted[0] ?? null;
}

function latestDate(values) {
  const sorted = values.filter(Boolean).sort();
  return sorted.at(-1) ?? null;
}

function toKebabCase(value) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}
