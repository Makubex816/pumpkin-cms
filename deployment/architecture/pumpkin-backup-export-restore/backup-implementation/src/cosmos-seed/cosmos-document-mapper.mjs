import path from 'node:path';
import { createHash } from 'node:crypto';
import { routeDocumentTypeToContainer, cosmosSeedContractVersion, cosmosSeedPartitionKeyPath } from './cosmos-container-router.mjs';
import { hasSecretLikeValue } from '../validators/backup-validator.mjs';
import { readJson } from '../utils/json-writer.mjs';
import { bundleRelativePath, toPosixPath } from '../utils/safe-paths.mjs';

const defaultTenantKey = 'ice-rink-rentals';
const defaultSiteKey = 'ice-rink-rentals';

const forbiddenNormalizedKeys = new Set([
  'apikey',
  'apikeyhash',
  'apikeymeta',
  'accountkey',
  'databasekey',
  'storagekey',
  'primarykey',
  'secondarykey',
  'privatekey',
  'connectionstring',
  'endpointwithcredentials',
  'token',
  'accesstoken',
  'refreshtoken',
  'jwt',
  'password',
  'secret',
  'clientsecret',
  'sas',
  'sasurl',
  'authheader',
  'authorization',
  'cookie'
]);

export async function mapIceBackupToCosmosSeed({
  bundleRoot,
  providerFixture,
  runtimeProfile,
  createdAt = new Date().toISOString(),
  migrationRunId = 'phase-2f12o-ice-cosmos-seed-dry-run'
}) {
  const source = await readSourceBaseline(bundleRoot);
  const tenantKey = source.manifest.scope?.tenantKey ?? source.manifest.tenantKey ?? defaultTenantKey;
  const siteKey = source.manifest.scope?.siteKey ?? tenantKey ?? defaultSiteKey;
  const target = buildTargetDescriptor({ providerFixture });
  const sourceDescriptor = buildSourceDescriptor({ bundleRoot, manifest: source.manifest });
  const baseContext = {
    tenantKey,
    siteKey,
    createdAt,
    migrationRunId,
    sourceDescriptor,
    target
  };
  const seoBySlug = new Map(source.seo.map((entry) => [getPageSlug(entry), entry]));

  const documents = [
    ...source.tenants.map((tenant) => mapTenant({ tenant, manifest: source.manifest, context: baseContext })),
    ...source.sites.map((site) => mapSite({ site, context: baseContext, runtimeProfile, providerFixture })),
    ...source.pages.map((page) => mapPage({ page, seoBySlug, context: baseContext })),
    ...source.routes.map((route) => mapRoute({ route, context: baseContext })),
    ...source.forms.map((form) => mapForm({ form, context: baseContext })),
    ...source.mediaAssets.map((asset) => mapMediaAsset({ asset, mediaInventory: source.mediaInventory, context: baseContext })),
    ...source.themes.map((theme, index) => mapTheme({ theme, index, context: baseContext }))
  ];

  documents.push(mapImportRun({
    context: baseContext,
    source,
    providerFixture,
    runtimeProfile,
    counts: countDocumentsByContainer(documents)
  }));

  const grouped = groupDocumentsByContainer(documents);
  return {
    schemaVersion: cosmosSeedContractVersion,
    tenantKey,
    siteKey,
    migrationRunId,
    createdAt,
    source,
    sourceDescriptor,
    target,
    documents,
    grouped,
    counts: countDocumentsByContainer(documents)
  };
}

export function groupDocumentsByContainer(documents) {
  const grouped = {};
  for (const document of documents) {
    const container = routeDocumentTypeToContainer(document.documentType);
    if (!grouped[container]) grouped[container] = [];
    grouped[container].push(document);
  }
  for (const container of Object.keys(grouped)) {
    grouped[container].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  }
  return grouped;
}

export function countDocumentsByContainer(documents) {
  const counts = {};
  for (const document of documents) {
    const container = routeDocumentTypeToContainer(document.documentType);
    counts[container] = (counts[container] ?? 0) + 1;
  }
  return counts;
}

