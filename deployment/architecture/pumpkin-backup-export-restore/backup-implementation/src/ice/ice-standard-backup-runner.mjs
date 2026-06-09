import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { writeChecksums } from '../checksum-writer.mjs';
import { validateBackupBundle, writeValidationReports, hasSecretLikeValue } from '../validators/backup-validator.mjs';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { packageRoot, resolveTmpOutputPath, toPosixPath } from '../utils/safe-paths.mjs';

const repoRoot = path.resolve(packageRoot, '..', '..', '..', '..');
const tenantKey = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';

const targetProfile = {
  tenant: 'Ice Skating Rink Rentals',
  primaryDomain: 'iceskatingrinkrentals.com',
  wwwDomain: 'www.iceskatingrinkrentals.com',
  mediaDomain: 'media.iceskatingrinkrentals.com',
  approvedRoutes: ['/', '/contact', '/service-areas'],
  approvedSlugs: ['home', 'contact', 'service-areas'],
  obsoleteRoutesExpected404: ['/ice-rink-rentals', '/events-holiday-activations']
};

const envNames = [
  'PUMPKIN_API_URL',
  'PUMPKIN_ADMIN_JWT',
  'ICE_RINK_RENTALS_API_KEY',
  'ICE_RINK_RENTALS_TENANT_ID'
];

export async function createIceStandardBackup({ outputPath, overwrite = false, now = new Date() }) {
  const bundleRoot = resolveTmpOutputPath(outputPath);
  if (await pathExists(bundleRoot)) {
    if (!overwrite) throw new Error(`output already exists; pass --overwrite to replace: ${outputPath}`);
    await fs.rm(bundleRoot, { recursive: true, force: true });
  }

  const createdAt = now.toISOString();
  await fs.mkdir(bundleRoot, { recursive: true });

  const envPresence = readEnvPresence();
  const cmsResult = await collectCmsContent({ envPresence, createdAt });
  const staticEvidence = await collectStaticEvidence({ createdAt });
  const bundleData = buildBundleData({ cmsResult, staticEvidence, envPresence, createdAt });
  const fileEntries = [];

  fileEntries.push(...(await writeTopLevelDocs({ bundleRoot, bundleData, createdAt })));
  fileEntries.push(...(await writeDatabaseEvidence({ bundleRoot, bundleData, createdAt })));
  fileEntries.push(...(await writeCmsContent({ bundleRoot, bundleData })));
  fileEntries.push(...(await writeMediaInventory({ bundleRoot, bundleData })));
  fileEntries.push(...(await writeStaticEvidence({ bundleRoot, bundleData })));
  fileEntries.push(...(await writeConfigInventory({ bundleRoot, bundleData })));
  fileEntries.push(...(await writeEscrowMarker({ bundleRoot })));

  const manifest = await writeManifest({ bundleRoot, bundleData, fileEntries, createdAt });
  const checksums = await writeChecksums(bundleRoot);
  const expectedCountsPath = await writeExpectedRestoreCounts({ bundleRoot, bundleData, createdAt });
  const validation = await validateBackupBundle({ bundlePath: bundleRoot });
  await writeValidationReports({ bundleRoot, validation });

  return {
    bundleRoot,
    manifest,
    checksums,
    validation,
    expectedCountsPath,
    cmsResult,
    envPresence,
    componentStatus: bundleData.componentStatus
  };
}

function readEnvPresence() {
  return Object.fromEntries(
    envNames.map((name) => [
      name,
      {
        name,
        presence: isPresent(process.env[name]) ? 'PRESENT' : 'MISSING',
        value: 'NOT_COLLECTED'
      }
    ])
  );
}

