import fs from 'node:fs/promises';
import path from 'node:path';
import { deterministicId, stateHash } from '../migration/deterministic-id-mapper.mjs';
import { productionEntities } from '../migration/target-entity-router.mjs';
import { readJson, writeJson } from '../utils/json-writer.mjs';

export const stagingExecutionSchemaVersion = '0.1.0';

export const stagingTraceFields = [
  'requestId',
  'actionId',
  'correlationId',
  'migrationRunId',
  'migrationRecordId',
  'providerProfileId',
  'providerMode',
  'applyPlanId',
  'applyPlanRecordId',
  'stagingExecutionRunId',
  'stagingExecutionRecordId',
  'readbackRunId',
  'readbackRecordId',
  'tenantKey',
  'siteKey',
  'sourceRecordId',
  'targetRecordId',
  'targetEntity',
  'outboundLinkId',
  'outboundLinkInstanceId',
  'policyId',
  'policyVersion',
  'scanRunId',
  'reviewDecisionId',
  'bulkActionId',
  'auditEventIds',
  'rollbackPlanId',
  'affectedPageIds',
  'affectedInstanceIds',
  'beforeStateHash',
  'afterStateHash',
  'migrationRecordHash',
  'applyPlanRecordHash',
  'stagingExecutionRecordHash',
  'readbackRecordHash',
  'performedAt',
  'outcome',
  'blockReason',
  'validationResultId'
];

export function createStagingExecutionRunId({ applyPlanId, providerProfileId, providerMode }) {
  return deterministicId('olstage', [applyPlanId, providerProfileId, providerMode, 'phase-2h20'], 16);
}

export function createReadbackRunId({ stagingExecutionRunId }) {
  return deterministicId('olread', [stagingExecutionRunId, 'readback'], 16);
}

export function buildStagingExecutionRecords({ applyPlanRecords, profile, applyPlanManifest }) {
  const stagingExecutionRunId = createStagingExecutionRunId({
    applyPlanId: applyPlanManifest.applyPlanId,
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode
  });
  const readbackRunId = createReadbackRunId({ stagingExecutionRunId });
  return applyPlanRecords.map((applyPlanRecord, index) => buildStagingExecutionRecord({
    applyPlanRecord,
    profile,
    stagingExecutionRunId,
    readbackRunId,
    index
  }));
}

export function buildStagingExecutionRecord({ applyPlanRecord, profile, stagingExecutionRunId, readbackRunId, index }) {
  const applyPlanRecordHash = stateHash(applyPlanRecord);
  const stagingExecutionRecordId = deterministicId('olstagexec', [stagingExecutionRunId, applyPlanRecord.applyPlanRecordId, index], 18);
  const readbackRecordId = deterministicId('olreadrec', [readbackRunId, stagingExecutionRecordId], 18);
  const providerStoredRecordHash = stateHash({
    stagingExecutionRunId,
    stagingExecutionRecordId,
    applyPlanRecordHash,
    targetEntity: applyPlanRecord.targetEntity,
    targetRecordId: applyPlanRecord.targetRecordId,
    targetContainer: applyPlanRecord.targetContainer,
    operation: applyPlanRecord.operation
  });
  const readbackRecordHash = stateHash({
    readbackRunId,
    readbackRecordId,
    stagingExecutionRecordId,
    providerStoredRecordHash
  });
  const base = {
    schemaVersion: stagingExecutionSchemaVersion,
    recordType: 'pumpkin-outbound-link-staging-execution-record',
    id: stagingExecutionRecordId,
    requestId: applyPlanRecord.requestId,
    actionId: applyPlanRecord.actionId,
    correlationId: applyPlanRecord.correlationId,
    migrationRunId: applyPlanRecord.migrationRunId,
    migrationRecordId: applyPlanRecord.migrationRecordId,
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    applyPlanId: applyPlanRecord.applyPlanId,
    applyPlanRecordId: applyPlanRecord.applyPlanRecordId,
    stagingExecutionRunId,
    stagingExecutionRecordId,
    readbackRunId,
    readbackRecordId,
    tenantKey: applyPlanRecord.tenantKey,
    siteKey: applyPlanRecord.siteKey,
    partitionKey: applyPlanRecord.partitionKey,
    sourceRecordId: applyPlanRecord.sourceRecordId,
    targetRecordId: applyPlanRecord.targetRecordId,
    targetEntity: applyPlanRecord.targetEntity,
    sourceEntity: applyPlanRecord.sourceEntity,
    targetContainer: applyPlanRecord.targetContainer,
    operation: executionOperationFor(applyPlanRecord.operation),
    writeExecution: 'staging_simulated_tmp_write',
    dryRunOnly: false,
    stagingSimulatedOnly: true,
    liveWriteAllowed: false,
    productionWriteAllowed: false,
    requiresFutureApproval: true,
    outboundLinkId: applyPlanRecord.outboundLinkId,
    outboundLinkInstanceId: applyPlanRecord.outboundLinkInstanceId,
    policyId: applyPlanRecord.policyId,
    policyVersion: applyPlanRecord.policyVersion,
    scanRunId: applyPlanRecord.scanRunId,
    reviewDecisionId: applyPlanRecord.reviewDecisionId,
    bulkActionId: applyPlanRecord.bulkActionId,
    auditEventIds: Array.isArray(applyPlanRecord.auditEventIds) ? applyPlanRecord.auditEventIds : [],
    rollbackPlanId: applyPlanRecord.rollbackPlanId,
    affectedPageIds: Array.isArray(applyPlanRecord.affectedPageIds) ? applyPlanRecord.affectedPageIds : [],
    affectedInstanceIds: Array.isArray(applyPlanRecord.affectedInstanceIds) ? applyPlanRecord.affectedInstanceIds : [],
    beforeStateHash: applyPlanRecord.beforeStateHash,
    afterStateHash: applyPlanRecord.afterStateHash,
    migrationRecordHash: applyPlanRecord.migrationRecordHash,
    applyPlanRecordHash,
    providerStoredRecordHash,
    readbackRecordHash,
    performedAt: applyPlanRecord.performedAt,
    outcome: 'staging_simulated_written',
    blockReason: null,
    validationResultId: deterministicId('olstageval', [stagingExecutionRecordId, 'validation'], 12),
    sourceApplyPlanOutcome: applyPlanRecord.outcome,
    boundaries: stagingExecutionBoundaries()
  };
  return {
    ...base,
    stagingExecutionRecordHash: stateHash({
      ...base,
      stagingExecutionRecordHash: 'pending'
    })
  };
}

