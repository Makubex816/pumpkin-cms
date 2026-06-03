#!/usr/bin/env node
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const TEMP_TOKEN_PATH = path.join(tmpdir(), 'pumpkin-admin-jwt.txt');
const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const EMAIL_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';

const args = parseArgs(process.argv.slice(2));
const apiBase = args['api-base'] || 'http://localhost:5064';
const consumeTemp = Boolean(args['consume-temp']);

const result = await probe();
console.log(JSON.stringify(result, null, 2));

async function probe() {
  const loaded = loadTokenCandidate();
  if (!loaded.present) {
    return {
      schemaVersion: 'pumpkin-admin-auth-probe.v1',
      apiBase,
      tokenPresent: false,
      envToken: process.env.PUMPKIN_ADMIN_JWT?.trim() ? 'PRESENT' : 'MISSING',
      tempTokenFile: existsSync(TEMP_TOKEN_PATH) ? 'PRESENT' : 'MISSING',
      probePerformed: false,
      safeCategory: 'token-missing',
      tokenPrinted: false,
      cmsWritePerformed: false,
    };
  }

  const normalized = normalizeTokenValue(loaded.value);
  if (consumeTemp && loaded.source === 'temp-file') {
    rmSync(TEMP_TOKEN_PATH, { force: true });
  }

  if (!normalized.token || normalized.token.split('.').length !== 3) {
    return {
      schemaVersion: 'pumpkin-admin-auth-probe.v1',
      apiBase,
      tokenPresent: true,
      tokenSource: loaded.source,
      probePerformed: false,
      safeCategory: 'malformed-token-shape',
      hadBearerPrefix: normalized.hadBearerPrefix,
      wasJsonWrapper: normalized.wasJsonWrapper,
      tempTokenConsumed: consumeTemp && loaded.source === 'temp-file',
      tokenPrinted: false,
      cmsWritePerformed: false,
    };
  }

  try {
    const response = await fetch(`${apiBase.replace(/\/$/, '')}/api/auth/verify`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${normalized.token}`,
        Accept: 'application/json',
      },
    });
    const text = await response.text();
    const body = parseJson(text);
    return {
      schemaVersion: 'pumpkin-admin-auth-probe.v1',
      apiBase,
      endpoint: 'GET /api/auth/verify',
      tokenPresent: true,
      tokenSource: loaded.source,
      probePerformed: true,
      status: response.status,
      safeCategory: classifyStatus(response.status),
      hadBearerPrefix: normalized.hadBearerPrefix,
      wasJsonWrapper: normalized.wasJsonWrapper,
      tempTokenConsumed: consumeTemp && loaded.source === 'temp-file',
      verifiedTenantId: stringOrEmpty(body?.tenantId),
      verifiedRole: stringOrEmpty(body?.role || body?.[ROLE_CLAIM]),
      verifiedEmailMasked: maskEmail(body?.email || body?.[EMAIL_CLAIM]),
      tokenPrinted: false,
      cmsWritePerformed: false,
    };
  } catch (error) {
    return {
      schemaVersion: 'pumpkin-admin-auth-probe.v1',
      apiBase,
      endpoint: 'GET /api/auth/verify',
      tokenPresent: true,
      tokenSource: loaded.source,
      probePerformed: true,
      status: 0,
      safeCategory: 'transport-error',
      safeError: String(error?.message || error || '').slice(0, 200),
      tempTokenConsumed: consumeTemp && loaded.source === 'temp-file',
      tokenPrinted: false,
      cmsWritePerformed: false,
    };
  }
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

  if (token.startsWith('{')) {
    try {
      const parsed = JSON.parse(token);
      const key = ['token', 'accessToken', 'jwt', 'idToken', 'authToken'].find(
        (candidate) => typeof parsed?.[candidate] === 'string' && parsed[candidate].trim()
      );
      if (key) {
        token = parsed[key].trim();
        wasJsonWrapper = true;
      }
    } catch {
      // The shape helper reports JSON parse details; the probe only classifies safely.
    }
  }

  if (/^Bearer\s+/i.test(token)) {
    token = token.replace(/^Bearer\s+/i, '').trim();
    hadBearerPrefix = true;
  }

  return { token, hadBearerPrefix, wasJsonWrapper };
}

function classifyStatus(status) {
  if (status === 200) return 'valid';
  if (status === 401) return 'invalid-or-expired-token';
  if (status === 403) return 'forbidden-role-or-tenant';
  if (status === 0) return 'transport-error';
  return `http-${status}`;
}

function parseJson(text) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function parseArgs(argv) {
  const output = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (item === '--consume-temp') {
      output['consume-temp'] = true;
      continue;
    }
    if (!item.startsWith('--')) continue;
    const key = item.slice(2);
    const value = argv[index + 1];
    if (value && !value.startsWith('--')) {
      output[key] = value;
      index += 1;
    }
  }
  return output;
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
