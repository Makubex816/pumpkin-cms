import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import { tmpdir } from 'os';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

const siteDefinitions = {
  'ice-rink-rentals': {
    domain: 'iceskatingrinkrentals.com',
    tenantEnv: 'ICE_RINK_RENTALS_TENANT_ID',
    apiKeyEnv: 'ICE_RINK_RENTALS_API_KEY',
    expectedSlugs: ['home', 'contact', 'service-areas'],
    obsoleteSlugs: ['ice-rink-rentals', 'events-holiday-activations'],
    mediaOrigin: 'https://media.iceskatingrinkrentals.com',
  },
  'roller-rink-rentals': {
    domain: 'rollerrinkrentals.com',
    tenantEnv: 'ROLLER_RINK_RENTALS_TENANT_ID',
    apiKeyEnv: 'ROLLER_RINK_RENTALS_API_KEY',
  },
};

const textExtensions = new Set(['.json', '.md', '.txt', '.xml']);

const secretPatterns = [
  { label: 'private key', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/i },
  { label: 'Azure storage connection string', pattern: /DefaultEndpointsProtocol=|AccountKey=/i },
  { label: 'development storage connection string', pattern: /UseDevelopmentStorage\s*=\s*true/i },
  { label: 'OpenAI-style API key', pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { label: 'GitHub token', pattern: /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/ },
  { label: 'Slack token', pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/ },
  { label: 'JWT token', pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ },
  {
    label: 'assigned secret-like value',
    pattern: /\b(password|api[_-]?key|secret|token|connectionString)\b\s*[:=]\s*["'][^"']{12,}["']/i,
  },
];

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(appRoot, '../..');
const tempAdminTokenPath = path.join(tmpdir(), 'pumpkin-admin-jwt.txt');
const require = createRequire(import.meta.url);
const {
  ICE_LAUNCH_NAVIGATION_ROUTES,
  validateContentBlocksDesignSystem,
  validateThemeDesignSystem,
  validateThemeNavigation,
} = require(path.join(repoRoot, 'packages', 'pumpkin-ts-models', 'dist', 'index.js'));
const command = process.argv[2] || 'snapshot';
const args = parseArgs(process.argv);

function parseArgs(argv) {
  const parsed = {};

  for (let index = 3; index < argv.length; index += 1) {
    const arg = argv[index];

    if (!arg.startsWith('--')) continue;

    const key = arg.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith('--')) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      index += 1;
    }
  }

  return parsed;
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function fail(message) {
  console.error(`[cms-snapshot] ${message}`);
  process.exitCode = 1;
}

function getSiteKey() {
  return String(args.site || process.env.STATIC_SITE_KEY || process.env.SITE_KEY || '');
}

