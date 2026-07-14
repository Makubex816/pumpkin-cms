import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from '../node_modules/typescript/lib/typescript.js';

const sourcePath = path.resolve('src/lib/tenant-runtime-config.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const runtime = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const tenants = ['party-pros-philadelphia', 'strip-club-near-me-vegas'];

assert.equal(
  runtime.getTenantApiKeySettingName('strip-club-near-me-vegas'),
  'PUMPKIN_TENANT_API_KEY__STRIP_CLUB_NEAR_ME_VEGAS',
);
const scoped = runtime.resolveTenantRuntimeConfig('strip-club-near-me-vegas', {
  PUMPKIN_API_URL: 'https://api.example.test/',
  PUMPKIN_TENANT_API_KEY__STRIP_CLUB_NEAR_ME_VEGAS: 'vegas-fixture-key',
  PUMPKIN_TENANT_ID: 'party-pros-philadelphia',
  PUMPKIN_API_KEY: 'party-fixture-key',
}, tenants);
assert.deepEqual(scoped, {
  tenantId: 'strip-club-near-me-vegas',
  apiUrl: 'https://api.example.test',
  apiKey: 'vegas-fixture-key',
  apiKeySettingName: 'PUMPKIN_TENANT_API_KEY__STRIP_CLUB_NEAR_ME_VEGAS',
  source: 'tenant-scoped',
});

const legacy = runtime.resolveTenantRuntimeConfig('party-pros-philadelphia', {
  PUMPKIN_API_URL: 'https://api.example.test',
  PUMPKIN_TENANT_ID: 'party-pros-philadelphia',
  PUMPKIN_API_KEY: 'party-fixture-key',
}, tenants);
assert.equal(legacy.source, 'legacy-global');
assert.equal(legacy.apiKeySettingName, 'PUMPKIN_API_KEY');
assert.equal(runtime.resolveTenantRuntimeConfig('unknown-tenant', {
  PUMPKIN_API_URL: 'https://api.example.test',
  PUMPKIN_TENANT_API_KEY__UNKNOWN_TENANT: 'unknown-fixture-key',
}, tenants), null);
assert.equal(runtime.resolveTenantRuntimeConfig('strip-club-near-me-vegas', {
  PUMPKIN_API_URL: 'https://api.example.test',
}, tenants), null);

const clientSource = [
  ...walk(path.resolve('src/components')),
  ...walk(path.resolve('src/app'), (file) => !file.includes(`${path.sep}api${path.sep}`)),
].map((file) => fs.readFileSync(file, 'utf8')).join('\n');
assert.equal(clientSource.includes('PUMPKIN_TENANT_API_KEY__'), false);
assert.equal(source.includes('strip-club-near-me-vegas'), false);
assert.equal(source.includes('party-pros-philadelphia'), false);

process.stdout.write(`${JSON.stringify({ tenantScoped: true, legacyPartyProsPreserved: true, unknownTenantHeld: true, clientExposure: false })}\n`);

function walk(root, include = () => true) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) return walk(target, include);
    return entry.isFile() && /\.(?:ts|tsx)$/.test(entry.name) && include(target) ? [target] : [];
  });
}