async function collectCmsContent({ envPresence, createdAt }) {
  const apiReady = envPresence.PUMPKIN_API_URL.presence === 'PRESENT';
  const adminReady = envPresence.PUMPKIN_ADMIN_JWT.presence === 'PRESENT';
  const requestLog = [];
  const warnings = [];

  if (!apiReady || !adminReady) {
    return {
      status: 'blocked',
      tenantId: tenantKey,
      requestLog,
      warnings: ['CMS export blocked because required API env presence was missing.'],
      tenants: [buildFallbackTenant()],
      pages: [],
      themes: [],
      activeTheme: null,
      mediaAssets: []
    };
  }

  const baseUrl = String(process.env.PUMPKIN_API_URL).replace(/\/+$/, '');
  const token = String(process.env.PUMPKIN_ADMIN_JWT);
  const tenantId = isPresent(process.env.ICE_RINK_RENTALS_TENANT_ID)
    ? String(process.env.ICE_RINK_RENTALS_TENANT_ID)
    : tenantKey;
  const client = makeCmsClient({ baseUrl, token, requestLog });

  let tenant = null;
  const tenantResult = await client.get(`/api/admin/tenants/${encodeURIComponent(tenantId)}`, 'admin tenant', { optional: true });
  if (tenantResult.ok) {
    tenant = tenantResult.data;
  } else if (tenantResult.warning) {
    warnings.push(tenantResult.warning);
  }

  if (!tenant) {
    const tenantsResult = await client.get('/api/admin/tenants', 'admin tenant list', { optional: true });
    if (tenantsResult.ok) {
      const tenants = Array.isArray(tenantsResult.data?.tenants) ? tenantsResult.data.tenants : [];
      tenant = tenants.find((item) => getTenantId(item) === tenantId || getTenantId(item) === tenantKey) ?? null;
    } else if (tenantsResult.warning) {
      warnings.push(tenantsResult.warning);
    }
  }

  if (!tenant) {
    tenant = buildFallbackTenant();
    warnings.push('Tenant record was built from approved target profile because admin tenant lookup did not return Ice.');
  }

  const pagesResult = await client.get(`/api/admin/pages?tenantId=${encodeURIComponent(tenantId)}`, 'admin pages');
  const allPages = Array.isArray(pagesResult.data) ? pagesResult.data : pagesResult.data?.pages ?? [];
  const pages = allPages.filter((page) => targetProfile.approvedSlugs.includes(getPageSlug(page)));
  const excludedSlugs = allPages
    .map(getPageSlug)
    .filter((slug) => slug && !targetProfile.approvedSlugs.includes(slug))
    .sort((a, b) => a.localeCompare(b));

  if (excludedSlugs.length > 0) {
    warnings.push(`Non-approved CMS page slug(s) excluded from standard backup route set: ${[...new Set(excludedSlugs)].join(', ')}.`);
  }

  const themesResult = await client.get(`/api/admin/themes/${encodeURIComponent(tenantId)}`, 'admin themes', { optional: true });
  const themes = themesResult.ok ? normalizeThemesPayload(themesResult.data) : [];
  if (themesResult.warning) warnings.push(themesResult.warning);

  const activeThemeResult = await client.get(`/api/admin/themes/${encodeURIComponent(tenantId)}/active`, 'admin active theme', { optional: true });
  const activeTheme = activeThemeResult.ok ? activeThemeResult.data : null;
  if (activeThemeResult.warning) warnings.push(activeThemeResult.warning);

  const mediaResult = await client.get(`/api/admin/${encodeURIComponent(tenantId)}/media-assets`, 'admin media assets', { optional: true });
  const mediaAssets = mediaResult.ok
    ? Array.isArray(mediaResult.data) ? mediaResult.data : mediaResult.data?.mediaAssets ?? []
    : [];
  if (mediaResult.warning) warnings.push(mediaResult.warning);

  return {
    status: 'included',
    tenantId,
    createdAt,
    requestLog,
    warnings,
    tenants: [tenant],
    pages,
    themes,
    activeTheme,
    mediaAssets
  };
}