function getSiteContext({ requireApiKey = false } = {}) {
  const siteKey = getSiteKey();
  const site = siteDefinitions[siteKey];

  if (!site) {
    throw new Error('SITE_KEY or STATIC_SITE_KEY must be ice-rink-rentals or roller-rink-rentals.');
  }

  const tenantId = process.env[site.tenantEnv] || siteKey;
  const apiKey = process.env[site.apiKeyEnv] || '';
  const missing = [];

  if (requireApiKey && !apiKey) {
    missing.push(site.apiKeyEnv);
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}.`);
  }

  return {
    ...site,
    siteKey,
    tenantId,
    apiKey,
    apiUrl: (process.env.PUMPKIN_API_URL || 'http://localhost:5064').replace(/\/+$/, ''),
    snapshotRoot: path.join(appRoot, '.static-content-snapshots', siteKey),
  };
}

function encodeSlugPath(slug) {
  return String(slug || 'home')
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');
}

function normalizeSlug(slug) {
  const value = String(slug || 'home').trim().replace(/^\/+|\/+$/g, '');
  return value || 'home';
}

function normalizeRedirectSlug(value) {
  if (typeof value !== 'string') return '';

  try {
    const url = new URL(value);
    return normalizeSlug(url.pathname);
  } catch {
    return normalizeSlug(value);
  }
}

function getPageRedirects(page) {
  if (!Array.isArray(page?.redirects)) return [];

  return page.redirects
    .map((redirect) => ({
      from: normalizeRedirectSlug(redirect.from),
      to: normalizeRedirectSlug(redirect.to),
      type: redirect.type || 301,
      reason: String(redirect.reason || 'slug_changed'),
      active: redirect.active !== false,
    }))
    .filter((redirect) => redirect.from && redirect.to);
}

function getRawPageSlug(page) {
  return String(page?.pageSlug || page?.PageSlug || page?.slug || page?.Slug || '').trim().replace(/^\/+|\/+$/g, '');
}

function getPageSlug(page) {
  return normalizeSlug(getRawPageSlug(page));
}

function getContentBlocks(page) {
  return page?.ContentData?.ContentBlocks ?? page?.contentData?.contentBlocks;
}

function getPageTitle(page) {
  return page?.MetaData?.title ?? page?.metaData?.title ?? '';
}

function getUpdatedAt(page) {
  return page?.MetaData?.updatedAt ?? page?.metaData?.updatedAt ?? page?.publishedAt ?? '';
}

function getCanonicalUrl(page) {
  return page?.seo?.canonicalUrl ?? page?.Seo?.CanonicalUrl ?? '';
}

function getTargetKeyword(page) {
  return page?.MetaData?.keyword || page?.metaData?.keyword || page?.searchData?.keyword || page?.SearchData?.Keyword || '';
}

function stringValue(value) {
  return typeof value === 'string' ? value : '';
}

function isPublishedProductionPage(page) {
  return page?.isPublished === true && page?.workflow?.approvedForPublish === true;
}

function hasNoindexRobots(page) {
  return /\bnoindex\b/i.test(stringValue(page?.seo?.robots));
}

function getConfiguredStaticFormEndpoint() {
  return stringValue(process.env.NEXT_PUBLIC_STATIC_FORM_ENDPOINT) ||
    stringValue(process.env.STATIC_FORM_ENDPOINT) ||
    stringValue(process.env.NEXT_PUBLIC_STATIC_FORM_ACTION) ||
    stringValue(process.env.STATIC_FORM_ACTION);
}

function getAdminToken() {
  const envToken = stringValue(process.env.CMS_SNAPSHOT_ADMIN_TOKEN) || stringValue(process.env.PUMPKIN_ADMIN_JWT);
  if (envToken) return envToken;

  try {
    if (existsSync(tempAdminTokenPath)) {
      return readFileSync(tempAdminTokenPath, 'utf8').trim();
    }
  } catch {
    return '';
  }

  return '';
}

function getApprovedSnapshotSlugs(site) {
  return site.siteKey === 'ice-rink-rentals' ? new Set(site.expectedSlugs || []) : null;
}

function applySnapshotRouteScope(site, pages, warnings) {
  const approvedSlugs = getApprovedSnapshotSlugs(site);
  if (!approvedSlugs) {
    return { pages, excludedSlugs: [] };
  }

  const excludedSlugs = [];
  const scopedPages = pages.filter((page) => {
    const slug = getPageSlug(page);
    if (approvedSlugs.has(slug)) return true;
    excludedSlugs.push(slug);
    return false;
  });
  const uniqueExcludedSlugs = [...new Set(excludedSlugs)].sort((a, b) => a.localeCompare(b));

  if (uniqueExcludedSlugs.length > 0) {
    warnings.push(`Ice static snapshot route scope excluded non-approved slug(s): ${uniqueExcludedSlugs.join(', ')}.`);
  }

  return { pages: scopedPages, excludedSlugs: uniqueExcludedSlugs };
}

function normalizeMenuUrl(value) {
  const rawValue = stringValue(value).trim();
  if (!rawValue) return '';

  try {
    const url = new URL(rawValue);
    return url.pathname || '/';
  } catch {
    return rawValue.split('#')[0].split('?')[0].replace(/\/+$/, '') || '/';
  }
}

function routeScopedTheme(site, theme, warnings) {
  if (site.siteKey !== 'ice-rink-rentals' || !theme || typeof theme !== 'object') return theme;

  const approvedRoutes = ['/', '/service-areas', '/contact'];
  const approvedRouteSet = new Set(approvedRoutes);
  const menu = Array.isArray(theme.menu) ? theme.menu : [];
  const byRoute = new Map();
  const excludedRoutes = [];

  for (const item of menu) {
    const route = normalizeMenuUrl(item?.url || item?.href);
    if (approvedRouteSet.has(route) && !byRoute.has(route)) {
      byRoute.set(route, { ...item, url: route });
    } else if (route) {
      excludedRoutes.push(route);
    }
  }

  if (!byRoute.has('/')) {
    byRoute.set('/', { label: 'Home', url: '/' });
  }

  const scopedMenu = approvedRoutes.map((route) => byRoute.get(route));
  const uniqueExcludedRoutes = [...new Set(excludedRoutes)].sort((a, b) => a.localeCompare(b));

  if (uniqueExcludedRoutes.length > 0 || scopedMenu.length !== menu.length) {
    warnings.push(
      `Ice static snapshot route scope rewrote theme.menu for local route-shape proof; excluded non-approved route(s): ${uniqueExcludedRoutes.join(', ') || 'none'}.`
    );
  }

  return { ...theme, menu: scopedMenu };
}

function stripPublicStaticAdminPayloads(site, page) {
  if (site.siteKey !== 'ice-rink-rentals' || !page || typeof page !== 'object') return page;

  const publicPage = JSON.parse(JSON.stringify(page));

  if (publicPage.revision && typeof publicPage.revision === 'object') {
    delete publicPage.revision.latestSnapshot;
  }

  return publicPage;
}

function collectStrings(value, pathLabel = 'page', output = []) {
  if (typeof value === 'string') {
    output.push({ path: pathLabel, value });
    return output;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectStrings(item, `${pathLabel}[${index}]`, output));
    return output;
  }

  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      collectStrings(item, `${pathLabel}.${key}`, output);
    }
  }

  return output;
}

function looksLikeMediaUrl(value) {
  const trimmed = stringValue(value).trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/media/')) return true;
  if (/^data:image\//i.test(trimmed)) return true;
  if (/^https?:\/\/(?:[^/\s]+\.)?(?:placehold\.co|placeholder\.com|example\.(?:com|test))\b/i.test(trimmed)) return true;
  return /^https?:\/\/[^\s?#]+\.(?:png|jpe?g|webp|gif|svg)(?:[?#][^\s]*)?$/i.test(trimmed);
}

function isAllowedProductionMediaUrl(value, mediaOrigin) {
  const trimmed = stringValue(value).trim();
  return Boolean(mediaOrigin) && trimmed.startsWith(`${mediaOrigin}/`);
}

function addProductionStaticGates(site, page, label, warnings) {
  if (site.siteKey !== 'ice-rink-rentals' || !isPublishedProductionPage(page)) return;

  if (hasNoindexRobots(page)) {
    warnings.push(`${label}: production/indexing readiness blocker: approved production static pages must not use noindex robots metadata.`);
  }

  if (page?.includeInSitemap === true && hasNoindexRobots(page)) {
    warnings.push(`${label}: production/indexing readiness blocker: includeInSitemap is true while robots contains noindex.`);
  }

  const media = getMedia(page);
  for (const [slot, asset] of Object.entries(media)) {
    if (!asset || typeof asset !== 'object') continue;
    const assetId = stringValue(asset.assetId) || stringValue(asset.mediaAssetId);
    const url = stringValue(asset.publicUrl) || stringValue(asset.url) || stringValue(asset.src);
    if (assetId && !url) {
      warnings.push(`${label}: media production readiness blocker: media.${slot} has a MediaAsset id but no production publicUrl.`);
    }
  }

  const mediaRefs = collectStrings(page)
    .filter(({ value }) => looksLikeMediaUrl(value));

  for (const { path: mediaPath, value } of mediaRefs) {
    const trimmed = value.trim();
    if (trimmed.startsWith('/media/')) {
      warnings.push(`${label}: media production readiness blocker: ${mediaPath} uses local-dev media URL ${trimmed}; production static media must use ${site.mediaOrigin}.`);
    } else if (/^data:image\//i.test(trimmed)) {
      warnings.push(`${label}: media production readiness blocker: ${mediaPath} embeds a base64 image; production static media must use an approved MediaAsset URL.`);
    } else if (!isAllowedProductionMediaUrl(trimmed, site.mediaOrigin)) {
      warnings.push(`${label}: media production readiness blocker: ${mediaPath} uses unapproved media URL ${trimmed}; expected ${site.mediaOrigin}.`);
    }
  }

  const blocks = Array.isArray(getContentBlocks(page)) ? getContentBlocks(page) : [];
  const hasFormBlock = blocks.some((block) => block?.type === 'Contact' || block?.type === 'formBlock');
  if (hasFormBlock) {
    const endpoint = getConfiguredStaticFormEndpoint();
    const endpointVerified = process.env.STATIC_FORM_ENDPOINT_VERIFIED === 'true';
    if (!endpoint) {
      warnings.push(`${label}: contact form production readiness blocker: static form endpoint is not configured for static production readiness.`);
    } else if (!/^https:\/\//i.test(endpoint) || /localhost|127\.0\.0\.1|<|>|\bexample\./i.test(endpoint)) {
      warnings.push(`${label}: contact form production readiness blocker: static form endpoint must be a verified HTTPS endpoint, not a local or placeholder URL.`);
    }
    if (!endpointVerified) {
      warnings.push(`${label}: contact form production readiness blocker: static form endpoint/backend verification is missing; Microsoft 365 mailbox status is not app form readiness.`);
    }
  }
}

function getFulfillment(page) {
  return page?.fulfillment && typeof page.fulfillment === 'object' ? page.fulfillment : {};
}

function getGoogleAds(page) {
  return page?.googleAds && typeof page.googleAds === 'object' ? page.googleAds : {};
}

function getMedia(page) {
  return page?.media && typeof page.media === 'object' ? page.media : {};
}

function getWorkflow(page) {
  return page?.workflow && typeof page.workflow === 'object' ? page.workflow : {};
}

function getRevision(page) {
  return page?.revision && typeof page.revision === 'object' ? page.revision : {};
}

function getStaticPublishing(page) {
  return page?.staticPublishing && typeof page.staticPublishing === 'object' ? page.staticPublishing : {};
}

function getTemplateIdentity(page) {
  return page?.template && typeof page.template === 'object' ? page.template : {};
}

function getLinking(page) {
  return page?.linking && typeof page.linking === 'object' ? page.linking : {};
}

function getSchemaControls(page) {
  return page?.schemaControls && typeof page.schemaControls === 'object' ? page.schemaControls : {};
}

function getServiceSchema(page) {
  return page?.serviceSchema && typeof page.serviceSchema === 'object' ? page.serviceSchema : {};
}

function getFormConfig(page) {
  return page?.formConfig && typeof page.formConfig === 'object' ? page.formConfig : {};
}

function hasFormOrCta(page) {
  const blocks = Array.isArray(getContentBlocks(page)) ? getContentBlocks(page) : [];
  return blocks.some((block) => block?.type === 'Contact' || block?.type === 'formBlock' || block?.type === 'PrimaryCTA');
}

function addImageAltWarnings(page, label, warnings) {
  const media = getMedia(page);
  for (const [slot, asset] of Object.entries(media)) {
    if (!asset || typeof asset !== 'object') continue;
    const url = stringValue(asset.publicUrl) || stringValue(asset.url) || stringValue(asset.src);
    const assetId = stringValue(asset.assetId) || stringValue(asset.mediaAssetId);
    if (url && !isSafeMediaUrl(url)) {
      warnings.push(`${label}: media.${slot}.url uses an unsafe or unsupported media URL scheme.`);
    }
    if (url && /^data:/i.test(url)) {
      warnings.push(`${label}: media.${slot}.url must not embed base64 image data.`);
    }
    if (url && !asset.alt && asset.decorative !== true) {
      warnings.push(`${label}: media.${slot}.alt is missing while media.${slot}.url is set.`);
    }
    if (url && !assetId) {
      warnings.push(`${label}: media.${slot}.assetId is missing; register or reference a MediaAsset before production publish.`);
    }
    if (url && (asset.status === 'archived' || asset.status === 'replaced' || asset.status === 'deleted-pending')) {
      warnings.push(`${label}: media.${slot}.status is ${asset.status}; choose an active MediaAsset before production publish.`);
    }
    if (url && !asset.source && !asset.credit) {
      warnings.push(`${label}: media.${slot}.source is missing while media.${slot}.url is set.`);
    }
    if (url && !asset.licenseStatus) {
      warnings.push(`${label}: media.${slot}.licenseStatus is missing while media.${slot}.url is set.`);
    }
    if (url && !asset.usageStatus) {
      warnings.push(`${label}: media.${slot}.usageStatus is missing while media.${slot}.url is set.`);
    }
  }

  const blocks = Array.isArray(getContentBlocks(page)) ? getContentBlocks(page) : [];
  blocks.forEach((block, blockIndex) => {
    const content = block?.content && typeof block.content === 'object' ? block.content : {};
    for (const [key, value] of Object.entries(content)) {
      const lowerKey = key.toLowerCase();
      if (!lowerKey.includes('image') || typeof value !== 'string' || !value.trim()) continue;
      const isImageUrlField = !/(alt|caption|assetid|license|usage|focal|title|source)/i.test(key);
      if (isImageUrlField && !isSafeMediaUrl(value)) {
        warnings.push(`${label}: ContentData.ContentBlocks[${blockIndex}].content.${key} uses an unsafe or unsupported media URL scheme.`);
      }

      const altCandidates = [
        `${key}Alt`,
        `${key}AltText`,
        key.replace(/Image$/i, 'ImageAlt'),
        key.replace(/Image$/i, 'ImageAltText'),
        'alt',
        'image-alt',
      ];
      const hasAlt = altCandidates.some((candidate) => typeof content[candidate] === 'string' && content[candidate].trim());
      if (!hasAlt) {
        warnings.push(`${label}: block ${blockIndex + 1} ${block.type}.${key} has an image URL but no nearby alt text.`);
      }
    }
  });
}

function isSafeMediaUrl(value) {
  const trimmed = stringValue(value).trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;
  if (/^https:\/\//i.test(trimmed)) return true;
  if (/^http:\/\/localhost(?::\d+)?\//i.test(trimmed)) return true;
  return false;
}

function addProductionReadinessWarnings(page, label, warnings) {
  const seo = page?.seo || {};
  const fulfillment = getFulfillment(page);
  const googleAds = getGoogleAds(page);
  const workflow = getWorkflow(page);
  const revision = getRevision(page);
  const staticPublishing = getStaticPublishing(page);
  const template = getTemplateIdentity(page);
  const linking = getLinking(page);
  const schemaControls = getSchemaControls(page);
  const serviceSchema = getServiceSchema(page);
  const formConfig = getFormConfig(page);
  const blocks = Array.isArray(getContentBlocks(page)) ? getContentBlocks(page) : [];

  if (!getTargetKeyword(page)) warnings.push(`${label}: target keyword is missing.`);
  if (!seo.metaTitle) warnings.push(`${label}: seo.metaTitle is missing.`);
  if (!seo.metaDescription) warnings.push(`${label}: seo.metaDescription is missing.`);
  if (!seo.canonicalUrl) warnings.push(`${label}: seo.canonicalUrl is missing.`);
  if (!seo.robots) warnings.push(`${label}: seo.robots is missing.`);
  if (page?.isPublished && !page?.includeInSitemap) warnings.push(`${label}: published page is not included in sitemap.`);
  if (page?.includeInSitemap && !seo.canonicalUrl) warnings.push(`${label}: sitemap page has no canonical URL.`);
  if (page?.sitemapPriority !== undefined && page?.sitemapPriority !== null && (typeof page.sitemapPriority !== 'number' || page.sitemapPriority < 0 || page.sitemapPriority > 1)) {
    warnings.push(`${label}: sitemapPriority should be a number between 0 and 1.`);
  }
  const activeRedirects = getPageRedirects(page).filter((redirect) => redirect.active);
  if (Array.isArray(page?.previousSlugs) && page.previousSlugs.length > 0) {
    const currentSlug = normalizeRedirectSlug(getPageSlug(page));
    const missingCoverage = page.previousSlugs
      .map(normalizeRedirectSlug)
      .filter((previousSlug) => !activeRedirects.some((redirect) => redirect.from === previousSlug && redirect.to === currentSlug));
    if (missingCoverage.length > 0) {
      warnings.push(`${label}: previousSlugs missing active redirect coverage: ${missingCoverage.join(', ')}.`);
    }
  }
  if (seo.canonicalUrl) {
    try {
      const canonicalUrl = new URL(seo.canonicalUrl);
      if (normalizeRedirectSlug(canonicalUrl.pathname) !== normalizeRedirectSlug(getPageSlug(page))) {
        warnings.push(`${label}: canonical URL path does not match current pageSlug.`);
      }
    } catch {
      warnings.push(`${label}: canonical URL could not be parsed for redirect validation.`);
    }
  }
  if (page?.isPublished && workflow.approvedForPublish !== true) {
    warnings.push(`${label}: published page is not marked workflow.approvedForPublish.`);
  }
  if (page?.isPublished && !['approved', 'published'].includes(String(workflow.status || ''))) {
    warnings.push(`${label}: published page should use workflow.status approved or published.`);
  }
  if (page?.isPublished && !String(revision.currentRevisionId || '')) {
    warnings.push(`${label}: published page has no revision.currentRevisionId yet.`);
  }
  if (page?.isPublished && revision.rollbackAvailable !== true) {
    warnings.push(`${label}: published page has no rollback snapshot available yet.`);
  }
  if (page?.isPublished && staticPublishing.staticEligible !== true) {
    warnings.push(`${label}: published page is not marked staticPublishing.staticEligible.`);
  }
  if (staticPublishing.needsRebuild === true) {
    warnings.push(`${label}: staticPublishing.needsRebuild is true.`);
  }
  if (!String(template.templateKey || '')) {
    warnings.push(`${label}: template.templateKey is missing.`);
  }
  if (!String(template.contentModelVersion || '')) {
    warnings.push(`${label}: template.contentModelVersion is missing.`);
  }

  const serviceLike = ['service', 'state-service-hub', 'city-service-area', 'event-use', 'product-intent'].includes(String(template.templateKey || '')) ||
    ['service', 'state', 'city', 'event', 'product'].some((value) => `${page?.MetaData?.pageType || ''} ${getPageSlug(page)}`.toLowerCase().includes(value));
  const productsOffered = Array.isArray(serviceSchema.productsOffered) ? serviceSchema.productsOffered : [];
  const areasServed = Array.isArray(serviceSchema.areasServed) ? serviceSchema.areasServed : [];

  if (serviceLike && !String(serviceSchema.serviceName || '')) warnings.push(`${label}: serviceSchema.serviceName is missing.`);
  if (serviceLike && !String(serviceSchema.serviceType || '')) warnings.push(`${label}: serviceSchema.serviceType is missing.`);
  if (serviceLike && productsOffered.length === 0) warnings.push(`${label}: serviceSchema.productsOffered is empty.`);
  if (['state-service-hub', 'city-service-area'].includes(String(template.templateKey || '')) && areasServed.length === 0) {
    warnings.push(`${label}: serviceSchema.areasServed is empty for a location/service-area page.`);
  }
  if (serviceSchema.publicSchemaEnabled === true && (!String(serviceSchema.serviceName || '') || !String(serviceSchema.serviceType || ''))) {
    warnings.push(`${label}: public Service schema is enabled before serviceName/serviceType are complete.`);
  }

  if (!fulfillment.fulfillmentStatus) warnings.push(`${label}: fulfillment.fulfillmentStatus is missing.`);

  if (
    fulfillment.fulfillmentStatus &&
    fulfillment.fulfillmentStatus !== 'direct_partner_available' &&
    fulfillment.publicDisclosureRequired !== true
  ) {
    warnings.push(`${label}: non-direct fulfillment should set publicDisclosureRequired before launch.`);
  }

  if (googleAds.eligible === true && !seo.metaDescription) {
    warnings.push(`${label}: Google Ads eligible page is missing meta description.`);
  }

  if (googleAds.eligible === true && !hasFormOrCta(page)) {
    warnings.push(`${label}: Google Ads eligible page should include a form or CTA.`);
  }

  if (googleAds.eligible === true && fulfillment.fulfillmentStatus === 'research_only_until_provider_confirmed') {
    warnings.push(`${label}: Google Ads eligible page uses research-only fulfillment; review before launch.`);
  }

  const requiredLinks = Array.isArray(linking.requiredLinks) ? linking.requiredLinks : [];
  if (requiredLinks.length > 0) {
    const contentText = JSON.stringify(page?.ContentData || {});
    for (const requiredLink of requiredLinks) {
      if (String(requiredLink || '') && !contentText.includes(requiredLink)) {
        warnings.push(`${label}: required link "${requiredLink}" was not found in ContentData.`);
      }
    }
  }

  if (blocks.some((block) => block?.type === 'FAQ') && schemaControls.enableFAQSchema === false) {
    warnings.push(`${label}: FAQ block exists but schemaControls.enableFAQSchema is false.`);
  }

  const contactBlocks = blocks.filter((block) => block?.type === 'Contact' || block?.type === 'formBlock');
  const formBlocks = blocks.filter((block) => block?.type === 'formBlock');
  const isContactPage = normalizeSlug(getPageSlug(page)) === 'contact' || String(template.templateKey || '') === 'contact';

  if (isContactPage && formBlocks.length === 0) {
    warnings.push(`${label}: contact page has no visible formBlock.`);
  }

  if (contactBlocks.length > 0 && !String(formConfig.formType || '')) {
    warnings.push(`${label}: contact/formBlock exists but formConfig.formType is missing.`);
  }

  if (contactBlocks.length > 0 && !String(formConfig.domainRoutingKey || '')) {
    warnings.push(`${label}: contact/formBlock exists but formConfig.domainRoutingKey is missing.`);
  }

  if (contactBlocks.length > 0 && !String(formConfig.staticFormEndpointKey || '')) {
    warnings.push(`${label}: contact/formBlock exists but formConfig.staticFormEndpointKey is missing.`);
  }

  for (const block of formBlocks) {
    const content = block?.content && typeof block.content === 'object' ? block.content : {};
    if (!String(content.formKey || '')) warnings.push(`${label}: formBlock is missing formKey.`);
    if (!String(content.staticEndpointRef || '')) warnings.push(`${label}: formBlock ${String(content.id || '')} is missing staticEndpointRef.`);
    if (!String(content.leadRecipientRef || '')) warnings.push(`${label}: formBlock ${String(content.id || '')} is missing leadRecipientRef.`);
    if (!String(content.submitLabel || '')) warnings.push(`${label}: formBlock ${String(content.id || '')} is missing submitLabel.`);
  }

  if (hasFormOrCta(page) && !String(formConfig.conversionGoal || '')) {
    warnings.push(`${label}: form/CTA exists but formConfig.conversionGoal is missing.`);
  }

  addImageAltWarnings(page, label, warnings);
}

function pageFileName(page) {
  return `${getPageSlug(page).replace(/[\\/:*?"<>|]/g, '-')}.json`;
}

async function fetchJson(url, headers, label, { optional = false } = {}) {
  let response;

  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...headers,
      },
    });
  } catch (error) {
    if (optional) {
      return { data: null, warning: `${label} request failed: ${error.message}` };
    }

    throw new Error(`${label} request failed: ${error.message}`);
  }

  if (!response.ok) {
    const message = `${label} returned ${response.status} ${response.statusText}`;
    if (optional) {
      return { data: null, warning: message };
    }

    throw new Error(message);
  }

  return { data: await response.json(), warning: '' };
}

