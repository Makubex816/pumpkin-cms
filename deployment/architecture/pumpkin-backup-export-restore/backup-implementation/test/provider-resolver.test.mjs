import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createStandardBackup } from '../src/standard-backup-runner.mjs';
import { buildProviderConnectorReadiness, validateProviderMetadata } from '../src/provider/provider-discovery-model.mjs';
import { resolveProviderSourceFromFixture } from '../src/provider/provider-resolver.mjs';
import {
  buildProviderMetadataEndpointResponse,
  buildRuntimeProfileBridge,
  endpointAllowedResponseKeys,
  validateProviderMetadataEndpointResponse
} from '../src/provider/runtime-profile-bridge.mjs';
import { readJson } from '../src/utils/json-writer.mjs';
import { packageRoot } from '../src/utils/safe-paths.mjs';

const fixedDate = new Date('2026-01-01T00:00:00.000Z');
const iceAnswers = 'fixtures/ice-cosmos-media-standard-backup.answers.json';
const testBundleNames = [
  'test-provider-source-missing',
  'test-provider-source-future-target'
];

after(async () => {
  await Promise.all(testBundleNames.map((name) => clean(name)));
});

async function clean(name) {
  await fs.rm(path.join(packageRoot, '.tmp', name), { recursive: true, force: true });
}

test('configured Cosmos provider source resolves as non-exporting future preflight-ready metadata', async () => {
  const result = await resolveProviderSourceFromFixture({
    fixturePath: 'fixtures/provider-source.cosmos.configured.json'
  });
  assert.equal(result.validation.status, 'passed');
  assert.equal(result.metadata.providerType, 'cosmos');
  assert.equal(result.metadata.providerStatus, 'configured');
  assert.equal(result.metadata.secretsIncluded, false);
  assert.equal(result.readiness.exportReadiness, 'ready-for-future-cosmos-preflight');
  assert.equal(result.readiness.liveDatabaseExportAllowed, false);
});

test('Ice missing provider source resolves as blocked with Cosmos provisioning next action', async () => {
  const result = await resolveProviderSourceFromFixture({
    fixturePath: 'fixtures/provider-source.ice.missing.json'
  });
  assert.equal(result.validation.status, 'passed');
  assert.equal(result.metadata.providerType, 'missing');
  assert.equal(result.metadata.providerStatus, 'missing');
  assert.equal(result.metadata.selectedTargetProvider, 'cosmos');
  assert.equal(result.readiness.exportReadiness, 'blocked');
  assert.equal(result.readiness.cosmosProvisioningRequired, true);
  assert.equal(result.readiness.nextAction, 'cosmos-provisioning-preflight-required');
});

test('Ice provisioned future-target Cosmos resolves as runtime-wiring-required but never export-ready', async () => {
  const result = await resolveProviderSourceFromFixture({
    fixturePath: 'fixtures/provider-source.ice.future-target-cosmos.json'
  });
  assert.equal(result.validation.status, 'passed');
  assert.equal(result.metadata.providerType, 'cosmos');
  assert.equal(result.metadata.providerStatus, 'future-target');
  assert.equal(result.metadata.sourceResolutionStatus, 'provisioned');
  assert.equal(result.metadata.accountName, 'cosmos-pumpkin-prod-eastus');
  assert.equal(result.readiness.exportReadiness, 'metadata-endpoint-runtime-wiring-required');
  assert.equal(result.readiness.cosmosProvisioningRequired, false);
  assert.equal(result.readiness.liveDatabaseExportAllowed, false);
  assert.equal(result.readiness.nextAction, 'metadata-endpoint-runtime-wiring-approval-required');
});

test('provider metadata contract rejects forbidden fields', async () => {
  const fixture = await readJson(path.join(packageRoot, 'fixtures', 'provider-source.forbidden-field.json'));
  const validation = validateProviderMetadata(fixture);
  assert.equal(validation.status, 'failed');
  assert(validation.failures.some((failure) => failure.code === 'FORBIDDEN_FIELD'));
});

test('runtime profile bridge emits endpoint-safe provisioned future target metadata', async () => {
  const result = await resolveProviderSourceFromFixture({
    fixturePath: 'fixtures/provider-source.ice.future-target-cosmos.json'
  });
  const bridge = buildRuntimeProfileBridge(result);
  assert.equal(bridge.response.providerType, 'cosmos');
  assert.equal(bridge.response.providerStatus, 'future-target');
  assert.equal(bridge.response.provisioningStatus, 'provisioned');
  assert.equal(bridge.response.runtimeStatus, 'metadata-endpoint-runtime-wiring-required');
  assert.equal(bridge.response.secretsIncluded, false);
  assert.equal(bridge.readiness.liveDatabaseExportAllowed, false);
  assert.deepEqual(Object.keys(bridge.response).sort(), endpointAllowedResponseKeys().sort());
});

