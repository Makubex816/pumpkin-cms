import assert from 'node:assert/strict';
import { copyFile, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { verifyDeploymentArtifacts } from './verify-deployment-artifacts.mjs';

const appRoot = process.cwd();
const standaloneRoot = path.join(appRoot, '.next', 'standalone');
const args = parseArgs(process.argv.slice(2));
await verifyDeploymentArtifacts({ root: appRoot, mode: 'source' });

const manifest = JSON.parse(await readFile(path.join(appRoot, 'deployment', 'tenant-artifacts.json'), 'utf8'));
await assertStandaloneRoot();
await replaceDirectory(path.join(appRoot, '.next', 'static'), path.join(standaloneRoot, '.next', 'static'));
await replaceDirectory(path.join(appRoot, 'public'), path.join(standaloneRoot, 'public'));

const fixtureRoot = path.join(standaloneRoot, 'preview-fixtures');
await removeInsideStandalone(fixtureRoot);
for (const tenant of manifest.tenants) {
  const source = path.join(appRoot, ...tenant.fixturePath.split('/'));
  const destination = path.join(standaloneRoot, ...tenant.fixturePath.split('/'));
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

const evidenceRoot = path.join(standaloneRoot, 'deployment-artifacts');
await removeInsideStandalone(evidenceRoot);
await mkdir(evidenceRoot, { recursive: true });
await copyFile(
  path.join(appRoot, 'deployment', 'tenant-artifacts.json'),
  path.join(evidenceRoot, 'tenant-artifacts.json'),
);
await copyFile(
  path.join(appRoot, ...manifest.registry.sourcePath.split('/')),
  path.join(standaloneRoot, ...manifest.registry.packagePath.split('/')),
);
await copyFile(
  path.join(appRoot, ...manifest.hostRouting.sourcePath.split('/')),
  path.join(standaloneRoot, ...manifest.hostRouting.packagePath.split('/')),
);

const report = await verifyDeploymentArtifacts({ root: standaloneRoot, mode: 'package' });
if (args.output) await writeFile(path.resolve(args.output), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify({ status: report.status, tenants: report.tenants, artifactCount: report.artifactCount, staticFiles: report.staticFiles, standaloneRoot })}\n`);

async function assertStandaloneRoot() {
  const serverPath = path.join(standaloneRoot, 'server.js');
  const server = await readFile(serverPath).catch((error) => {
    if (error?.code === 'ENOENT') throw new Error('Next standalone output is missing. Run the production build first.');
    throw error;
  });
  assert(server.length > 0, 'Next standalone server is empty.');
}

async function replaceDirectory(source, destination) {
  await removeInsideStandalone(destination);
  await cp(source, destination, { recursive: true, force: true });
}

async function removeInsideStandalone(target) {
  const relative = path.relative(standaloneRoot, target);
  assert(relative && !relative.startsWith('..') && !path.isAbsolute(relative), `Unsafe standalone target: ${target}`);
  await rm(target, { recursive: true, force: true });
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
