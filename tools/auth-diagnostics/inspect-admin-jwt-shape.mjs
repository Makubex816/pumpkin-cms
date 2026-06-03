#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const TEMP_TOKEN_PATH = path.join(tmpdir(), 'pumpkin-admin-jwt.txt');
const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const EMAIL_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';

const result = inspectToken();
console.log(JSON.stringify(result, null, 2));

function inspectToken() {
  const loaded = loadTokenCandidate();
  if (!loaded.present) {
    return {
      schemaVersion: 'pumpkin-admin-jwt-shape-diagnostic.v1',
      tokenPresent: false,
      source: loaded.source,
      envToken: process.env.PUMPKIN_ADMIN_JWT?.trim() ? 'PRESENT' : 'MISSING',
      tempTokenFile: existsSync(TEMP_TOKEN_PATH) ? 'PRESENT' : 'MISSING',
      tokenPrinted: false,
    };
  }

  const normalized = normalizeTokenValue(loaded.value);
  const parts = normalized.token ? normalized.token.split('.') : [];
  const output = {
    schemaVersion: 'pumpkin-admin-jwt-shape-diagnostic.v1',
    tokenPresent: true,
    source: loaded.source,
    tokenPrinted: false,
    rawTokenPrinted: false,
    hadBearerPrefix: normalized.hadBearerPrefix,
    wasJsonWrapper: normalized.wasJsonWrapper,
    jsonWrapperTokenKey: normalized.jsonWrapperTokenKey || '',
    partsCount: parts.length,
    shapeWarning: normalized.warning || '',
  };

  if (parts.length !== 3) {
    return {
      ...output,
      decodeOk: false,
      reason: 'JWT must have exactly three dot-separated parts after safe normalization.',
    };
  }

  const header = decodePart(parts[0]);
  const payload = decodePart(parts[1]);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const exp = numberOrNull(payload?.exp);

  return {
    ...output,
    decodeOk: Boolean(header && payload),
    alg: stringOrEmpty(header?.alg),
    typ: stringOrEmpty(header?.typ),
    iss: stringOrEmpty(payload?.iss),
    aud: payload?.aud ?? '',
    exp,
    expIso: exp ? new Date(exp * 1000).toISOString() : '',
    expired: exp ? exp <= nowSeconds : null,
    tenantId: stringOrEmpty(payload?.tenantId),
    role: stringOrEmpty(payload?.role || payload?.[ROLE_CLAIM]),
    emailMasked: maskEmail(payload?.email || payload?.[EMAIL_CLAIM]),
    namePresent: Boolean(payload?.name),
    nameIdentifierPresent: Boolean(payload?.nameid || payload?.sub),
    signaturePrinted: false,
  };
}

function loadTokenCandidate() {
  const envToken = process.env.PUMPKIN_ADMIN_JWT?.trim();
  if (envToken) return { present: true, source: 'PUMPKIN_ADMIN_JWT', value: envToken };
  if (existsSync(TEMP_TOKEN_PATH)) {
    const value = readFileSync(TEMP_TOKEN_PATH, 'utf8').trim();
    return { present: Boolean(value), source: 'temp-file', value };
  }
  return { present: false, source: 'none', value: '' };
}

function normalizeTokenValue(value) {
  let token = String(value || '').trim();
  let hadBearerPrefix = false;
  let wasJsonWrapper = false;
  let jsonWrapperTokenKey = '';
  let warning = '';

  if (token.startsWith('{')) {
    try {
      const parsed = JSON.parse(token);
      const key = ['token', 'accessToken', 'jwt', 'idToken', 'authToken'].find(
        (candidate) => typeof parsed?.[candidate] === 'string' && parsed[candidate].trim()
      );
      if (key) {
        token = parsed[key].trim();
        wasJsonWrapper = true;
        jsonWrapperTokenKey = key;
      } else {
        warning = 'JSON wrapper was present, but no token-like string key was found.';
      }
    } catch {
      warning = 'Token file/env starts with JSON marker but is not valid JSON.';
    }
  }

  if (/^Bearer\s+/i.test(token)) {
    token = token.replace(/^Bearer\s+/i, '').trim();
    hadBearerPrefix = true;
  }

  return { token, hadBearerPrefix, wasJsonWrapper, jsonWrapperTokenKey, warning };
}

function decodePart(value) {
  try {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function stringOrEmpty(value) {
  return typeof value === 'string' ? value : '';
}

function maskEmail(value) {
  if (typeof value !== 'string' || !value.includes('@')) return '';
  const [name, domain] = value.split('@');
  const safeName = name.length <= 2 ? `${name[0] || ''}*` : `${name.slice(0, 2)}***`;
  return `${safeName}@${domain}`;
}
