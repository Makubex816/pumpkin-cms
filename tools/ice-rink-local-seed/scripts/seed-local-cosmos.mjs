import { CosmosClient } from '@azure/cosmos';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const defaultSiteKey = 'ice-rink-rentals';
const siteKey = process.env.SITE_KEY?.trim() || defaultSiteKey;
const seedSitesRoot = path.join(toolRoot, 'seed-sites');

const siteConfigs = {
  'ice-rink-rentals': {
    tenantId: 'ice-rink-rentals',
    apiHashEnv: 'ICE_RINK_RENTALS_API_HASH',
    hashPlaceholder: '__ICE_RINK_RENTALS_API_HASH__',
    seedable: true,
  },
  'second-product-rentals': {
    tenantId: 'second-product-rentals',
    apiHashEnv: 'SECOND_PRODUCT_API_HASH',
    hashPlaceholder: '__SECOND_PRODUCT_API_HASH__',
    seedable: true,
  },
};

const siteConfig = siteConfigs[siteKey];
const siteSeedRoot = path.join(seedSitesRoot, siteKey);

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable ${name}.`);
  }
  return value;
}

async function readJson(relativePath) {
  const raw = await readFile(path.join(siteSeedRoot, relativePath), 'utf8');
  return JSON.parse(raw);
}

async function readTenantTemplate(apiHash) {
  const raw = await readFile(path.join(siteSeedRoot, 'tenant.template.json'), 'utf8');
  if (!raw.includes(siteConfig.hashPlaceholder)) {
    throw new Error('tenant.template.json is missing the API hash placeholder.');
  }

  const tenant = JSON.parse(raw.replace(siteConfig.hashPlaceholder, apiHash));
  if (tenant.apiKeyHash === siteConfig.hashPlaceholder || !tenant.apiKeyHash) {
    throw new Error('Tenant API hash replacement failed.');
  }

  return tenant;
}

function assertTenantScoped(item, label) {
  if (!item || item.tenantId !== siteConfig.tenantId) {
    throw new Error(`${label} must have tenantId ${siteConfig.tenantId}.`);
  }
}

async function upsert(container, item, label) {
  assertTenantScoped(item, label);
  const response = await container.items.upsert(item);
  return response.resource?.id ?? item.id;
}

async function main() {
  if (!siteConfig) {
    throw new Error(`Unsupported SITE_KEY ${siteKey}. Add a site config before seeding this seed set.`);
  }

  if (!siteConfig.seedable) {
    throw new Error(`SITE_KEY ${siteKey} is placeholder-only and is not seedable yet.`);
  }

  const connectionString = requireEnv('COSMOS_CONNECTION_STRING');
  const apiHash = requireEnv(siteConfig.apiHashEnv);
  const databaseName = process.env.COSMOS_DATABASE_NAME?.trim() || 'PumpkinCMS';

  if (apiHash === siteConfig.hashPlaceholder) {
    throw new Error(`${siteConfig.apiHashEnv} must be the real local BCrypt hash, not the template placeholder.`);
  }

  const client = new CosmosClient(connectionString);
  const database = client.database(databaseName);
  const tenantContainer = database.container('Tenant');
  const themeContainer = database.container('Theme');
  const pageContainer = database.container('Page');

  const tenant = await readTenantTemplate(apiHash);
  const theme = await readJson('theme.json');
  const pageFiles = (await readdir(path.join(siteSeedRoot, 'pages')))
    .filter((file) => file.endsWith('.json'))
    .sort();
  const pages = await Promise.all(pageFiles.map((file) => readJson(`pages/${file}`)));

  const upserted = {
    Tenant: [],
    Theme: [],
    Page: [],
  };

  upserted.Tenant.push(await upsert(tenantContainer, tenant, 'Tenant'));
  upserted.Theme.push(await upsert(themeContainer, theme, 'Theme'));

  for (const page of pages) {
    upserted.Page.push(await upsert(pageContainer, page, `Page ${page.pageSlug ?? page.id}`));
  }

  console.log(`Seed completed for SITE_KEY=${siteKey} in database ${databaseName}.`);
  console.log(`Tenant upserted: ${upserted.Tenant.join(', ')}`);
  console.log(`Theme upserted: ${upserted.Theme.join(', ')}`);
  console.log(`Pages upserted: ${upserted.Page.join(', ')}`);
}

main().catch((error) => {
  console.error('Local Cosmos seed failed.');
  console.error(error.message);
  process.exit(1);
});
