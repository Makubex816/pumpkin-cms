#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../../../../..');
const SECURE_PATH = path.join(REPO_ROOT, '.tmp/v2-8-61a/secure/backup-manager-export.json');
const APPROVED_BACKUP_ROOT = path.resolve('C:/Users/User/Desktop/PumpkinCMS/secure-operator-handoff/tenant-backups');
const REPORT_SOURCE_ROOT = 'deployment/architecture/tenant-website-publish-readiness';

const DATABASE_FILES = {
  tenant: 'tenant.json',
  pages: 'pages.json',
  mediaAssets: 'media-assets.json',
  themes: 'themes.json',
  formDefinitions: 'form-definitions.json',
  formEntries: 'form-entries.json',
  importRuns: 'import-runs.json',
  publishRuns: 'publish-runs.json',
  domainBindings: 'domain-bindings.json',
  users: 'users-sanitized.json',
  backupRuns: 'backup-runs.json'
};

const V260X_DEPLOYMENT = {
  productionDeployId: 'dfc54ec4-ea78-4358-9567-a3badc9e98fe',
  isolatedDeployId: 'f08a69c0-9e7a-428d-8d84-6ace3fd6d701',
  responsiveReplayStatus: 'passed',
  responsiveReplayChecks: 28,
  responsiveReplayOverflows: 0
};

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
  'https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/dashboard',
  'https://app-airstrip-prod-centralus-001.azurewebsites.net/',
  'https://app-airstrip-prod-centralus-001.azurewebsites.net/request-booking',
  'https://app-airstrip-prod-centralus-001.azurewebsites.net/packages',
  'https://app-airstrip-prod-centralus-001.azurewebsites.net/airstrip-the-club'
];

function safeJson(value) {
  return JSON.stringify(value, null, 2) + '\n';
}

async function readJson(filePath) {
  const text = await fs.readFile(filePath, 'utf8');
  return JSON.parse(text.replace(/^\uFEFF/, ''));
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, safeJson(value), 'utf8');
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

function assertApprovedOutput(outputDir) {
  const resolved = path.resolve(outputDir);
  const relative = path.relative(APPROVED_BACKUP_ROOT, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative) || relative === '') {
    throw new Error(`Backup output path must be a child of ${APPROVED_BACKUP_ROOT}`);
  }
  if (!resolved.toLowerCase().includes('v2-8-61a-airstrip-full-backup-proof')) {
    throw new Error('Backup output path must include the approved V2.8.61A Airstrip backup folder name.');
  }
  return resolved;
}

function joinUrl(baseUrl, route) {
  if (/^https?:\/\//i.test(route)) return route;
  return `${baseUrl.replace(/\/+$/, '')}/${route.replace(/^\/+/, '')}`;
}

function encode(value) {
  return encodeURIComponent(value);
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

function redactSecrets(value, key = '') {
  if (value == null) return value;
  if (isSecretKey(key)) {
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
    id: user.id ?? user.Id,
    tenantId: user.tenantId ?? user.TenantId,
    email: user.email ?? user.Email,
    username: user.username ?? user.Username,
    firstName: user.firstName ?? user.FirstName ?? null,
    lastName: user.lastName ?? user.LastName ?? null,
    displayName: user.displayName ?? user.DisplayName ?? null,
    role: user.role ?? user.Role,
    isActive: user.isActive ?? user.IsActive,
    createdDate: user.createdDate ?? user.CreatedDate,
    lastLogin: user.lastLogin ?? user.LastLogin ?? null,
    permissions: user.permissions ?? user.Permissions ?? []
  }));
}

function getArray(wrapper, key) {
  const value = wrapper?.[key] ?? wrapper?.[key[0].toUpperCase() + key.slice(1)];
  if (Array.isArray(value)) return value;
  if (Array.isArray(wrapper)) return wrapper;
  return [];
}

function pickMediaUrl(asset) {
  const direct = asset.publicUrl ?? asset.PublicUrl ?? asset.url ?? asset.Url;
  if (typeof direct === 'string' && direct.trim()) return direct.trim();
  const variants = asset.variants ?? asset.Variants ?? [];
  for (const variant of variants) {
    const url = variant.publicUrl ?? variant.PublicUrl ?? variant.url ?? variant.Url;
    if (typeof url === 'string' && url.trim()) return url.trim();
  }
  return '';
}

