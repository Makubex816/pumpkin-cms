import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const defaultSiteKey = 'ice-rink-rentals';
const siteKey = process.env.SITE_KEY?.trim() || defaultSiteKey;
const seedSitesRoot = path.join(toolRoot, 'seed-sites');
const siteSeedRoot = path.join(seedSitesRoot, siteKey);
const errors = [];
const warnings = [];

const siteConfigs = {
  'ice-rink-rentals': {
    tenantId: 'ice-rink-rentals',
    hashPlaceholder: '__ICE_RINK_RENTALS_API_HASH__',
    expectedSlugs: ['home', 'ice-rink-rentals', 'events-holiday-activations', 'contact'],
    themeFile: 'theme.json',
    placeholderOnly: false,
  },
  'second-product-rentals': {
    tenantId: 'second-product-rentals',
    hashPlaceholder: '__SECOND_PRODUCT_API_HASH__',
    expectedSlugs: ['home', 'second-product-rentals', 'contact'],
    themeFile: 'theme.json',
    placeholderOnly: false,
  },
};

const siteConfig = siteConfigs[siteKey];

const forbiddenPatterns = [
  { label: 'CMS LIVE marker', pattern: /CMS LIVE:/i },
  { label: 'Cosmos connection string endpoint', pattern: /AccountEndpoint\s*=/i },
  { label: 'Cosmos account key', pattern: /AccountKey\s*=/i },
  { label: 'Mongo connection string', pattern: /mongodb(?:\+srv)?:\/\//i },
  { label: 'BCrypt hash', pattern: /\$2[aby]\$\d{2}\$/ },
  { label: 'JWT-like token', pattern: /eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/ },
];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

async function pathExists(absolutePath) {
  try {
    await access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(relativePath) {
  const absolutePath = path.join(siteSeedRoot, relativePath);
  const raw = await readFile(absolutePath, 'utf8');
  return {
    absolutePath,
    raw,
    data: JSON.parse(raw),
  };
}

function scanRaw(relativePath, raw) {
  for (const { label, pattern } of forbiddenPatterns) {
    if (pattern.test(raw)) {
      fail(`seed-sites/${siteKey}/${relativePath} contains forbidden ${label}.`);
    }
  }
}

function requireString(page, field, label) {
  if (!page[field] || typeof page[field] !== 'string') {
    fail(`${label} is missing required string field ${field}.`);
  }
}

function validatePage(page, relativePath) {
  requireString(page, 'id', relativePath);
  requireString(page, 'PageId', relativePath);
  requireString(page, 'tenantId', relativePath);
  requireString(page, 'pageSlug', relativePath);

  if (page.tenantId !== siteConfig.tenantId) {
    fail(`${relativePath} tenantId must be ${siteConfig.tenantId}.`);
  }

  if (!siteConfig.expectedSlugs.includes(page.pageSlug)) {
    fail(`${relativePath} has unexpected pageSlug ${page.pageSlug}.`);
  }

  if (page.isPublished !== true) {
    fail(`${relativePath} must have isPublished: true.`);
  }

  if (page.includeInSitemap !== true) {
    fail(`${relativePath} must have includeInSitemap: true.`);
  }

  if (!page.seo || typeof page.seo !== 'object') {
    fail(`${relativePath} is missing seo.`);
  }

  const blocks = page.ContentData?.ContentBlocks;
  if (!Array.isArray(blocks) || blocks.length === 0) {
    fail(`${relativePath} is missing ContentData.ContentBlocks.`);
  }

  if (page.PageId !== page.id) {
    warn(`${relativePath} PageId and id differ; this is allowed but unusual for the local seed.`);
  }
}

async function collectFiles(rootPath) {
  const entries = await readdir(rootPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolutePath)));
    } else {
      files.push(absolutePath);
    }
  }

  return files;
}

