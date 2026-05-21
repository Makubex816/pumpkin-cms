import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

const siteDefinitions = {
  'ice-rink-rentals': {
    domain: 'iceskatingrinkrentals.com',
    tenantEnv: 'ICE_RINK_RENTALS_TENANT_ID',
    apiKeyEnv: 'ICE_RINK_RENTALS_API_KEY',
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
  return blocks.some((block) => block?.type === 'Contact' || block?.type === 'PrimaryCTA');
}

function addImageAltWarnings(page, label, warnings) {
  const media = getMedia(page);
  for (const [slot, asset] of Object.entries(media)) {
    if (!asset || typeof asset !== 'object') continue;
    if (asset.url && !asset.alt && asset.decorative !== true) {
      warnings.push(`${label}: media.${slot}.alt is missing while media.${slot}.url is set.`);
    }
    if (asset.url && !asset.assetId) {
      warnings.push(`${label}: media.${slot}.assetId is missing; register or reference a MediaAsset before production publish.`);
    }
    if (asset.url && !asset.source) {
      warnings.push(`${label}: media.${slot}.source is missing while media.${slot}.url is set.`);
    }
    if (asset.url && !asset.licenseStatus) {
      warnings.push(`${label}: media.${slot}.licenseStatus is missing while media.${slot}.url is set.`);
    }
    if (asset.url && !asset.usageStatus) {
      warnings.push(`${label}: media.${slot}.usageStatus is missing while media.${slot}.url is set.`);
    }
  }

  const blocks = Array.isArray(getContentBlocks(page)) ? getContentBlocks(page) : [];
  blocks.forEach((block, blockIndex) => {
    const content = block?.content && typeof block.content === 'object' ? block.content : {};
    for (const [key, value] of Object.entries(content)) {
      if (!key.toLowerCase().includes('image') || typeof value !== 'string' || !value.trim()) continue;

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

  if (blocks.some((block) => block?.type === 'Contact') && !String(formConfig.formType || '')) {
    warnings.push(`${label}: Contact block exists but formConfig.formType is missing.`);
  }

  if (blocks.some((block) => block?.type === 'Contact') && !String(formConfig.domainRoutingKey || '')) {
    warnings.push(`${label}: Contact block exists but formConfig.domainRoutingKey is missing.`);
  }

  if (blocks.some((block) => block?.type === 'Contact') && !String(formConfig.staticFormEndpointKey || '')) {
    warnings.push(`${label}: Contact block exists but formConfig.staticFormEndpointKey is missing.`);
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
  const adminToken = process.env.CMS_SNAPSHOT_ADMIN_TOKEN || process.env.PUMPKIN_ADMIN_JWT || '';

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
  const url = `${site.apiUrl}/api/themes/${tenantPath}`;
  return fetchJson(url, { Authorization: `Bearer ${site.apiKey}` }, 'theme', { optional: true });
}

function writeSnapshot(site, pages, theme, warnings, includeUnpublished) {
  const pagesDir = path.join(site.snapshotRoot, 'pages');
  rmSync(site.snapshotRoot, { recursive: true, force: true });
  mkdirSync(pagesDir, { recursive: true });

  const sortedPages = [...pages].sort((a, b) => getPageSlug(a).localeCompare(getPageSlug(b)));

  for (const page of sortedPages) {
    writeFileSync(path.join(pagesDir, pageFileName(page)), JSON.stringify(page, null, 2), 'utf8');
  }

  if (theme) {
    writeFileSync(path.join(site.snapshotRoot, 'theme.json'), JSON.stringify(theme, null, 2), 'utf8');
  }

  const manifest = {
    siteKey: site.siteKey,
    tenantId: site.tenantId,
    domain: site.domain,
    source: 'pumpkin-api',
    contentSource: 'cms-snapshot',
    generatedAt: new Date().toISOString(),
    includeUnpublished,
    pageCount: sortedPages.length,
    publishedCount: sortedPages.filter((page) => page?.isPublished === true).length,
    unpublishedCount: sortedPages.filter((page) => page?.isPublished !== true).length,
    themeSnapshot: Boolean(theme),
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
    }
    if (typeof page?.isPublished !== 'boolean') errors.push(`${label}: isPublished must be boolean.`);
    if (typeof page?.includeInSitemap !== 'boolean') errors.push(`${label}: includeInSitemap must be boolean.`);
    if (!allowUnpublished && page?.isPublished !== true) errors.push(`${label}: unpublished pages are not allowed by default.`);

    const canonical = getCanonicalUrl(page);
    if (canonical && !canonical.startsWith(`https://${site.domain}`)) {
      errors.push(`${label}: canonicalUrl must use https://${site.domain}.`);
    }

    addProductionReadinessWarnings(page, label, warnings);
  }

  if (pages.length === 0 && errors.length === 0) {
    errors.push('Snapshot must contain at least one page.');
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
  const pages = await fetchPagesForSnapshot(site, includeUnpublished, warnings);
  const themeResult = await fetchTheme(site);

  if (themeResult.warning) {
    warnings.push(themeResult.warning);
  }

  const manifest = writeSnapshot(site, pages, themeResult.data, warnings, includeUnpublished);
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
