export const errorCodes = {
  OK: 'OK',
  OUTBOUND_LINK_NOT_FOUND: 'OUTBOUND_LINK_NOT_FOUND',
  OUTBOUND_LINK_INSTANCE_NOT_FOUND: 'OUTBOUND_LINK_INSTANCE_NOT_FOUND',
  OUTBOUND_LINK_POLICY_NOT_FOUND: 'OUTBOUND_LINK_POLICY_NOT_FOUND',
  OUTBOUND_LINK_FORBIDDEN_TENANT: 'OUTBOUND_LINK_FORBIDDEN_TENANT',
  OUTBOUND_LINK_FORBIDDEN_ROLE: 'OUTBOUND_LINK_FORBIDDEN_ROLE',
  OUTBOUND_LINK_WRITE_NOT_APPROVED: 'OUTBOUND_LINK_WRITE_NOT_APPROVED',
  OUTBOUND_LINK_INVALID_FILTER: 'OUTBOUND_LINK_INVALID_FILTER',
  OUTBOUND_LINK_INVALID_SORT: 'OUTBOUND_LINK_INVALID_SORT',
  OUTBOUND_LINK_INVALID_PAGINATION: 'OUTBOUND_LINK_INVALID_PAGINATION',
  OUTBOUND_LINK_STORE_INVALID: 'OUTBOUND_LINK_STORE_INVALID'
};

export const errorCatalog = {
  [errorCodes.OUTBOUND_LINK_NOT_FOUND]: {
    status: 404,
    message: 'Outbound link was not found in the requested tenant/site scope.'
  },
  [errorCodes.OUTBOUND_LINK_INSTANCE_NOT_FOUND]: {
    status: 404,
    message: 'Outbound link instance was not found in the requested tenant/site scope.'
  },
  [errorCodes.OUTBOUND_LINK_POLICY_NOT_FOUND]: {
    status: 404,
    message: 'Outbound link policy was not found in the requested tenant/site scope.'
  },
  [errorCodes.OUTBOUND_LINK_FORBIDDEN_TENANT]: {
    status: 403,
    message: 'The local actor is not assigned to the requested tenant/site scope.'
  },
  [errorCodes.OUTBOUND_LINK_FORBIDDEN_ROLE]: {
    status: 403,
    message: 'The local actor role is not allowed to perform this operation.'
  },
  [errorCodes.OUTBOUND_LINK_WRITE_NOT_APPROVED]: {
    status: 403,
    message: 'Write actions are blocked in the local API contract foundation.'
  },
  [errorCodes.OUTBOUND_LINK_INVALID_FILTER]: {
    status: 400,
    message: 'The request contains an unsupported or invalid filter.'
  },
  [errorCodes.OUTBOUND_LINK_INVALID_SORT]: {
    status: 400,
    message: 'The request contains an unsupported sort field or direction.'
  },
  [errorCodes.OUTBOUND_LINK_INVALID_PAGINATION]: {
    status: 400,
    message: 'The request contains invalid pagination values.'
  },
  [errorCodes.OUTBOUND_LINK_STORE_INVALID]: {
    status: 500,
    message: 'The local outbound link store could not be read as a valid API source.'
  }
};

export class ApiContractError extends Error {
  constructor(code, details = {}) {
    const catalogEntry = errorCatalog[code] ?? { message: code, status: 500 };
    super(details.message ?? catalogEntry.message);
    this.name = 'ApiContractError';
    this.code = code;
    this.status = details.status ?? catalogEntry.status;
    this.details = details.details ?? null;
  }
}

export function getErrorDefinition(code) {
  return errorCatalog[code] ?? {
    status: 500,
    message: 'Unknown outbound link API contract error.'
  };
}

