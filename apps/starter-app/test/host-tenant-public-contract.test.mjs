import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from '../node_modules/typescript/lib/typescript.js';

const routes = JSON.parse(fs.readFileSync(path.resolve('src/generated/host-tenant-routes.json'), 'utf8'));
const artifacts = JSON.parse(fs.readFileSync(path.resolve('deployment/tenant-artifacts.json'), 'utf8'));
const fixtureText = fs.readFileSync(path.resolve('preview-fixtures/strip-club-near-me-vegas/preview.json'), 'utf8');
const fixture = JSON.parse(fixtureText.replace(/^\uFEFF/, ''));
const vegasRoute = routes.routes.find((route) => route.tenantId === 'strip-club-near-me-vegas');
const partyRoute = routes.routes.find((route) => route.tenantId === 'party-pros-philadelphia');
assert.deepEqual(vegasRoute.hosts, ['stripclubnearmevegas.com', 'www.stripclubnearmevegas.com']);
assert.equal(vegasRoute.formsMode, 'live-submit');
assert.deepEqual(partyRoute.hosts, ['partyrentalphiladelphia.com', 'www.partyrentalphiladelphia.com']);
assert.equal(partyRoute.formsMode, 'live-submit');

const vegasArtifact = artifacts.tenants.find((tenant) => tenant.tenantId === fixture.tenantId);
assert.deepEqual(vegasArtifact.hosts, vegasRoute.hosts);
assert.equal(vegasArtifact.formsMode, vegasRoute.formsMode);
assert.equal(fixture.counts.routes, 43);
assert.equal(fixture.redirects.length, 3);
assert.equal(fixture.forms.instances.length, 65);
assert.equal(fixture.forms.submissionMode, 'disabled-no-post');

const helperSource = fs.readFileSync(path.resolve('src/lib/package-static-site.ts'), 'utf8');
const helperCompiled = ts.transpileModule(helperSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const helper = await import(`data:text/javascript;base64,${Buffer.from(helperCompiled).toString('base64')}`);
const siteHtml = helper.adaptPackageStaticHtmlForSite(fixture.routes.contact.html, fixture.tenantId);
assert.equal(siteHtml.includes(`/preview/${fixture.tenantId}`), false);
assert.equal(siteHtml.includes('data-preview-external="held"'), false);
assert.match(siteHtml, /href="\/"/);

const adapterSource = fs.readFileSync(path.resolve('src/components/PreviewBehaviorAdapter.tsx'), 'utf8');
for (const requirement of ['privacyConsent', 'companyWebsite', 'tenantId', 'pageSlug', 'formKey', 'data-live-submit', "method: 'POST'"]) {
  assert(adapterSource.includes(requirement), `Missing live form adaptation: ${requirement}`);
}
const submitSource = fs.readFileSync(path.resolve('src/app/api/forms/submit/[type]/route.ts'), 'utf8');
assert(submitSource.includes('resolveHostTenantRouteForHost'));
assert(submitSource.includes('resolveTenantRuntimeConfig'));
assert.equal(submitSource.includes('loadTenantConfig()'), false);
const middlewareSource = fs.readFileSync(path.resolve('src/middleware.ts'), 'utf8');
assert(middlewareSource.includes('resolveHostFixtureRedirect'));
assert(middlewareSource.includes('resolveTenantRuntimeConfig'));
assert(middlewareSource.includes('getRequestOrigin(request)'));
assert.equal(middlewareSource.includes('new URL(hostFixtureRedirect.location, request.url)'), false);
const hostRegistrySource = fs.readFileSync(path.resolve('src/lib/host-tenant-registry.ts'), 'utf8');
assert(hostRegistrySource.includes('isStarterFallbackHost'));
assert(hostRegistrySource.includes('WEBSITE_HOSTNAME'));
for (const sitePath of [
  'src/app/(site)/layout.tsx',
  'src/app/(site)/page.tsx',
  'src/app/(site)/[...slug]/page.tsx',
]) {
  const source = fs.readFileSync(path.resolve(sitePath), 'utf8');
  assert(source.includes('isCurrentRequestStarterFallbackHost'));
  assert(source.includes('notFound'));
}

const genericSources = [
  'src/lib/host-tenant-registry.ts',
  'src/lib/tenant-runtime-config.ts',
  'src/lib/package-static-site.ts',
  'src/components/PreviewBehaviorAdapter.tsx',
].map((file) => fs.readFileSync(path.resolve(file), 'utf8')).join('\n');
assert.equal(/strip-club-near-me-vegas|party-pros-philadelphia/i.test(genericSources), false);
assert.equal(fixtureText.includes('PUMPKIN_TENANT_API_KEY__'), false);

process.stdout.write(`${JSON.stringify({ vegasHosts: 2, partyProsHosts: 2, routes: 43, redirects: 3, formInstances: 65, previewNoPost: true, publicAdapter: true })}\n`);