export function buildProviderStoreRecord(executionRecord) {
  const base = {
    schemaVersion: stagingExecutionSchemaVersion,
    recordType: 'pumpkin-outbound-link-staging-provider-store-record',
    providerStoredRecordId: deterministicId('olstgstore', [executionRecord.stagingExecutionRunId, executionRecord.targetEntity, executionRecord.targetRecordId], 18),
    ...copyTraceFields(executionRecord),
    targetContainer: executionRecord.targetContainer,
    operation: executionRecord.operation,
    providerStoredRecordHash: executionRecord.providerStoredRecordHash,
    storedAt: executionRecord.performedAt,
    outcome: 'stored_in_staging_simulated_provider',
    boundaries: stagingExecutionBoundaries()
  };
  return base;
}

export async function writeStagingExecutionRecords({ outputRoot, executionRecords }) {
  await writeJson(path.join(outputRoot, 'staging-execution-records.json'), {
    schemaVersion: stagingExecutionSchemaVersion,
    collectionType: 'pumpkin-outbound-link-staging-execution-records',
    stagingExecutionRunId: executionRecords[0]?.stagingExecutionRunId ?? null,
    readbackRunId: executionRecords[0]?.readbackRunId ?? null,
    applyPlanId: executionRecords[0]?.applyPlanId ?? null,
    tenantKey: executionRecords[0]?.tenantKey ?? null,
    siteKey: executionRecords[0]?.siteKey ?? null,
    records: executionRecords,
    boundaries: stagingExecutionBoundaries()
  });
}

export async function writeStagingProviderStore({ outputRoot, executionRecords }) {
  const storeRoot = path.join(outputRoot, 'staging-provider-store');
  await fs.mkdir(storeRoot, { recursive: true });
  const storeRecords = executionRecords.map(buildProviderStoreRecord);
  const files = [];
  for (const entity of productionEntities) {
    const records = storeRecords.filter((record) => record.targetEntity === entity);
    const file = `${entity}.json`;
    await writeJson(path.join(storeRoot, file), {
      schemaVersion: stagingExecutionSchemaVersion,
      collectionType: 'pumpkin-outbound-link-staging-simulated-provider-store',
      entity,
      stagingExecutionRunId: executionRecords[0]?.stagingExecutionRunId ?? null,
      tenantKey: executionRecords[0]?.tenantKey ?? null,
      siteKey: executionRecords[0]?.siteKey ?? null,
      records,
      boundaries: stagingExecutionBoundaries()
    });
    files.push(file);
  }
  await writeJson(path.join(storeRoot, 'staging-provider-store-index.json'), {
    schemaVersion: stagingExecutionSchemaVersion,
    indexType: 'pumpkin-outbound-link-staging-simulated-provider-store-index',
    stagingExecutionRunId: executionRecords[0]?.stagingExecutionRunId ?? null,
    readbackRunId: executionRecords[0]?.readbackRunId ?? null,
    files,
    summary: {
      totalRecords: storeRecords.length,
      countsByEntity: countByEntity(storeRecords)
    },
    boundaries: stagingExecutionBoundaries()
  });
  return { storeRoot, storeRecords, files };
}

export async function readStagingExecutionRecords(executionRoot) {
  const envelope = await readJson(path.join(executionRoot, 'staging-execution-records.json'));
  return envelope.records ?? [];
}

export async function readStagingProviderStore(executionRoot) {
  const storeRoot = path.join(executionRoot, 'staging-provider-store');
  const records = [];
  for (const entity of productionEntities) {
    const envelope = await readJson(path.join(storeRoot, `${entity}.json`));
    records.push(...(envelope.records ?? []));
  }
  return {
    storeRoot,
    records,
    byExecutionRecordId: new Map(records.map((record) => [record.stagingExecutionRecordId, record]))
  };
}

export function copyTraceFields(record) {
  return Object.fromEntries(stagingTraceFields.map((field) => [field, record[field] ?? null]));
}

export function countByEntity(records) {
  return Object.fromEntries(productionEntities.map((entity) => [
    entity,
    records.filter((record) => record.targetEntity === entity).length
  ]));
}

export function stagingExecutionBoundaries() {
  return {
    localOnly: true,
    stagingSimulatedOnly: true,
    writesOnlyUnderTmp: true,
    liveProviderWrites: false,
    productionWrites: false,
    productionDatabaseMigration: false,
    cmsWrites: false,
    protectedConfigReads: false,
    secretValuesIncluded: false,
    externalCrawling: false,
    azureMutations: false,
    deployment: false,
    searchConsoleIndexing: false,
    livePagePublication: false
  };
}

function executionOperationFor(applyPlanOperation) {
  if (applyPlanOperation === 'would_write_trace_log') return 'staging_simulated_write_trace_log';
  if (applyPlanOperation === 'would_write_rollback_plan') return 'staging_simulated_write_rollback_plan';
  return 'staging_simulated_upsert_candidate';
}

