#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../../../../..');
const SECURE_PATH = path.join(REPO_ROOT, '.tmp/v2-8-61of/secure/party-pros-backup-export.json');
const APPROVED_BACKUP_ROOT = path.resolve('C:/Users/User/Desktop/PumpkinCMS/secure-operator-handoff/tenant-backups');
const APPROVED_BACKUP_FOLDER = 'v2-8-61of-party-pros-full-backup-proof';
const RESULT_SCHEMA = 'pumpkin-tenant-full-backup-proof';
const RESULT_SCHEMA_VERSION = 'v2-8-61of';

const RUNTIME_CHECKS = [
  'https://iceskatingrinkrentals.com/',
  'https://iceskatingrinkrentals.com/contact',
  'https://iceskatingrinkrentals.com/service-areas',
  'https://iceskatingrinkrentals.com/api/static-contact-health',
  'https://www.iceskatingrinkrentals.com/',
  'https://www.iceskatingrinkrentals.com/contact',
  'https://www.iceskatingrinkrentals.com/service-areas',
  'https://www.iceskatingrinkrentals.com/api/static-contact-health',
  'https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health',
  'https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health',
  'https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/',
  'https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/login',
  'https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/dashboard'
];

const DATABASE_FILES = {
  tenant: 'tenant.json',
  pages: 'pages.json',
  themes: 'themes.json',
  formDefinitions: 'form-definitions.json',
  formEntries: 'form-entries.json',
  mediaAssets: 'media-assets.json',
  users: 'users-sanitized.json',
  importRuns: 'import-runs.json',
  publishRuns: 'publish-runs.json',
  domainBindings: 'domain-bindings.json'
};

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function readJson(filePath) {
  const text = await fs.readFile(filePath, 'utf8');
  return JSON.parse(text.replace(/^\uFEFF/, ''));
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, json(value), 'utf8');
}

async function writeText(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, value.endsWith('\n') ? value : `${value}\n`, 'utf8');
}

function requireString(value, fieldName) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required secure field: ${fieldName}`);
  }
  return value.trim();
}

function requireNumber(value, fieldName) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Missing required numeric secure field: ${fieldName}`);
  }
  return value;
}

function requireBoolean(value, fieldName) {
  if (value !== true) {
    throw new Error(`Required approval flag is not true: ${fieldName}`);
  }
}

function sha256Text(value) {
  return createHash('sha256').update(String(value), 'utf8').digest('hex');
}

async function sha256File(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);
    stream.on('error', reject);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

function assertApprovedOutput(outputDir) {
  const resolved = path.resolve(outputDir);
  const relative = path.relative(APPROVED_BACKUP_ROOT, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative) || relative === '') {
    throw new Error(`Backup output path must be a child of ${APPROVED_BACKUP_ROOT}`);
  }
  if (path.basename(resolved).toLowerCase() !== APPROVED_BACKUP_FOLDER) {
    throw new Error(`Backup output path must end with ${APPROVED_BACKUP_FOLDER}`);
  }
  return resolved;
}

async function ensureEmptyOrCreateDirectory(outputDir) {
  await fs.mkdir(outputDir, { recursive: true });
  const entries = await fs.readdir(outputDir);
  if (entries.length > 0) {
    throw new Error(`Refusing to overwrite non-empty backup output folder: ${outputDir}`);
  }
}

function joinUrl(baseUrl, route) {
  if (/^https?:\/\//i.test(route)) return route;
  return `${baseUrl.replace(/\/+$/, '')}/${route.replace(/^\/+/, '')}`;
}

function enc(value) {
  return encodeURIComponent(value);
}

function getValue(record, ...keys) {
  if (!record || typeof record !== 'object') return undefined;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(record, key)) return record[key];
    const pascal = `${key[0]?.toUpperCase() ?? ''}${key.slice(1)}`;
    if (Object.prototype.hasOwnProperty.call(record, pascal)) return record[pascal];
  }
  return undefined;
}