export function sanitizeSeedValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeSeedValue(item));
  }
  if (value && typeof value === 'object') {
    const sanitized = {};
    for (const [key, child] of Object.entries(value)) {
      if (isForbiddenSeedKey(key)) {
        continue;
      }
      sanitized[key] = sanitizeSeedValue(child);
    }
    return sanitized;
  }
  if (typeof value === 'string' && hasSecretLikeValue(`value: "${value}"`)) {
    return 'REDACTED';
  }
  return value;
}

export function isForbiddenSeedKey(key) {
  return forbiddenNormalizedKeys.has(normalizeKey(key));
}

async function readSourceBaseline(bundleRoot) {
  const manifest = await readJson(path.join(bundleRoot, 'manifest.json'));
  const tenants = await readJson(path.join(bundleRoot, 'cms-content', 'tenants.json'));
  const sites = await readJson(path.join(bundleRoot, 'cms-content', 'sites.json'));
  const pages = await readJson(path.join(bundleRoot, 'cms-content', 'pages.json'));
  const routes = await readJson(path.join(bundleRoot, 'cms-content', 'routes.json'));
  const forms = await readJson(path.join(bundleRoot, 'cms-content', 'forms.json'));
  const seo = await readJson(path.join(bundleRoot, 'cms-content', 'seo.json'));
  const themeEnvelope = await readJson(path.join(bundleRoot, 'cms-content', 'theme.json'));
  const mediaInventory = await readJson(path.join(bundleRoot, 'media', 'media-assets.json'));
  const staticEvidence = await readJson(path.join(bundleRoot, 'static', 'static-output-manifest.json'));
  const configInventory = await readJson(path.join(bundleRoot, 'config-inventory', 'env-inventory.redacted.json'));
  return {
    manifest,
    tenants: ensureArray(tenants),
    sites: ensureArray(sites),
    pages: ensureArray(pages),
    routes: ensureArray(routes),
    forms: ensureArray(forms),
    seo: ensureArray(seo),
    themes: ensureArray(themeEnvelope.themes),
    themeEnvelope,
    mediaInventory,
    mediaAssets: ensureArray(mediaInventory.mediaAssets),
    staticEvidence,
    configInventory
  };
}

function mapTenant({ tenant, manifest, context }) {
  const tenantKey = tenant.tenantKey ?? tenant.tenantId ?? context.tenantKey;
  return withMigrationMetadata({
    id: sanitizeId(tenantKey),
    documentType: 'tenant',
    schemaVersion: cosmosSeedContractVersion,
    tenantKey,
    name: tenant.name ?? manifest.target?.tenant ?? 'Ice Skating Rink Rentals',
    sourceTenantId: tenant.tenantId ?? tenant.id ?? tenantKey,
    domain: tenant.domain ?? manifest.target?.primaryDomain ?? null,
    status: tenant.status ?? 'active',
    targetProfile: sanitizeSeedValue(manifest.target ?? {}),
    redaction: {
      protectedCredentialMaterialExcluded: true,
      valuesIncluded: false,
      note: 'Tenant credential-bearing source fields are excluded from seed documents.'
    },
    sourceDigest: sha256Json(sanitizeSeedValue(tenant))
  }, context, 'cms-content/tenants.json');
}

function mapSite({ site, context, runtimeProfile, providerFixture }) {
  const siteKey = site.siteKey ?? context.siteKey;
  return withMigrationMetadata({
    id: sanitizeId(`${context.tenantKey}:${siteKey}`),
    documentType: 'site',
    schemaVersion: cosmosSeedContractVersion,
    tenantKey: site.tenantKey ?? context.tenantKey,
    siteKey,
    name: site.name ?? 'Ice Skating Rink Rentals',
    primaryDomain: site.primaryDomain ?? null,
    wwwDomain: site.wwwDomain ?? null,
    mediaDomain: site.mediaDomain ?? null,
    approvedRoutes: ensureArray(site.approvedRoutes),
    obsoleteRoutesExpected404: ensureArray(site.obsoleteRoutesExpected404),
    searchConsoleIndexingStatus: site.searchConsoleIndexingStatus ?? 'hard-stopped-pending-final-owner-approval',
    providerRuntimeMapping: {
      providerType: providerFixture.providerType,
      providerStatus: providerFixture.providerStatus,
      sourceResolutionStatus: providerFixture.sourceResolutionStatus,
      selectedTargetProvider: providerFixture.selectedTargetProvider,
      runtimeProfileName: runtimeProfile.profileName,
      runtimeStatus: runtimeProfile.provider.runtimeStatus,
      runtimeSwitchAllowed: runtimeProfile.guards.runtimeSwitch.allowed,
      productionWritesAllowed: runtimeProfile.guards.productionWrites.allowed,
      liveDatabaseExportAllowed: runtimeProfile.guards.liveDatabaseExport.allowed,
      nextAction: runtimeProfile.readiness.nextAction
    }
  }, context, 'cms-content/sites.json');
}

