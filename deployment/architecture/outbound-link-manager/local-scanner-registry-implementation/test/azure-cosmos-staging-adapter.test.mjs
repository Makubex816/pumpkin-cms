import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import {
  approvedAzureCosmosStaging,
  evaluateAzureCosmosStagingGate,
  loadExecutionContext,
  runAzureCosmosStagingExecution
} from '../src/staging-execution/azure-cosmos-staging-adapter.mjs';
import { runStagingExecution } from '../src/staging-execution/staging-apply-executor.mjs';
import { readJson } from '../src/utils/json-writer.mjs';
import { packageRoot, tmpRoot } from '../src/utils/safe-paths.mjs';

const testRoot = path.join(tmpRoot, 'test-azure-cosmos-staging-adapter');
const packagePath = '.tmp/phase-2h22-staging-execution-package';
const profilePath = 'fixtures/provider-profile-olm-staging-cosmos-nosql.fixture.json';
const stagingSimulatedProfilePath = 'fixtures/staging-execution-profile.fixture.json';
const liveReadonlyProfilePath = 'fixtures/provider-profile-live-readonly.fixture.json';

test.before(async () => {
  await fs.rm(testRoot, { recursive: true, force: true });
});

test('scoped Azure Cosmos gate passes only with exact V2.2.2 values and explicit flag', async () => {
  const context = await loadExecutionContext({
    packagePath,
    profilePath,
    env: validEnv()
  });
  const blocked = evaluateAzureCosmosStagingGate({
    ...context,
    executeLiveWriteApproved: false
  });
  assert.equal(blocked.status, 'blocked');
  assert.equal(blocked.failures.some((failure) => failure.code === 'AZURE_COSMOS_STAGING_EXECUTION_FLAG_MISSING'), true);

  const passed = evaluateAzureCosmosStagingGate({
    ...context,
    executeLiveWriteApproved: true
  });
  assert.equal(passed.status, 'passed');
  assert.equal(passed.summary.approvedRecordCount, 48);
  assert.equal(passed.summary.liveWriteApprovedScoped, true);
});

test('scoped Azure Cosmos gate blocks missing env, wrong batch, and non-staging profiles', async () => {
  const context = await loadExecutionContext({
    packagePath,
    profilePath,
    env: { ...validEnv(), OLM_STAGING_PROVIDER_MODE: '' }
  });
  const missingEnv = evaluateAzureCosmosStagingGate({
    ...context,
    executeLiveWriteApproved: true
  });
  assert.equal(missingEnv.status, 'blocked');
  assert.equal(missingEnv.failures.some((failure) => failure.code === 'OLM_STAGING_CONTRACT_VALUE_MISMATCH' || failure.code === 'OLM_STAGING_FIELD_MISSING'), true);

  const wrongBatchContext = await loadExecutionContext({
    packagePath,
    profilePath,
    env: validEnv()
  });
  wrongBatchContext.packageManifest.firstWriteBatch.batchId = 'wrong-batch';
  const wrongBatch = evaluateAzureCosmosStagingGate({
    ...wrongBatchContext,
    executeLiveWriteApproved: true
  });
  assert.equal(wrongBatch.status, 'blocked');
  assert.equal(wrongBatch.failures.some((failure) => failure.code === 'FIRST_WRITE_BATCH_ID_MISMATCH'), true);

  const liveReadonlyContext = await loadExecutionContext({
    packagePath,
    profilePath: liveReadonlyProfilePath,
    env: validEnv()
  });
  const liveReadonly = evaluateAzureCosmosStagingGate({
    ...liveReadonlyContext,
    executeLiveWriteApproved: true
  });
  assert.equal(liveReadonly.status, 'blocked');
  assert.equal(liveReadonly.failures.some((failure) => failure.code === 'PROVIDER_PROFILE_ID_MISMATCH' || failure.code === 'PROVIDER_MODE_MISMATCH'), true);
});

test('fake client executes scoped write and readback without secrets or Azure calls', async () => {
  const fakeClient = new FakeCosmosClient();
  const result = await runAzureCosmosStagingExecution({
    packagePath,
    profilePath,
    outputPath: '.tmp/test-azure-cosmos-staging-adapter/success',
    overwrite: true,
    executeLiveWriteApproved: true,
    env: validEnv(),
    clientFactory: async () => fakeClient
  });
  assert.equal(result.validation.status, 'passed');
  assert.equal(result.summary.writeExecuted, true);
  assert.equal(result.summary.recordsWritten, 48);
  assert.equal(result.readback.status, 'passed');
  assert.equal(result.providerState.status, 'passed');
  assert.equal(fakeClient.writeCount, 48);
  assert.equal(fakeClient.readCount >= 48, true);

  const manifest = await readJson(path.join(result.outputRoot, 'azure-cosmos-staging-execution-manifest.json'));
  assert.equal(manifest.boundaries.liveProviderWrites, true);
  assert.equal(manifest.boundaries.productionWrites, false);
  assert.equal(manifest.boundaries.keysListKeys, false);
});

test('fake client conflict blocks before writing', async () => {
  const fakeClient = new FakeCosmosClient({ conflictIds: new Set(['olp_edc9b74d5255ece6']) });
  const result = await runAzureCosmosStagingExecution({
    packagePath,
    profilePath,
    outputPath: '.tmp/test-azure-cosmos-staging-adapter/conflict',
    overwrite: true,
    executeLiveWriteApproved: true,
    env: validEnv(),
    clientFactory: async () => fakeClient
  });
  assert.equal(result.validation.status, 'blocked');
  assert.equal(result.summary.writeExecuted, false);
  assert.equal(result.summary.recordsWritten, 0);
  assert.equal(fakeClient.writeCount, 0);
  assert.equal(result.gate.failures.some((failure) => failure.code === 'AZURE_COSMOS_STAGING_RECORD_CONFLICT'), true);
});