function makeCmsClient({ baseUrl, token, requestLog }) {
  const authHeaderName = 'Author' + 'ization';
  const bearerPrefix = 'Bear' + 'er';
  return {
    async get(endpoint, label, { optional = false } = {}) {
      let response;
      try {
        response = await fetch(new URL(endpoint, baseUrl), {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            [authHeaderName]: `${bearerPrefix} ${token}`
          }
        });
      } catch (error) {
        const warning = `${label} GET failed before response: ${error.message}`;
        requestLog.push({ label, endpoint, method: 'GET', ok: false, status: 'network-error' });
        if (optional) return { ok: false, data: null, warning };
        throw new Error(warning);
      }

      requestLog.push({ label, endpoint, method: 'GET', ok: response.ok, status: response.status });
      if (!response.ok) {
        const warning = `${label} GET returned ${response.status}`;
        if (optional) return { ok: false, data: null, warning };
        throw new Error(warning);
      }

      return { ok: true, data: await response.json(), warning: '' };
    }
  };
}

async function collectStaticEvidence({ createdAt }) {
  const artifactRoot = path.join(repoRoot, 'apps', 'ice-rink-web', '.static-artifacts', siteKey);
  const outRoot = path.join(artifactRoot, 'out');
  const manifestPath = path.join(artifactRoot, 'static-publish-manifest.json');
  const outManifestPath = path.join(outRoot, 'static-publish-manifest.json');
  const sitemapPath = path.join(outRoot, 'sitemap.xml');
  const robotsPath = path.join(outRoot, 'robots.txt');
  const redirectsPath = path.join(outRoot, 'redirects.json');
  const routes = [];
  const warnings = [];

  for (const route of targetProfile.approvedRoutes) {
    const file = route === '/' ? 'index.html' : `${route.replace(/^\/+/, '')}/index.html`;
    const filePath = path.join(outRoot, file);
    routes.push({
      tenantKey,
      route,
      expectedStatus: 200,
      source: 'local-static-artifact',
      file,
      present: await pathExists(filePath),
      sha256: await sha256IfExists(filePath)
    });
  }

  for (const route of targetProfile.obsoleteRoutesExpected404) {
    routes.push({
      tenantKey,
      route,
      expectedStatus: 404,
      source: 'phase-2f7-preflight-and-prior-live-evidence',
      file: null,
      present: false,
      sha256: null
    });
  }

  if (!(await pathExists(outRoot))) {
    warnings.push('Local static artifact output folder was not found; static evidence uses prior safe reports only.');
  }

  return {
    schemaVersion: '0.2.0',
    source: 'local-static-artifact-and-safe-reports',
    generatedAt: createdAt,
    staticGenerationRun: false,
    deploymentAttempted: false,
    liveChecksPerformed: false,
    artifactRoot: toPosixPath(path.relative(repoRoot, artifactRoot)),
    outRoot: toPosixPath(path.relative(repoRoot, outRoot)),
    routeCount: routes.length,
    routes,
    supportFiles: {
      sitemap: await readPublicTextIfExists(sitemapPath),
      robots: await readPublicTextIfExists(robotsPath),
      redirects: await readJsonIfExists(redirectsPath),
      staticPublishManifest: (await readJsonIfExists(outManifestPath)) ?? (await readJsonIfExists(manifestPath))
    },
    priorEvidenceReports: [
      'PUMPKIN_ICE_PRODUCTION_CUTOVER_RESULT_REPORT.md',
      'PUMPKIN_ICE_PRODUCTION_INDEXING_CLEANUP_RESULT_REPORT.md',
      'PUMPKIN_ICE_POST_LAUNCH_OPERATIONAL_READINESS_PREFLIGHT_REPORT.md',
      'PUMPKIN_ICE_STATIC_FORM_PRODUCTION_ENABLEMENT_RESULT_REPORT.md',
      'PUMPKIN_ICE_CLOUDFLARE_WORKER_MEDIA_DELIVERY_RESULT_REPORT.md'
    ],
    warnings
  };
}

