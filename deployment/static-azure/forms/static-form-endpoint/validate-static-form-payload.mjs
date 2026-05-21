import { sanitizeFormData, sanitizeString } from './sanitize-static-form-payload.mjs';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HONEYPOT_FIELDS = new Set([
  'website',
  'company-url',
  'companyUrl',
  'hp-field',
  'hp_field',
  '_gotcha',
]);

export function parseAllowedList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getSiteConfigs(env = process.env) {
  const sharedLocalOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
  ];

  return [
    {
      siteKey: 'ice-rink-rentals',
      tenantId: 'ice-rink-rentals',
      domains: ['iceskatingrinkrentals.com', 'www.iceskatingrinkrentals.com'],
      allowedOrigins: [
        'https://iceskatingrinkrentals.com',
        'https://www.iceskatingrinkrentals.com',
        'https://ice-dev.iceskatingrinkrentals.com',
        ...sharedLocalOrigins,
      ],
      apiKeyEnv: 'ICE_RINK_RENTALS_API_KEY',
      defaultFormId: 'contact',
      defaultLeadRoutingMode: 'manual_review_then_provider_match',
      defaultRecipientGroup: 'local_admin',
      staticFormEndpointKey: env.ICE_RINK_RENTALS_STATIC_FORM_ENDPOINT_KEY || 'ice-rink-rentals-default',
    },
    {
      siteKey: 'roller-rink-rentals',
      tenantId: 'roller-rink-rentals',
      domains: ['rollerrinkrentals.com', 'www.rollerrinkrentals.com'],
      allowedOrigins: [
        'https://rollerrinkrentals.com',
        'https://www.rollerrinkrentals.com',
        'https://roller-dev.rollerrinkrentals.com',
        ...sharedLocalOrigins,
      ],
      apiKeyEnv: 'ROLLER_RINK_RENTALS_API_KEY',
      defaultFormId: 'contact',
      defaultLeadRoutingMode: 'manual_review_then_provider_match',
      defaultRecipientGroup: 'local_admin',
      staticFormEndpointKey: env.ROLLER_RINK_RENTALS_STATIC_FORM_ENDPOINT_KEY || 'roller-rink-rentals-default',
    },
  ];
}

export function getAllowedSiteKeys(env = process.env) {
  const configured = parseAllowedList(env.STATIC_FORM_ALLOWED_SITE_KEYS);
  if (configured.length === 0) {
    return new Set(getSiteConfigs(env).map((site) => site.siteKey));
  }

  return new Set(configured);
}

export function getAllowedOrigins(env = process.env) {
  const configured = parseAllowedList(env.STATIC_FORM_ALLOWED_ORIGINS);
  const defaults = getSiteConfigs(env).flatMap((site) => site.allowedOrigins);
  return new Set([...defaults, ...configured]);
}

export function resolveSite({ payload, origin = '', host = '', env = process.env }) {
  const allowedSiteKeys = getAllowedSiteKeys(env);
  const sites = getSiteConfigs(env).filter((site) => allowedSiteKeys.has(site.siteKey));
  const siteKey = sanitizeString(payload?.siteKey, 120);
  const tenantId = sanitizeString(payload?.tenantId, 120);
  const domain = normalizeDomain(sanitizeString(payload?.domain, 200) || host || origin);

  const explicitMatch = siteKey
    ? sites.find((site) => site.siteKey === siteKey)
    : null;

  if (explicitMatch) return explicitMatch;

  if (tenantId) {
    const tenantMatch = sites.find((site) => site.tenantId === tenantId);
    if (tenantMatch) return tenantMatch;
  }

  if (domain) {
    const domainMatch = sites.find((site) => site.domains.includes(domain));
    if (domainMatch) return domainMatch;
  }

  if (origin) {
    const originMatch = sites.find((site) => site.allowedOrigins.includes(origin));
    if (originMatch && !isLocalOrigin(origin)) return originMatch;
  }

  return null;
}

export function validateStaticFormPayload({
  payload,
  origin = '',
  host = '',
  method = 'POST',
  contentType = 'application/json',
  contentLength = 0,
  env = process.env,
}) {
  const errors = [];
  const warnings = [];
  const maxBodyBytes = parseInteger(env.STATIC_FORM_MAX_BODY_BYTES, 20000);

  if (method !== 'POST') {
    errors.push('Only POST is supported.');
  }

  if (contentLength > maxBodyBytes) {
    errors.push(`Request exceeds the ${maxBodyBytes} byte limit.`);
  }

  if (contentType && !contentType.toLowerCase().includes('application/json')) {
    warnings.push('Expected application/json content type.');
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    errors.push('Request body must be a JSON object.');
    return { ok: false, errors, warnings, site: null, formData: {}, formId: '', pageSlug: '' };
  }

  const allowedOrigins = getAllowedOrigins(env);
  const allowMissingOrigin = env.STATIC_FORM_ALLOW_MISSING_ORIGIN === 'true';
  const isOriginAllowed = origin ? allowedOrigins.has(origin) : allowMissingOrigin;

  if (!isOriginAllowed) {
    errors.push('Origin is not allowed.');
  }

  const site = resolveSite({ payload, origin, host, env });
  if (!site) {
    errors.push('Unable to resolve a known site for this submission.');
  }

  if (site && payload.siteKey && sanitizeString(payload.siteKey) !== site.siteKey) {
    errors.push('Submitted siteKey does not match the resolved site.');
  }

  if (site && payload.tenantId && sanitizeString(payload.tenantId) !== site.tenantId) {
    errors.push('Submitted tenantId does not match the resolved site.');
  }

  const formData = sanitizeFormData(payload.formData);
  const formId = sanitizeString(payload.formId, 120) || site?.defaultFormId || 'contact';
  const pageSlug = sanitizeString(payload.pageSlug, 180) || 'contact';
  const formType = sanitizeString(payload.formType, 120) || sanitizeString(payload?.formConfig?.formType, 120) || 'quote_request';

  if (!formId) errors.push('formId is required.');
  if (Object.keys(formData).length === 0) errors.push('formData is required.');

  const filledHoneypot = Object.entries(formData).some(([key, value]) => HONEYPOT_FIELDS.has(key) && String(value).trim());
  if (filledHoneypot) {
    errors.push('Unable to submit this request.');
  }

  const email = firstNonEmpty(formData, ['email', 'email-address', 'emailAddress']);
  const name = firstNonEmpty(formData, ['name', 'full-name', 'fullName']);
  const phone = firstNonEmpty(formData, ['phone', 'phone-number', 'phoneNumber', 'tel']);
  const eventLocation = firstNonEmpty(formData, ['event-location', 'eventLocation', 'event_location', 'location', 'venue']);
  const message = firstNonEmpty(formData, ['message', 'details', 'comments']);

  if (!name) errors.push('Name is required.');
  if (!email) {
    errors.push('Email is required.');
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.push('Email must be valid.');
  }

  if (formType === 'quote_request') {
    if (!phone) errors.push('Phone is required for quote requests.');
    if (!eventLocation && !message) {
      errors.push('Event location or message is required for quote requests.');
    }
  } else if (!eventLocation && !message) {
    errors.push('Event location or message is required.');
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    site,
    formData,
    formId,
    pageSlug,
    formType,
  };
}

function firstNonEmpty(record, keys) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  return '';
}

function normalizeDomain(value) {
  if (!value) return '';

  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return value
      .replace(/^https?:\/\//i, '')
      .split('/')[0]
      .split(':')[0]
      .toLowerCase();
  }
}

function isLocalOrigin(origin) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
}

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
