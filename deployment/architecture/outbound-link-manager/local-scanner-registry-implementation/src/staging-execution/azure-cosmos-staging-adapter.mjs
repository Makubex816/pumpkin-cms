import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { productionEntities, productionRecordFiles } from '../migration/target-entity-router.mjs';
import { deterministicId, stateHash } from '../migration/deterministic-id-mapper.mjs';
import { validateProviderProfile } from '../providers/provider-profile-validator.mjs';
import { readJson, writeJson, pathExists } from '../utils/json-writer.mjs';
import { resolveFixturePath, resolveTmpOutputPath, toPackageRelative } from '../utils/safe-paths.mjs';
import { validateStagingEnvContract } from '../staging-target/staging-env-contract.mjs';

export const azureCosmosStagingSchemaVersion = '0.1.0';

export const approvedAzureCosmosStaging = Object.freeze({
  providerProfileId: 'olm-staging-cosmos-nosql-v1',
  providerType: 'azure-cosmos-nosql',
  providerMode: 'live-write-approved',
  resourceScope: 'resourceGroup:rg-pumpkincms-stg-eastus-olm',
  accountHost: 'cosmos-pumpkincms-stg-olm01.documents.azure.com',
  databaseName: 'pumpkincms-olm-staging',
  rbacOrAuthMode: 'cosmos-nosql-data-plane-rbac',
  identityOrSessionType: 'operator-azure-cli-session+managed-identity',
  readbackMethod: 'cosmos-nosql-tenant-site-batch-id-readback',
  rollbackMethod: 'cosmos-nosql-first-write-batch-delete-by-batch-id',
  approvalManifestId: 'olapprove_508df3f03faa4f80',
  firstWriteBatchId: 'olbatch_b08e184fdc6565aa',
  expectedRecordCount: 48,
  tenantKey: 'fixture-tenant',
  siteKey: 'fixture-site',
  partitionKey: '/tenantKey'
});

const expectedContainersByEntity = Object.freeze({
  outbound_links: 'outbound-links',
  outbound_link_instances: 'outbound-link-instances',
  outbound_link_policies: 'outbound-link-policies',
  outbound_link_scan_runs: 'outbound-link-scan-runs',
  outbound_link_audit_logs: 'outbound-link-audit-logs',
  outbound_link_render_decisions: 'outbound-link-render-decisions',
  outbound_link_review_decisions: 'outbound-link-review-decisions',
  outbound_link_bulk_actions: 'outbound-link-bulk-actions',
  outbound_link_rollback_plans: 'outbound-link-rollback-plans',
  outbound_link_trace_logs: 'outbound-link-trace-logs'
});

const outputFiles = [
  'azure-cosmos-staging-execution-manifest.json',
  'approval-manifest-finalized.json',
  'provider-gate-report.json',
  'write-records.json',
  'readback-result.json',
  'trace-audit-rollback-validation.json',
  'provider-state-result.json',
  'VALIDATION_RESULT.json'
];