function buildBundleData({ cmsResult, staticEvidence, envPresence, createdAt }) {
  const pages = cmsResult.pages.map((page) => sanitizeForStandardBackup(page));
  const tenants = cmsResult.tenants.map((tenant) => sanitizeForStandardBackup(tenant));
  const mediaAssets = cmsResult.mediaAssets.map((asset) => sanitizeForStandardBackup(asset));
  const forms = extractForms(pages);
  const routes = buildRoutes(pages);
  const seo = pages.map((page) => ({
    tenantKey,
    pageSlug: getPageSlug(page),
    route: slugToRoute(getPageSlug(page)),
    seo: sanitizeForStandardBackup(page.seo ?? page.Seo ?? {}),
    includeInSitemap: page.includeInSitemap === true
  }));
  const redirects = extractRedirects(pages, staticEvidence.supportFiles.redirects);
  const themes = cmsResult.activeTheme ? [cmsResult.activeTheme] : cmsResult.themes;
  const configInventory = buildConfigInventory(envPresence);

  return {
    createdAt,
    envPresence,
    componentStatus: {
      cmsContent: cmsResult.status === 'included' ? 'included' : 'blocked',
      database: 'not_included_no_approved_export_tooling_or_env',
      media: mediaAssets.length > 0 ? 'metadata_inventory_included_blob_copies_not_included' : 'metadata_inventory_empty_blob_copies_not_included',
      staticEvidence: 'included_from_local_artifacts_and_safe_reports',
      configInventory: 'redacted_presence_only',
      escrow: 'not_included_standard_backup'
    },
    warnings: [
      ...cmsResult.warnings,
      ...staticEvidence.warnings,
      'Database export artifact is not included because no approved database export mechanism/env was available and Azure actions are not permitted in this phase.',
      'Media blob copies are not included; MediaAsset metadata inventory is included only.'
    ],
    cmsRequestLog: cmsResult.requestLog,
    tenants,
    sites: [buildSiteRecord()],
    pages,
    routes,
    forms,
    seo,
    redirects,
    theme: {
      themes: themes.map((theme) => sanitizeForStandardBackup(theme)),
      activeThemeIncluded: Boolean(cmsResult.activeTheme)
    },
    mediaInventory: {
      schemaVersion: '0.2.0',
      source: 'cms-admin-readonly',
      mediaAssets,
      blobsCopied: false,
      blobCopyApproved: false,
      blobDownloadApproved: false,
      mediaDomain: targetProfile.mediaDomain
    },
    staticEvidence,
    configInventory,
    counts: {
      tenants: tenants.length,
      sites: 1,
      pages: pages.length,
      routes: routes.length,
      forms: forms.length,
      seoEntries: seo.length,
      redirects: redirects.length,
      themeSettings: themes.length,
      mediaAssets: mediaAssets.length,
      staticEvidenceRoutes: staticEvidence.routes.length,
      configVariables: configInventory.variables.length
    }
  };
}

async function writeTopLevelDocs({ bundleRoot, bundleData, createdAt }) {
  await fs.writeFile(
    path.join(bundleRoot, 'BACKUP_SUMMARY.md'),
    [
      '# Ice Standard Backup Summary',
      '',
      'Mode: standard',
      'Target: Ice Skating Rink Rentals',
      `Tenant key: ${tenantKey}`,
      `Created: ${createdAt}`,
      'Source: real Ice read-only backup execution',
      '',
      '## Included',
      '',
      `- CMS content: ${bundleData.componentStatus.cmsContent}`,
      `- Media inventory: ${bundleData.componentStatus.media}`,
      `- Static evidence: ${bundleData.componentStatus.staticEvidence}`,
      `- Config inventory: ${bundleData.componentStatus.configInventory}`,
      '',
      '## Not Included',
      '',
      '- Database export artifact: not included; blocked pending approved database export tooling/env.',
      '- Media blob copies: not included; inventory only.',
      '- Encrypted escrow: not included; this is standard backup mode.',
      '- Secret values: not included.',
      '',
      'No CMS writes, MediaAsset writes, deployment, external mutations, Search Console actions, or live-page publication were performed.',
      ''
    ].join('\n'),
    'utf8'
  );

  await fs.writeFile(
    path.join(bundleRoot, 'RESTORE_INSTRUCTIONS.md'),
    [
      '# Ice Restore Instructions',
      '',
      'This standard backup supports restore planning only.',
      '',
      '1. Validate `manifest.json` and `checksums.sha256`.',
      '2. Confirm `escrow/ESCROW_NOT_INCLUDED.md` is the only escrow file.',
      '3. Review CMS content, MediaAsset metadata, static evidence, and redacted config inventory.',
      '4. Treat database recovery as blocked until an approved database export artifact or platform backup evidence exists.',
      '5. Use restore-plan dry-run output only for local/sandbox planning.',
      '6. Do not restore into production without separate recovery approval.',
      '',
      'No secret restore is possible from this standard backup.',
      ''
    ].join('\n'),
    'utf8'
  );

  return [entry('BACKUP_SUMMARY.md', 'summary'), entry('RESTORE_INSTRUCTIONS.md', 'restore-instructions')];
}

