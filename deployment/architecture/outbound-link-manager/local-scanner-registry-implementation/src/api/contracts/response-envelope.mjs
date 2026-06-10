import { errorCodes, getErrorDefinition } from './error-codes.mjs';

export function createSuccessEnvelope({
  data = null,
  meta = {},
  tenantKey,
  siteKey,
  requestId = createRequestId(),
  message = 'OK'
}) {
  return {
    ok: true,
    status: 200,
    code: errorCodes.OK,
    message,
    data,
    errors: [],
    meta,
    tenantKey,
    siteKey,
    requestId
  };
}

export function createErrorEnvelope({
  code,
  message = null,
  errors = [],
  meta = {},
  tenantKey = null,
  siteKey = null,
  requestId = createRequestId(),
  status = null
}) {
  const definition = getErrorDefinition(code);
  return {
    ok: false,
    status: status ?? definition.status,
    code,
    message: message ?? definition.message,
    data: null,
    errors: normalizeErrors(errors, code),
    meta,
    tenantKey,
    siteKey,
    requestId
  };
}

export function createRequestId(now = new Date()) {
  const timestamp = typeof now === 'string' ? now : now.toISOString();
  const compact = timestamp.replace(/[^0-9]/g, '').slice(0, 17);
  const random = Math.random().toString(36).slice(2, 8);
  return `olapi_${compact}_${random}`;
}

function normalizeErrors(errors, code) {
  if (!Array.isArray(errors) || errors.length === 0) {
    return [{ code, message: getErrorDefinition(code).message }];
  }
  return errors.map((error) => ({
    code: error.code ?? code,
    message: error.message ?? getErrorDefinition(error.code ?? code).message,
    path: error.path ?? null,
    details: error.details ?? null
  }));
}

