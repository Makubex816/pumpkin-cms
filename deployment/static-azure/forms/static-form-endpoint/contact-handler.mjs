import { randomUUID } from 'node:crypto';
import { validateStaticFormPayload } from './validate-static-form-payload.mjs';
import { sanitizeString } from './sanitize-static-form-payload.mjs';

export function buildCorsHeaders(origin = '', env = process.env) {
  const headers = {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json',
    Vary: 'Origin',
  };

  const allowedOrigins = String(env.STATIC_FORM_ALLOWED_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const defaultLocal = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
  ];

  const defaultProd = [
    'https://iceskatingrinkrentals.com',
    'https://www.iceskatingrinkrentals.com',
    'https://ice-dev.iceskatingrinkrentals.com',
    'https://rollerrinkrentals.com',
    'https://www.rollerrinkrentals.com',
    'https://roller-dev.rollerrinkrentals.com',
  ];

  if (origin && new Set([...defaultLocal, ...defaultProd, ...allowedOrigins]).has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'OPTIONS, POST';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
  }

  return headers;
}

export async function handleStaticContactRequest({
  method,
  headers = {},
  body,
  env = process.env,
  fetchImpl = fetch,
  now = () => new Date(),
  logger = console,
}) {
  const origin = getHeader(headers, 'origin');

  if (method === 'OPTIONS') {
    return response(204, {}, origin, env);
  }

  let payload;
  try {
    payload = typeof body === 'string' ? JSON.parse(body || '{}') : body;
  } catch {
    return response(400, {
      ok: false,
      message: 'Invalid JSON payload.',
      validationErrors: ['Invalid JSON payload.'],
    }, origin, env);
  }

  const validation = validateStaticFormPayload({
    payload,
    origin,
    host: getHeader(headers, 'host'),
    method,
    contentType: getHeader(headers, 'content-type'),
    contentLength: Number.parseInt(getHeader(headers, 'content-length') || '0', 10) || 0,
    env,
  });

  if (!validation.ok || !validation.site) {
    return response(400, {
      ok: false,
      message: validation.errors.includes('Origin is not allowed.') ? 'Origin is not allowed.' : 'Please check the highlighted form fields.',
      validationErrors: validation.errors,
      warnings: validation.warnings,
    }, origin, env);
  }

  const entry = buildFormEntry({
    site: validation.site,
    formId: validation.formId,
    formKey: validation.formKey,
    pageSlug: validation.pageSlug,
    formData: validation.formData,
    origin,
    referrer: getHeader(headers, 'referer'),
    userAgent: getHeader(headers, 'user-agent'),
    clientIp: getClientIp(headers),
    now,
    payload,
    routing: validation.routing,
  });

  try {
    const savedEntry = await forwardToPumpkin({
      entry,
      site: validation.site,
      env,
      fetchImpl,
      logger,
    });

    return response(200, {
      ok: true,
      message: 'Your request was submitted.',
      entryId: savedEntry?.id || entry.id,
    }, origin, env);
  } catch (error) {
    logger.error?.('Static form forward failed:', getSafeErrorMessage(error));
    return response(502, {
      ok: false,
      message: 'Unable to submit this request right now.',
    }, origin, env);
  }
}

export function buildFormEntry({ site, formId, formKey, pageSlug, formData, origin, referrer, userAgent, clientIp, now, payload, routing = {} }) {
  const domainRoutingKey = sanitizeString(routing.domainRoutingKey || payload?.domainRoutingKey || payload?.staticEndpointRef || payload?.formConfig?.domainRoutingKey || payload?.formConfig?.staticEndpointRef || site.staticFormEndpointKey, 160);
  const recipientGroup = sanitizeString(routing.recipientGroup || payload?.recipientGroup || payload?.leadRecipientRef || payload?.formConfig?.recipientGroup || payload?.formConfig?.leadRecipientRef || site.defaultRecipientGroup, 160);
  const routingMode = sanitizeString(routing.routingMode || payload?.routingMode || payload?.formConfig?.routingMode || site.defaultLeadRoutingMode, 160);
  const consentAccepted = ['true', 'on', 'yes', '1'].includes(String(formData.consent || '').toLowerCase());

  return {
    id: `${site.tenantId}-${formId}-${randomUUID()}`,
    tenantId: site.tenantId,
    siteKey: site.siteKey,
    formId,
    formKey: formKey || formId,
    pageSlug,
    sourcePage: sanitizeString(payload?.sourcePage || formData.sourcePage || pageSlug, 180),
    leadType: (formKey || formId) === 'default-quote-request' ? 'quote-request' : 'contact',
    status: 'new',
    spamStatus: 'clean',
    consentAccepted,
    honeypotFilled: false,
    formData,
    submittedAt: now().toISOString(),
    ipAddress: clientIp,
    userAgent,
    metadata: {
      source: 'static-form-endpoint',
      referrer,
      status: 'new',
      spamStatus: 'clean',
      consentAccepted,
      leadRecipientRef: recipientGroup,
      staticEndpointRef: domainRoutingKey,
      tags: [
        site.siteKey,
        pageSlug,
        formId,
        formKey,
        domainRoutingKey,
        recipientGroup,
        routingMode,
      ].filter(Boolean),
    },
  };
}

async function forwardToPumpkin({ entry, site, env, fetchImpl, logger }) {
  const mode = env.STATIC_FORM_FORWARD_MODE || 'pumpkin-api';
  if (mode === 'dry-run') {
    logger.info?.(`Static form dry-run accepted for site ${site.siteKey}, form ${entry.formId}.`);
    return { id: entry.id, dryRun: true };
  }

  const apiUrl = String(env.PUMPKIN_API_URL || 'http://localhost:5064').replace(/\/+$/, '');
  const apiKey = env[site.apiKeyEnv] || '';

  if (!apiKey) {
    throw new Error(`Missing API key env var ${site.apiKeyEnv}.`);
  }

  const response = await fetchImpl(`${apiUrl}/api/forms/${encodeURIComponent(site.tenantId)}/entries`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  });

  if (!response.ok) {
    throw new Error(`Pumpkin API returned ${response.status}.`);
  }

  return response.json().catch(() => ({ id: entry.id }));
}

function response(status, body, origin, env) {
  return {
    status,
    headers: buildCorsHeaders(origin, env),
    body,
  };
}

function getHeader(headers, name) {
  const lowerName = name.toLowerCase();
  if (headers instanceof Headers) return headers.get(name) || '';
  const match = Object.entries(headers || {}).find(([key]) => key.toLowerCase() === lowerName);
  return match ? String(match[1] || '') : '';
}

function getClientIp(headers) {
  const forwardedFor = getHeader(headers, 'x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || '';
  return getHeader(headers, 'x-real-ip');
}

function getSafeErrorMessage(error) {
  if (!(error instanceof Error)) return 'unknown error';
  return error.message.replace(/Bearer\s+[A-Za-z0-9._~-]+/g, 'Bearer [redacted]');
}