function normalizeSitemapEntries(payload) {
  const pages = Array.isArray(payload) ? payload : payload?.pages ?? [];

  return pages
    .map((entry) => {
      const rawSlug = String(entry?.pageSlug || entry?.PageSlug || entry?.slug || entry?.Slug || '').trim();
      return {
        pageSlug: rawSlug ? normalizeSlug(rawSlug) : '',
        lastModified: entry?.lastModified || entry?.LastModified || '',
      };
    })
    .filter((entry) => Boolean(entry.pageSlug));
}

async function fetchPublishedPages(site) {
  const tenantPath = encodeURIComponent(site.tenantId);
  const authHeaders = { Authorization: `Bearer ${site.apiKey}` };
  const sitemapUrl = `${site.apiUrl}/api/tenant/${tenantPath}/sitemap`;
  const sitemapResult = await fetchJson(sitemapUrl, authHeaders, 'sitemap');
  const sitemapEntries = normalizeSitemapEntries(sitemapResult.data);
  const slugs = [...new Set(sitemapEntries.map((entry) => entry.pageSlug))].sort((a, b) => a.localeCompare(b));
  const pages = [];

  for (const slug of slugs) {
    const pageUrl = `${site.apiUrl}/api/pages/${tenantPath}/${encodeSlugPath(slug)}`;
    const pageResult = await fetchJson(pageUrl, authHeaders, `page ${slug}`);
    pages.push(pageResult.data);
  }

  return pages.filter((page) => page?.isPublished === true);
}

