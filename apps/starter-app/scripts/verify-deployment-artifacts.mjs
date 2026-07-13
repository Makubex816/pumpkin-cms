import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_MANIFEST_PATH = 'deployment/tenant-artifacts.json';
const PACKAGE_MANIFEST_PATH = 'deployment-artifacts/tenant-artifacts.json';

export async function verifyDeploymentArtifacts({ root, mode = 'source' }) {
  assert(['source', 'package'].includes(mode), `Unsupported verification mode: ${mode}`);
  const resolvedRoot = path.resolve(root);
  const manifestPath = mode === 'source' ? SOURCE_MANIFEST_PATH : PACKAGE_MANIFEST_PATH;
  const manifest = await readJsonArtifact(resolvedRoot, manifestPath);
  assert.equal(manifest.schemaVersion, 'pumpkin-starter-deployment-artifacts/v1');
  assert.equal(manifest.application, 'pumpkin-starter-app');
  assert(Array.isArray(manifest.tenants) && manifest.tenants.length > 0, 'Deployment tenant inventory is empty.');

  const registryPath = mode === 'source' ? manifest.registry.sourcePath : manifest.registry.packagePath;
  const hostRoutingPath = mode === 'source' ? manifest.hostRouting.sourcePath : manifest.hostRouting.packagePath;
  const registry = await readJsonArtifact(resolvedRoot, registryPath);
  const hostRouting = await readJsonArtifact(resolvedRoot, hostRoutingPath);
  assert.equal(registry.schemaVersion, 'pumpkin-preview-registry/v1');
  assert.equal(hostRouting.schemaVersion, 'pumpkin-host-tenant-routes/v1');

  const tenantIds = manifest.tenants.map((tenant) => tenant.tenantId);
  assert.equal(new Set(tenantIds).size, tenantIds.length, 'Deployment tenant inventory contains duplicates.');
  assert.deepEqual(Object.keys(registry.tenants).sort(), [...tenantIds].sort(), 'Registry and deployment tenant inventories differ.');

  const artifacts = [];
  for (const tenant of manifest.tenants) {
    assert(/^[a-z0-9][a-z0-9-]{1,80}$/.test(tenant.tenantId), `Invalid tenant ID: ${tenant.tenantId}`);
    assert(['structured-fixture', 'package-static'].includes(tenant.fixtureFormat), `Invalid fixture format: ${tenant.tenantId}`);
    const fixture = await readJsonArtifact(resolvedRoot, tenant.fixturePath, tenant.fixtureSha256, artifacts);
    assert.equal(fixture.tenantId, tenant.tenantId, `Fixture tenant mismatch: ${tenant.tenantId}`);
    const routeCount = tenant.fixtureFormat === 'package-static'
      ? Object.keys(fixture.routes || {}).length
      : Object.keys(fixture.pages || {}).length;
    assert.equal(routeCount, tenant.routeCount, `Fixture route count mismatch: ${tenant.tenantId}`);

    const registryTenant = registry.tenants[tenant.tenantId];
    assert(registryTenant, `Registry tenant is missing: ${tenant.tenantId}`);
    assert.equal(registryTenant.fixturePath, tenant.fixturePath, `Registry fixture path mismatch: ${tenant.tenantId}`);
    assert.equal(registryTenant.renderMode, tenant.fixtureFormat, `Registry render mode mismatch: ${tenant.tenantId}`);
    assert.equal(registryTenant.routeCount, tenant.routeCount, `Registry route count mismatch: ${tenant.tenantId}`);

    for (const themeAsset of tenant.themeAssets || []) {
      await readArtifact(resolvedRoot, themeAsset.path, themeAsset.sha256, artifacts);
    }

    const hostRoute = hostRouting.routes.find((route) => route.tenantId === tenant.tenantId);
    if (tenant.hosts.length > 0) {
      assert(hostRoute, `Host routing is missing: ${tenant.tenantId}`);
      assert.deepEqual([...hostRoute.hosts].sort(), [...tenant.hosts].sort(), `Host inventory mismatch: ${tenant.tenantId}`);
      assert.equal(hostRoute.formsMode, tenant.formsMode, `Host form mode mismatch: ${tenant.tenantId}`);
      assert.equal(hostRoute.source, 'preview-fixture', `Host source mismatch: ${tenant.tenantId}`);
    } else {
      assert.equal(hostRoute, undefined, `Unexpected public host routing: ${tenant.tenantId}`);
    }
  }

  const hostTenantIds = hostRouting.routes.map((route) => route.tenantId);
  assert(hostTenantIds.every((tenantId) => tenantIds.includes(tenantId)), 'Host routing contains an unregistered tenant.');
  for (const sharedAsset of manifest.sharedAssets || []) {
    await readArtifact(resolvedRoot, sharedAsset.path, sharedAsset.sha256, artifacts);
  }

  let staticFiles = null;
  if (mode === 'package') {
    await readArtifact(resolvedRoot, 'server.js', '', artifacts);
    staticFiles = await countFiles(path.join(resolvedRoot, '.next', 'static'));
    assert(staticFiles > 0, 'Packaged Next static output is empty.');
  }

  return {
    schemaVersion: 'pumpkin-deployment-artifact-completeness-proof/v1',
    status: 'passed',
    mode,
    tenants: tenantIds.sort(),
    registryPath,
    hostRoutingPath,
    artifactCount: artifacts.length,
    staticFiles,
    artifacts,
  };
}