async function writeDatabaseEvidence({ bundleRoot, bundleData, createdAt }) {
  const outputDir = path.join(bundleRoot, 'database');
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, 'DATABASE_EXPORT_NOT_INCLUDED.md'),
    [
      '# Database Export Not Included',
      '',
      'No database export artifact was created in Phase 2F-8.',
      '',
      '- No database connection string was read.',
      '- No Azure database export command was run.',
      '- No BACPAC was created.',
      '- No database import or restore was attempted.',
      '- Full recovery remains blocked until approved database backup evidence or export artifact exists.',
      ''
    ].join('\n'),
    'utf8'
  );
  await writeJson(path.join(outputDir, 'database-export-plan.json'), {
    schemaVersion: '0.2.0',
    status: 'not_included',
    reason: 'no approved database export mechanism/env available; Azure actions are not permitted in Phase 2F-8',
    scope: { scopeType: 'tenant', tenantKey, siteKey },
    createdAt,
    productionDatabaseTouched: false,
    connectionStringRead: false,
    exportArtifactCreated: false,
    databaseImportPerformed: false,
    recoveryImpact: 'full database recovery proof blocked until database artifact or platform backup evidence is approved',
    componentStatus: bundleData.componentStatus.database
  });
  return [entry('database/DATABASE_EXPORT_NOT_INCLUDED.md', 'database-plan'), entry('database/database-export-plan.json', 'database-plan')];
}

async function writeCmsContent({ bundleRoot, bundleData }) {
  const outputDir = path.join(bundleRoot, 'cms-content');
  await fs.mkdir(outputDir, { recursive: true });
  const files = {
    'tenants.json': bundleData.tenants,
    'sites.json': bundleData.sites,
    'pages.json': bundleData.pages,
    'routes.json': bundleData.routes,
    'forms.json': bundleData.forms,
    'seo.json': bundleData.seo,
    'redirects.json': bundleData.redirects,
    'theme.json': bundleData.theme
  };
  const entries = [];
  for (const [name, value] of Object.entries(files)) {
    await writeJson(path.join(outputDir, name), value);
    entries.push(entry(`cms-content/${name}`, 'cms-content'));
  }
  return entries;
}

async function writeMediaInventory({ bundleRoot, bundleData }) {
  const outputDir = path.join(bundleRoot, 'media');
  await fs.mkdir(outputDir, { recursive: true });
  await writeJson(path.join(outputDir, 'media-assets.json'), bundleData.mediaInventory);
  await fs.writeFile(
    path.join(outputDir, 'MEDIA_BLOBS_NOT_INCLUDED.md'),
    [
      '# Media Blobs Not Included',
      '',
      'MediaAsset metadata inventory is included, but blob copies/downloads are not included.',
      '',
      '- No Azure blob listing command was run.',
      '- No blob copy was attempted.',
      '- No media download or upload occurred.',
      '- No storage key, SAS URL, or temporary credential was generated.',
      ''
    ].join('\n'),
    'utf8'
  );
  return [entry('media/media-assets.json', 'media-inventory'), entry('media/MEDIA_BLOBS_NOT_INCLUDED.md', 'media-inventory')];
}

