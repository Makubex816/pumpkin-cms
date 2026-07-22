import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const sourcePath = path.resolve('apps/starter-app/src/lib/tenant-redirect-runtime.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const runtime = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

const config = runtime.getTenantRedirectRuntimeConfig({
  PUMPKIN_TENANT_ID: 'fixture-tenant',
  PUMPKIN_API_URL: 'https://api.example.test/',
  PUMPKIN_API_KEY: 'fixture-key',
});
assert.deepEqual(config, {
  tenantId: 'fixture-tenant',
  apiUrl: 'https://api.example.test',
  apiKey: 'fixture-key',
});
assert.equal(runtime.getTenantRedirectRuntimeConfig({}), null);

for (const excluded of ['/admin', '/admin/pages', '/api/forms', '/preview/tenant', '/_next/static/a.js', '/favicon.ico', '/image.png']) {
  assert.equal(runtime.shouldResolveTenantRedirect(excluded), false, `${excluded} is excluded`);
}
assert.equal(runtime.shouldResolveTenantRedirect('/guides/old-route'), true);
assert.equal(runtime.shouldResolveTenantRedirect('/legacy/page.html'), true);

const requests = [];
const resolution = await runtime.resolveTenantRedirect(
  config,
  '/guides/old-route',
  'campaign=summer',
  async (input, init) => {
    requests.push({ url: String(input), authorizationConfigured: init.headers.Authorization === 'Bearer fixture-key' });
    return new Response(JSON.stringify({
      matched: true,
      location: '/guides/new-route?campaign=summer',
      statusCode: 301,
      preserveQueryString: true,
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  },
);
assert.equal(resolution.statusCode, 301);
assert.equal(resolution.location, '/guides/new-route?campaign=summer');
assert.equal(requests.length, 1);
assert.equal(requests[0].authorizationConfigured, true);
const requestedUrl = new URL(requests[0].url);
assert.equal(requestedUrl.pathname, '/api/redirects/fixture-tenant/resolve');
assert.equal(requestedUrl.searchParams.get('sourcePath'), '/guides/old-route');
assert.equal(requestedUrl.searchParams.get('query'), 'campaign=summer');

for (const statusCode of [301, 302, 307, 308]) {
  const statusResolution = await runtime.resolveTenantRedirect(config, `/old-${statusCode}`, '', async () =>
    new Response(JSON.stringify({ matched: true, location: `/new-${statusCode}`, statusCode, preserveQueryString: false }), { status: 200 }));
  assert.equal(statusResolution.statusCode, statusCode);
}

const targetPage = await runtime.resolveTenantRedirect(config, '/guides/new-route', '', async () => new Response('', { status: 404 }));
assert.equal(targetPage, null);
const loop = await runtime.resolveTenantRedirect(config, '/same', 'x=1', async () =>
  new Response(JSON.stringify({ matched: true, location: '/same?x=1', statusCode: 301, preserveQueryString: true }), { status: 200 }));
assert.equal(loop, null);
const crossTenantLocation = await runtime.resolveTenantRedirect(config, '/old', '', async () =>
  new Response(JSON.stringify({ matched: true, location: 'javascript:alert(1)', statusCode: 301, preserveQueryString: false }), { status: 200 }));
assert.equal(crossTenantLocation, null);

const middlewareSource = fs.readFileSync(path.resolve('apps/starter-app/src/middleware.ts'), 'utf8');
assert.equal(middlewareSource.includes('redirect_precedes_page'), false);
assert.equal(/strip-club|party-pros|ice-rink/i.test(source + middlewareSource), false);
assert.equal((middlewareSource.match(/await resolveTenantRedirect/g) || []).length, 1);

process.stdout.write(`${JSON.stringify({ oldRouteRedirected: true, targetPageFallsThrough: true, tenantScoped: true, loopRejected: true, statuses: [301, 302, 307, 308] })}\n`);
