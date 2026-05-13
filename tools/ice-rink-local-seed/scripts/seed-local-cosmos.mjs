import { CosmosClient } from '@azure/cosmos';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const tenantId = 'ice-rink-rentals';
const hashPlaceholder = '__ICE_RINK_RENTALS_API_HASH__';

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable ${name}.`);
  }
  return value;
}

async function readJson(relativePath) {
  const raw = await readFile(path.join(toolRoot, relativePath), 'utf8');
  return JSON.parse(raw);
}

async function readTenantTemplate(apiHash) {
  const raw = await readFile(path.join(toolRoot, 'seed/tenant.template.json'), 'utf8');
  if (!raw.includes(hashPlaceholder)) {
    throw new Error('tenant.template.json is missing the API hash placeholder.');
  }

  const tenant = JSON.parse(raw.replace(hashPlaceholder, apiHash));
  if (tenant.apiKeyHash === hashPlaceholder || !tenant.apiKeyHash) {
    throw new Error('Tenant API hash replacement failed.');
  }

  return tenant;
}

function assertTenantScoped(item, label) {
  if (!item || item.tenantId !== tenantId) {
    throw new Error(`${label} must have tenantId ${tenantId}.`);
  }
}

async function upsert(container, item, label) {
  assertTenantScoped(item, label);
  const response = await container.items.upsert(item);
  return response.resource?.id ?? item.id;
}

async function main() {
  const connectionString = requireEnv('COSMOS_CONNECTION_STRING');
  const apiHash = requireEnv('ICE_RINK_RENTALS_API_HASH');
  const databaseName = process.env.COSMOS_DATABASE_NAME?.trim() || 'PumpkinCMS';

  if (apiHash === hashPlaceholder) {
    throw new Error('ICE_RINK_RENTALS_API_HASH must be the real local BCrypt hash, not the template placeholder.');
  }

  const client = new CosmosClient(connectionString);
  const database = client.database(databaseName);
  const tenantContainer = database.container('Tenant');
  const themeContainer = database.container('Theme');
  const pageContainer = database.container('Page');

  const tenant = await readTenantTemplate(apiHash);
  const theme = await readJson('seed/theme.json');
  const pageFiles = (await readdir(path.join(toolRoot, 'seed/pages')))
    .filter((file) => file.endsWith('.json'))
    .sort();
  const pages = await Promise.all(pageFiles.map((file) => readJson(`seed/pages/${file}`)));

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

  console.log(`Seed completed for database ${databaseName}.`);
  console.log(`Tenant upserted: ${upserted.Tenant.join(', ')}`);
  console.log(`Theme upserted: ${upserted.Theme.join(', ')}`);
  console.log(`Pages upserted: ${upserted.Page.join(', ')}`);
}

main().catch((error) => {
  console.error('Local Cosmos seed failed.');
  console.error(error.message);
  process.exit(1);
});