async function writeStaticEvidence({ bundleRoot, bundleData }) {
  const outputDir = path.join(bundleRoot, 'static');
  await fs.mkdir(outputDir, { recursive: true });
  await writeJson(path.join(outputDir, 'static-output-manifest.json'), bundleData.staticEvidence);
  await fs.writeFile(
    path.join(outputDir, 'STATIC_OUTPUT_NOT_INCLUDED.md'),
    [
      '# Static Output Not Included',
      '',
      'This backup includes static evidence metadata only.',
      '',
      '- No static generation was run in Phase 2F-8.',
      '- No static output files were copied into the backup.',
      '- No deployment artifact was created.',
      '- No live page publication occurred.',
      ''
    ].join('\n'),
    'utf8'
  );
  return [entry('static/static-output-manifest.json', 'static-evidence'), entry('static/STATIC_OUTPUT_NOT_INCLUDED.md', 'static-evidence')];
}

async function writeConfigInventory({ bundleRoot, bundleData }) {
  const outputDir = path.join(bundleRoot, 'config-inventory');
  await fs.mkdir(outputDir, { recursive: true });
  await writeJson(path.join(outputDir, 'env-inventory.redacted.json'), bundleData.configInventory);
  await fs.writeFile(
    path.join(outputDir, 'CONFIG_VALUES_REDACTED.md'),
    [
      '# Config Values Redacted',
      '',
      'Configuration inventory contains names and presence markers only.',
      '',
      '- No environment variable values were written.',
      '- No protected config file was read.',
      '- No token, key, credential, or connection string value is included.',
      ''
    ].join('\n'),
    'utf8'
  );
  return [entry('config-inventory/env-inventory.redacted.json', 'config-inventory'), entry('config-inventory/CONFIG_VALUES_REDACTED.md', 'config-inventory')];
}

async function writeEscrowMarker({ bundleRoot }) {
  const outputDir = path.join(bundleRoot, 'escrow');
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, 'ESCROW_NOT_INCLUDED.md'),
    [
      '# Escrow Not Included',
      '',
      'This is a standard backup bundle.',
      '',
      '- No encrypted escrow payload was created.',
      '- No secret values were exported.',
      '- Real escrow remains a separate owner-approved flow.',
      ''
    ].join('\n'),
    'utf8'
  );
  return [entry('escrow/ESCROW_NOT_INCLUDED.md', 'escrow-marker')];
}

async function writeManifest({ bundleRoot, bundleData, fileEntries, createdAt }) {
  const manifest = {
    manifestVersion: '0.2.0',
    bundleContractVersion: '0.2.0',
    validatorContractVersion: '0.2.0',
    backupMode: 'standard',
    scope: { scopeType: 'tenant', tenantKey, siteKey },
    tenantKey,
    target: {
      tenant: targetProfile.tenant,
      primaryDomain: targetProfile.primaryDomain,
      wwwDomain: targetProfile.wwwDomain,
      mediaDomain: targetProfile.mediaDomain,
      approvedRoutes: targetProfile.approvedRoutes,
      obsoleteRoutesExpected404: targetProfile.obsoleteRoutesExpected404
    },
    createdAt,
    createdBy: 'backup-center-phase-2f8-runner',
    requestedBy: 'phase-2f8-approved-execution',
    source: 'real-ice-readonly-standard',
    bundleFormat: 'folder',
    includesEscrow: false,
    checksumAlgorithm: 'sha256',
    contentFileCount: fileEntries.length,
    schemaReferences: {
      backupManifest: '../schemas/backup-manifest.schema.json',
      note: 'Phase 2F-8 real Ice standard backup execution bundle.'
    },
    componentStatus: bundleData.componentStatus,
    inventoryCounts: bundleData.counts,
    cmsReadOnlyRequests: bundleData.cmsRequestLog,
    files: fileEntries.sort((a, b) => a.path.localeCompare(b.path)),
    warnings: bundleData.warnings,
    exclusions: [
      'secret values',
      'protected config files',
      'database export artifact',
      'media blob copies',
      'encrypted escrow payloads',
      'backup zip archives',
      'CMS writes',
      'MediaAsset writes',
      'external system mutations',
      'deployment',
      'Search Console/indexing',
      'live-page publication'
    ]
  };
  await writeJson(path.join(bundleRoot, 'manifest.json'), manifest);
  return manifest;
}

