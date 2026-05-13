import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const seedRoot = path.join(toolRoot, 'seed');
const expectedSlugs = ['home', 'ice-rink-rentals', 'events-holiday-activations', 'contact'];
const tenantId = 'ice-rink-rentals';
const errors = [];
const warnings = [];

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

async function readJson(relativePath) {
  const absolutePath = path.join(toolRoot, relativePath);
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
      fail(`${relativePath} contains forbidden ${label}.`);
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

  if (page.tenantId !== tenantId) {
    fail(`${relativePath} tenantId must be ${tenantId}.`);
  }

  if (!expectedSlugs.includes(page.pageSlug)) {
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

async function main() {
  const tenant = await readJson('seed/tenant.template.json');
  scanRaw('seed/tenant.template.json', tenant.raw.replace('__ICE_RINK_RENTALS_API_HASH__', ''));

  if (tenant.data.apiKeyHash !== '__ICE_RINK_RENTALS_API_HASH__') {
    fail('tenant.template.json apiKeyHash must remain __ICE_RINK_RENTALS_API_HASH__.');
  }

  if (tenant.data.apiKey && tenant.data.apiKey.trim()) {
    fail('tenant.template.json apiKey must remain empty.');
  }

  if (tenant.data.tenantId !== tenantId || tenant.data.id !== tenantId) {
    fail(`tenant.template.json must use id and tenantId ${tenantId}.`);
  }

  const theme = await readJson('seed/theme.json');
  scanRaw('seed/theme.json', theme.raw);
  if (theme.data.tenantId !== tenantId) {
    fail(`theme.json tenantId must be ${tenantId}.`);
  }
  if (theme.data.isActive !== true) {
    fail('theme.json must have isActive: true.');
  }

  const pagesDir = path.join(seedRoot, 'pages');
  const pageFiles = (await readdir(pagesDir)).filter((file) => file.endsWith('.json')).sort();
  const seenSlugs = new Set();

  for (const pageFile of pageFiles) {
    const relativePath = `seed/pages/${pageFile}`;
    const page = await readJson(relativePath);
    scanRaw(relativePath, page.raw);
    validatePage(page.data, relativePath);
    if (page.data.pageSlug) {
      seenSlugs.add(page.data.pageSlug);
    }
  }

  for (const slug of expectedSlugs) {
    if (!seenSlugs.has(slug)) {
      fail(`Missing expected page slug ${slug}.`);
    }
  }

  for (const slug of seenSlugs) {
    if (!expectedSlugs.includes(slug)) {
      fail(`Unexpected page slug ${slug}.`);
    }
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

  console.log('Seed validation passed.');
  console.log(`Validated tenant template, theme, and ${pageFiles.length} page documents.`);
}

main().catch((error) => {
  console.error('Seed validation crashed.');
  console.error(error);
  process.exit(1);
});