async function validatePlaceholderSite() {
  const files = await collectFiles(siteSeedRoot);

  for (const absolutePath of files) {
    const relativePath = path.relative(siteSeedRoot, absolutePath).replaceAll(path.sep, '/');
    const raw = await readFile(absolutePath, 'utf8');
    scanRaw(relativePath, raw.replace(siteConfig.hashPlaceholder, ''));
  }

  const tenant = await readJson('tenant.template.json');
  if (tenant.data.apiKeyHash !== siteConfig.hashPlaceholder) {
    fail(`tenant.template.json apiKeyHash must remain ${siteConfig.hashPlaceholder}.`);
  }

  if (tenant.data.apiKey && tenant.data.apiKey.trim()) {
    fail('tenant.template.json apiKey must remain empty.');
  }

  if (tenant.data.tenantId !== siteConfig.tenantId || tenant.data.id !== siteConfig.tenantId) {
    fail(`tenant.template.json must use id and tenantId ${siteConfig.tenantId}.`);
  }

  const theme = await readJson(siteConfig.themeFile);
  if (theme.data.tenantId !== siteConfig.tenantId) {
    fail(`${siteConfig.themeFile} tenantId must be ${siteConfig.tenantId}.`);
  }

  const pagesDir = path.join(siteSeedRoot, 'pages');
  const pageFiles = (await readdir(pagesDir)).filter((file) => file.endsWith('.json'));
  if (pageFiles.length > 0) {
    fail('second-product-rentals is placeholder-only and must not contain page JSON yet.');
  }
}

async function validateSeedableSite() {
  const tenant = await readJson('tenant.template.json');
  scanRaw('tenant.template.json', tenant.raw.replace(siteConfig.hashPlaceholder, ''));

  if (tenant.data.apiKeyHash !== siteConfig.hashPlaceholder) {
    fail(`tenant.template.json apiKeyHash must remain ${siteConfig.hashPlaceholder}.`);
  }

  if (tenant.data.apiKey && tenant.data.apiKey.trim()) {
    fail('tenant.template.json apiKey must remain empty.');
  }

  if (tenant.data.tenantId !== siteConfig.tenantId || tenant.data.id !== siteConfig.tenantId) {
    fail(`tenant.template.json must use id and tenantId ${siteConfig.tenantId}.`);
  }

  const theme = await readJson(siteConfig.themeFile);
  scanRaw(siteConfig.themeFile, theme.raw);
  if (theme.data.tenantId !== siteConfig.tenantId) {
    fail(`${siteConfig.themeFile} tenantId must be ${siteConfig.tenantId}.`);
  }
  if (theme.data.isActive !== true) {
    fail(`${siteConfig.themeFile} must have isActive: true.`);
  }

  const pagesDir = path.join(siteSeedRoot, 'pages');
  const pageFiles = (await readdir(pagesDir)).filter((file) => file.endsWith('.json')).sort();
  const seenSlugs = new Set();

  for (const pageFile of pageFiles) {
    const relativePath = `pages/${pageFile}`;
    const page = await readJson(relativePath);
    scanRaw(relativePath, page.raw);
    validatePage(page.data, relativePath);
    if (page.data.pageSlug) {
      seenSlugs.add(page.data.pageSlug);
    }
  }

  for (const slug of siteConfig.expectedSlugs) {
    if (!seenSlugs.has(slug)) {
      fail(`Missing expected page slug ${slug}.`);
    }
  }

  for (const slug of seenSlugs) {
    if (!siteConfig.expectedSlugs.includes(slug)) {
      fail(`Unexpected page slug ${slug}.`);
    }
  }

  return pageFiles.length;
}

async function main() {
  let pageCount = 0;

  if (!siteConfig) {
    fail(`Unsupported SITE_KEY ${siteKey}. Add a site config before validating this seed set.`);
  } else if (!(await pathExists(siteSeedRoot))) {
    fail(`Missing seed folder for SITE_KEY ${siteKey}: ${siteSeedRoot}`);
  } else if (siteConfig.placeholderOnly) {
    await validatePlaceholderSite();
  } else {
    pageCount = await validateSeedableSite();
  }

  if (warnings.length > 0) {
    console.warn('Seed validation warnings:');
    for (const message of warnings) console.warn(`- ${message}`);
  }

  if (errors.length > 0) {
    console.error('Seed validation failed:');
    for (const message of errors) console.error(`- ${message}`);
    process.exit(1);
  }

  console.log(`Seed validation passed for SITE_KEY=${siteKey}.`);
  if (siteConfig?.placeholderOnly) {
    console.log('Validated placeholder-safe tenant/theme structure. No page JSON is present for this placeholder site yet.');
  } else {
    console.log(`Validated tenant template, theme, and ${pageCount} page documents.`);
  }
}

main().catch((error) => {
  console.error('Seed validation crashed.');
  console.error(error);
  process.exit(1);
});