function pickId(record, fallback) {
  return record.id ?? record.Id ?? record.assetId ?? record.AssetId ?? record.pageId ?? record.PageId ?? fallback;
}

function safeFileName(input, fallback) {
  const base = path.basename(String(input || fallback || 'file')).replace(/[<>:"/\\|?*\x00-\x1f]/g, '-');
  return base || fallback || 'file';
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
      ? body.slice(0, 200)
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
  const parsed = new URL(url);
  if (parsed.search) {
    throw new Error(`Refusing media URL with query string: ${parsed.origin}${parsed.pathname}`);
  }

  const response = await fetch(url);
  if (!response.ok) {
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

async function copyPath(source, target) {
  const stat = await fs.stat(source);
  await fs.mkdir(path.dirname(target), { recursive: true });
  if (stat.isDirectory()) {
    await fs.cp(source, target, {
      recursive: true,
      force: true,
      filter: (src) => {
        const normalized = src.replace(/\\/g, '/');
        return !normalized.includes('/node_modules/') &&
          !normalized.includes('/.next/') &&
          !normalized.includes('/dist/') &&
          !normalized.includes('/out/');
      }
    });
    return;
  }
  await fs.copyFile(source, target);
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

async function buildChecksums(rootDir) {
  const files = (await listFiles(rootDir))
    .filter((filePath) => path.basename(filePath) !== 'checksums.sha256');
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

function routeFromPage(page) {
  const slug = page.pageSlug ?? page.PageSlug ?? '';
  return slug === 'home' || slug === '/' || slug === '' ? '/' : `/${String(slug).replace(/^\/+/, '')}`;
}

async function main() {
  const secure = await readJson(SECURE_PATH);
  const apiBaseUrl = requireString(secure.pumpkinApiBaseUrl, 'pumpkinApiBaseUrl').replace(/\/+$/, '');
  const loginEndpoint = requireString(secure.adminLoginEndpoint, 'adminLoginEndpoint');
  const tenantId = requireString(secure.targetTenantId, 'targetTenantId');
  const tenantName = requireString(secure.targetTenantName, 'targetTenantName');
  const outputDir = assertApprovedOutput(requireString(secure.backupOutputDir, 'backupOutputDir'));
  const expectedMediaCount = requireNumber(secure.airstripExpectedMediaCount, 'airstripExpectedMediaCount');
  const expectedPageCount = requireNumber(secure.airstripExpectedPageCount, 'airstripExpectedPageCount');
  const expectedFormDefinition = requireString(secure.airstripExpectedFormDefinition, 'airstripExpectedFormDefinition');
  const mediaPublicBase = requireString(secure.airstripMediaPublicBase, 'airstripMediaPublicBase').replace(/\/+$/, '');
  const productionHost = requireString(secure.airstripProductionDefaultHost, 'airstripProductionDefaultHost').replace(/\/+$/, '');
  const sourcePackageZip = requireString(secure.sourcePackageZip, 'sourcePackageZip');
  const normalizedPackagePath = requireString(secure.normalizedPackagePath, 'normalizedPackagePath');
  const overlayPaths = Array.isArray(secure.overlayPaths) ? secure.overlayPaths : [];

  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  const tokenResponse = await fetchJson(joinUrl(apiBaseUrl, loginEndpoint), {
    method: 'POST',
    body: JSON.stringify({
      email: requireString(secure.superAdminEmail, 'superAdminEmail'),
      password: requireString(secure.superAdminPassword, 'superAdminPassword')
    })
  });
  const token = requireString(tokenResponse.token ?? tokenResponse.Token, 'login token');
  const authHeaders = { Authorization: `Bearer ${token}` };

  const currentUser = tokenResponse.user ?? tokenResponse.User ?? {};
  if ((currentUser.role ?? currentUser.Role) !== 'SuperAdmin') {
    throw new Error('Authenticated user is not SuperAdmin.');
  }

  const [
    tenant,
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
    fetchJson(joinUrl(apiBaseUrl, `/api/admin/tenants/${encode(tenantId)}`), { headers: authHeaders }),
    fetchJson(joinUrl(apiBaseUrl, `/api/admin/pages?tenantId=${encode(tenantId)}&_=${Date.now()}`), { headers: authHeaders }),
    fetchJson(joinUrl(apiBaseUrl, `/api/admin/${encode(tenantId)}/media-assets`), { headers: authHeaders }),
    fetchJson(joinUrl(apiBaseUrl, `/api/admin/themes/${encode(tenantId)}`), { headers: authHeaders }),
    fetchJson(joinUrl(apiBaseUrl, `/api/admin/forms/${encode(tenantId)}/definitions`), { headers: authHeaders }),
    fetchJson(joinUrl(apiBaseUrl, `/api/admin/${encode(tenantId)}/form-entries`), { headers: authHeaders }),
    fetchJson(joinUrl(apiBaseUrl, `/api/admin/${encode(tenantId)}/import-runs`), { headers: authHeaders }),
    fetchJson(joinUrl(apiBaseUrl, `/api/admin/${encode(tenantId)}/publish-runs`), { headers: authHeaders }),
    fetchJson(joinUrl(apiBaseUrl, `/api/admin/tenants/${encode(tenantId)}/domain-bindings`), { headers: authHeaders }),
    fetchJson(joinUrl(apiBaseUrl, `/api/admin/users?tenantId=${encode(tenantId)}`), { headers: authHeaders })
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

  const databaseDir = path.join(outputDir, 'database');
  await writeJson(path.join(databaseDir, DATABASE_FILES.tenant), redactSecrets(tenant));
  await writeJson(path.join(databaseDir, DATABASE_FILES.pages), redactSecrets(pages));
  await writeJson(path.join(databaseDir, DATABASE_FILES.mediaAssets), redactSecrets(mediaAssets));
  await writeJson(path.join(databaseDir, DATABASE_FILES.themes), redactSecrets(themes));
  await writeJson(path.join(databaseDir, DATABASE_FILES.formDefinitions), redactSecrets(formDefinitions));
  await writeJson(path.join(databaseDir, DATABASE_FILES.formEntries), redactSecrets(formEntries));
  await writeJson(path.join(databaseDir, DATABASE_FILES.importRuns), redactSecrets(importRuns));
  await writeJson(path.join(databaseDir, DATABASE_FILES.publishRuns), redactSecrets(publishRuns));
  await writeJson(path.join(databaseDir, DATABASE_FILES.domainBindings), redactSecrets(domainBindings));
  await writeJson(path.join(databaseDir, DATABASE_FILES.users), sanitizeUsers(users));
  await writeJson(path.join(databaseDir, DATABASE_FILES.backupRuns), {
    backupRuns: [],
    status: 'not_implemented_in_production_model',
    note: 'V2.8.61A local operator export did not create a live BackupRun record.'
  });

  const mediaDir = path.join(outputDir, 'media');
  const mediaEntries = [];
  const usedNames = new Set();
  for (const [index, asset] of mediaAssets.entries()) {
    const sourceUrl = pickMediaUrl(asset);
    if (!sourceUrl) {
      throw new Error(`MediaAsset ${pickId(asset, index)} does not expose a public URL.`);
    }
    if (!sourceUrl.startsWith(mediaPublicBase)) {
      throw new Error(`MediaAsset ${pickId(asset, index)} URL is outside the approved public media base.`);
    }
    const parsed = new URL(sourceUrl);
    let fileName = safeFileName(parsed.pathname, `media-${index + 1}`);
    if (usedNames.has(fileName.toLowerCase())) {
      fileName = `${String(index + 1).padStart(2, '0')}-${fileName}`;
    }
    usedNames.add(fileName.toLowerCase());
    const relativePath = `blobs/${fileName}`;
    const localPath = path.join(mediaDir, relativePath);
    const downloaded = await downloadFile(sourceUrl, localPath);
    mediaEntries.push({
      id: pickId(asset, index),
      sourceUrl,
      localPath: `media/${relativePath.replace(/\\/g, '/')}`,
      bytes: downloaded.bytes,
      sha256: downloaded.sha256,
      contentType: downloaded.contentType
    });
  }
  await writeJson(path.join(mediaDir, 'media-manifest.json'), {
    tenantId,
    mediaPublicBase,
    mediaCount: mediaEntries.length,
    totalBytes: mediaEntries.reduce((sum, entry) => sum + entry.bytes, 0),
    entries: mediaEntries
  });

  const websiteDir = path.join(outputDir, 'website');
  await copyPath(sourcePackageZip, path.join(websiteDir, 'original-package', path.basename(sourcePackageZip)));
  await copyPath(normalizedPackagePath, path.join(websiteDir, 'normalized-package', path.basename(normalizedPackagePath)));
  for (const overlayPath of overlayPaths) {
    const resolvedOverlayPath = path.resolve(REPO_ROOT, overlayPath);
    await copyPath(resolvedOverlayPath, path.join(websiteDir, 'overlays', path.basename(overlayPath)));
  }

  await writeJson(path.join(websiteDir, 'runtime', 'route-map.json'), {
    tenantId,
    productionHost,
    pageCount: pages.length,
    routes: pages.map((page) => ({
      pageId: page.pageId ?? page.PageId ?? page.id ?? page.Id,
      slug: page.pageSlug ?? page.PageSlug,
      route: routeFromPage(page),
      isPublished: page.isPublished ?? page.IsPublished ?? null,
      includeInSitemap: page.includeInSitemap ?? page.IncludeInSitemap ?? null
    }))
  });
  await writeJson(path.join(websiteDir, 'runtime', 'deployment-metadata.json'), {
    tenantId,
    productionHost,
    appService: {
      resourceGroup: 'rg-airstrip-prod-centralus',
      name: 'app-airstrip-prod-centralus-001',
      defaultHost: 'app-airstrip-prod-centralus-001.azurewebsites.net'
    },
    v2_8_60x: V260X_DEPLOYMENT,
    sourcePackageCopied: true,
    normalizedPackageCopied: true,
    overlaysCopied: overlayPaths.map((item) => item.replace(/\\/g, '/')),
    runtimePackageIncluded: false
  });
  await writeJson(path.join(websiteDir, 'runtime', 'responsive-proof-summary.json'), {
    tenantId,
    status: 'passed',
    carryforward: 'V2.8.60X production responsive replay passed 28/28 checks with zero overflow.',
    productionDefaultHost: productionHost,
    resultPackage: `${REPORT_SOURCE_ROOT}/v2-8-60x-airstrip-club-info-responsive-result/`
  });
  await writeText(path.join(websiteDir, 'runtime', 'runtime-artifact-not-included.md'), [
    '# Runtime Artifact Not Included',
    '',
    'V2.8.61A did not rebuild or deploy the Airstrip runtime. The protected backup includes the original source ZIP, normalized package, and responsive overlays needed for a future rebuild/restore workflow.',
    '',
    'A live restore remains a separate approval and must rebuild/package from the included website sources before any deployment.'
  ].join('\n'));

  const resources = {
    tenantId,
    tenantName,
    productionHost,
    targetDomain: 'airstripclublasvegas.com',
    targetWwwDomain: 'www.airstripclublasvegas.com',
    pumpkinApi: {
      baseUrl: apiBaseUrl,
      resourceGroup: 'rg-pumpkin-api-prod-centralus',
      webApp: 'app-pumpkin-api-prod-centralus-001'
    },
    adminUi: {
      baseUrl: 'https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net',
      resourceGroup: 'rg-pumpkin-api-prod-centralus',
      webApp: 'app-pumpkin-admin-prod-centralus-001'
    },
    airstripRuntime: {
      resourceGroup: 'rg-airstrip-prod-centralus',
      webApp: 'app-airstrip-prod-centralus-001',
      defaultHost: productionHost
    },
    mediaStorage: {
      account: 'iceskatingmedia',
      container: requireString(secure.airstripMediaContainer, 'airstripMediaContainer'),
      publicBase: mediaPublicBase
    },
    domainBindings: redactSecrets(domainBindings),
    bluehostOwnerDnsStatus: 'manual_owner_action_required_from_v2_8_61',
    secretMaterialIncluded: false
  };
  await writeJson(path.join(outputDir, 'resources', 'resource-bindings.json'), resources);

  const formDefinitionIds = formDefinitions.map((definition) => String(definition.id ?? definition.Id ?? definition.formKey ?? definition.FormKey ?? ''));
  const runtimeResults = await Promise.all(RUNTIME_CHECKS.map(fetchStatus));
  await writeJson(path.join(outputDir, 'validation', 'runtime-no-regression.json'), {
    method: 'GET-only',
    checkedAt: new Date().toISOString(),
    passed: runtimeResults.every((result) => result.ok),
    checks: runtimeResults
  });

  const tenantSummary = {
    tenantId,
    tenantName,
    productionHost,
    mediaPublicBase,
    counts: {
      pages: pages.length,
      mediaAssets: mediaAssets.length,
      mediaBlobsDownloaded: mediaEntries.length,
      themes: themes.length,
      formDefinitions: formDefinitions.length,
      formEntries: formEntries.length,
      importRuns: importRuns.length,
      publishRuns: publishRuns.length,
      domainBindings: domainBindings.length,
      usersSanitized: users.length,
      backupRuns: 0
    },
    expectedCounts: {
      pages: expectedPageCount,
      mediaAssets: expectedMediaCount,
      formDefinition: expectedFormDefinition
    },
    sourcePackageZip: path.basename(sourcePackageZip),
    normalizedPackage: path.basename(normalizedPackagePath),
    overlays: overlayPaths.map((item) => path.basename(item)),
    secretMaterialIncluded: false
  };
  await writeJson(path.join(outputDir, 'tenant-summary.json'), tenantSummary);

  await writeText(path.join(outputDir, 'restore', 'RESTORE_RUNBOOK.md'), [
    '# Airstrip Restore Runbook Seed',
    '',
    'Status: restore planning seed only. Live restore is not approved by V2.8.61A.',
    '',
    '1. Verify `checksums.sha256` before using any file.',
    '2. Review `MISSING_OR_NONRECOVERABLE_ITEMS.md` and obtain a separate secure handoff for any excluded secrets.',
    '3. Recreate or select the target tenant under a separate live-restore approval.',
    '4. Restore tenant-scoped database records in dependency order: Tenant, Theme, Pages, FormDefinition, MediaAsset metadata, ImportRun, PublishRun, DomainBinding, sanitized Users as policy permits, and FormEntry only if PII restore is explicitly approved.',
    '5. Restore media blobs from `media/blobs/` using a future approved storage write path. Do not use storage keys, listKeys, SAS, or connection strings unless separately approved.',
    '6. Rebuild Airstrip runtime from `website/original-package/`, `website/normalized-package/`, and `website/overlays/` before any deployment approval.',
    '7. Reapply DNS/custom-domain steps only after owner DNS approval and public validation.',
    '8. Run GET-only runtime no-regression before any customer-facing POST or form proof.'
  ].join('\n'));

  await writeText(path.join(outputDir, 'MISSING_OR_NONRECOVERABLE_ITEMS.md'), [
    '# Missing Or Nonrecoverable Items',
    '',
    '- SuperAdmin password and bearer token were used only in-memory and are not included.',
    '- Tenant API key or API key hash fields are redacted.',
    '- Appsettings, Key Vault values, connection strings, storage keys, SAS tokens, and deployment tokens are not included.',
    '- Live DNS/custom-domain binding execution state is not recoverable from this bundle; DomainBinding records and public owner DNS packet state are included by metadata only.',
    '- A rebuilt production runtime ZIP/package is not included because V2.8.61A did not build or deploy.',
    '- BackupRun records are not included because the production model/API does not currently implement BackupRun persistence.'
  ].join('\n'));

  const preliminaryValidation = {
    status: 'pending_checksums',
    checkedAt: new Date().toISOString(),
    counts: tenantSummary.counts,
    countExpectations: {
      pages: { expected: expectedPageCount, actual: pages.length, ok: pages.length === expectedPageCount },
      mediaAssets: { expected: expectedMediaCount, actual: mediaAssets.length, ok: mediaAssets.length === expectedMediaCount },
      mediaBlobsDownloaded: { expected: expectedMediaCount, actual: mediaEntries.length, ok: mediaEntries.length === expectedMediaCount },
      formDefinition: {
        expected: expectedFormDefinition,
        actualIds: formDefinitionIds,
        ok: formDefinitionIds.some((id) => id.toLowerCase() === expectedFormDefinition.toLowerCase())
      }
    },
    runtimeNoRegression: {
      checked: runtimeResults.length,
      passed: runtimeResults.filter((result) => result.ok).length,
      ok: runtimeResults.every((result) => result.ok)
    },
    prohibitedActions: {
      dnsOrIndexing: false,
      contactPostOrFormSubmission: false,
      mediaUploadDelete: false,
      appDeploy: false,
      appsettingMutation: false,
      storageKeysListKeysSasConnectionStringGeneration: false
    }
  };
  preliminaryValidation.status = Object.values(preliminaryValidation.countExpectations).every((item) => item.ok) &&
    preliminaryValidation.runtimeNoRegression.ok
    ? 'pending_checksum_validation'
    : 'blocked_before_checksum_validation';
  await writeJson(path.join(outputDir, 'validation', 'backup-validation-report.json'), preliminaryValidation);

  const manifest = {
    schema: 'pumpkin-tenant-full-backup-proof',
    schemaVersion: 'v2-8-61a',
    generatedAt: new Date().toISOString(),
    tenantId,
    tenantName,
    classification: 'backup_manager_package_export_airstrip_full_backup_no_domain_no_post',
    bundlePath: outputDir,
    source: {
      apiBaseUrl,
      productionHost,
      sourcePackageZipCopied: true,
      normalizedPackageCopied: true,
      overlaysCopied: overlayPaths.length
    },
    counts: tenantSummary.counts,
    expectedCounts: tenantSummary.expectedCounts,
    databaseFiles: DATABASE_FILES,
    secretMaterialIncluded: false,
    restoreApproved: false,
    liveMutations: {
      authLoginPostForReadOnlyExport: true,
      sourceLoginMayUpdateLastLogin: true,
      dnsOrIndexing: false,
      contactPostOrFormSubmission: false,
      contentWrite: false,
      tenantUserRoleDomainBindingAppsetting: false,
      mediaUploadDelete: false,
      appDeploy: false,
      storageKeysListKeysSasConnectionStringGeneration: false
    }
  };
  await writeJson(path.join(outputDir, 'manifest.json'), manifest);

  const checksums = await buildChecksums(outputDir);
  const checksumValidation = await validateChecksums(outputDir, checksums);
  const finalValidation = {
    ...preliminaryValidation,
    status: preliminaryValidation.status === 'pending_checksum_validation' && checksumValidation.ok ? 'passed' : 'blocked',
    checksumValidation,
    checksumEntries: checksums.length
  };
  await writeJson(path.join(outputDir, 'validation', 'backup-validation-report.json'), finalValidation);

  const finalChecksums = await buildChecksums(outputDir);
  const finalChecksumValidation = await validateChecksums(outputDir, finalChecksums);
  await writeJson(path.join(outputDir, 'validation', 'backup-validation-report.json'), {
    ...finalValidation,
    status: finalValidation.status === 'passed' && finalChecksumValidation.ok ? 'passed' : 'blocked',
    checksumValidation: finalChecksumValidation,
    checksumEntries: finalChecksums.length
  });
  await buildChecksums(outputDir);

  const result = {
    status: finalValidation.status,
    tenantId,
    outputDir,
    counts: tenantSummary.counts,
    checksumEntries: finalChecksums.length,
    runtimeChecksPassed: runtimeResults.filter((result) => result.ok).length,
    runtimeChecksTotal: runtimeResults.length,
    apiDeployPerformed: false,
    disallowedLiveMutationsPerformed: false,
    authLoginPostForReadOnlyExport: true
  };
  console.log(safeJson(result));
}

main().catch((error) => {
  console.error(`V2.8.61A backup export failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