function getArray(wrapper, key) {
  const value = getValue(wrapper, key);
  if (Array.isArray(value)) return value;
  if (Array.isArray(wrapper)) return wrapper;
  return [];
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeBlobPath(value) {
  const raw = normalizeString(value).replace(/\\/g, '/').replace(/^\/+/, '');
  if (!raw) return '';
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function publicBlobBase(account, container) {
  return `https://${account}.blob.core.windows.net/${container}`;
}

function buildBlobUrl(account, container, blobPath) {
  return `${publicBlobBase(account, container)}/${blobPath.split('/').map(encodeURIComponent).join('/')}`;
}

function isSecretKey(key) {
  const normalized = String(key).replace(/[^a-z0-9]/gi, '').toLowerCase();
  return normalized.includes('password') ||
    normalized.includes('secret') ||
    normalized.includes('token') ||
    normalized.includes('connectionstring') ||
    normalized.includes('authorization') ||
    normalized.includes('cookie') ||
    normalized.includes('credential') ||
    normalized === 'apikey' ||
    normalized === 'apikeyhash' ||
    normalized.endsWith('apikey') ||
    normalized.endsWith('apikeyhash');
}

function containsSecretLikeValue(value) {
  if (typeof value !== 'string') return false;
  const candidate = value.toLowerCase();
  return candidate.includes('accountkey=') ||
    candidate.includes('sharedaccesssignature=') ||
    candidate.includes('sig=') ||
    candidate.includes('bearer ') ||
    candidate.includes('password=');
}

function redactSecrets(value, key = '') {
  if (value == null) return value;
  if (isSecretKey(key) || containsSecretLikeValue(value)) {
    if (typeof value === 'string' && value.trim() === '') return value;
    return '[REDACTED]';
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactSecrets(item));
  }
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [entryKey, redactSecrets(entryValue, entryKey)])
    );
  }
  return value;
}

function sanitizeUsers(users) {
  return users.map((user) => redactSecrets({
    id: getValue(user, 'id'),
    tenantId: getValue(user, 'tenantId'),
    email: getValue(user, 'email'),
    username: getValue(user, 'username'),
    firstName: getValue(user, 'firstName') ?? null,
    lastName: getValue(user, 'lastName') ?? null,
    displayName: getValue(user, 'displayName') ?? null,
    role: getValue(user, 'role'),
    isActive: getValue(user, 'isActive'),
    createdDate: getValue(user, 'createdDate') ?? getValue(user, 'createdAt') ?? null,
    lastLogin: getValue(user, 'lastLogin') ?? null,
    permissions: getValue(user, 'permissions') ?? []
  }));
}

function recordId(record, fallback) {
  return normalizeString(getValue(record, 'id')) ||
    normalizeString(getValue(record, 'assetId')) ||
    normalizeString(getValue(record, 'pageId')) ||
    normalizeString(getValue(record, 'themeId')) ||
    normalizeString(getValue(record, 'formKey')) ||
    String(fallback);
}

function pickMediaLocation(asset, tenantMedia) {
  const candidates = [
    getValue(asset, 'publicUrl'),
    getValue(asset, 'url'),
    getValue(asset, 'sourceUrl')
  ].map(normalizeString).filter(Boolean);

  const variants = getValue(asset, 'variants') ?? [];
  for (const variant of Array.isArray(variants) ? variants : []) {
    candidates.push(...[
      getValue(variant, 'publicUrl'),
      getValue(variant, 'url'),
      getValue(variant, 'sourceUrl')
    ].map(normalizeString).filter(Boolean));
  }

  let blobPath = normalizeBlobPath(getValue(asset, 'blobPath'));
  let sourceUrl = candidates.find((candidate) => /^https?:\/\//i.test(candidate)) ?? '';

  if (!sourceUrl && blobPath) {
    sourceUrl = buildBlobUrl(tenantMedia.account, tenantMedia.container, blobPath);
  }

  if (!sourceUrl) {
    throw new Error(`MediaAsset ${recordId(asset, 'unknown')} does not expose a public URL or blobPath.`);
  }

  const parsed = new URL(sourceUrl);
  if (parsed.search) {
    throw new Error(`Refusing media URL with query string for ${recordId(asset, 'unknown')}`);
  }
  if (parsed.hostname.toLowerCase() !== `${tenantMedia.account}.blob.core.windows.net`.toLowerCase()) {
    throw new Error(`MediaAsset ${recordId(asset, 'unknown')} is outside the approved storage account.`);
  }

  const pathParts = parsed.pathname.replace(/^\/+/, '').split('/');
  const urlContainer = pathParts.shift() ?? '';
  const pathFromUrl = normalizeBlobPath(pathParts.join('/'));
  if (!blobPath) blobPath = pathFromUrl;

  if (urlContainer.toLowerCase() !== tenantMedia.container.toLowerCase()) {
    throw new Error(`MediaAsset ${recordId(asset, 'unknown')} is outside the approved media container.`);
  }
  if (!blobPath.toLowerCase().startsWith(tenantMedia.prefix.toLowerCase())) {
    throw new Error(`MediaAsset ${recordId(asset, 'unknown')} is outside the approved tenant media prefix.`);
  }

  return {
    sourceUrl: buildBlobUrl(tenantMedia.account, tenantMedia.container, blobPath),
    blobPath
  };
}

function safePathSegments(inputPath) {
  return normalizeBlobPath(inputPath)
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      const safe = segment.replace(/[<>:"\\|?*\x00-\x1f]/g, '-');
      return safe === '.' || safe === '..' || safe.trim() === '' ? '_' : safe;
    });
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {})
    }
  });

  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : await response.text().catch(() => '');

  if (!response.ok) {
    const safeMessage = typeof body === 'string'
      ? body.slice(0, 180)
      : (body.message ?? body.error ?? body.title ?? `HTTP ${response.status}`);
    throw new Error(`HTTP ${response.status} for ${url}: ${safeMessage}`);
  }

  return body;
}