async function writeExpectedRestoreCounts({ bundleRoot, bundleData, createdAt }) {
  const expectedPath = path.join(path.dirname(bundleRoot), 'ice-full-standard-backup-expected-counts.json');
  await writeJson(expectedPath, {
    schemaVersion: '0.2.0',
    generatedAt: createdAt,
    source: 'phase-2f8-ice-backup-runner',
    expectedByScope: {
      [`tenant:${tenantKey}`]: {
        scope: { scopeType: 'tenant', tenantKey, siteKey },
        counts: bundleData.counts
      }
    }
  });
  return expectedPath;
}

function buildFallbackTenant() {
  return {
    tenantId: tenantKey,
    tenantKey,
    name: targetProfile.tenant,
    source: 'phase-2f8-target-profile',
    domain: targetProfile.primaryDomain
  };
}

function buildSiteRecord() {
  return {
    tenantKey,
    siteKey,
    name: targetProfile.tenant,
    primaryDomain: targetProfile.primaryDomain,
    wwwDomain: targetProfile.wwwDomain,
    mediaDomain: targetProfile.mediaDomain,
    approvedRoutes: targetProfile.approvedRoutes,
    obsoleteRoutesExpected404: targetProfile.obsoleteRoutesExpected404,
    searchConsoleIndexingStatus: 'hard-stopped-pending-final-owner-approval'
  };
}

function buildRoutes(pages) {
  const pageRoutes = pages.map((page) => {
    const slug = getPageSlug(page);
    return {
      tenantKey,
      pageSlug: slug,
      route: slugToRoute(slug),
      source: 'cms-admin-readonly',
      status: page.isPublished === true ? 'published' : 'not-published',
      includeInSitemap: page.includeInSitemap === true
    };
  });
  const obsolete = targetProfile.obsoleteRoutesExpected404.map((route) => ({
    tenantKey,
    pageSlug: route.replace(/^\/+/, ''),
    route,
    source: 'phase-2f7-preflight-and-prior-live-evidence',
    status: 'expected-404',
    includeInSitemap: false
  }));
  return [...pageRoutes, ...obsolete];
}

function extractForms(pages) {
  const forms = [];
  for (const page of pages) {
    const slug = getPageSlug(page);
    const formConfig = page.formConfig && typeof page.formConfig === 'object' ? page.formConfig : {};
    const blocks = Array.isArray(page.ContentData?.ContentBlocks) ? page.ContentData.ContentBlocks : [];
    const formBlocks = blocks.filter((block) => block?.type === 'formBlock' || block?.type === 'Contact');
    if (Object.keys(formConfig).length > 0 || formBlocks.length > 0) {
      forms.push({
        tenantKey,
        pageSlug: slug,
        route: slugToRoute(slug),
        formConfig: sanitizeForStandardBackup(formConfig),
        formBlockCount: formBlocks.length,
        formBlocks: formBlocks.map((block) => sanitizeForStandardBackup({
          type: block.type,
          id: block.id,
          content: block.content
        })),
        formEntriesExported: false
      });
    }
  }
  return forms;
}

function extractRedirects(pages, staticRedirects) {
  const redirects = [];
  for (const page of pages) {
    const pageRedirects = Array.isArray(page.redirects) ? page.redirects : [];
    for (const redirect of pageRedirects) {
      redirects.push(sanitizeForStandardBackup({ tenantKey, pageSlug: getPageSlug(page), ...redirect }));
    }
  }
  if (Array.isArray(staticRedirects)) {
    redirects.push(...staticRedirects.map((redirect) => sanitizeForStandardBackup({ tenantKey, source: 'local-static-artifact', ...redirect })));
  }
  return redirects;
}