async function fetchAdminPages(site, adminToken) {
  if (!adminToken) {
    throw new Error('CMS_SNAPSHOT_ADMIN_TOKEN or PUMPKIN_ADMIN_JWT is required for --include-unpublished.');
  }

  const url = `${site.apiUrl}/api/admin/pages?tenantId=${encodeURIComponent(site.tenantId)}`;
  const result = await fetchJson(url, { Authorization: `Bearer ${adminToken}` }, 'admin pages');
  return Array.isArray(result.data) ? result.data : result.data?.pages ?? [];
}

async function fetchPagesForSnapshot(site, includeUnpublished, warnings) {
  const adminToken = getAdminToken();

  if (adminToken) {
    const pages = await fetchAdminPages(site, adminToken);
    return includeUnpublished ? pages : pages.filter((page) => page?.isPublished === true);
  }

  if (includeUnpublished) {
    throw new Error('CMS_SNAPSHOT_ADMIN_TOKEN or PUMPKIN_ADMIN_JWT is required for --include-unpublished.');
  }

  warnings.push('Admin JWT was not provided; using sitemap discovery, so published pages excluded from sitemap may not be included.');
  return fetchPublishedPages(site);
}

async function fetchTheme(site) {
  const tenantPath = encodeURIComponent(site.tenantId);
  const adminToken = getAdminToken();

  if (adminToken) {
    const adminUrl = `${site.apiUrl}/api/admin/themes/${tenantPath}/active`;
    return fetchJson(adminUrl, { Authorization: `Bearer ${adminToken}` }, 'admin theme', { optional: true });
  }

  const url = `${site.apiUrl}/api/themes/${tenantPath}`;
  return fetchJson(url, { Authorization: `Bearer ${site.apiKey}` }, 'theme', { optional: true });
}

