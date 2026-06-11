import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { buildStagingExecutionPackage } from '../src/execution-package/staging-execution-package-builder.mjs';
import { validateStagingEnvContract } from '../src/staging-target/staging-env-contract.mjs';
import { tmpRoot } from '../src/utils/safe-paths.mjs';

const completeEnv = {
  OLM_STAGING_PROVIDER_PROFILE_ID: 'profile_scoped_staging_write',
  OLM_STAGING_PROVIDER_TYPE: 'cosmos-native-rbac',
  OLM_STAGING_PROVIDER_MODE: 'staging-write-approved',
  OLM_STAGING_RESOURCE_SCOPE: 'resource-scope-redacted',
  OLM_STAGING_ACCOUNT_OR_HOST: 'account-host-redacted',
  OLM_STAGING_DATABASE_OR_NAMESPACE: 'database-namespace-redacted',
  OLM_STAGING_RBAC_OR_AUTH_MODE: 'rbac-session',
  OLM_STAGING_IDENTITY_OR_SESSION_TYPE: 'current-operator-principal',
  OLM_STAGING_READBACK_METHOD: 'tenant-site-count-and-id-readback',
  OLM_STAGING_ROLLBACK_METHOD: 'batch-scoped-delete-by-id-manifest'
};

const packagePath = '.tmp/test-staging-env-contract/package';
const testRoot = path.join(tmpRoot, 'test-staging-env-contract');

test.before(async () => {
  await fs.rm(testRoot, { recursive: true, force: true });
  await buildStagingExecutionPackage({
    sourcePath: 'fixtures/execution-package-source.fixture.json',
    outputPath: packagePath,
    overwrite: true
  });
});

test('staging env contract reports missing values without values', async () => {
  const result = await validateStagingEnvContract({ env: {} });
  assert.equal(result.status, 'blocked');
  assert.equal(result.summary.missingCount, 10);
  assert.equal(result.summary.failureCount, 10);
  assert.equal(result.boundaries.valuesPrinted, false);
  assert.equal(result.fields.every((field) => field.valuePrinted === false), true);
});

test('staging env contract rejects placeholders and blocked provider modes', async () => {
  const result = await validateStagingEnvContract({
    env: {
      ...completeEnv,
      OLM_STAGING_PROVIDER_PROFILE_ID: 'TBD',
      OLM_STAGING_PROVIDER_MODE: 'staging-simulated'
    }
  });
  assert.equal(result.status, 'blocked');
  assert.equal(result.fields.find((field) => field.name === 'OLM_STAGING_PROVIDER_PROFILE_ID').status, 'placeholder');
  assert.equal(result.fields.find((field) => field.name === 'OLM_STAGING_PROVIDER_MODE').status, 'blocked');
});

test('staging env contract accepts redacted present metadata and package linkage', async () => {
  const result = await validateStagingEnvContract({
    env: completeEnv,
    packagePath
  });
  assert.equal(result.status, 'passed');
  assert.equal(result.summary.presentCount, 10);
  assert.equal(result.packageLinkage.status, 'passed');
  assert.equal(result.packageLinkage.approvalManifestIdMatched, true);
  assert.equal(result.packageLinkage.firstWriteBatchIdMatched, true);
  assert.equal(result.packageLinkage.expectedRecordCountMatched, true);
  assert.equal(result.packageLinkage.realStagingProviderWritePerformed, false);
});

test('staging env contract CLI does not print values', () => {
  const secretLikeValue = 'do-not-print-this-contract-value';
  const cli = spawnSync(process.execPath, [
    'src/outbound-link-cli.mjs',
    'validate-staging-env-contract',
    '--package',
    packagePath
  ], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...completeEnv,
      OLM_STAGING_ACCOUNT_OR_HOST: secretLikeValue
    },
    encoding: 'utf8'
  });
  assert.equal(cli.status, 0, cli.stderr);
  assert.match(cli.stdout, /stagingEnvContract: passed/);
  assert.doesNotMatch(cli.stdout, new RegExp(secretLikeValue));
});