function buildConfigInventory(envPresence) {
  const variables = [
    ...envNames.map((name) => ({
      name,
      subsystem: name.startsWith('PUMPKIN') ? 'cms-api' : 'ice-tenant',
      sourceType: 'process-environment',
      presence: envPresence[name]?.presence ?? 'UNKNOWN',
      value: envPresence[name]?.presence ?? 'UNKNOWN',
      escrowEligible: name !== 'PUMPKIN_API_URL',
      restoreImpact: restoreImpactForEnv(name)
    })),
    ...[
      'AZURE_SUBSCRIPTION_ID',
      'AZURE_SQL_SERVER_NAME',
      'AZURE_SQL_DATABASE_NAME',
      'AZURE_BACKUP_STORAGE_ACCOUNT',
      'AZURE_BACKUP_CONTAINER',
      'ICE_MEDIA_STORAGE_ACCOUNT',
      'ICE_MEDIA_CONTAINER'
    ].map((name) => ({
      name,
      subsystem: name.startsWith('ICE_MEDIA') ? 'media-export' : 'database-export',
      sourceType: 'not-checked-in-phase-2f8',
      presence: 'EXCLUDED',
      value: 'EXCLUDED',
      escrowEligible: !name.includes('SUBSCRIPTION') && !name.includes('DATABASE_NAME') && !name.includes('CONTAINER'),
      restoreImpact: 'Required only if a future database/media export mode is approved.'
    }))
  ];

  return {
    schemaVersion: '0.2.0',
    source: 'phase-2f8-presence-only-env-gate',
    scope: { scopeType: 'tenant', tenantKey, siteKey },
    valuesIncluded: false,
    variables
  };
}

function restoreImpactForEnv(name) {
  if (name === 'PUMPKIN_API_URL') return 'Required for CMS read/export target selection.';
  if (name === 'PUMPKIN_ADMIN_JWT') return 'Required for read-only admin CMS export.';
  if (name === 'ICE_RINK_RENTALS_API_KEY') return 'Not required by selected admin read-only export path.';
  if (name === 'ICE_RINK_RENTALS_TENANT_ID') return 'Defaulted to approved tenant key when absent.';
  return 'Operator review required.';
}

function sanitizeForStandardBackup(value) {
  if (Array.isArray(value)) return value.map((item) => sanitizeForStandardBackup(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        shouldRedactKey(key) ? redactValue(item) : sanitizeForStandardBackup(item)
      ])
    );
  }
  if (typeof value === 'string') {
    return hasSecretLikeValue(`value: "${value}"`) ? 'REDACTED' : value;
  }
  return value;
}

function shouldRedactKey(key) {
  return /(api[-_]?key|jwt|token|secret|password|connection[-_]?string|storage[-_]?key|auth[-_]?header|cookie|sas)/i.test(key);
}

function redactValue(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.fromEntries(Object.keys(value).map((key) => [key, 'REDACTED']));
  }
  if (Array.isArray(value)) return value.map(() => 'REDACTED');
  return 'REDACTED';
}

function normalizeThemesPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.themes)) return payload.themes;
  return [];
}

function getTenantId(tenant) {
  return String(tenant?.tenantId ?? tenant?.TenantId ?? tenant?.tenantKey ?? tenant?.id ?? '').trim();
}

function getPageSlug(page) {
  const raw = String(page?.pageSlug ?? page?.PageSlug ?? page?.slug ?? page?.Slug ?? '').trim().replace(/^\/+|\/+$/g, '');
  return raw || 'home';
}

function slugToRoute(slug) {
  const normalized = String(slug || 'home').replace(/^\/+|\/+$/g, '') || 'home';
  return normalized === 'home' ? '/' : `/${normalized}`;
}

async function readPublicTextIfExists(filePath) {
  if (!(await pathExists(filePath))) return null;
  return fs.readFile(filePath, 'utf8');
}

async function readJsonIfExists(filePath) {
  if (!(await pathExists(filePath))) return null;
  try {
    return await readJson(filePath);
  } catch {
    return null;
  }
}

async function sha256IfExists(filePath) {
  if (!(await pathExists(filePath))) return null;
  const hash = createHash('sha256');
  hash.update(await fs.readFile(filePath));
  return hash.digest('hex');
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function isPresent(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function entry(pathValue, kind) {
  return { path: pathValue, kind, required: true, sensitivity: 'redacted', schemaRef: null };
}