async function fetchStatus(url) {
  try {
    const response = await fetch(url, { method: 'GET', redirect: 'manual' });
    return {
      url,
      status: response.status,
      ok: response.status >= 200 && response.status < 400,
      contentType: response.headers.get('content-type') ?? ''
    };
  } catch (error) {
    return {
      url,
      status: 0,
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function downloadFile(url, targetPath) {
  const response = await fetch(url);
  if (!response.ok) {
    const parsed = new URL(url);
    throw new Error(`HTTP ${response.status} while downloading media ${parsed.origin}${parsed.pathname}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, bytes);
  return {
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    contentType: response.headers.get('content-type') ?? ''
  };
}

async function listFiles(rootDir) {
  const files = [];
  async function walk(current) {
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }
  await walk(rootDir);
  return files.sort((a, b) => a.localeCompare(b));
}

function checksumExcluded(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/');
  return normalized === 'checksums.sha256' ||
    normalized === 'validation/backup-validation-report.json';
}

async function buildChecksums(rootDir) {
  const files = (await listFiles(rootDir))
    .filter((filePath) => !checksumExcluded(path.relative(rootDir, filePath)));
  const entries = [];
  for (const filePath of files) {
    const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
    const stat = await fs.stat(filePath);
    entries.push({
      path: relativePath,
      bytes: stat.size,
      sha256: await sha256File(filePath)
    });
  }
  await writeText(
    path.join(rootDir, 'checksums.sha256'),
    entries.map((entry) => `${entry.sha256}  ${entry.path}`).join('\n')
  );
  return entries;
}

async function validateChecksums(rootDir, checksumEntries) {
  const results = [];
  for (const entry of checksumEntries) {
    const filePath = path.join(rootDir, entry.path);
    const actual = await sha256File(filePath);
    results.push({
      path: entry.path,
      expected: entry.sha256,
      actual,
      ok: actual === entry.sha256
    });
  }
  return {
    ok: results.every((result) => result.ok),
    checked: results.length,
    failures: results.filter((result) => !result.ok)
  };
}

async function copyDirectoryFiltered(source, target) {
  await fs.cp(source, target, {
    recursive: true,
    force: false,
    filter: (src) => {
      const normalized = src.replace(/\\/g, '/');
      return !normalized.includes('/node_modules/') &&
        !normalized.includes('/.git/') &&
        !normalized.includes('/.next/') &&
        !normalized.includes('/dist/') &&
        !normalized.includes('/out/');
    }
  });
}

async function fileMetadata(filePath, expectedSha256 = '') {
  const resolved = path.resolve(filePath);
  const stat = await fs.stat(resolved);
  if (!stat.isFile()) {
    throw new Error(`Expected file artifact is not a file: ${resolved}`);
  }
  const actualSha256 = await sha256File(resolved);
  return {
    path: resolved,
    basename: path.basename(resolved),
    bytes: stat.size,
    expectedSha256: expectedSha256 || null,
    actualSha256,
    expectedMatchesActual: expectedSha256 ? expectedSha256.toLowerCase() === actualSha256.toLowerCase() : null
  };
}

async function directoryContentManifest(rootDir) {
  const resolved = path.resolve(rootDir);
  const files = await listFiles(resolved);
  const entries = [];
  for (const filePath of files) {
    const relativePath = path.relative(resolved, filePath).replace(/\\/g, '/');
    const stat = await fs.stat(filePath);
    entries.push({
      path: relativePath,
      bytes: stat.size,
      sha256: await sha256File(filePath)
    });
  }
  return {
    path: resolved,
    fileCount: entries.length,
    totalBytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
    manifestSha256: sha256Text(json(entries)),
    entries
  };
}

async function directoryReferenceNoContent(rootDir) {
  const resolved = path.resolve(rootDir);
  const stat = await fs.stat(resolved);
  return {
    path: resolved,
    exists: true,
    isDirectory: stat.isDirectory(),
    pathSha256: sha256Text(resolved.replace(/\\/g, '/')),
    note: 'Hash is over the normalized path string only. File contents were not read.'
  };
}

function routeFromPage(page) {
  const slug = normalizeString(getValue(page, 'pageSlug')) || normalizeString(getValue(page, 'slug'));
  return slug === '' || slug === '/' || slug.toLowerCase() === 'home'
    ? '/'
    : `/${slug.replace(/^\/+/, '')}`;
}

function pageIsPublished(page) {
  return Boolean(getValue(page, 'isPublished'));
}

function pageInSitemap(page) {
  return Boolean(getValue(page, 'includeInSitemap'));
}

function uniqueCount(values) {
  return new Set(values.filter(Boolean).map((value) => String(value).toLowerCase())).size;
}

function validateReadback({ tenant, pages, mediaAssets, themes, formDefinitions }, secureTenant) {
  const tenantId = requireString(secureTenant.tenantId, 'tenant.tenantId');
  const expectedPages = requireNumber(secureTenant.expectedPages, 'tenant.expectedPages');
  const expectedMediaAssets = requireNumber(secureTenant.expectedMediaAssets, 'tenant.expectedMediaAssets');
  const expectedFormDefinition = requireString(secureTenant.formDefinition, 'tenant.formDefinition');
  const expectedTheme = requireString(secureTenant.theme, 'tenant.theme');

  const actualTenantId = normalizeString(getValue(tenant, 'tenantId'));
  const tenantStatus = normalizeString(getValue(tenant, 'status')).toLowerCase();
  const tenantIsActive = getValue(tenant, 'isActive');
  const tenantActive = tenantIsActive === true || tenantStatus === 'active';
  const formDefinitionIds = formDefinitions.map((definition) =>
    normalizeString(getValue(definition, 'id')) ||
    normalizeString(getValue(definition, 'formKey')) ||
    normalizeString(getValue(definition, 'formType'))
  );
  const themeIds = themes.map((theme) => normalizeString(getValue(theme, 'themeId')) || normalizeString(getValue(theme, 'id')));

  const checks = {
    tenantId: { expected: tenantId, actual: actualTenantId, ok: actualTenantId === tenantId },
    tenantActive: {
      expected: 'active',
      actual: tenantStatus || tenantIsActive,
      ok: tenantActive
    },
    pages: { expected: expectedPages, actual: pages.length, ok: pages.length === expectedPages },
    mediaAssets: { expected: expectedMediaAssets, actual: mediaAssets.length, ok: mediaAssets.length === expectedMediaAssets },
    formDefinition: {
      expected: expectedFormDefinition,
      actualIds: formDefinitionIds,
      ok: formDefinitionIds.some((id) => id.toLowerCase() === expectedFormDefinition.toLowerCase())
    },
    theme: {
      expected: expectedTheme,
      actualIds: themeIds,
      ok: themeIds.some((id) => id.toLowerCase() === expectedTheme.toLowerCase())
    }
  };

  const ok = Object.values(checks).every((check) => check.ok);
  if (!ok) {
    throw new Error(`Party Pros live readback did not match expected counts: ${JSON.stringify(checks)}`);
  }
  return checks;
}

async function main() {
  const secure = await readJson(SECURE_PATH);
  const approvals = secure.approvals ?? {};
  requireBoolean(approvals.allowSuperAdminLogin, 'approvals.allowSuperAdminLogin');
  requireBoolean(approvals.allowReadOnlyAdminApiExport, 'approvals.allowReadOnlyAdminApiExport');
  requireBoolean(approvals.allowReadOnlyBlobDownloadOrPublicRead, 'approvals.allowReadOnlyBlobDownloadOrPublicRead');
  requireBoolean(approvals.allowOutsideRepoBackupOutput, 'approvals.allowOutsideRepoBackupOutput');
  requireBoolean(approvals.allowTenantParameterizedBackupTooling, 'approvals.allowTenantParameterizedBackupTooling');
  requireBoolean(approvals.noStorageKeysListKeysSas, 'approvals.noStorageKeysListKeysSas');
  requireBoolean(approvals.noDeploy, 'approvals.noDeploy');
  requireBoolean(approvals.noDnsCustomDomain, 'approvals.noDnsCustomDomain');
  requireBoolean(approvals.noContactPost, 'approvals.noContactPost');
  requireBoolean(approvals.noFormSubmission, 'approvals.noFormSubmission');
  requireBoolean(approvals.noCustomerFacingPost, 'approvals.noCustomerFacingPost');
  requireBoolean(approvals.noAirstripDisturbance, 'approvals.noAirstripDisturbance');

  const apiBaseUrl = requireString(secure.pumpkinApiBaseUrl, 'pumpkinApiBaseUrl').replace(/\/+$/, '');
  const loginEndpoint = requireString(secure.adminLoginEndpoint, 'adminLoginEndpoint');
  const tenant = secure.tenant ?? {};
  const tenantId = requireString(tenant.tenantId, 'tenant.tenantId');
  const tenantName = requireString(tenant.tenantName, 'tenant.tenantName');
  const outputDir = assertApprovedOutput(requireString(secure.backupOutput?.folder, 'backupOutput.folder'));
  const tenantMedia = {
    account: requireString(tenant.mediaStorageAccount, 'tenant.mediaStorageAccount'),
    container: requireString(tenant.mediaContainer, 'tenant.mediaContainer'),
    prefix: requireString(tenant.mediaPrefix, 'tenant.mediaPrefix').replace(/^\/+/, '').replace(/\/?$/, '/')
  };
  const sourceArtifacts = secure.sourceArtifacts ?? {};
  const sourceZip = requireString(sourceArtifacts.sourceZip, 'sourceArtifacts.sourceZip');
  const sourceZipExpectedSha256 = normalizeString(sourceArtifacts.sourceZipSha256);
  const compiledPackage = requireString(sourceArtifacts.compiledPackage, 'sourceArtifacts.compiledPackage');
  const creationHardcopyFolder = requireString(sourceArtifacts.creationHardcopyFolder, 'sourceArtifacts.creationHardcopyFolder');

  await ensureEmptyOrCreateDirectory(outputDir);

  const loginResponse = await fetchJson(joinUrl(apiBaseUrl, loginEndpoint), {
    method: 'POST',
    body: JSON.stringify({
      email: requireString(secure.superAdminEmail, 'superAdminEmail'),
      password: requireString(secure.superAdminPassword, 'superAdminPassword')
    })
  });
  const token = requireString(getValue(loginResponse, 'token'), 'login token');
  const authHeaders = { Authorization: `Bearer ${token}` };
  const loginUser = getValue(loginResponse, 'user') ?? {};
  if (getValue(loginUser, 'role') !== 'SuperAdmin') {
    throw new Error('Authenticated user is not SuperAdmin.');
  }

  const verifiedUser = await fetchJson(joinUrl(apiBaseUrl, '/api/auth/verify'), { headers: authHeaders });
  if (getValue(verifiedUser, 'role') !== 'SuperAdmin') {
    throw new Error('JWT verify did not return SuperAdmin.');
  }

  const [
    liveTenant,
    pagesWrapper,
    mediaWrapper,
    themesWrapper,
    formDefinitionsWrapper,
    formEntriesWrapper,
    importRunsWrapper,
    publishRunsWrapper,
    domainBindingsWrapper,
    usersWrapper
  ] = await Promise.all([
    fetchJson(joinUrl(apiBaseUrl, `/api/admin/tenants/${enc(tenantId)}`), { headers: authHeaders }),
    fetchJson(joinUrl(apiBaseUrl, `/api/admin/pages?tenantId=${enc(tenantId)}&_=${Date.now()}`), { headers: authHeaders }),
    fetchJson(joinUrl(apiBaseUrl, `/api/admin/${enc(tenantId)}/media-assets`), { headers: authHeaders }),
    fetchJson(joinUrl(apiBaseUrl, `/api/admin/themes/${enc(tenantId)}`), { headers: authHeaders }),
    fetchJson(joinUrl(apiBaseUrl, `/api/admin/forms/${enc(tenantId)}/definitions`), { headers: authHeaders }),
    fetchJson(joinUrl(apiBaseUrl, `/api/admin/${enc(tenantId)}/form-entries`), { headers: authHeaders }),
    fetchJson(joinUrl(apiBaseUrl, `/api/admin/${enc(tenantId)}/import-runs`), { headers: authHeaders }),
    fetchJson(joinUrl(apiBaseUrl, `/api/admin/${enc(tenantId)}/publish-runs`), { headers: authHeaders }),
    fetchJson(joinUrl(apiBaseUrl, `/api/admin/tenants/${enc(tenantId)}/domain-bindings`), { headers: authHeaders }),
    fetchJson(joinUrl(apiBaseUrl, `/api/admin/users?tenantId=${enc(tenantId)}`), { headers: authHeaders })
  ]);

  const pages = getArray(pagesWrapper, 'pages');
  const mediaAssets = getArray(mediaWrapper, 'mediaAssets');
  const themes = getArray(themesWrapper, 'themes');
  const formDefinitions = getArray(formDefinitionsWrapper, 'formDefinitions');
  const formEntries = getArray(formEntriesWrapper, 'formEntries');
  const importRuns = getArray(importRunsWrapper, 'importRuns');
  const publishRuns = getArray(publishRunsWrapper, 'publishRuns');
  const domainBindings = getArray(domainBindingsWrapper, 'domainBindings');
  const users = getArray(usersWrapper, 'users');

  const readbackChecks = validateReadback({ tenant: liveTenant, pages, mediaAssets, themes, formDefinitions }, tenant);

  const databaseDir = path.join(outputDir, 'database');
  await writeJson(path.join(databaseDir, DATABASE_FILES.tenant), redactSecrets(liveTenant));
  await writeJson(path.join(databaseDir, DATABASE_FILES.pages), redactSecrets(pages));
  await writeJson(path.join(databaseDir, DATABASE_FILES.themes), redactSecrets(themes));
  await writeJson(path.join(databaseDir, DATABASE_FILES.formDefinitions), redactSecrets(formDefinitions));
  await writeJson(path.join(databaseDir, DATABASE_FILES.formEntries), redactSecrets(formEntries));
  await writeJson(path.join(databaseDir, DATABASE_FILES.mediaAssets), redactSecrets(mediaAssets));
  await writeJson(path.join(databaseDir, DATABASE_FILES.users), sanitizeUsers(users));
  await writeJson(path.join(databaseDir, DATABASE_FILES.importRuns), redactSecrets(importRuns));
  await writeJson(path.join(databaseDir, DATABASE_FILES.publishRuns), redactSecrets(publishRuns));
  await writeJson(path.join(databaseDir, DATABASE_FILES.domainBindings), redactSecrets(domainBindings));

  const mediaDir = path.join(outputDir, 'media');
  const mediaEntries = [];
  const localPathSet = new Set();
  for (const [index, asset] of mediaAssets.entries()) {
    const location = pickMediaLocation(asset, tenantMedia);
    const relativeBlobPath = safePathSegments(location.blobPath).join('/');
    const localRelativePath = `blobs/${relativeBlobPath}`;
    const localKey = localRelativePath.toLowerCase();
    if (localPathSet.has(localKey)) {
      throw new Error(`Duplicate local media backup path resolved for ${location.blobPath}`);
    }
    localPathSet.add(localKey);

    const downloaded = await downloadFile(location.sourceUrl, path.join(mediaDir, localRelativePath));
    mediaEntries.push({
      id: recordId(asset, index),
      assetId: normalizeString(getValue(asset, 'assetId')) || null,
      blobPath: location.blobPath,
      sourceUrl: location.sourceUrl,
      localPath: `media/${localRelativePath}`,
      bytes: downloaded.bytes,
      sha256: downloaded.sha256,
      contentType: downloaded.contentType
    });
  }

  const mediaManifest = {
    tenantId,
    storageAccount: tenantMedia.account,
    container: tenantMedia.container,
    prefix: tenantMedia.prefix,
    publicBase: `${publicBlobBase(tenantMedia.account, tenantMedia.container)}/${tenantMedia.prefix}`,
    mediaCount: mediaEntries.length,
    uniqueBlobPaths: uniqueCount(mediaEntries.map((entry) => entry.blobPath)),
    zeroByteCount: mediaEntries.filter((entry) => entry.bytes === 0).length,
    totalBytes: mediaEntries.reduce((sum, entry) => sum + entry.bytes, 0),
    entries: mediaEntries
  };
  await writeJson(path.join(mediaDir, 'media-manifest.json'), mediaManifest);

  const sourceZipMetadata = await fileMetadata(sourceZip, sourceZipExpectedSha256);
  const compiledManifest = await directoryContentManifest(compiledPackage);
  const compiledTarget = path.join(outputDir, 'website', 'compiled-package');
  await copyDirectoryFiltered(compiledPackage, compiledTarget);
  const compiledBundleManifest = await directoryContentManifest(compiledTarget);
  const hardcopyReference = await directoryReferenceNoContent(creationHardcopyFolder);

  await writeJson(path.join(outputDir, 'website', 'source-zip-metadata.json'), sourceZipMetadata);
  await writeJson(path.join(outputDir, 'website', 'compiled-package-source-manifest.json'), compiledManifest);
  await writeJson(path.join(outputDir, 'website', 'compiled-package-bundle-manifest.json'), compiledBundleManifest);
  await writeJson(path.join(outputDir, 'website', 'hardcopy-reference.json'), hardcopyReference);
  await writeJson(path.join(outputDir, 'resources', 'shared-media-resource-map.json'), {
    tenantId,
    sharedMediaAccount: tenantMedia.account,
    tenantMediaContainer: tenantMedia.container,
    tenantMediaPrefix: tenantMedia.prefix,
    publicBlobBase: `${publicBlobBase(tenantMedia.account, tenantMedia.container)}/${tenantMedia.prefix}`,
    noStorageKeysListKeysSas: true,
    restoreWriteRequiresSeparateApproval: true
  });
  await writeJson(path.join(outputDir, 'website', 'route-map.json'), {
    tenantId,
    targetDomain: tenant.targetDomain,
    wwwDomain: tenant.wwwDomain,
    pages: pages.map((page) => ({
      id: recordId(page, ''),
      slug: normalizeString(getValue(page, 'pageSlug')) || normalizeString(getValue(page, 'slug')),
      route: routeFromPage(page),
      isPublished: pageIsPublished(page),
      includeInSitemap: pageInSitemap(page)
    }))
  });

  const runtimeResults = await Promise.all(RUNTIME_CHECKS.map(fetchStatus));
  await writeJson(path.join(outputDir, 'validation', 'runtime-no-regression.json'), {
    method: 'GET-only',
    checkedAt: new Date().toISOString(),
    airstripProbed: false,
    passed: runtimeResults.every((result) => result.ok),
    checks: runtimeResults
  });

  const tenantSummary = {
    tenantId,
    tenantName,
    businessName: tenant.businessName,
    targetDomain: tenant.targetDomain,
    wwwDomain: tenant.wwwDomain,
    generatedAt: new Date().toISOString(),
    counts: {
      pages: pages.length,
      unpublishedPages: pages.filter((page) => !pageIsPublished(page)).length,
      sitemapPages: pages.filter(pageInSitemap).length,
      themes: themes.length,
      formDefinitions: formDefinitions.length,
      formEntries: formEntries.length,
      mediaAssets: mediaAssets.length,
      mediaBlobsDownloaded: mediaEntries.length,
      usersSanitized: users.length,
      importRuns: importRuns.length,
      publishRuns: publishRuns.length,
      domainBindings: domainBindings.length
    },
    media: {
      storageAccount: tenantMedia.account,
      container: tenantMedia.container,
      prefix: tenantMedia.prefix,
      totalBytes: mediaManifest.totalBytes,
      zeroByteCount: mediaManifest.zeroByteCount,
      uniqueBlobPaths: mediaManifest.uniqueBlobPaths
    },
    expectations: {
      pages: requireNumber(tenant.expectedPages, 'tenant.expectedPages'),
      mediaAssets: requireNumber(tenant.expectedMediaAssets, 'tenant.expectedMediaAssets'),
      mediaBlobs: requireNumber(tenant.expectedMediaAssets, 'tenant.expectedMediaAssets'),
      formDefinition: requireString(tenant.formDefinition, 'tenant.formDefinition'),
      theme: requireString(tenant.theme, 'tenant.theme')
    },
    sourceArtifacts: {
      sourceZip: {
        path: sourceZipMetadata.path,
        bytes: sourceZipMetadata.bytes,
        sha256: sourceZipMetadata.actualSha256,
        expectedMatchesActual: sourceZipMetadata.expectedMatchesActual
      },
      compiledPackage: {
        sourcePath: compiledManifest.path,
        copiedTo: compiledTarget,
        fileCount: compiledBundleManifest.fileCount,
        totalBytes: compiledBundleManifest.totalBytes,
        sourceManifestSha256: compiledManifest.manifestSha256,
        bundleManifestSha256: compiledBundleManifest.manifestSha256
      },
      creationHardcopy: hardcopyReference
    },
    secretMaterialIncluded: false
  };
  await writeJson(path.join(outputDir, 'tenant-summary.json'), tenantSummary);

  await writeText(path.join(outputDir, 'restore', 'RESTORE_RUNBOOK.md'), [
    '# Party Pros Restore Runbook Seed',
    '',
    'Status: restore planning seed only. Live restore is not approved by V2.8.61OF.',
    '',
    '1. Verify `checksums.sha256` before using any backup payload file.',
    '2. Review `MISSING_OR_NONRECOVERABLE_ITEMS.md` and obtain a separate secure handoff for excluded secrets.',
    '3. Recreate or select the target tenant only under a separately approved restore mutation phase.',
    '4. Restore tenant-scoped records in dependency order: Tenant, Theme, Pages, FormDefinition, MediaAsset metadata, ImportRun, PublishRun, DomainBinding, sanitized Users as policy permits, and FormEntry only if lead data restore is explicitly approved.',
    '5. Restore media blobs from `media/blobs/` to the mapped shared media account/container/prefix using a future approved storage write path.',
    '6. Rebuild or validate the website package from `website/compiled-package/` and the source ZIP metadata before any deploy approval.',
    '7. Reapply DNS/custom-domain steps only after owner DNS approval and public validation.',
    '8. Run GET-only runtime no-regression before any customer-facing POST or form proof.',
    '',
    'No deploy, DNS/custom-domain mutation, Airstrip action, contact POST, form submission, storage key/listKeys/SAS use, or live restore is authorized by this seed.'
  ].join('\n'));

  await writeText(path.join(outputDir, 'MISSING_OR_NONRECOVERABLE_ITEMS.md'), [
    '# Missing Or Nonrecoverable Items',
    '',
    '- SuperAdmin password and bearer token were used only in-memory and are not included.',
    '- Tenant API key, API key hash, password hashes, cookies, connection strings, deployment tokens, appsettings, storage keys, listKeys output, and SAS tokens are not included.',
    '- The outside hardcopy is referenced only by normalized path hash; its secret contents were not read or copied.',
    '- Live DNS/custom-domain provider state is not recoverable from this bundle; DomainBinding records are included only where source-supported read routes returned them.',
    '- Any future media restore requires a separately approved storage write path.',
    '- Any future TenantAdmin password or owner handoff secret must come from a separately approved secure handoff.'
  ].join('\n'));

  const validationCounts = {
    pages: { expected: tenantSummary.expectations.pages, actual: pages.length, ok: pages.length === tenantSummary.expectations.pages },
    mediaAssets: { expected: tenantSummary.expectations.mediaAssets, actual: mediaAssets.length, ok: mediaAssets.length === tenantSummary.expectations.mediaAssets },
    mediaBlobsDownloaded: { expected: tenantSummary.expectations.mediaBlobs, actual: mediaEntries.length, ok: mediaEntries.length === tenantSummary.expectations.mediaBlobs },
    mediaUniqueBlobPaths: { expected: tenantSummary.expectations.mediaBlobs, actual: mediaManifest.uniqueBlobPaths, ok: mediaManifest.uniqueBlobPaths === tenantSummary.expectations.mediaBlobs },
    mediaZeroByte: { expected: 0, actual: mediaManifest.zeroByteCount, ok: mediaManifest.zeroByteCount === 0 },
    formDefinition: readbackChecks.formDefinition,
    theme: readbackChecks.theme,
    sourceZipHash: {
      expected: sourceZipExpectedSha256 || null,
      actual: sourceZipMetadata.actualSha256,
      ok: sourceZipMetadata.expectedMatchesActual !== false
    }
  };

  const manifest = {
    schema: RESULT_SCHEMA,
    schemaVersion: RESULT_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    tenantId,
    tenantName,
    classification: 'party_pros_tenant_parameterized_backup_export_no_mutation_no_deploy_no_dns_no_post',
    bundlePath: outputDir,
    databaseFiles: DATABASE_FILES,
    counts: tenantSummary.counts,
    expectations: tenantSummary.expectations,
    media: tenantSummary.media,
    sourceArtifacts: tenantSummary.sourceArtifacts,
    checksumManifestExcludes: [
      'checksums.sha256',
      'validation/backup-validation-report.json'
    ],
    approvals: {
      restoreApproved: false,
      deployApproved: false,
      dnsApproved: false,
      contactPostApproved: false,
      formSubmissionApproved: false,
      customerFacingPostApproved: false,
      airstripProbed: false,
      storageKeysListKeysSasUsed: false
    },
    liveReadbackRoutes: [
      'POST /api/auth/login',
      'GET /api/auth/verify',
      'GET /api/admin/tenants/{tenantId}',
      'GET /api/admin/pages?tenantId={tenantId}',
      'GET /api/admin/{tenantId}/media-assets',
      'GET /api/admin/themes/{tenantId}',
      'GET /api/admin/forms/{tenantId}/definitions',
      'GET /api/admin/{tenantId}/form-entries',
      'GET /api/admin/{tenantId}/import-runs',
      'GET /api/admin/{tenantId}/publish-runs',
      'GET /api/admin/tenants/{tenantId}/domain-bindings',
      'GET /api/admin/users?tenantId={tenantId}'
    ],
    authLoginPostForReadOnlyExport: true,
    sourceLoginMayUpdateSuperAdminLastLogin: true,
    secretMaterialIncluded: false
  };
  await writeJson(path.join(outputDir, 'manifest.json'), manifest);

  const checksumEntries = await buildChecksums(outputDir);
  const checksumValidation = await validateChecksums(outputDir, checksumEntries);
  const runtimePassed = runtimeResults.every((result) => result.ok);
  const countsPassed = Object.values(validationCounts).every((item) => item.ok);
  const validationReport = {
    status: checksumValidation.ok && runtimePassed && countsPassed ? 'passed' : 'blocked',
    checkedAt: new Date().toISOString(),
    readbackChecks,
    counts: validationCounts,
    checksumValidation,
    checksumEntries: checksumEntries.length,
    checksumManifestExcludes: manifest.checksumManifestExcludes,
    runtimeNoRegression: {
      checked: runtimeResults.length,
      passed: runtimeResults.filter((result) => result.ok).length,
      ok: runtimePassed,
      airstripProbed: false
    },
    prohibitedActions: {
      tenantContentMediaUserRoleDomainBindingMutation: false,
      deploy: false,
      dnsCustomDomain: false,
      contactPost: false,
      formSubmission: false,
      customerFacingPost: false,
      airstripProbeOrMutation: false,
      storageKeysListKeysSas: false,
      appsettingMutation: false,
      azureResourceCreation: false
    },
    authLoginPostForReadOnlyExport: true,
    sourceLoginMayUpdateSuperAdminLastLogin: true,
    notes: [
      'The backup checksum manifest excludes itself and the validation report to avoid self-referential checksum churn.',
      'The outside hardcopy was referenced by path hash only; contents were not read.'
    ]
  };
  await writeJson(path.join(outputDir, 'validation', 'backup-validation-report.json'), validationReport);

  const result = {
    status: validationReport.status,
    tenantId,
    outputDir,
    counts: tenantSummary.counts,
    media: tenantSummary.media,
    checksumEntries: checksumEntries.length,
    runtimeChecksPassed: runtimeResults.filter((result) => result.ok).length,
    runtimeChecksTotal: runtimeResults.length,
    noDeployDnsPostAirstripOrStorageKeyAction: true,
    secretMaterialIncluded: false
  };
  console.log(json(result));
}

main().catch((error) => {
  console.error(`V2.8.61OF tenant backup export failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
