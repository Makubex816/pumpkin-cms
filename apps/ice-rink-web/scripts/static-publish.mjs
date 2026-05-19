import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import path from 'path';
import process from 'process';

const siteDefinitions = {
  'ice-rink-rentals': {
    domain: 'iceskatingrinkrentals.com',
    expectedSlugs: ['home', 'ice-rink-rentals', 'contact'],
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
      return `  <url>
    <loc>${escapeXml(buildPageUrl(site, page.pageSlug))}</loc>
    <lastmod>${new Date(lastModified).toISOString().split('T')[0]}</lastmod>
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
  }

  for (const slug of site.expectedSlugs) {
    if (!slugs.has(slug)) errors.push(`Missing expected slug: ${slug}.`);
  }

  return { errors, warnings };
}

function writeStaticArtifacts(site, pages, targetDir) {
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
  writeStaticArtifacts(site, pages, artifactDir);
  let outputSnapshot = false;

  if (command === 'generate') {
    const outDir = path.join(appRoot, 'out');
    if (existsSync(outDir)) {
      writeStaticArtifacts(site, pages, outDir);
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
    artifactDir,
    outputSnapshot,
  }, null, 2));
}

run();