test('provider metadata endpoint response rejects forbidden fields', async () => {
  const result = await resolveProviderSourceFromFixture({
    fixturePath: 'fixtures/provider-source.ice.future-target-cosmos.json'
  });
  const response = buildProviderMetadataEndpointResponse(result);
  const validation = validateProviderMetadataEndpointResponse({
    ...response,
    connectionString: 'redacted'
  });
  assert.equal(validation.status, 'failed');
  assert(validation.failures.some((failure) => failure.code === 'UNKNOWN_FIELD'));
  assert(validation.failures.some((failure) => failure.code === 'FORBIDDEN_FIELD'));
});

test('readiness blocks live export when provider source is missing', async () => {
  const result = await resolveProviderSourceFromFixture({
    fixturePath: 'fixtures/provider-source.ice.missing.json'
  });
  const readiness = buildProviderConnectorReadiness(result.metadata);
  assert.equal(readiness.liveDatabaseExportAllowed, false);
  assert.equal(readiness.exportReadiness, 'blocked');
});

test('standard bundle can include missing provider source metadata without enabling export', async () => {
  await clean('test-provider-source-missing');
  const result = await createStandardBackup({
    answersPath: iceAnswers,
    outputPath: '.tmp/test-provider-source-missing',
    scopeOverride: 'tenant',
    overwrite: true,
    now: fixedDate,
    connectors: {
      providerSourceFixture: 'fixtures/provider-source.ice.missing.json'
    }
  });
  assert.equal(result.validation.status, 'passed');
  const providerSource = await readJson(path.join(result.bundleRoot, 'database', 'provider-source', 'provider-source.json'));
  assert.equal(providerSource.metadata.providerStatus, 'missing');
  assert.equal(providerSource.readiness.liveDatabaseExportAllowed, false);
  assert.equal(result.manifest.componentStatus.providerSource.status, 'missing');
  assert.equal(result.manifest.componentStatus.providerSource.liveDatabaseExportAllowed, false);
});

test('standard bundle can include future-target Cosmos metadata without creating export artifacts', async () => {
  await clean('test-provider-source-future-target');
  const result = await createStandardBackup({
    answersPath: iceAnswers,
    outputPath: '.tmp/test-provider-source-future-target',
    scopeOverride: 'tenant',
    overwrite: true,
    now: fixedDate,
    connectors: {
      providerSourceFixture: 'fixtures/provider-source.ice.future-target-cosmos.json',
      tenantWebsiteBundle: true
    }
  });
  assert.equal(result.validation.status, 'passed');
  assert.equal(result.manifest.componentStatus.providerSource.status, 'future-target');
  assert.equal(result.manifest.componentStatus.providerSource.sourceResolutionStatus, 'provisioned');
  assert.equal(result.manifest.componentStatus.providerSource.cosmosProvisioningRequired, false);
  assert.equal(result.manifest.componentStatus.providerSource.nextAction, 'metadata-endpoint-runtime-wiring-approval-required');
  assert.equal(result.manifest.connectorFoundation.liveCosmosExportPerformed, false);
  await assert.rejects(() => fs.access(path.join(result.bundleRoot, 'database', 'cosmos-json', 'export-manifest.json')));
});

test('CLI resolve-provider prints only non-secret summary fields', async () => {
  const cliPath = path.join(packageRoot, 'src', 'backup-cli.mjs');
  const outcome = await runNode([
    cliPath,
    'resolve-provider',
    '--fixture',
    'fixtures/provider-source.ice.missing.json'
  ]);
  assert.equal(outcome.code, 0);
  assert.match(outcome.stdout, /providerType: missing/);
  assert.match(outcome.stdout, /selectedTargetProvider: cosmos/);
  assert.match(outcome.stdout, /nextAction: cosmos-provisioning-preflight-required/);
  assert.doesNotMatch(outcome.stdout, /connection/i);
  assert.doesNotMatch(outcome.stdout, /token/i);
});

test('CLI resolve-runtime-profile prints only non-secret runtime summary fields', async () => {
  const cliPath = path.join(packageRoot, 'src', 'backup-cli.mjs');
  const outcome = await runNode([
    cliPath,
    'resolve-runtime-profile',
    '--fixture',
    'fixtures/provider-source.ice.future-target-cosmos.json'
  ]);
  assert.equal(outcome.code, 0);
  assert.match(outcome.stdout, /providerType: cosmos/);
  assert.match(outcome.stdout, /provisioningStatus: provisioned/);
  assert.match(outcome.stdout, /runtimeStatus: metadata-endpoint-runtime-wiring-required/);
  assert.doesNotMatch(outcome.stdout, /connection/i);
  assert.doesNotMatch(outcome.stdout, /token/i);
});

function runNode(args) {
  return new Promise((resolve) => {
    execFile(process.execPath, args, { cwd: packageRoot }, (error, stdout, stderr) => {
      resolve({
        code: error?.code ?? 0,
        stdout,
        stderr
      });
    });
  });
}
