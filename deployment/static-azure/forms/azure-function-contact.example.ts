import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

type TenantKey = 'ice-rink-rentals' | 'roller-rink-rentals';

interface StaticContactRequest {
  formId?: unknown;
  pageSlug?: unknown;
  formData?: unknown;
}

const defaultAllowedOrigins = [
  'https://iceskatingrinkrentals.com',
  'https://www.iceskatingrinkrentals.com',
  'https://rollerrinkrentals.com',
  'https://www.rollerrinkrentals.com',
];

const tenantByOrigin: Record<string, TenantKey> = {
  'https://iceskatingrinkrentals.com': 'ice-rink-rentals',
  'https://www.iceskatingrinkrentals.com': 'ice-rink-rentals',
  'https://rollerrinkrentals.com': 'roller-rink-rentals',
  'https://www.rollerrinkrentals.com': 'roller-rink-rentals',
};

function getAllowedOrigins(): Set<string> {
  const configuredOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set([...defaultAllowedOrigins, ...configuredOrigins]);
}

function buildHeaders(origin: string): Record<string, string> {
  const allowedOrigins = getAllowedOrigins();
  const headers: Record<string, string> = {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json',
    Vary: 'Origin',
  };

  if (allowedOrigins.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'OPTIONS, POST';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
  }

  return headers;
}

function getString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function getFormData(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => [key, String(item ?? '').trim()])
      .filter(([key]) => key.length > 0),
  );
}

function getBodySize(request: HttpRequest): number {
  const header = request.headers.get('content-length');
  const parsed = Number.parseInt(header || '0', 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function jsonResponse(status: number, body: unknown, origin: string): HttpResponseInit {
  return {
    status,
    headers: buildHeaders(origin),
    jsonBody: body,
  };
}

async function forwardToPumpkin(entry: unknown): Promise<{ id?: string }> {
  const forwardUrl = process.env.PUMPKIN_FORM_FORWARD_URL || '';
  const forwardToken = process.env.PUMPKIN_FORM_FORWARD_TOKEN || '';

  if (!forwardUrl) {
    throw new Error('Static form forwarding is not configured.');
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (forwardToken) {
    headers.Authorization = `Bearer ${forwardToken}`;
  }

  const response = await fetch(forwardUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(entry),
  });

  if (!response.ok) {
    throw new Error(`Forward target returned ${response.status}.`);
  }

  return await response.json().catch(() => ({}));
}

export async function staticContact(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = getAllowedOrigins();
  const tenantId = tenantByOrigin[origin];
  const maxBodyBytes = Number.parseInt(process.env.STATIC_FORM_MAX_BODY_BYTES || '20000', 10);

  if (request.method === 'OPTIONS') {
    return { status: 204, headers: buildHeaders(origin) };
  }

  if (!allowedOrigins.has(origin) || !tenantId) {
    return jsonResponse(403, { ok: false, error: 'Origin is not allowed.' }, origin);
  }

  if (getBodySize(request) > maxBodyBytes) {
    return jsonResponse(413, { ok: false, error: 'Request is too large.' }, origin);
  }

  let body: StaticContactRequest;

  try {
    body = (await request.json()) as StaticContactRequest;
  } catch {
    return jsonResponse(400, { ok: false, error: 'Invalid JSON payload.' }, origin);
  }

  const formData = getFormData(body.formData);
  const formId = getString(body.formId, 'contact');
  const pageSlug = getString(body.pageSlug, 'contact');

  if (Object.keys(formData).length === 0) {
    return jsonResponse(400, { ok: false, error: 'Form data is required.' }, origin);
  }

  if (formData.website) {
    context.warn('Static contact honeypot was filled.');
    return jsonResponse(400, { ok: false, error: 'Unable to submit this request.' }, origin);
  }

  const entry = {
    id: `${tenantId}-${formId}-${crypto.randomUUID()}`,
    tenantId,
    formId,
    pageSlug,
    formData,
    submittedAt: new Date().toISOString(),
    metadata: {
      source: 'static-site',
      origin,
      status: 'new',
      tags: [tenantId, pageSlug, formId],
    },
  };

  try {
    const savedEntry = await forwardToPumpkin(entry);

    return jsonResponse(200, { ok: true, entryId: savedEntry.id || entry.id }, origin);
  } catch (error) {
    context.error('Static contact forward failed.', error);
    return jsonResponse(502, { ok: false, error: 'Unable to submit this request right now.' }, origin);
  }
}

app.http('static-contact', {
  methods: ['OPTIONS', 'POST'],
  authLevel: 'anonymous',
  route: 'static-contact',
  handler: staticContact,
});
