import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { verifyDeploymentArtifacts } from '../scripts/verify-deployment-artifacts.mjs';

const sourceRoot = process.cwd();
const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'pumpkin-deployment-artifacts-'));

try {
  const sourceProof = await verifyDeploymentArtifacts({ root: sourceRoot, mode: 'source' });
  assert.deepEqual(sourceProof.tenants, ['party-pros-philadelphia', 'strip-club-near-me-vegas']);

  const manifest = JSON.parse(await readFile(path.join(sourceRoot, 'deployment', 'tenant-artifacts.json'), 'utf8'));
  const artifactPaths = new Set([
    'deployment/tenant-artifacts.json',
    manifest.registry.sourcePath,
    manifest.hostRouting.sourcePath,
    ...manifest.sharedAssets.map((asset) => asset.path),
    ...manifest.tenants.flatMap((tenant) => [
      tenant.fixturePath,
      ...tenant.themeAssets.map((asset) => asset.path),
    ]),
  ]);
  for (const artifactPath of artifactPaths) {
    const destination = path.join(tempRoot, ...artifactPath.split('/'));
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(path.join(sourceRoot, ...artifactPath.split('/')), destination, { force: true });
  }

  const cleanProof = await verifyDeploymentArtifacts({ root: tempRoot, mode: 'source' });
  assert.equal(cleanProof.status, 'passed');

  const partyFixture = manifest.tenants.find((tenant) => tenant.tenantId === 'party-pros-philadelphia').fixturePath;
  await rm(path.join(tempRoot, ...partyFixture.split('/')));
  await assert.rejects(
    verifyDeploymentArtifacts({ root: tempRoot, mode: 'source' }),
    /Missing required artifact: preview-fixtures\/party-pros-philadelphia\/preview\.json/,
  );
  await restore(partyFixture);

  const vegasTheme = manifest.tenants
    .find((tenant) => tenant.tenantId === 'strip-club-near-me-vegas')
    .themeAssets.find((asset) => asset.path.endsWith('/styles.css')).path;
  await rm(path.join(tempRoot, ...vegasTheme.split('/')));
  await assert.rejects(
    verifyDeploymentArtifacts({ root: tempRoot, mode: 'source' }),
    /Missing required artifact: public\/themes\/strip-club-near-me-vegas-reference\/styles\.css/,
  );
  await restore(vegasTheme);

  const registryPath = path.join(tempRoot, ...manifest.registry.sourcePath.split('/'));
  const registry = JSON.parse(await readFile(registryPath, 'utf8'));
  delete registry.tenants['party-pros-philadelphia'];
  await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
  await assert.rejects(
    verifyDeploymentArtifacts({ root: tempRoot, mode: 'source' }),
    /Registry and deployment tenant inventories differ/,
  );

  process.stdout.write(`${JSON.stringify({
    status: 'passed',
    sourceTenants: sourceProof.tenants,
    cleanCopyTenants: cleanProof.tenants,
    failClosedCases: ['missing-party-fixture', 'missing-vegas-theme', 'missing-registry-tenant'],
  })}\n`);

  async function restore(relativePath) {
    const destination = path.join(tempRoot, ...relativePath.split('/'));
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(path.join(sourceRoot, ...relativePath.split('/')), destination, { force: true });
  }
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