async function readJsonArtifact(root, relativePath, expectedSha256 = '', artifacts = null) {
  const buffer = await readArtifact(root, relativePath, expectedSha256, artifacts);
  try {
    return JSON.parse(buffer.toString('utf8').replace(/^\uFEFF/, ''));
  } catch {
    throw new Error(`Invalid JSON artifact: ${relativePath}`);
  }
}

async function readArtifact(root, relativePath, expectedSha256 = '', artifacts = null) {
  const resolvedPath = resolveArtifactPath(root, relativePath);
  let buffer;
  try {
    buffer = await readFile(resolvedPath);
  } catch (error) {
    if (error?.code === 'ENOENT') throw new Error(`Missing required artifact: ${relativePath}`);
    throw error;
  }
  assert(buffer.length > 0, `Required artifact is empty: ${relativePath}`);
  const sha256 = createHash('sha256').update(buffer).digest('hex');
  if (expectedSha256) assert.equal(sha256, expectedSha256, `Artifact SHA-256 mismatch: ${relativePath}`);
  artifacts?.push({ path: relativePath, bytes: buffer.length, sha256 });
  return buffer;
}

function resolveArtifactPath(root, relativePath) {
  assert(typeof relativePath === 'string' && relativePath.length > 0, 'Artifact path is empty.');
  assert(!path.isAbsolute(relativePath), `Absolute artifact path is prohibited: ${relativePath}`);
  assert(!relativePath.includes('\\'), `Artifact path must use forward slashes: ${relativePath}`);
  const normalized = path.posix.normalize(relativePath);
  assert(normalized !== '..' && !normalized.startsWith('../'), `Artifact path escapes the root: ${relativePath}`);
  const resolved = path.resolve(root, ...normalized.split('/'));
  const relative = path.relative(root, resolved);
  assert(relative && !relative.startsWith('..') && !path.isAbsolute(relative), `Artifact path escapes the root: ${relativePath}`);
  return resolved;
}

async function countFiles(root) {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') return 0;
    throw error;
  }
  let count = 0;
  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) count += await countFiles(entryPath);
    if (entry.isFile() && (await stat(entryPath)).size > 0) count += 1;
  }
  return count;
}

function parseArgs(values) {
  const output = {};
  for (let index = 0; index < values.length; index += 1) {
    const token = values[index];
    assert(token.startsWith('--'), `Unexpected argument: ${token}`);
    const value = values[index + 1];
    assert(value && !value.startsWith('--'), `Missing value for ${token}`);
    output[token.slice(2)] = value;
    index += 1;
  }
  return output;
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const args = parseArgs(process.argv.slice(2));
  const report = await verifyDeploymentArtifacts({ root: args.root || process.cwd(), mode: args.mode || 'source' });
  if (args.output) await writeFile(path.resolve(args.output), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({ status: report.status, mode: report.mode, tenants: report.tenants, artifactCount: report.artifactCount, staticFiles: report.staticFiles })}\n`);
}