test('existing staging-simulated executor remains local-only and live-write-approved remains blocked there', async () => {
  const simulated = await runStagingExecution({
    applyPlanPath: '.tmp/phase-2h22-staging-execution-package/evidence/apply-plan',
    profilePath: stagingSimulatedProfilePath,
    outputPath: '.tmp/test-azure-cosmos-staging-adapter/staging-simulated-preserved',
    overwrite: true
  });
  assert.equal(simulated.validation.status, 'passed');
  assert.equal(simulated.summary.recordCount, 48);
  assert.equal(simulated.summary.providerMode, 'staging-simulated');

  const liveBlocked = await runStagingExecution({
    applyPlanPath: '.tmp/phase-2h22-staging-execution-package/evidence/apply-plan',
    profilePath,
    outputPath: '.tmp/test-azure-cosmos-staging-adapter/live-write-blocked-in-old-executor',
    overwrite: true
  });
  assert.equal(liveBlocked.validation.status, 'blocked');
  assert.equal(liveBlocked.summary.recordCount, 0);
  assert.equal(liveBlocked.summary.providerMode, 'live-write-approved');
});

test('CLI requires explicit live write flag and supports fake-free gate blocking', () => {
  const blocked = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'azure-cosmos-staging-execute',
    '--package',
    packagePath,
    '--profile',
    profilePath,
    '--out',
    '.tmp/test-azure-cosmos-staging-adapter/cli-missing-flag',
    '--overwrite'
  ], {
    cwd: packageRoot,
    encoding: 'utf8',
    env: { ...process.env, ...validEnv() }
  });
  assert.equal(blocked.status, 0);
  assert.match(blocked.stdout, /azureCosmosStagingExecution: blocked/);
  assert.match(blocked.stdout, /writeExecuted: false/);
});

test('Azure Cosmos adapter source avoids protected config and key-based access', async () => {
  const source = await fs.readFile(path.join(packageRoot, 'src/staging-execution/azure-cosmos-staging-adapter.mjs'), 'utf8');
  assert.equal(/appsettings|local\.settings|\.env\.local|keyvault|secret\s*show|listKeys\(|show-connection-string|generate-sas|AccountKey=|SharedAccessSignature|DefaultEndpointsProtocol=/i.test(source), false);
  assert.equal(/new\s+CosmosClient\(\s*['"`]|connectionString\s*:|accountKey\s*:|masterKey\s*:/i.test(source), false);
  assert.equal(/@azure\/identity/.test(source), true);
  assert.equal(/@azure\/cosmos/.test(source), true);
});

function validEnv() {
  return {
    OLM_STAGING_PROVIDER_PROFILE_ID: approvedAzureCosmosStaging.providerProfileId,
    OLM_STAGING_PROVIDER_TYPE: approvedAzureCosmosStaging.providerType,
    OLM_STAGING_PROVIDER_MODE: approvedAzureCosmosStaging.providerMode,
    OLM_STAGING_RESOURCE_SCOPE: approvedAzureCosmosStaging.resourceScope,
    OLM_STAGING_ACCOUNT_OR_HOST: approvedAzureCosmosStaging.accountHost,
    OLM_STAGING_DATABASE_OR_NAMESPACE: approvedAzureCosmosStaging.databaseName,
    OLM_STAGING_RBAC_OR_AUTH_MODE: approvedAzureCosmosStaging.rbacOrAuthMode,
    OLM_STAGING_IDENTITY_OR_SESSION_TYPE: approvedAzureCosmosStaging.identityOrSessionType,
    OLM_STAGING_READBACK_METHOD: approvedAzureCosmosStaging.readbackMethod,
    OLM_STAGING_ROLLBACK_METHOD: approvedAzureCosmosStaging.rollbackMethod
  };
}

class FakeCosmosClient {
  constructor({ conflictIds = new Set() } = {}) {
    this.records = new Map();
    this.conflictIds = conflictIds;
    this.writeCount = 0;
    this.readCount = 0;
  }

  database(databaseName) {
    return {
      container: (containerName) => new FakeContainer({
        root: this,
        databaseName,
        containerName
      })
    };
  }
}

class FakeContainer {
  constructor({ root, databaseName, containerName }) {
    this.root = root;
    this.databaseName = databaseName;
    this.containerName = containerName;
    this.items = {
      create: async (document) => {
        this.root.writeCount += 1;
        const key = this.key(document.id, document.tenantKey);
        if (this.root.records.has(key)) {
          const error = new Error('conflict');
          error.code = 409;
          throw error;
        }
        this.root.records.set(key, document);
        return { statusCode: 201, resource: document };
      }
    };
  }

  item(id, tenantKey) {
    return {
      read: async () => {
        this.root.readCount += 1;
        if (this.root.conflictIds.has(id)) {
          return { statusCode: 200, resource: { id, tenantKey, targetContainer: this.containerName } };
        }
        const key = this.key(id, tenantKey);
        if (!this.root.records.has(key)) {
          const error = new Error('not found');
          error.code = 404;
          throw error;
        }
        return { statusCode: 200, resource: this.root.records.get(key) };
      }
    };
  }

  key(id, tenantKey) {
    return `${this.databaseName}/${this.containerName}/${tenantKey}/${id}`;
  }
}