export async function runAzureCosmosStagingExecution({
  packagePath,
  profilePath,
  outputPath,
  overwrite = false,
  executeLiveWriteApproved = false,
  env = process.env,
  clientFactory = createDefaultCosmosClient
}) {
  const outputRoot = resolveTmpOutputPath(outputPath);
  if (await pathExists(outputRoot)) {
    if (!overwrite) {
      throw new Error(`Azure Cosmos staging output already exists: ${outputPath}`);
    }
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(outputRoot, { recursive: true });

  const context = await loadExecutionContext({ packagePath, profilePath, env });
  const gate = evaluateAzureCosmosStagingGate({
    ...context,
    executeLiveWriteApproved
  });
  await writeJson(path.join(outputRoot, 'provider-gate-report.json'), gate);

  if (gate.status !== 'passed') {
    return await writeBlockedResult({
      outputRoot,
      context,
      gate,
      blockReason: gate.failures[0]?.message ?? 'Azure Cosmos staging execution gate blocked'
    });
  }

  const approval = buildFinalizedApproval({ context });
  await writeJson(path.join(outputRoot, 'approval-manifest-finalized.json'), approval);

  const client = await clientFactory({ target: gate.target });
  const conflicts = await findConflicts({ client, records: context.records });
  if (conflicts.length > 0) {
    const conflictGate = {
      ...gate,
      status: 'blocked',
      failures: conflicts.map((conflict) => ({
        code: 'AZURE_COSMOS_STAGING_RECORD_CONFLICT',
        message: 'target record already exists; stopOnConflict is true',
        path: `${conflict.targetContainer}/${conflict.id}`
      })),
      summary: {
        ...gate.summary,
        failureCount: conflicts.length
      }
    };
    await writeJson(path.join(outputRoot, 'provider-gate-report.json'), conflictGate);
    return await writeBlockedResult({
      outputRoot,
      context,
      gate: conflictGate,
      blockReason: 'one or more approved staging records already exist'
    });
  }

  const writeRecords = [];
  let writeFailure = null;
  for (const record of context.records) {
    const document = buildCosmosDocument({ context, record });
    try {
      const response = await client
        .database(gate.target.databaseName)
        .container(record.targetContainer)
        .items
        .create(document);
      writeRecords.push(writeResultRecord({ context, record, document, response }));
    } catch (error) {
      writeFailure = {
        code: 'AZURE_COSMOS_STAGING_WRITE_FAILED',
        message: safeErrorMessage(error),
        path: `${record.targetContainer}/${record.id}`,
        statusCode: error?.code ?? error?.statusCode ?? null
      };
      break;
    }
  }

  if (writeFailure) {
    return await writePartialFailureResult({
      outputRoot,
      context,
      gate,
      writeRecords,
      writeFailure
    });
  }

  await writeJson(path.join(outputRoot, 'write-records.json'), {
    schemaVersion: azureCosmosStagingSchemaVersion,
    collectionType: 'pumpkin-outbound-link-azure-cosmos-staging-write-records',
    records: writeRecords,
    summary: {
      writtenRecordCount: writeRecords.length,
      countsByEntity: countByEntity(writeRecords),
      failureCount: 0
    },
    boundaries: azureCosmosExecutionBoundaries({ liveProviderWrites: true })
  });

  const readback = await readBackWrittenRecords({ client, context, gate, writeRecords });
  await writeJson(path.join(outputRoot, 'readback-result.json'), readback);
  const traceAuditRollback = validateTraceAuditRollback({ context, writeRecords, readback });
  await writeJson(path.join(outputRoot, 'trace-audit-rollback-validation.json'), traceAuditRollback);
  const providerState = buildProviderState({ context, gate, writeRecords, readback, traceAuditRollback });
  await writeJson(path.join(outputRoot, 'provider-state-result.json'), providerState);
  const manifest = buildManifest({ context, gate, writeRecords, readback, traceAuditRollback, providerState });
  await writeJson(path.join(outputRoot, 'azure-cosmos-staging-execution-manifest.json'), manifest);
  const validation = buildValidation({ context, manifest, readback, traceAuditRollback, providerState });
  await writeJson(path.join(outputRoot, 'VALIDATION_RESULT.json'), validation);
  await writeChecksums({ outputRoot });

  return {
    outputRoot,
    context,
    gate,
    manifest,
    validation,
    readback,
    traceAuditRollback,
    providerState,
    summary: {
      outputPath: toPackageRelative(outputRoot),
      status: validation.status,
      writeExecuted: true,
      recordsWritten: writeRecords.length,
      readbackStatus: readback.status,
      providerProfileId: context.profile.providerProfileId,
      providerMode: context.profile.providerMode
    }
  };
}

export async function inspectAzureCosmosStagingExecution({ executionPath }) {
  const outputRoot = resolveTmpOutputPath(executionPath);
  const validation = await readJson(path.join(outputRoot, 'VALIDATION_RESULT.json'));
  const manifest = await readJson(path.join(outputRoot, 'azure-cosmos-staging-execution-manifest.json'));
  return {
    executionPath: toPackageRelative(outputRoot),
    status: validation.status,
    writeExecuted: manifest.writeExecuted,
    recordsWritten: manifest.summary.recordsWritten,
    readbackStatus: manifest.summary.readbackStatus,
    providerProfileId: manifest.providerProfileId,
    providerMode: manifest.providerMode,
    failureCount: validation.summary.failureCount
  };
}

export async function loadExecutionContext({ packagePath, profilePath, env = process.env }) {
  const packageRoot = resolveTmpOutputPath(packagePath);
  const rawProfile = await readJson(resolveFixturePath(profilePath));
  const providerValidation = validateProviderProfile(rawProfile);
  const profile = providerValidation.profile;
  const packageManifest = await readJson(path.join(packageRoot, 'EXECUTION_PACKAGE_MANIFEST.json'));
  const approvalManifest = await readJson(path.join(packageRoot, 'APPROVAL_MANIFEST.json'));
  const applyPlanEnvelope = await readJson(path.join(packageRoot, 'evidence/apply-plan/apply-plan-records.json'));
  const productionRecords = await readProductionRecords(packageRoot);
  const records = mapApprovedRecords({ applyPlanRecords: applyPlanEnvelope.records ?? [], productionRecords });
  const envContract = await validateStagingEnvContract({ env, packagePath });
  return {
    packageRoot,
    packagePath,
    profile,
    providerValidation,
    packageManifest,
    approvalManifest,
    applyPlanRecords: applyPlanEnvelope.records ?? [],
    productionRecords,
    records,
    env,
    envContract
  };
}

export function evaluateAzureCosmosStagingGate({
  profile,
  providerValidation,
  packageManifest,
  approvalManifest,
  records,
  env,
  envContract,
  executeLiveWriteApproved = false
}) {
  const failures = [];
  if (!executeLiveWriteApproved) {
    failures.push(failure('AZURE_COSMOS_STAGING_EXECUTION_FLAG_MISSING', 'explicit live-write-approved execution flag is required', 'executeLiveWriteApproved'));
  }
  if (providerValidation.status !== 'passed') {
    failures.push(...providerValidation.failures.map((item) => failure(item.code, item.message, `provider.${item.path}`)));
  }
  expectEqual(failures, profile.providerProfileId, approvedAzureCosmosStaging.providerProfileId, 'PROVIDER_PROFILE_ID_MISMATCH', 'providerProfileId');
  expectEqual(failures, profile.providerType, approvedAzureCosmosStaging.providerType, 'PROVIDER_TYPE_MISMATCH', 'providerType');
  expectEqual(failures, profile.providerMode, approvedAzureCosmosStaging.providerMode, 'PROVIDER_MODE_MISMATCH', 'providerMode');
  if (profile.providerMode === 'production-runtime') {
    failures.push(failure('PRODUCTION_RUNTIME_BLOCKED', 'production-runtime is blocked for V2.2.2', 'providerMode'));
  }
  if (profile.providerMode === 'staging-simulated') {
    failures.push(failure('STAGING_SIMULATED_REAL_WRITE_BLOCKED', 'staging-simulated cannot perform real Cosmos writes', 'providerMode'));
  }
  expectEqual(failures, profile.targetProvider?.environment, 'staging', 'PROVIDER_ENVIRONMENT_MISMATCH', 'targetProvider.environment');
  expectEqual(failures, profile.targetProvider?.databaseName, approvedAzureCosmosStaging.databaseName, 'DATABASE_MISMATCH', 'targetProvider.databaseName');
  expectEqual(failures, profile.targetProvider?.partitionKey, approvedAzureCosmosStaging.partitionKey, 'PARTITION_KEY_MISMATCH', 'targetProvider.partitionKey');

  const envExpectations = {
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
  for (const [key, expected] of Object.entries(envExpectations)) {
    expectEqual(failures, env[key], expected, 'OLM_STAGING_CONTRACT_VALUE_MISMATCH', key);
  }
  if (envContract.status !== 'passed') {
    failures.push(...envContract.failures.map((item) => failure(item.code, item.message, item.field ?? 'OLM_STAGING')));
  }

  expectEqual(failures, packageManifest.approvalManifestId, approvedAzureCosmosStaging.approvalManifestId, 'APPROVAL_MANIFEST_ID_MISMATCH', 'EXECUTION_PACKAGE_MANIFEST.approvalManifestId');
  expectEqual(failures, approvalManifest.approvalManifestId, approvedAzureCosmosStaging.approvalManifestId, 'APPROVAL_MANIFEST_FILE_MISMATCH', 'APPROVAL_MANIFEST.approvalManifestId');
  expectEqual(failures, packageManifest.firstWriteBatch?.batchId, approvedAzureCosmosStaging.firstWriteBatchId, 'FIRST_WRITE_BATCH_ID_MISMATCH', 'EXECUTION_PACKAGE_MANIFEST.firstWriteBatch.batchId');
  expectEqual(failures, approvalManifest.firstWriteBatch?.batchId, approvedAzureCosmosStaging.firstWriteBatchId, 'FIRST_WRITE_BATCH_FILE_MISMATCH', 'APPROVAL_MANIFEST.firstWriteBatch.batchId');
  expectEqual(failures, packageManifest.expectedRecordCount, approvedAzureCosmosStaging.expectedRecordCount, 'EXPECTED_RECORD_COUNT_MISMATCH', 'EXECUTION_PACKAGE_MANIFEST.expectedRecordCount');
  expectEqual(failures, records.length, approvedAzureCosmosStaging.expectedRecordCount, 'APPROVED_RECORD_COUNT_MISMATCH', 'records');
  expectEqual(failures, packageManifest.tenantKey, approvedAzureCosmosStaging.tenantKey, 'TENANT_KEY_MISMATCH', 'tenantKey');
  expectEqual(failures, packageManifest.siteKey, approvedAzureCosmosStaging.siteKey, 'SITE_KEY_MISMATCH', 'siteKey');
  if (packageManifest.realStagingProviderWritePerformed || approvalManifest.realStagingProviderWritePerformed) {
    failures.push(failure('REAL_STAGING_WRITE_ALREADY_RECORDED', 'package records a prior real staging write', 'realStagingProviderWritePerformed'));
  }

  for (const record of records) {
    if (!record.id || !record.targetContainer || !record.targetEntity) {
      failures.push(failure('APPROVED_RECORD_INCOMPLETE', 'approved record must include id, target entity, and target container', record.id ?? 'unknown'));
    }
    if (record.tenantKey !== approvedAzureCosmosStaging.tenantKey || record.partitionKey !== approvedAzureCosmosStaging.tenantKey) {
      failures.push(failure('APPROVED_RECORD_PARTITION_MISMATCH', 'approved record must use tenantKey partitioning', record.id));
    }
    if (record.siteKey !== approvedAzureCosmosStaging.siteKey) {
      failures.push(failure('APPROVED_RECORD_SITE_MISMATCH', 'approved record must match approved siteKey', record.id));
    }
    if (record.targetContainer !== expectedContainersByEntity[record.targetEntity]) {
      failures.push(failure('APPROVED_RECORD_CONTAINER_MISMATCH', 'approved record target container mismatch', record.id));
    }
  }

  const countsByEntity = countByEntity(records);
  for (const item of packageManifest.firstWriteBatch?.targetEntities ?? []) {
    if ((countsByEntity[item.targetEntity] ?? 0) !== item.expectedCount) {
      failures.push(failure('APPROVED_ENTITY_COUNT_MISMATCH', 'approved entity count mismatch', item.targetEntity));
    }
  }

  const target = {
    endpoint: `https://${approvedAzureCosmosStaging.accountHost}:443/`,
    accountHost: approvedAzureCosmosStaging.accountHost,
    databaseName: approvedAzureCosmosStaging.databaseName,
    resourceScope: approvedAzureCosmosStaging.resourceScope,
    partitionKey: approvedAzureCosmosStaging.partitionKey,
    containersByEntity: expectedContainersByEntity
  };
  return {
    schemaVersion: azureCosmosStagingSchemaVersion,
    gateType: 'pumpkin-outbound-link-azure-cosmos-staging-execution-gate',
    status: failures.length === 0 ? 'passed' : 'blocked',
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    target,
    summary: {
      expectedRecordCount: approvedAzureCosmosStaging.expectedRecordCount,
      approvedRecordCount: records.length,
      countsByEntity,
      failureCount: failures.length,
      liveWriteApprovedScoped: failures.length === 0,
      productionRuntimeBlocked: true
    },
    failures,
    boundaries: azureCosmosExecutionBoundaries({ liveProviderWrites: false })
  };
}

async function createDefaultCosmosClient({ target }) {
  const [{ CosmosClient }, { DefaultAzureCredential }] = await Promise.all([
    import('@azure/cosmos'),
    import('@azure/identity')
  ]);
  const credential = new DefaultAzureCredential();
  return new CosmosClient({
    endpoint: target.endpoint,
    aadCredentials: credential
  });
}

async function findConflicts({ client, records }) {
  const conflicts = [];
  for (const record of records) {
    try {
      const response = await client
        .database(approvedAzureCosmosStaging.databaseName)
        .container(record.targetContainer)
        .item(record.id, record.tenantKey)
        .read();
      if (response?.resource) {
        conflicts.push({ id: record.id, targetContainer: record.targetContainer });
      }
    } catch (error) {
      if (!isNotFound(error)) {
        throw error;
      }
    }
  }
  return conflicts;
}

async function readBackWrittenRecords({ client, context, gate, writeRecords }) {
  const failures = [];
  const readbackRecords = [];
  for (const writeRecord of writeRecords) {
    try {
      const response = await client
        .database(gate.target.databaseName)
        .container(writeRecord.targetContainer)
        .item(writeRecord.id, writeRecord.tenantKey)
        .read();
      const document = response?.resource ?? null;
      if (!document) {
        failures.push(failure('AZURE_COSMOS_READBACK_RECORD_MISSING', 'readback document missing', writeRecord.id));
      }
      for (const field of ['tenantKey', 'siteKey', 'targetEntity', 'targetContainer', 'approvalManifestId', 'firstWriteBatchId', 'providerProfileId']) {
        if (document && document[field] !== writeRecord[field]) {
          failures.push(failure('AZURE_COSMOS_READBACK_FIELD_MISMATCH', `${field} mismatch`, `${writeRecord.id}/${field}`));
        }
      }
      readbackRecords.push({
        schemaVersion: azureCosmosStagingSchemaVersion,
        recordType: 'pumpkin-outbound-link-azure-cosmos-staging-readback-record',
        id: writeRecord.readbackRecordId,
        readbackRecordId: writeRecord.readbackRecordId,
        writeRecordId: writeRecord.writeRecordId,
        targetEntity: writeRecord.targetEntity,
        targetContainer: writeRecord.targetContainer,
        targetRecordId: writeRecord.targetRecordId,
        tenantKey: writeRecord.tenantKey,
        siteKey: writeRecord.siteKey,
        approvalManifestId: writeRecord.approvalManifestId,
        firstWriteBatchId: writeRecord.firstWriteBatchId,
        providerProfileId: writeRecord.providerProfileId,
        providerMode: writeRecord.providerMode,
        sourceRecordHash: writeRecord.sourceRecordHash,
        writtenRecordHash: writeRecord.writtenRecordHash,
        readbackRecordHash: document ? stateHash(document) : null,
        readbackStatus: document ? 'matched' : 'missing',
        outcome: document ? 'readback_verified' : 'readback_missing',
        blockReason: document ? null : 'readback document missing'
      });
    } catch (error) {
      failures.push(failure('AZURE_COSMOS_READBACK_FAILED', safeErrorMessage(error), writeRecord.id));
    }
  }
  return {
    schemaVersion: azureCosmosStagingSchemaVersion,
    resultType: 'pumpkin-outbound-link-azure-cosmos-staging-readback-result',
    status: failures.length === 0 && readbackRecords.length === context.records.length ? 'passed' : 'failed',
    approvalManifestId: approvedAzureCosmosStaging.approvalManifestId,
    firstWriteBatchId: approvedAzureCosmosStaging.firstWriteBatchId,
    providerProfileId: context.profile.providerProfileId,
    providerMode: context.profile.providerMode,
    records: readbackRecords,
    summary: {
      readbackRecordCount: readbackRecords.length,
      expectedRecordCount: context.records.length,
      countsByEntity: countByEntity(readbackRecords),
      failureCount: failures.length
    },
    failures,
    boundaries: azureCosmosExecutionBoundaries({ liveProviderWrites: true })
  };
}

function buildCosmosDocument({ context, record }) {
  const stagingExecutionRunId = createLiveStagingExecutionRunId({ context });
  const readbackRunId = createLiveReadbackRunId({ stagingExecutionRunId });
  return {
    ...record,
    dryRunOnly: false,
    liveWriteAllowed: true,
    productionWriteAllowed: false,
    providerProfileId: context.profile.providerProfileId,
    providerMode: context.profile.providerMode,
    approvalManifestId: approvedAzureCosmosStaging.approvalManifestId,
    approvalReference: 'V2.2.2',
    firstWriteBatchId: approvedAzureCosmosStaging.firstWriteBatchId,
    stagingExecutionRunId,
    readbackRunId,
    writeExecution: 'azure_cosmos_staging_create',
    outcome: 'azure_cosmos_staging_written',
    blockReason: null,
    boundaries: azureCosmosExecutionBoundaries({ liveProviderWrites: true })
  };
}

function writeResultRecord({ context, record, document, response }) {
  const writeRecordId = deterministicId('olazwrite', [document.stagingExecutionRunId, record.id], 18);
  const readbackRecordId = deterministicId('olazread', [document.readbackRunId, record.id], 18);
  return {
    schemaVersion: azureCosmosStagingSchemaVersion,
    recordType: 'pumpkin-outbound-link-azure-cosmos-staging-write-record',
    id: document.id,
    writeRecordId,
    readbackRecordId,
    targetRecordId: record.targetRecordId,
    targetEntity: record.targetEntity,
    targetContainer: record.targetContainer,
    tenantKey: record.tenantKey,
    siteKey: record.siteKey,
    partitionKey: record.partitionKey,
    approvalManifestId: document.approvalManifestId,
    approvalReference: document.approvalReference,
    firstWriteBatchId: document.firstWriteBatchId,
    providerProfileId: context.profile.providerProfileId,
    providerMode: context.profile.providerMode,
    requestId: record.requestId,
    actionId: record.actionId,
    correlationId: record.correlationId,
    migrationRunId: record.migrationRunId,
    migrationRecordId: record.migrationRecordId,
    sourceRecordId: record.sourceRecordId,
    outboundLinkId: record.outboundLinkId,
    outboundLinkInstanceId: record.outboundLinkInstanceId,
    policyId: record.policyId,
    policyVersion: record.policyVersion,
    scanRunId: record.scanRunId,
    reviewDecisionId: record.reviewDecisionId,
    bulkActionId: record.bulkActionId,
    auditEventIds: record.auditEventIds ?? [],
    rollbackPlanId: record.rollbackPlanId,
    affectedPageIds: record.affectedPageIds ?? [],
    affectedInstanceIds: record.affectedInstanceIds ?? [],
    beforeStateHash: record.beforeStateHash,
    afterStateHash: record.afterStateHash,
    sourceRecordHash: stateHash(record),
    writtenRecordHash: stateHash(document),
    statusCode: response?.statusCode ?? response?.headers?.[Symbol.toStringTag] ?? null,
    outcome: 'azure_cosmos_staging_written',
    blockReason: null
  };
}

function buildFinalizedApproval({ context }) {
  return {
    schemaVersion: azureCosmosStagingSchemaVersion,
    manifestType: 'pumpkin-outbound-link-v2-2-2-scoped-staging-write-approval-finalization',
    status: 'finalized_for_v2_2_2_scoped_staging_write',
    approvalManifestId: approvedAzureCosmosStaging.approvalManifestId,
    approvalReference: 'V2.2.2',
    firstWriteBatchId: approvedAzureCosmosStaging.firstWriteBatchId,
    providerProfileId: context.profile.providerProfileId,
    providerMode: context.profile.providerMode,
    expectedRecordCount: approvedAzureCosmosStaging.expectedRecordCount,
    futureExplicitStagingWriteApprovalRequired: false,
    futureApprovalGranted: true,
    realStagingProviderWritePerformed: false,
    productionDatabaseMigrationPerformed: false,
    boundaries: azureCosmosExecutionBoundaries({ liveProviderWrites: false })
  };
}

function buildManifest({ context, gate, writeRecords, readback, traceAuditRollback, providerState }) {
  return {
    schemaVersion: azureCosmosStagingSchemaVersion,
    manifestType: 'pumpkin-outbound-link-azure-cosmos-staging-execution-manifest',
    status: [readback.status, traceAuditRollback.status, providerState.status].every((status) => status === 'passed') ? 'passed' : 'failed',
    writeExecuted: true,
    approvalManifestId: approvedAzureCosmosStaging.approvalManifestId,
    approvalReference: 'V2.2.2',
    firstWriteBatchId: approvedAzureCosmosStaging.firstWriteBatchId,
    providerProfileId: context.profile.providerProfileId,
    providerMode: context.profile.providerMode,
    target: gate.target,
    tenantKey: approvedAzureCosmosStaging.tenantKey,
    siteKey: approvedAzureCosmosStaging.siteKey,
    summary: {
      recordsWritten: writeRecords.length,
      expectedRecordCount: approvedAzureCosmosStaging.expectedRecordCount,
      countsByEntity: countByEntity(writeRecords),
      readbackStatus: readback.status,
      traceAuditRollbackStatus: traceAuditRollback.status,
      providerStateStatus: providerState.status
    },
    files: outputFiles,
    boundaries: azureCosmosExecutionBoundaries({ liveProviderWrites: true })
  };
}

function buildValidation({ context, manifest, readback, traceAuditRollback, providerState }) {
  const failures = [];
  if (manifest.summary.recordsWritten !== approvedAzureCosmosStaging.expectedRecordCount) {
    failures.push(failure('AZURE_COSMOS_RECORD_COUNT_MISMATCH', 'records written must equal expected record count', 'recordsWritten'));
  }
  for (const [code, result] of [
    ['AZURE_COSMOS_READBACK_FAILED', readback],
    ['AZURE_COSMOS_TRACE_AUDIT_ROLLBACK_FAILED', traceAuditRollback],
    ['AZURE_COSMOS_PROVIDER_STATE_FAILED', providerState]
  ]) {
    if (result.status !== 'passed') {
      failures.push(failure(code, `${code} must pass`, code));
    }
  }
  return {
    schemaVersion: azureCosmosStagingSchemaVersion,
    validationType: 'pumpkin-outbound-link-azure-cosmos-staging-execution-validation',
    status: failures.length === 0 ? 'passed' : 'failed',
    providerProfileId: context.profile.providerProfileId,
    providerMode: context.profile.providerMode,
    approvalManifestId: approvedAzureCosmosStaging.approvalManifestId,
    firstWriteBatchId: approvedAzureCosmosStaging.firstWriteBatchId,
    summary: {
      recordsWritten: manifest.summary.recordsWritten,
      expectedRecordCount: approvedAzureCosmosStaging.expectedRecordCount,
      readbackStatus: readback.status,
      failureCount: failures.length
    },
    failures,
    boundaries: azureCosmosExecutionBoundaries({ liveProviderWrites: true })
  };
}

async function writeBlockedResult({ outputRoot, context, gate, blockReason }) {
  const blocked = blockedEnvelope({ context, gate, blockReason });
  await writeJson(path.join(outputRoot, 'approval-manifest-finalized.json'), {
    schemaVersion: azureCosmosStagingSchemaVersion,
    status: 'not_finalized',
    approvalManifestId: approvedAzureCosmosStaging.approvalManifestId,
    firstWriteBatchId: approvedAzureCosmosStaging.firstWriteBatchId,
    blockReason,
    boundaries: azureCosmosExecutionBoundaries({ liveProviderWrites: false })
  });
  await writeJson(path.join(outputRoot, 'write-records.json'), blocked);
  await writeJson(path.join(outputRoot, 'readback-result.json'), blocked);
  await writeJson(path.join(outputRoot, 'trace-audit-rollback-validation.json'), blocked);
  await writeJson(path.join(outputRoot, 'provider-state-result.json'), blocked);
  await writeJson(path.join(outputRoot, 'azure-cosmos-staging-execution-manifest.json'), {
    schemaVersion: azureCosmosStagingSchemaVersion,
    manifestType: 'pumpkin-outbound-link-azure-cosmos-staging-execution-manifest',
    status: 'blocked',
    writeExecuted: false,
    approvalManifestId: approvedAzureCosmosStaging.approvalManifestId,
    firstWriteBatchId: approvedAzureCosmosStaging.firstWriteBatchId,
    providerProfileId: context.profile.providerProfileId,
    providerMode: context.profile.providerMode,
    blockReason,
    summary: {
      recordsWritten: 0,
      expectedRecordCount: approvedAzureCosmosStaging.expectedRecordCount,
      failureCount: gate.failures.length
    },
    files: outputFiles,
    boundaries: azureCosmosExecutionBoundaries({ liveProviderWrites: false })
  });
  const validation = {
    schemaVersion: azureCosmosStagingSchemaVersion,
    validationType: 'pumpkin-outbound-link-azure-cosmos-staging-execution-validation',
    status: 'blocked',
    providerProfileId: context.profile.providerProfileId,
    providerMode: context.profile.providerMode,
    approvalManifestId: approvedAzureCosmosStaging.approvalManifestId,
    firstWriteBatchId: approvedAzureCosmosStaging.firstWriteBatchId,
    summary: {
      recordsWritten: 0,
      expectedRecordCount: approvedAzureCosmosStaging.expectedRecordCount,
      failureCount: gate.failures.length
    },
    failures: gate.failures,
    boundaries: azureCosmosExecutionBoundaries({ liveProviderWrites: false })
  };
  await writeJson(path.join(outputRoot, 'VALIDATION_RESULT.json'), validation);
  await writeChecksums({ outputRoot });
  return {
    outputRoot,
    context,
    gate,
    validation,
    summary: {
      outputPath: toPackageRelative(outputRoot),
      status: validation.status,
      writeExecuted: false,
      recordsWritten: 0,
      readbackStatus: 'blocked',
      providerProfileId: context.profile.providerProfileId,
      providerMode: context.profile.providerMode,
      blockReason
    }
  };
}

async function writePartialFailureResult({ outputRoot, context, gate, writeRecords, writeFailure }) {
  await writeJson(path.join(outputRoot, 'write-records.json'), {
    schemaVersion: azureCosmosStagingSchemaVersion,
    status: 'partial_failure',
    records: writeRecords,
    summary: {
      recordsWritten: writeRecords.length,
      expectedRecordCount: approvedAzureCosmosStaging.expectedRecordCount,
      failureCount: 1
    },
    failures: [writeFailure],
    boundaries: azureCosmosExecutionBoundaries({ liveProviderWrites: true })
  });
  const blocked = blockedEnvelope({ context, gate, blockReason: 'partial write failure; readback not attempted broadly' });
  await writeJson(path.join(outputRoot, 'readback-result.json'), blocked);
  await writeJson(path.join(outputRoot, 'trace-audit-rollback-validation.json'), blocked);
  await writeJson(path.join(outputRoot, 'provider-state-result.json'), blocked);
  await writeJson(path.join(outputRoot, 'approval-manifest-finalized.json'), buildFinalizedApproval({ context }));
  await writeJson(path.join(outputRoot, 'azure-cosmos-staging-execution-manifest.json'), {
    schemaVersion: azureCosmosStagingSchemaVersion,
    manifestType: 'pumpkin-outbound-link-azure-cosmos-staging-execution-manifest',
    status: 'partial_failure',
    writeExecuted: true,
    approvalManifestId: approvedAzureCosmosStaging.approvalManifestId,
    firstWriteBatchId: approvedAzureCosmosStaging.firstWriteBatchId,
    providerProfileId: context.profile.providerProfileId,
    providerMode: context.profile.providerMode,
    summary: {
      recordsWritten: writeRecords.length,
      expectedRecordCount: approvedAzureCosmosStaging.expectedRecordCount,
      failureCount: 1
    },
    failures: [writeFailure],
    boundaries: azureCosmosExecutionBoundaries({ liveProviderWrites: true })
  });
  const validation = {
    schemaVersion: azureCosmosStagingSchemaVersion,
    validationType: 'pumpkin-outbound-link-azure-cosmos-staging-execution-validation',
    status: 'failed',
    providerProfileId: context.profile.providerProfileId,
    providerMode: context.profile.providerMode,
    summary: {
      recordsWritten: writeRecords.length,
      expectedRecordCount: approvedAzureCosmosStaging.expectedRecordCount,
      failureCount: 1
    },
    failures: [writeFailure],
    boundaries: azureCosmosExecutionBoundaries({ liveProviderWrites: true })
  };
  await writeJson(path.join(outputRoot, 'VALIDATION_RESULT.json'), validation);
  await writeChecksums({ outputRoot });
  return {
    outputRoot,
    context,
    gate,
    validation,
    summary: {
      outputPath: toPackageRelative(outputRoot),
      status: validation.status,
      writeExecuted: true,
      recordsWritten: writeRecords.length,
      readbackStatus: 'not_run_partial_failure',
      providerProfileId: context.profile.providerProfileId,
      providerMode: context.profile.providerMode,
      blockReason: writeFailure.message
    }
  };
}

function validateTraceAuditRollback({ context, writeRecords, readback }) {
  const failures = [];
  for (const writeRecord of writeRecords) {
    for (const field of [
      'requestId',
      'actionId',
      'correlationId',
      'approvalManifestId',
      'firstWriteBatchId',
      'providerProfileId',
      'providerMode',
      'tenantKey',
      'siteKey',
      'targetRecordId',
      'targetEntity',
      'rollbackPlanId',
      'beforeStateHash',
      'afterStateHash'
    ]) {
      if (!Object.prototype.hasOwnProperty.call(writeRecord, field)) {
        failures.push(failure('AZURE_COSMOS_TRACE_FIELD_MISSING', `${field} is required`, `${writeRecord.id}/${field}`));
      }
    }
    if (writeRecord.rollbackPlanId !== context.packageManifest.rollbackPlanId) {
      failures.push(failure('AZURE_COSMOS_ROLLBACK_PLAN_MISMATCH', 'rollback plan ID mismatch', writeRecord.id));
    }
  }
  if (readback.status !== 'passed') {
    failures.push(failure('AZURE_COSMOS_READBACK_NOT_PASSED', 'readback must pass before trace/audit/rollback validation passes', 'readback'));
  }
  return {
    schemaVersion: azureCosmosStagingSchemaVersion,
    validationType: 'pumpkin-outbound-link-azure-cosmos-trace-audit-rollback-validation',
    status: failures.length === 0 ? 'passed' : 'failed',
    approvalManifestId: approvedAzureCosmosStaging.approvalManifestId,
    firstWriteBatchId: approvedAzureCosmosStaging.firstWriteBatchId,
    rollbackPlanId: context.packageManifest.rollbackPlanId,
    summary: {
      writeRecordCount: writeRecords.length,
      readbackRecordCount: readback.records?.length ?? 0,
      failureCount: failures.length
    },
    failures,
    boundaries: azureCosmosExecutionBoundaries({ liveProviderWrites: true, rollbackDeletionExecuted: false })
  };
}

function buildProviderState({ context, gate, writeRecords, readback, traceAuditRollback }) {
  const failures = [];
  for (const result of [readback, traceAuditRollback]) {
    if (result.status !== 'passed') {
      failures.push(...(result.failures ?? []));
    }
  }
  return {
    schemaVersion: azureCosmosStagingSchemaVersion,
    resultType: 'pumpkin-outbound-link-azure-cosmos-provider-state',
    status: failures.length === 0 ? 'passed' : 'failed',
    providerProfileId: context.profile.providerProfileId,
    providerMode: context.profile.providerMode,
    target: gate.target,
    summary: {
      recordsWritten: writeRecords.length,
      readbackRecordCount: readback.records?.length ?? 0,
      failureCount: failures.length
    },
    failures,
    boundaries: azureCosmosExecutionBoundaries({ liveProviderWrites: true })
  };
}

async function readProductionRecords(packageRoot) {
  const records = {};
  for (const entity of productionEntities) {
    const envelope = await readJson(path.join(packageRoot, 'evidence/migration', productionRecordFiles[entity]));
    records[entity] = envelope.records ?? [];
  }
  return records;
}

function mapApprovedRecords({ applyPlanRecords, productionRecords }) {
  const byEntityAndId = new Map();
  for (const [entity, records] of Object.entries(productionRecords)) {
    for (const record of records) {
      byEntityAndId.set(`${entity}/${record.id}`, record);
    }
  }
  return applyPlanRecords.map((applyPlanRecord) => {
    const productionRecord = byEntityAndId.get(`${applyPlanRecord.targetEntity}/${applyPlanRecord.targetRecordId}`);
    return {
      ...(productionRecord ?? {}),
      id: applyPlanRecord.targetRecordId,
      targetRecordId: applyPlanRecord.targetRecordId,
      targetEntity: applyPlanRecord.targetEntity,
      targetContainer: applyPlanRecord.targetContainer,
      tenantKey: applyPlanRecord.tenantKey,
      siteKey: applyPlanRecord.siteKey,
      partitionKey: applyPlanRecord.partitionKey,
      requestId: applyPlanRecord.requestId,
      actionId: applyPlanRecord.actionId,
      correlationId: applyPlanRecord.correlationId,
      migrationRunId: applyPlanRecord.migrationRunId,
      migrationRecordId: applyPlanRecord.migrationRecordId,
      sourceRecordId: applyPlanRecord.sourceRecordId,
      outboundLinkId: applyPlanRecord.outboundLinkId,
      outboundLinkInstanceId: applyPlanRecord.outboundLinkInstanceId,
      policyId: applyPlanRecord.policyId,
      policyVersion: applyPlanRecord.policyVersion,
      scanRunId: applyPlanRecord.scanRunId,
      reviewDecisionId: applyPlanRecord.reviewDecisionId,
      bulkActionId: applyPlanRecord.bulkActionId,
      auditEventIds: applyPlanRecord.auditEventIds ?? [],
      rollbackPlanId: applyPlanRecord.rollbackPlanId,
      affectedPageIds: applyPlanRecord.affectedPageIds ?? [],
      affectedInstanceIds: applyPlanRecord.affectedInstanceIds ?? [],
      beforeStateHash: applyPlanRecord.beforeStateHash,
      afterStateHash: applyPlanRecord.afterStateHash,
      migrationRecordHash: applyPlanRecord.migrationRecordHash
    };
  });
}

function createLiveStagingExecutionRunId({ context }) {
  return deterministicId('olazstage', [
    context.packageManifest.applyPlanId,
    approvedAzureCosmosStaging.providerProfileId,
    approvedAzureCosmosStaging.firstWriteBatchId,
    'v2-2-2'
  ], 16);
}

function createLiveReadbackRunId({ stagingExecutionRunId }) {
  return deterministicId('olazread', [stagingExecutionRunId, 'v2-2-2-readback'], 16);
}

function countByEntity(records) {
  return Object.fromEntries(productionEntities.map((entity) => [
    entity,
    records.filter((record) => record.targetEntity === entity).length
  ]));
}

function expectEqual(failures, actual, expected, code, pathValue) {
  if (actual !== expected) {
    failures.push(failure(code, `${pathValue} must equal ${expected}`, pathValue));
  }
}

function failure(code, message, pathValue) {
  return { code, message, path: pathValue };
}

function isNotFound(error) {
  return error?.code === 404 || error?.statusCode === 404 || error?.statusCode === '404';
}

function safeErrorMessage(error) {
  const message = String(error?.message ?? error ?? 'unknown error');
  const accountKeyPattern = new RegExp('Account' + 'Key=[^;&\\s]+', 'gi');
  return message
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, 'Bearer <redacted>')
    .replace(/sig=[^&\s]+/gi, 'sig=redacted')
    .replace(accountKeyPattern, 'storage-account-key redacted');
}

function blockedEnvelope({ context, gate, blockReason }) {
  return {
    schemaVersion: azureCosmosStagingSchemaVersion,
    status: 'blocked',
    providerProfileId: context.profile.providerProfileId,
    providerMode: context.profile.providerMode,
    approvalManifestId: approvedAzureCosmosStaging.approvalManifestId,
    firstWriteBatchId: approvedAzureCosmosStaging.firstWriteBatchId,
    blockReason,
    summary: {
      recordsWritten: 0,
      expectedRecordCount: approvedAzureCosmosStaging.expectedRecordCount,
      failureCount: gate.failures.length
    },
    failures: gate.failures,
    boundaries: azureCosmosExecutionBoundaries({ liveProviderWrites: false })
  };
}

function azureCosmosExecutionBoundaries({ liveProviderWrites, rollbackDeletionExecuted = false }) {
  return {
    localOnly: false,
    stagingOnly: true,
    scopedV2_2_2Only: true,
    liveProviderWrites,
    productionWrites: false,
    productionDatabaseMigration: false,
    cmsWrites: false,
    protectedConfigReads: false,
    secretValuesIncluded: false,
    keysListKeys: false,
    connectionStrings: false,
    sasGenerated: false,
    externalCrawling: false,
    azureInfrastructureMutations: false,
    rbacAssignments: false,
    deployment: false,
    searchConsoleIndexing: false,
    livePagePublication: false,
    rollbackDeletionExecuted
  };
}

async function writeChecksums({ outputRoot }) {
  const files = (await listFiles(outputRoot))
    .map((file) => path.relative(outputRoot, file).replaceAll('\\', '/'))
    .filter((file) => !['checksums.json', 'checksums.sha256'].includes(file))
    .sort();
  const checksums = [];
  for (const file of files) {
    const bytes = await fs.readFile(path.join(outputRoot, file));
    checksums.push({ file, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
  }
  await writeJson(path.join(outputRoot, 'checksums.json'), {
    schemaVersion: azureCosmosStagingSchemaVersion,
    checksumType: 'pumpkin-outbound-link-azure-cosmos-staging-checksums',
    files: checksums
  });
  await fs.writeFile(path.join(outputRoot, 'checksums.sha256'), `${checksums.map((item) => `${item.sha256}  ${item.file}`).join('\n')}\n`, 'utf8');
}

async function listFiles(root) {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}