function writeSnapshot(site, pages, theme, warnings, includeUnpublished, scope = {}) {
  const pagesDir = path.join(site.snapshotRoot, 'pages');
  rmSync(site.snapshotRoot, { recursive: true, force: true });
  mkdirSync(pagesDir, { recursive: true });

  const sortedPages = pages
    .map((page) => stripPublicStaticAdminPayloads(site, page))
    .sort((a, b) => getPageSlug(a).localeCompare(getPageSlug(b)));

  for (const page of sortedPages) {
    writeFileSync(path.join(pagesDir, pageFileName(page)), JSON.stringify(page, null, 2), 'utf8');
  }

  const themeForSnapshot = routeScopedTheme(site, theme, warnings);

  if (themeForSnapshot) {
    writeFileSync(path.join(site.snapshotRoot, 'theme.json'), JSON.stringify(themeForSnapshot, null, 2), 'utf8');
  }

  const manifest = {
    siteKey: site.siteKey,
    tenantId: site.tenantId,
    domain: site.domain,
    source: 'pumpkin-api',
    contentSource: 'cms-snapshot',
    generatedAt: new Date().toISOString(),
    includeUnpublished,
    discoveredPageCount: Number.isFinite(scope.discoveredPageCount) ? scope.discoveredPageCount : sortedPages.length,
    excludedPageSlugs: Array.isArray(scope.excludedSlugs) ? scope.excludedSlugs : [],
    approvedSnapshotSlugs: site.siteKey === 'ice-rink-rentals' ? [...site.expectedSlugs] : undefined,
    pageCount: sortedPages.length,
    publishedCount: sortedPages.filter((page) => page?.isPublished === true).length,
    unpublishedCount: sortedPages.filter((page) => page?.isPublished !== true).length,
    themeSnapshot: Boolean(themeForSnapshot),
    pages: sortedPages.map((page) => ({
      pageSlug: getPageSlug(page),
      title: getPageTitle(page),
      isPublished: page?.isPublished === true,
      includeInSitemap: page?.includeInSitemap === true,
      updatedAt: getUpdatedAt(page),
    })),
    warnings,
  };

  writeFileSync(path.join(site.snapshotRoot, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  return manifest;
}

function walkFiles(rootDir) {
  const files = [];
  const entries = readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function isTextFile(filePath) {
  return textExtensions.has(path.extname(filePath).toLowerCase());
}

function loadSnapshotPages(site, errors) {
  const pagesDir = path.join(site.snapshotRoot, 'pages');

  if (!existsSync(site.snapshotRoot)) {
    errors.push(`Snapshot root was not found: ${site.snapshotRoot}`);
    return [];
  }

  if (!existsSync(pagesDir)) {
    errors.push(`Snapshot pages directory was not found: ${pagesDir}`);
    return [];
  }

  return readdirSync(pagesDir)
    .filter((fileName) => fileName.endsWith('.json'))
    .map((fileName) => ({
      fileName,
      page: readJson(path.join(pagesDir, fileName)),
    }));
}

function scanSnapshotFiles(site, errors) {
  if (!existsSync(site.snapshotRoot)) return 0;

  const files = walkFiles(site.snapshotRoot);

  for (const filePath of files) {
    const fileName = path.basename(filePath);
    const relativePath = toPosix(path.relative(site.snapshotRoot, filePath));

    if (fileName === '.env' || fileName.startsWith('.env.')) {
      errors.push(`Forbidden env file found: ${relativePath}`);
    }

    if (/^appsettings\..*\.json$/i.test(fileName) || fileName === 'appsettings.Development.json') {
      errors.push(`Forbidden appsettings file found: ${relativePath}`);
    }

    if (!isTextFile(filePath)) continue;

    const content = readFileSync(filePath, 'utf8');

    if (content.includes('CMS LIVE')) {
      errors.push(`CMS LIVE marker found in ${relativePath}`);
    }

    for (const { label, pattern } of secretPatterns) {
      if (pattern.test(content)) {
        errors.push(`Possible ${label} found in ${relativePath}`);
      }
    }
  }

  return files.length;
}

function validateSnapshot(site, { allowUnpublished = false } = {}) {
  const errors = [];
  const warnings = [];
  const pages = loadSnapshotPages(site, errors);
  const slugs = new Set();
  const manifestPath = path.join(site.snapshotRoot, 'manifest.json');
  const fileCount = scanSnapshotFiles(site, errors);

  if (existsSync(manifestPath)) {
    const manifest = readJson(manifestPath);
    if (manifest.siteKey !== site.siteKey) errors.push(`manifest.json siteKey must be ${site.siteKey}.`);
    if (manifest.tenantId !== site.tenantId) errors.push(`manifest.json tenantId must be ${site.tenantId}.`);
    if (manifest.contentSource !== 'cms-snapshot') warnings.push('manifest.json contentSource should be cms-snapshot.');
  } else if (existsSync(site.snapshotRoot)) {
    warnings.push('manifest.json is missing.');
  }

  for (const { fileName, page } of pages) {
    const slug = getPageSlug(page);
    const rawSlug = getRawPageSlug(page);
    const label = slug || fileName;

    if (!page?.id) errors.push(`${label}: id is required.`);
    if (!page?.PageId) errors.push(`${label}: PageId is required.`);
    if (page?.tenantId !== site.tenantId) errors.push(`${label}: tenantId must be ${site.tenantId}.`);
    if (!rawSlug) errors.push(`${label}: pageSlug is required.`);
    if (slugs.has(slug)) errors.push(`${label}: duplicate pageSlug.`);
    slugs.add(slug);

    if (!getPageTitle(page)) warnings.push(`${label}: MetaData.title is empty.`);
    if (!page?.seo) warnings.push(`${label}: seo object is missing.`);
    if (!Array.isArray(getContentBlocks(page))) {
      errors.push(`${label}: ContentData.ContentBlocks must be an array.`);
    } else {
      const designValidation = validateContentBlocksDesignSystem(getContentBlocks(page));
      for (const issue of designValidation.errors) {
        errors.push(`${label}: ${issue.message}`);
      }
      for (const issue of designValidation.warnings) {
        warnings.push(`${label}: ${issue.message}`);
      }
    }
    if (typeof page?.isPublished !== 'boolean') errors.push(`${label}: isPublished must be boolean.`);
    if (typeof page?.includeInSitemap !== 'boolean') errors.push(`${label}: includeInSitemap must be boolean.`);
    if (!allowUnpublished && page?.isPublished !== true) errors.push(`${label}: unpublished pages are not allowed by default.`);

    const canonical = getCanonicalUrl(page);
    if (canonical && !canonical.startsWith(`https://${site.domain}`)) {
      errors.push(`${label}: canonicalUrl must use https://${site.domain}.`);
    }

    addProductionStaticGates(site, page, label, warnings);
    addProductionReadinessWarnings(page, label, warnings);
  }

  for (const slug of site.expectedSlugs || []) {
    if (!slugs.has(slug)) errors.push(`Missing expected slug: ${slug}.`);
  }

  const approvedSlugs = getApprovedSnapshotSlugs(site);
  if (approvedSlugs) {
    for (const slug of slugs) {
      if (!approvedSlugs.has(slug)) {
        errors.push(`Non-approved Ice static slug is present in CMS snapshot: ${slug}.`);
      }
    }
  }

  for (const slug of site.obsoleteSlugs || []) {
    if (slugs.has(slug)) {
      errors.push(`Obsolete Ice launch slug is still present in CMS snapshot: ${slug}.`);
    }
  }

  if (pages.length === 0 && errors.length === 0) {
    errors.push('Snapshot must contain at least one page.');
  }

  const themePath = path.join(site.snapshotRoot, 'theme.json');
  if (existsSync(themePath)) {
    const theme = readJson(themePath);
    const designValidation = validateThemeDesignSystem(theme.designSystem, site.tenantId);
    for (const issue of designValidation.errors) {
      errors.push(`theme.json: ${issue.message}`);
    }
    for (const issue of designValidation.warnings) {
      warnings.push(`theme.json: ${issue.message}`);
    }

    const navigationValidation = validateThemeNavigation(theme.menu || [], {
      path: 'theme.menu',
      approvedRoutes: site.siteKey === 'ice-rink-rentals' ? [...ICE_LAUNCH_NAVIGATION_ROUTES] : undefined,
      requireRoutes: site.siteKey === 'ice-rink-rentals' ? [...ICE_LAUNCH_NAVIGATION_ROUTES] : undefined,
    });
    for (const issue of navigationValidation.errors) {
      errors.push(`theme.json: ${issue.message}`);
    }
    for (const issue of navigationValidation.warnings) {
      warnings.push(`theme.json: ${issue.message}`);
    }
  }

  return {
    ok: errors.length === 0,
    siteKey: site.siteKey,
    tenantId: site.tenantId,
    snapshotRoot: site.snapshotRoot,
    pageCount: pages.length,
    fileCount,
    errors,
    warnings,
  };
}

async function runSnapshot() {
  const site = getSiteContext({ requireApiKey: true });
  const includeUnpublished = args['include-unpublished'] === true;
  const warnings = [];
  const discoveredPages = await fetchPagesForSnapshot(site, includeUnpublished, warnings);
  const routeScope = applySnapshotRouteScope(site, discoveredPages, warnings);
  const pages = routeScope.pages;
  const themeResult = await fetchTheme(site);

  if (themeResult.warning) {
    warnings.push(themeResult.warning);
  }

  const manifest = writeSnapshot(site, pages, themeResult.data, warnings, includeUnpublished, {
    discoveredPageCount: discoveredPages.length,
    excludedSlugs: routeScope.excludedSlugs,
  });
  const validation = validateSnapshot(site, { allowUnpublished: includeUnpublished });

  console.log(JSON.stringify({
    ok: validation.ok,
    command: 'snapshot',
    siteKey: site.siteKey,
    tenantId: site.tenantId,
    contentSource: 'cms-snapshot',
    snapshotRoot: site.snapshotRoot,
    pageCount: manifest.pageCount,
    publishedCount: manifest.publishedCount,
    unpublishedCount: manifest.unpublishedCount,
    themeSnapshot: manifest.themeSnapshot,
    warnings: [...warnings, ...validation.warnings],
    errors: validation.errors,
  }, null, 2));

  if (!validation.ok) {
    process.exit(1);
  }
}

function runValidate() {
  const site = getSiteContext({ requireApiKey: false });
  const allowUnpublished = args['allow-unpublished'] === true;
  const validation = validateSnapshot(site, { allowUnpublished });
  console.log(JSON.stringify(validation, null, 2));

  if (!validation.ok) {
    process.exit(1);
  }
}

async function main() {
  try {
    if (command === 'snapshot') {
      await runSnapshot();
      return;
    }

    if (command === 'validate') {
      runValidate();
      return;
    }

    throw new Error(`Unknown command: ${command}`);
  } catch (error) {
    fail(error.message);
    process.exit(1);
  }
}

main();
