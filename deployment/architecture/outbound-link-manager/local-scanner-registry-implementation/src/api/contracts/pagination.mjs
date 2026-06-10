import { ApiContractError, errorCodes } from './error-codes.mjs';

const defaultPage = 1;
const defaultPageSize = 25;
const maxPageSize = 100;

export function normalizePagination(query = {}) {
  const page = toPositiveInteger(query.page ?? defaultPage, 'page');
  const pageSize = toPositiveInteger(query.pageSize ?? query['page-size'] ?? defaultPageSize, 'pageSize');
  if (pageSize > maxPageSize) {
    throw new ApiContractError(errorCodes.OUTBOUND_LINK_INVALID_PAGINATION, {
      details: { pageSize, maxPageSize },
      message: `pageSize cannot exceed ${maxPageSize}`
    });
  }
  return { page, pageSize };
}

export function paginateItems(items, pagination) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pagination.pageSize));
  if (pagination.page > totalPages && totalItems > 0) {
    throw new ApiContractError(errorCodes.OUTBOUND_LINK_INVALID_PAGINATION, {
      details: { page: pagination.page, totalPages },
      message: 'page exceeds total pages'
    });
  }
  const start = (pagination.page - 1) * pagination.pageSize;
  const pageItems = items.slice(start, start + pagination.pageSize);
  return {
    items: pageItems,
    pageInfo: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPreviousPage: pagination.page > 1
    }
  };
}

function toPositiveInteger(value, field) {
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < 1) {
    throw new ApiContractError(errorCodes.OUTBOUND_LINK_INVALID_PAGINATION, {
      details: { field, value },
      message: `${field} must be a positive integer`
    });
  }
  return numeric;
}

