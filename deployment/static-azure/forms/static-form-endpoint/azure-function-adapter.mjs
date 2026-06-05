import { handleStaticContactRequest } from './contact-handler.mjs';

export const STATIC_CONTACT_FUNCTION_NAME = 'static-contact';
export const STATIC_CONTACT_ROUTE = 'static-contact';
export const STATIC_CONTACT_PUBLIC_PATH = '/api/static-contact';
export const CONTACT_COMPATIBILITY_ROUTE = null;

export function getStaticContactFunctionOptions(handler = handleAzureFunctionStaticContact) {
  return {
    methods: ['OPTIONS', 'POST'],
    authLevel: 'anonymous',
    route: STATIC_CONTACT_ROUTE,
    handler,
  };
}

export async function handleAzureFunctionStaticContact(request, context = {}, overrides = {}) {
  const method = String(request?.method || 'GET').toUpperCase();
  const headers = headersToObject(request?.headers);
  const body = method === 'OPTIONS' ? {} : await readRequestText(request);

  const result = await handleStaticContactRequest({
    method,
    headers,
    body,
    env: overrides.env || process.env,
    fetchImpl: overrides.fetchImpl || fetch,
    now: overrides.now || (() => new Date()),
    logger: context,
  });

  return {
    status: result.status,
    headers: result.headers,
    jsonBody: result.body,
  };
}

function headersToObject(headers) {
  if (!headers) return {};
  if (typeof headers.entries === 'function') {
    return Object.fromEntries(headers.entries());
  }

  const output = {};
  for (const [key, value] of Object.entries(headers)) {
    output[key] = Array.isArray(value) ? value.join(',') : String(value || '');
  }

  return output;
}

async function readRequestText(request) {
  if (!request) return '{}';
  if (typeof request.text === 'function') return request.text();
  if (typeof request.body === 'string') return request.body;
  if (request.body && typeof request.body === 'object') return JSON.stringify(request.body);
  if (typeof request.json === 'function') return JSON.stringify(await request.json());
  return '{}';
}