function mapPage({ page, seoBySlug, context }) {
  const pageSlug = getPageSlug(page);
  const seoEntry = seoBySlug.get(pageSlug) ?? null;
  const sourcePageId = page.id ?? page.pageId ?? `${context.tenantKey}:${pageSlug}`;
  return withMigrationMetadata({
    id: sanitizeId(sourcePageId),
    documentType: 'page',
    schemaVersion: cosmosSeedContractVersion,
    tenantKey: page.tenantKey ?? page.tenantId ?? context.tenantKey,
    siteKey: page.siteKey ?? context.siteKey,
    pageSlug,
    route: slugToRoute(pageSlug),
    title: page.title ?? page.MetaData?.title ?? page.metaData?.title ?? pageSlug,
    status: page.isPublished === true ? 'published' : 'draft',
    isPublished: page.isPublished === true,
    includeInSitemap: page.includeInSitemap === true || seoEntry?.includeInSitemap === true,
    pageVersion: page.pageVersion ?? page.version ?? null,
    metaData: sanitizeSeedValue(page.MetaData ?? page.metaData ?? page.metadata ?? {}),
    searchData: sanitizeSeedValue(page.SearchData ?? page.searchData ?? {}),
    contentData: sanitizeSeedValue(page.ContentData ?? page.contentData ?? {}),
    pageQuality: sanitizeSeedValue(page.pageQuality ?? {}),
    workflow: sanitizeSeedValue(page.workflow ?? {}),
    template: sanitizeSeedValue(page.template ?? {}),
    linking: sanitizeSeedValue(page.linking ?? {}),
    schemaControls: sanitizeSeedValue(page.schemaControls ?? {}),
    serviceSchema: sanitizeSeedValue(page.serviceSchema ?? {}),
    formConfig: sanitizeSeedValue(page.formConfig ?? {}),
    media: sanitizeSeedValue(page.media ?? {}),
    seo: sanitizeSeedValue(seoEntry?.seo ?? {}),
    sourceDigest: sha256Json(sanitizeSeedValue(page))
  }, context, 'cms-content/pages.json');
}

function mapRoute({ route, context }) {
  const routePath = route.route ?? slugToRoute(getPageSlug(route));
  return withMigrationMetadata({
    id: sanitizeId(`${context.tenantKey}:route:${routePath === '/' ? 'home' : routePath.replace(/^\/+/, '')}`),
    documentType: 'route',
    schemaVersion: cosmosSeedContractVersion,
    tenantKey: route.tenantKey ?? context.tenantKey,
    siteKey: route.siteKey ?? context.siteKey,
    pageSlug: route.pageSlug ?? (routePath.replace(/^\/+/, '') || 'home'),
    route: routePath,
    source: route.source ?? 'cms-admin-readonly',
    status: route.status ?? 'unknown',
    expectedStatus: route.status === 'expected-404' ? 404 : 200,
    includeInSitemap: route.includeInSitemap === true
  }, context, 'cms-content/routes.json');
}

