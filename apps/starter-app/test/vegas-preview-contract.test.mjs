import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const fixturePath = path.resolve('preview-fixtures/strip-club-near-me-vegas/preview.json');
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const expected = {
  routes: 43,
  pageOwnedRedirects: 1,
  genericRedirects: 2,
  semanticRedirects: 3,
  clubDetails: 10,
  guideArticles: 19,
  canonicalMedia: 302,
  sourcePathAliases: 473,
  formDefinitions: 32,
  physicalFormInstances: 57,
  effectiveFormInstances: 65,
  physicalLinks: 1747,
  effectiveLinks: 1797,
  physicalAirstripLinks: 39,
  effectiveAirstripLinks: 45,
  physicalControls: 1057,
  effectiveControls: 1108,
};
assert.deepEqual(fixture.counts, expected);
assert.equal(fixture.renderMode, 'package-static');
assert.equal(fixture.previewOnly, true);
assert.equal(fixture.immutable, true);
assert.equal(fixture.forms.submissionMode, 'disabled-no-post');
assert.equal(fixture.launchHold.publicLaunchApproved, false);
assert.equal(fixture.launchHold.indexingApproved, false);
assert.equal(fixture.acceptedDeviations.length, 2);

const routes = Object.values(fixture.routes);
assert.equal(new Set(routes.map((route) => route.route)).size, 43);
assert.equal(new Set(routes.map((route) => route.title)).size, 43);
assert.equal(routes.filter((route) => route.h1.trim()).length, 43);
assert.equal(routes.filter((route) => /<script\b/i.test(route.html)).length, 0);
assert.equal(routes.filter((route) => /\son[a-z]+\s*=/i.test(route.html)).length, 0);
assert.equal(routes.filter((route) => /javascript:/i.test(route.html)).length, 0);
assert.equal(routes.filter((route) => /<form\b[^>]*(?:action|method)\s*=/i.test(route.html)).length, 0);
assert.equal(routes.filter((route) => /type=["'](?:submit|image)["']/i.test(route.html)).length, 0);
assert.equal(routes.reduce((sum, route) => sum + route.counts.airstripLinks, 0), 39);
assert.equal(fixture.links.rows.filter((row) => row.isAirstrip).length, 39);
assert.equal(fixture.controls.rows.filter((row) => !row.intendedAction).length, 0);
assert.equal(fixture.links.unresolvedTargets, 0);
assert.equal(fixture.links.missingAnchors, 0);
assert.equal(fixture.controls.unmapped, 0);

const resolverPath = path.resolve('src/lib/preview-fixture-redirects.ts');
let resolverSource = await readFile(resolverPath, 'utf8');
resolverSource = resolverSource.replace(
  /import previewRegistry from '@\/generated\/preview-fixture-registry\.json';/,
  `const previewRegistry = ${JSON.stringify({ schemaVersion: 'pumpkin-preview-registry/v1', tenants: { [fixture.tenantId]: { redirects: fixture.redirects } } })};`,
);
resolverSource = resolverSource.replace(
  /import \{ resolveHostTenantRouteForHost \} from '@\/lib\/host-tenant-registry';/,
  'const resolveHostTenantRouteForHost = () => null;',
);
const compiled = ts.transpileModule(resolverSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const resolver = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
for (const redirect of fixture.redirects) {
  const source = `/preview/${fixture.tenantId}${redirect.sourcePath}`;
  const resolution = resolver.resolvePreviewFixtureRedirect(source, 'campaign=proof');
  assert.equal(resolution.statusCode, 301);
  assert.equal(resolution.location, `/preview/${fixture.tenantId}${redirect.targetPath}?campaign=proof`);
  assert.equal(resolver.resolvePreviewFixtureRedirect(resolution.location.split('?')[0], ''), null);
}
assert.equal(/strip-club-near-me-vegas|party-pros-philadelphia/i.test(resolverSource.split('const previewRegistry =')[0]), false);

process.stdout.write(`${JSON.stringify({ counts: expected, uniqueTitles: 43, redirectContracts: 3, scripts: 0, formActions: 0, submitControls: 0 })}\n`);
