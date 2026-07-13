import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const fixturePath = path.resolve('preview-fixtures/party-pros-philadelphia/preview.json');
const fixtureBuffer = await readFile(fixturePath);
const fixtureText = fixtureBuffer.toString('utf8').replace(/^\uFEFF/, '');
const fixture = JSON.parse(fixtureText);
const expectedFixtureSha256 = '2e19d8c084a9cbcb6d5897e1ed7da0380274e96ee7e2662e4210a0c28459dd26';

assert.equal(createHash('sha256').update(fixtureBuffer).digest('hex'), expectedFixtureSha256);
assert.equal(fixture.tenantId, 'party-pros-philadelphia');
assert.equal(fixture.siteKey, 'party-pros-philadelphia');
assert.equal(fixture.siteName, 'Party Pros East Coast Philadelphia');
assert.equal(fixture.theme.themeId, 'party-pros-static-reference-parity-v3');
assert.equal(fixture.theme.themeCssPath, '/themes/party-pros-reference.css');

const pages = Object.values(fixture.pages);
assert.equal(pages.length, 301);
assert.equal(new Set(pages.map((page) => page.pageSlug)).size, 301);
assert(pages.every((page) => page.tenantId === fixture.tenantId));
assert(pages.every((page) => page.MetaData?.title?.trim()));
assert(pages.every((page) => getBlocks(page).some((block) => block.type === 'CatalogHero' && block.content?.headline?.trim())));

const blockCounts = countBlocks(pages);
assert.equal(blockCounts.CatalogHero, 301);
assert.equal(blockCounts.CatalogIndex, 1);
assert.equal(blockCounts.ItemDetail, 214);
assert.equal(blockCounts.BlogIndex, 1);
assert.equal(blockCounts.BlogArticle, 58);
assert.equal(blockCounts.Contact, 1);
assert.equal(blockCounts.QuoteCartTray, 301);

const catalogPage = fixture.pages.catalog;
const catalog = getBlocks(catalogPage).find((block) => block.type === 'CatalogIndex');
assert(catalog, 'CatalogIndex is missing from the catalog page.');
assert.equal(catalog.content.items.length, 214);
assert.equal(new Set(catalog.content.items.map((item) => item.quoteId)).size, 214);
assert.equal(new Set(catalog.content.items.map((item) => item.link)).size, 214);
assert(catalog.content.items.every((item) => item.quoteId && item.link && item.title && item.image));

const itemDetails = pages.flatMap((page) => getBlocks(page).filter((block) => block.type === 'ItemDetail'));
assert.equal(itemDetails.length, 214);
assert.equal(new Set(itemDetails.map((block) => block.content.quoteItem?.id)).size, 214);
assert(itemDetails.every((block) => block.content.quoteItem?.id && block.content.quoteItem?.title));

const blogIndex = getBlocks(fixture.pages.blog).find((block) => block.type === 'BlogIndex');
assert(blogIndex, 'BlogIndex is missing from the blog page.');
assert.equal(blogIndex.content.posts.length, 58);
assert.equal(new Set(blogIndex.content.posts.map((post) => post.link)).size, 58);

const formDefinitions = fixture.formDefinitions;
assert.equal(formDefinitions.length, 1);
assert.equal(formDefinitions[0].tenantId, fixture.tenantId);
assert.equal(formDefinitions[0].formKey, 'party-pros-quote-request');
assert.equal(formDefinitions[0].status, 'active');
assert.equal(formDefinitions[0].fields.length, 9);
const contact = getBlocks(fixture.pages.contact).find((block) => block.type === 'Contact');
assert.equal(contact?.id, 'quote-request');
assert.equal(contact?.content.formType, 'party-pros-quote-request');

const registry = JSON.parse(await readFile(path.resolve('src/generated/preview-fixture-registry.json'), 'utf8'));
const registryEntry = registry.tenants[fixture.tenantId];
assert.equal(registryEntry.fixturePath, 'preview-fixtures/party-pros-philadelphia/preview.json');
assert.equal(registryEntry.renderMode, 'structured-fixture');
assert.equal(registryEntry.routeCount, 301);

const hostRoutes = JSON.parse(await readFile(path.resolve('src/generated/host-tenant-routes.json'), 'utf8'));
const hostRoute = hostRoutes.routes.find((route) => route.tenantId === fixture.tenantId);
assert.deepEqual(hostRoute.hosts, ['partyrentalphiladelphia.com', 'www.partyrentalphiladelphia.com']);
assert.equal(hostRoute.source, 'preview-fixture');
assert.equal(hostRoute.formsMode, 'live-submit');

const manifest = JSON.parse(await readFile(path.resolve('deployment/tenant-artifacts.json'), 'utf8'));
const manifestTenant = manifest.tenants.find((tenant) => tenant.tenantId === fixture.tenantId);
assert.equal(manifestTenant.fixtureSha256, expectedFixtureSha256);
assert.equal(manifestTenant.routeCount, 301);
assert.deepEqual(
  manifestTenant.themeAssets.map((asset) => asset.path).sort(),
  ['public/themes/party-pros-orange-slate-v1.css', 'public/themes/party-pros-reference.css'],
);

assert.equal(/(?:[A-Za-z]:\\|node_modules|(?:^|[\\/])\.next(?:[\\/]|$))/i.test(fixtureText), false);
assert.equal(/"(?:password|secret|apiKey|connectionString|sasToken)"\s*:/i.test(fixtureText), false);
assert.equal(/<script\b|\son[a-z]+\s*=|javascript:/i.test(fixtureText), false);

process.stdout.write(`${JSON.stringify({
  fixtureSha256: expectedFixtureSha256,
  pages: pages.length,
  itemDetails: blockCounts.ItemDetail,
  catalogItems: catalog.content.items.length,
  blogArticles: blockCounts.BlogArticle,
  quoteCartTrays: blockCounts.QuoteCartTray,
  formDefinitions: formDefinitions.length,
  hosts: hostRoute.hosts.length,
})}\n`);

function getBlocks(page) {
  return page?.ContentData?.ContentBlocks ?? [];
}

function countBlocks(sourcePages) {
  return sourcePages
    .flatMap((page) => getBlocks(page))
    .reduce((counts, block) => {
      counts[block.type] = (counts[block.type] ?? 0) + 1;
      return counts;
    }, {});
}
