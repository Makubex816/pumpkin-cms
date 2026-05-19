import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import path from 'path';
import process from 'process';

const siteDefinitions = {
  'ice-rink-rentals': {
    domain: 'iceskatingrinkrentals.com',
    expectedSlugs: ['home', 'ice-rink-rentals', 'events-holiday-activations', 'contact'],
  },
  'roller-rink-rentals': {
    domain: 'rollerrinkrentals.com',
    expectedSlugs: ['home', 'roller-rink-rentals', 'contact'],
  },
};

const command = process.argv[2] || 'validate';
const siteKey = process.env.STATIC_SITE_KEY || process.env.SITE_KEY || '';
const contentSource = process.env.STATIC_CONTENT_SOURCE || 'seed-sites';
const appRoot = process.cwd();
const repoRoot = path.resolve(appRoot, '../..');

function fail(message) {
  console.error(`[static-publish] ${message}`);
  process.exitCode = 1;
}

function getSite() {
  const site = siteDefinitions[siteKey];
  if (!site) {
    fail('SITE_KEY or STATIC_SITE_KEY must be ice-rink-rentals or roller-rink-rentals.');
    return null;
  }

  return site;
}

function getSiteRoot() {
  if (contentSource === 'seed-sites') {
    return path.join(repoRoot, 'tools', 'ice-rink-local-seed', 'seed-sites', siteKey);
  }

  if (contentSource === 'cms-snapshot') {
    return path.join(appRoot, '.static-content-snapshots', siteKey);
  }

  if (process.env.STATIC_CONTENT_DIR) {
    return path.resolve(appRoot, process.env.STATIC_CONTENT_DIR, siteKey);
  }

  return path.join(appRoot, '.static-content', siteKey);
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function loadPages() {
  const siteRoot = getSiteRoot();
  const pagesDir = path.join(siteRoot, 'pages');

  if (!existsSync(siteRoot)) {
    fail(`Static content root was not found: ${siteRoot}`);
    return [];
  }

  if (!existsSync(pagesDir)) {
    fail(`Static pages directory was not found: ${pagesDir}`);
    return [];
  }

  return readdirSync(pagesDir)
    .filter((fileName) => fileName.endsWith('.json'))
    .map((fileName) => ({
      fileName,
      page: readJson(path.join(pagesDir, fileName)),
    }))
    .sort((a, b) => String(a.page.pageSlug).localeCompare(String(b.page.pageSlug)));
}

function buildPageUrl(site, slug) {
  if (!slug || slug === 'home') return `https://${site.domain}`;
  return `https://${site.domain}/${slug}`;
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateSitemapXml(site, pages) {
  const urls = pages
    .filter(({ page }) => page.isPublished && page.includeInSitemap)
    .map(({ page }) => {
      const lastModified = page.MetaData?.updatedAt || page.publishedAt || new Date().toISOString();
      const changeFrequency = page.sitemapChangeFrequency ? `\n    <changefreq>${escapeXml(page.sitemapChangeFrequency)}</changefreq>` : '';
      const priority = typeof page.sitemapPriority === 'number' ? `\n    <priority>${page.sitemapPriority.toFixed(1)}</priority>` : '';
      return `  <url>
    <loc>${escapeXml(buildPageUrl(site, page.pageSlug))}</loc>
    <lastmod>${new Date(lastModified).toISOString().split('T')[0]}</lastmod>${changeFrequency}${priority}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function generateRobotsTxt(site) {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: https://${site.domain}/sitemap.xml`,
    '',
  ].join('\n');
}

function stringValue(value) {
  return typeof value === 'string' ? value : '';
}

function getTargetKeyword(page) {
  return stringValue(page.MetaData?.keyword) || stringValue(page.searchData?.keyword);
}

function getFulfillment(page) {
  return page.fulfillment && typeof page.fulfillment === 'object' ? page.fulfillment : {};
}

function getGoogleAds(page) {
  return page.googleAds && typeof page.googleAds === 'object' ? page.googleAds : {};
}

function getMedia(page) {
  return page.media && typeof page.media === 'object' ? page.media : {};
}

function hasFormOrCta(page) {
  const blocks = Array.isArray(page.ContentData?.ContentBlocks) ? page.ContentData.ContentBlocks : [];
  return blocks.some((block) => block.type === 'Contact' || block.type === 'PrimaryCTA');
}

function addImageAltWarnings(page, label, warnings) {
  const media = getMedia(page);
  for (const [slot, asset] of Object.entries(media)) {
    if (!asset || typeof asset !== 'object') continue;
    if (stringValue(asset.url) && !stringValue(asset.alt) && asset.decorative !== true) {
      warnings.push(`${label}: media.${slot}.alt is missing while media.${slot}.url is set.`);
    }
  }

  const blocks = Array.isArray(page.ContentData?.ContentBlocks) ? page.ContentData.ContentBlocks : [];
  blocks.forEach((block, blockIndex) => {
    const content = block.content && typeof block.content === 'object' ? block.content : {};
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
      const hasAlt = altCandidates.some((candidate) => stringValue(content[candidate]).trim());
      if (!hasAlt) {
        warnings.push(`${label}: block ${blockIndex + 1} ${block.type}.${key} has an image URL but no nearby alt text.`);
      }
    }
  });
}

function addProductionReadinessWarnings(page, label, warnings) {
  const seo = page.seo || {};
  const fulfillment = getFulfillment(page);
  const googleAds = getGoogleAds(page);

  if (!getTargetKeyword(page)) warnings.push(`${label}: target keyword is missing.`);
  if (!stringValue(seo.metaTitle)) warnings.push(`${label}: seo.metaTitle is missing.`);
  if (!stringValue(seo.metaDescription)) warnings.push(`${label}: seo.metaDescription is missing.`);
  if (!stringValue(seo.canonicalUrl)) warnings.push(`${label}: seo.canonicalUrl is missing.`);
  if (!stringValue(seo.robots)) warnings.push(`${label}: seo.robots is missing.`);
  if (page.isPublished && !page.includeInSitemap) warnings.push(`${label}: published page is not included in sitemap.`);
  if (page.includeInSitemap && !stringValue(seo.canonicalUrl)) warnings.push(`${label}: sitemap page has no canonical URL.`);
  if (page.sitemapPriority !== undefined && page.sitemapPriority !== null && (typeof page.sitemapPriority !== 'number' || page.sitemapPriority < 0 || page.sitemapPriority > 1)) {
    warnings.push(`${label}: sitemapPriority should be a number between 0 and 1.`);
  }
  if (!stringValue(fulfillment.fulfillmentStatus)) warnings.push(`${label}: fulfillment.fulfillmentStatus is missing.`);

  if (
    stringValue(fulfillment.fulfillmentStatus) &&
    fulfillment.fulfillmentStatus !== 'direct_partner_available' &&
    fulfillment.publicDisclosureRequired !== true
  ) {
    warnings.push(`${label}: non-direct fulfillment should set publicDisclosureRequired before launch.`);
  }

  if (googleAds.eligible === true && !stringValue(seo.metaDescription)) {
    warnings.push(`${label}: Google Ads eligible page is missing meta description.`);
  }

  if (googleAds.eligible === true && !hasFormOrCta(page)) {
    warnings.push(`${label}: Google Ads eligible page should include a form or CTA.`);
  }

  if (googleAds.eligible === true && fulfillment.fulfillmentStatus === 'research_only_until_provider_confirmed') {
    warnings.push(`${label}: Google Ads eligible page uses research-only fulfillment; review before launch.`);
  }

  addImageAltWarnings(page, label, warnings);
}

function validatePageShape(site, pages) {
  const errors = [];
  const warnings = [];
  const slugs = new Set();

  for (const { fileName, page } of pages) {
    const label = page.pageSlug || fileName;
    const expectedFileName = `${page.pageSlug}.json`;

    if (!page.id) errors.push(`${label}: id is required.`);
    if (!page.PageId) errors.push(`${label}: PageId is required.`);
    if (page.tenantId !== siteKey) errors.push(`${label}: tenantId must be ${siteKey}.`);
    if (!page.pageSlug) errors.push(`${label}: pageSlug is required.`);
    if (fileName !== expectedFileName) warnings.push(`${label}: file name does not match pageSlug.`);
    if (slugs.has(page.pageSlug)) errors.push(`${label}: duplicate pageSlug.`);
    slugs.add(page.pageSlug);

    if (!page.MetaData?.title) warnings.push(`${label}: MetaData.title is empty.`);
    if (!page.seo) warnings.push(`${label}: seo object is missing.`);
    if (!Array.isArray(page.ContentData?.ContentBlocks)) {
      errors.push(`${label}: ContentData.ContentBlocks must be an array.`);
    }
    if (typeof page.isPublished !== 'boolean') errors.push(`${label}: isPublished must be boolean.`);
    if (typeof page.includeInSitemap !== 'boolean') errors.push(`${label}: includeInSitemap must be boolean.`);

    const canonical = page.seo?.canonicalUrl || '';
    if (canonical && !canonical.startsWith(`https://${site.domain}`)) {
      errors.push(`${label}: canonicalUrl must use https://${site.domain}.`);
    }

    if (JSON.stringify(page).includes('CMS LIVE')) {
      errors.push(`${label}: contains CMS LIVE marker.`);
    }

    addProductionReadinessWarnings(page, label, warnings);
  }

  for (const slug of site.expectedSlugs) {
    if (!slugs.has(slug)) errors.push(`Missing expected slug: ${slug}.`);
  }

  return { errors, warnings };
}

function writeStaticArtifacts(site, pages, targetDir, qualityWarnings = []) {
  mkdirSync(targetDir, { recursive: true });
  writeFileSync(path.join(targetDir, 'sitemap.xml'), generateSitemapXml(site, pages), 'utf8');
  writeFileSync(path.join(targetDir, 'robots.txt'), generateRobotsTxt(site), 'utf8');
  writeFileSync(
    path.join(targetDir, 'static-publish-manifest.json'),
    JSON.stringify({
      siteKey,
      domain: site.domain,
      generatedAt: new Date().toISOString(),
      contentSource,
      pageCount: pages.length,
      qualityWarnings,
      pages: pages.map(({ page }) => ({
        pageSlug: page.pageSlug,
        isPublished: page.isPublished,
        includeInSitemap: page.includeInSitemap,
      })),
    }, null, 2),
    'utf8',
  );
}

function copyStaticOutput(siteArtifactDir) {
  const outDir = path.join(appRoot, 'out');
  const outputSnapshotDir = path.join(siteArtifactDir, 'out');

  if (!existsSync(outDir)) {
    console.warn('[static-publish] Warning: out directory not found; wrote validation artifacts only.');
    return false;
  }

  rmSync(outputSnapshotDir, { recursive: true, force: true });
  cpSync(outDir, outputSnapshotDir, { recursive: true });
  return true;
}

function run() {
  const site = getSite();
  if (!site) return;

  const pages = loadPages();
  const { errors, warnings } = validatePageShape(site, pages);
  const publishedCount = pages.filter(({ page }) => page.isPublished).length;
  const sitemapCount = pages.filter(({ page }) => page.isPublished && page.includeInSitemap).length;

  for (const warning of warnings) {
    console.warn(`[static-publish] Warning: ${warning}`);
  }

  for (const error of errors) {
    console.error(`[static-publish] Error: ${error}`);
  }

  if (errors.length > 0) {
    process.exitCode = 1;
    return;
  }

  const artifactDir = path.join(appRoot, '.static-artifacts', siteKey);
  writeStaticArtifacts(site, pages, artifactDir, warnings);
  let outputSnapshot = false;

  if (command === 'generate') {
    const outDir = path.join(appRoot, 'out');
    if (existsSync(outDir)) {
      writeStaticArtifacts(site, pages, outDir, warnings);
    }
    outputSnapshot = copyStaticOutput(artifactDir);
  } else if (command !== 'validate') {
    fail(`Unknown command: ${command}`);
    return;
  }

  console.log(JSON.stringify({
    ok: true,
    command,
    siteKey,
    domain: site.domain,
    contentSource,
    pageCount: pages.length,
    publishedCount,
    sitemapCount,
    warningCount: warnings.length,
    artifactDir,
    outputSnapshot,
  }, null, 2));
}

run();