function mapForm({ form, context }) {
  const pageSlug = form.pageSlug ?? getPageSlug(form);
  const formId = form.formConfig?.formId ?? form.formId ?? `${context.tenantKey}:${pageSlug}:form`;
  return withMigrationMetadata({
    id: sanitizeId(formId),
    documentType: 'form',
    schemaVersion: cosmosSeedContractVersion,
    tenantKey: form.tenantKey ?? context.tenantKey,
    siteKey: form.siteKey ?? context.siteKey,
    pageSlug,
    route: form.route ?? slugToRoute(pageSlug),
    formId,
    formConfig: sanitizeSeedValue(form.formConfig ?? {}),
    formBlockCount: Number(form.formBlockCount ?? 0),
    formBlocks: sanitizeSeedValue(ensureArray(form.formBlocks)),
    formEntriesExported: form.formEntriesExported === true,
    entriesIncluded: false
  }, context, 'cms-content/forms.json');
}

function mapMediaAsset({ asset, mediaInventory, context }) {
  const assetId = asset.assetId ?? asset.mediaAssetId ?? asset.id;
  return withMigrationMetadata({
    id: sanitizeId(asset.id ?? `${context.tenantKey}:media:${assetId}`),
    documentType: 'mediaAsset',
    schemaVersion: cosmosSeedContractVersion,
    tenantKey: asset.tenantKey ?? asset.tenantId ?? context.tenantKey,
    siteKey: asset.siteKey || context.siteKey,
    assetId,
    status: asset.status ?? 'unknown',
    title: asset.title ?? '',
    altText: asset.altText ?? asset.alt ?? '',
    caption: asset.caption ?? '',
    licenseStatus: asset.licenseStatus ?? asset.license ?? '',
    usageStatus: asset.usageStatus ?? '',
    usageType: asset.usageType ?? '',
    file: {
      fileName: asset.fileName ?? '',
      safeFileName: asset.safeFileName ?? '',
      mimeType: asset.mimeType ?? '',
      extension: asset.extension ?? '',
      sizeBytes: asset.sizeBytes ?? asset.fileSize ?? null,
      checksum: asset.checksum ?? asset.hash ?? ''
    },
    dimensions: {
      width: asset.width ?? null,
      height: asset.height ?? null
    },
    urls: {
      url: asset.url ?? '',
      publicUrl: asset.publicUrl ?? '',
      thumbnailUrl: asset.thumbnailUrl ?? ''
    },
    storage: {
      provider: asset.storageProvider ?? '',
      containerName: asset.storageContainer ?? '',
      blobPath: asset.blobPath ?? ''
    },
    variants: sanitizeSeedValue(ensureArray(asset.variants)),
    tags: sanitizeSeedValue(ensureArray(asset.tags)),
    usageReferences: sanitizeSeedValue(ensureArray(asset.usageReferences)),
    usedByPages: sanitizeSeedValue(ensureArray(asset.usedByPages)),
    blobCopied: mediaInventory.blobsCopied === true,
    blobDownloadApproved: mediaInventory.blobDownloadApproved === true,
    mediaDomain: mediaInventory.mediaDomain ?? null,
    sourceDigest: sha256Json(sanitizeSeedValue(asset))
  }, context, 'media/media-assets.json');
}

function mapTheme({ theme, index, context }) {
  const themeId = theme.themeId ?? theme.id ?? `${context.tenantKey}:theme:${index + 1}`;
  return withMigrationMetadata({
    id: sanitizeId(themeId),
    documentType: 'theme',
    schemaVersion: cosmosSeedContractVersion,
    tenantKey: theme.tenantKey ?? theme.tenantId ?? context.tenantKey,
    siteKey: theme.siteKey ?? context.siteKey,
    themeId,
    name: theme.name ?? themeId,
    description: theme.description ?? '',
    isActive: theme.isActive === true,
    header: sanitizeSeedValue(theme.header ?? {}),
    footer: sanitizeSeedValue(theme.footer ?? {}),
    blockStyles: sanitizeSeedValue(theme.blockStyles ?? {}),
    menu: sanitizeSeedValue(ensureArray(theme.menu)),
    sourceDigest: sha256Json(sanitizeSeedValue(theme))
  }, context, 'cms-content/theme.json');
}

function mapImportRun({ context, source, providerFixture, runtimeProfile, counts }) {
  return withMigrationMetadata({
    id: context.migrationRunId,
    documentType: 'importRun',
    schemaVersion: cosmosSeedContractVersion,
    tenantKey: context.tenantKey,
    siteKey: context.siteKey,
    phase: '2F-12O',
    status: 'dry-run-generated',
    dryRunOnly: true,
    liveCosmosWritesPerformed: false,
    cmsWritesPerformed: false,
    mediaDownloaded: false,
    databaseExportPerformed: false,
    sourceBaseline: {
      backupMode: source.manifest.backupMode,
      source: source.manifest.source,
      createdAt: source.manifest.createdAt,
      validationStatus: 'passed',
      inventoryCounts: source.manifest.inventoryCounts
    },
    target: {
      providerType: providerFixture.providerType,
      providerStatus: providerFixture.providerStatus,
      accountName: providerFixture.accountName,
      resourceGroup: providerFixture.resourceGroup,
      databaseName: providerFixture.databaseName,
      partitionKeyPath: cosmosSeedPartitionKeyPath
    },
    runtimeProfile: {
      profileName: runtimeProfile.profileName,
      runtimeStatus: runtimeProfile.provider.runtimeStatus,
      seedMigrationGatePassed: runtimeProfile.guards.liveDatabaseExport.reasonCodes.includes('seed-migration-gate-not-passed') === false,
      runtimeSwitchAllowed: runtimeProfile.guards.runtimeSwitch.allowed,
      productionWritesAllowed: runtimeProfile.guards.productionWrites.allowed
    },
    documentCounts: counts
  }, context, 'seed-manifest.json');
}

function withMigrationMetadata(document, context, sourceFile) {
  const container = routeDocumentTypeToContainer(document.documentType);
  return {
    ...document,
    migrationMetadata: {
      migrationRunId: context.migrationRunId,
      phase: '2F-12O',
      dryRunOnly: true,
      generatedAt: context.createdAt,
      source: {
        bundle: context.sourceDescriptor.relativePath,
        file: sourceFile,
        payloadDigest: document.sourceDigest ?? null
      },
      target: {
        provider: 'cosmos',
        accountName: context.target.accountName,
        databaseName: context.target.databaseName,
        container,
        partitionKeyPath: cosmosSeedPartitionKeyPath
      }
    }
  };
}

function buildSourceDescriptor({ bundleRoot, manifest }) {
  return {
    relativePath: toPosixPath(bundleRelativePath(path.dirname(bundleRoot), bundleRoot)),
    manifestCreatedAt: manifest.createdAt,
    source: manifest.source,
    backupMode: manifest.backupMode,
    inventoryCounts: manifest.inventoryCounts ?? {}
  };
}

function buildTargetDescriptor({ providerFixture }) {
  return {
    provider: 'cosmos',
    providerStatus: providerFixture.providerStatus,
    sourceResolutionStatus: providerFixture.sourceResolutionStatus,
    accountName: providerFixture.accountName,
    resourceGroup: providerFixture.resourceGroup,
    subscriptionHint: providerFixture.subscriptionHint,
    databaseName: providerFixture.databaseName,
    containerNames: ensureArray(providerFixture.containerNames),
    backupPolicyMode: providerFixture.backupPolicyMode,
    partitionKeyPath: cosmosSeedPartitionKeyPath
  };
}

function getPageSlug(value) {
  const raw = String(value?.pageSlug ?? value?.PageSlug ?? value?.slug ?? value?.Slug ?? '').trim().replace(/^\/+|\/+$/g, '');
  return raw || 'home';
}

function slugToRoute(slug) {
  const normalized = String(slug || 'home').replace(/^\/+|\/+$/g, '') || 'home';
  return normalized === 'home' ? '/' : `/${normalized}`;
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function sanitizeId(value) {
  return String(value ?? '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^A-Za-z0-9._:/-]/g, '-')
    || 'missing-id';
}

function sha256Json(value) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(value));
  return hash.digest('hex');
}

function normalizeKey(key) {
  return String(key).replace(/[^a-z0-9]/gi, '').toLowerCase();
}
