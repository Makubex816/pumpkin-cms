import fs from 'node:fs/promises';
import path from 'node:path';
import { writeChecksums } from '../checksum-writer.mjs';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { resolveTmpBundlePath, resolveTmpOutputPath } from '../utils/safe-paths.mjs';
import { validateSeedDryRunPackage, writeSeedValidationReports } from './tenant-partition-validator.mjs';
import { approvedCosmosContainers, listApprovedCosmosContainerNames } from './cosmos-container-router.mjs';
import {
  buildComparableDocument,
  CosmosAadDataPlaneClient,
  CosmosDataPlaneError
} from './live-cosmos-aad-client.mjs';

const tenantKey = 'ice-rink-rentals';
const livePhase = '2F-12P';

export async function runGuardedLiveCosmosSeed({
  seedPath,
  outputPath,
  overwrite = false,
  client = null,
  now = new Date()
}) {
  const seedRoot = resolveTmpBundlePath(seedPath);
  const outputRoot = resolveTmpOutputPath(outputPath);
  if (await pathExists(outputRoot)) {
    if (!overwrite) throw new Error(`output already exists; pass --overwrite to replace: ${outputPath}`);
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(outputRoot, { recursive: true });

  const startedAt = now.toISOString();
  const seedValidation = await validateSeedDryRunPackage({ seedPath: seedRoot, expectedTenantKey: tenantKey });
  await writeSeedValidationReports({ seedRoot, validation: seedValidation });
  const seedManifest = await readJson(path.join(seedRoot, 'seed-manifest.json'));
  const seedDocuments = await readSeedDocuments(seedRoot, seedManifest);
  const expectedCounts = buildExpectedCounts(seedDocuments);
  const result = baseResult({ startedAt, seedRoot, outputRoot, seedManifest, seedValidation, expectedCounts });

  if (seedValidation.status !== 'passed') {
    result.status = 'blocked';
    result.blockers.push(blocker('SEED_DRY_RUN_VALIDATION_FAILED', 'Phase 2F-12O seed dry-run validation did not pass.'));
    await writeLiveSeedReports({ outputRoot, result });
    return result;
  }

  const targetValidation = validateManifestTarget(seedManifest);
  result.targetReadback = targetValidation;
  if (targetValidation.status !== 'passed') {
    result.status = 'blocked';
    result.blockers.push(...targetValidation.failures.map((failure) => blocker(failure.code, failure.message)));
    await writeLiveSeedReports({ outputRoot, result });
    return result;
  }

  const dataPlaneClient = client ?? new CosmosAadDataPlaneClient({
    accountName: seedManifest.target.accountName,
    databaseName: seedManifest.target.databaseName
  });

  try {
    result.dataPlaneAccess = await dataPlaneClient.verifyAccess({ containerName: 'tenants', tenantKey });
  } catch (error) {
    result.status = 'blocked';
    result.dataPlaneAccess = dataPlaneAccessBlocked(error);
    result.blockers.push(blocker('DATA_PLANE_ACCESS_UNAVAILABLE', 'Safe Azure AD/RBAC Cosmos data-plane access was unavailable; no live seed writes were attempted.'));
    await writeLiveSeedReports({ outputRoot, result });
    return result;
  }

  try {
    result.preWriteTargetState = await inspectPreWriteState({ client: dataPlaneClient, seedDocuments, expectedCounts });
  } catch (error) {
    result.status = 'blocked';
    result.preWriteTargetState = preWriteBlocked(error);
    result.blockers.push(blocker('PRE_WRITE_TARGET_STATE_UNAVAILABLE', 'Pre-write target state could not be verified safely; no live seed writes were attempted.'));
    await writeLiveSeedReports({ outputRoot, result });
    return result;
  }

  if (result.preWriteTargetState.conflictCount > 0 || result.preWriteTargetState.extraTenantDocumentCount > 0) {
    result.status = 'blocked';
    result.blockers.push(blocker('PRE_WRITE_TARGET_CONFLICT', 'Existing tenant documents did not match the deterministic seed package; no live seed writes were attempted.'));
    await writeLiveSeedReports({ outputRoot, result });
    return result;
  }

  try {
    result.execution.attempted = true;
    await executeMissingSeedDocuments({
      client: dataPlaneClient,
      seedDocuments,
      existingMatches: result.preWriteTargetState.existingMatches,
      execution: result.execution
    });
  } catch (error) {
    result.status = result.execution.createdCount > 0 ? 'partial' : 'failed';
    result.execution.error = summarizeError(error);
    result.blockers.push(blocker('LIVE_SEED_WRITE_FAILED', 'A guarded Cosmos data-plane write failed. Runtime switch remains blocked.'));
    await writeLiveSeedReports({ outputRoot, result });
    return result;
  }

  try {
    result.readback = await performReadback({ client: dataPlaneClient, expectedCounts });
  } catch (error) {
    result.status = 'partial';
    result.readback = readbackBlocked(error);
    result.blockers.push(blocker('READBACK_VERIFICATION_FAILED', 'Seed writes completed or were skipped, but readback verification did not pass.'));
    await writeLiveSeedReports({ outputRoot, result });
    return result;
  }

  result.status = result.readback.status === 'passed' ? 'seeded-and-verified' : 'partial';
  if (result.status !== 'seeded-and-verified') {
    result.blockers.push(blocker('READBACK_COUNT_MISMATCH', 'Readback counts did not match the approved seed manifest.'));
  }
  await writeLiveSeedReports({ outputRoot, result });
  return result;
}

async function readSeedDocuments(seedRoot, seedManifest) {
  const documentsByContainer = {};
  for (const container of seedManifest.target.containers) {
    documentsByContainer[container.name] = await readJson(path.join(seedRoot, 'seed-documents', `${container.name}.json`));
  }
  return documentsByContainer;
}

function buildExpectedCounts(seedDocuments) {
  const counts = {};
  for (const containerName of listApprovedCosmosContainerNames()) {
    counts[containerName] = seedDocuments[containerName]?.length ?? 0;
  }
  counts.total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  return counts;
}

function baseResult({ startedAt, seedRoot, outputRoot, seedManifest, seedValidation, expectedCounts }) {
  return {
    schemaVersion: '0.1.0',
    phase: livePhase,
    status: 'started',
    startedAt,
    completedAt: null,
    dryRunSource: {
      seedRoot,
      manifestPhase: seedManifest.phase,
      migrationRunId: seedManifest.migrationRunId,
      validationStatus: seedValidation.status,
      expectedCounts
    },
    target: {
      accountName: seedManifest.target.accountName,
      resourceGroup: seedManifest.target.resourceGroup,
      databaseName: seedManifest.target.databaseName,
      partitionKeyPath: seedManifest.target.partitionKeyPath,
      tenantKey
    },
    targetReadback: null,
    dataPlaneAccess: null,
    preWriteTargetState: null,
    execution: {
      attempted: false,
      createdCount: 0,
      skippedExistingCount: 0,
      conflictCount: 0,
      failedCount: 0,
      byContainer: {}
    },
    readback: null,
    rollbackAbort: {
      rollbackExecuted: false,
      reason: 'No rollback or delete action is approved in Phase 2F-12P. If a partial live seed occurs, future rollback requires fresh owner approval.'
    },
    boundaries: {
      protectedConfigRead: false,
      keysListed: false,
      connectionStringsRead: false,
      sasGenerated: false,
      tokensPrinted: false,
      tokensPersisted: false,
      cmsRuntimeSwitchPerformed: false,
      cmsWritesPerformed: false,
      mediaAssetWritesPerformed: false,
      deploymentPerformed: false,
      searchConsoleOrIndexingPerformed: false,
      livePagePublicationPerformed: false,
      generatedTmpOutputStaged: false
    },
    blockers: [],
    outputRoot
  };
}

function validateManifestTarget(seedManifest) {
  const failures = [];
  if (seedManifest.scope?.tenantKey !== tenantKey) {
    failures.push({ code: 'TENANT_SCOPE_INVALID', message: 'Seed manifest tenant scope is not the approved Ice tenant.' });
  }
  if (seedManifest.target?.partitionKeyPath !== '/tenantKey') {
    failures.push({ code: 'PARTITION_KEY_INVALID', message: 'Seed manifest target partition key is not /tenantKey.' });
  }
  const expectedContainers = new Set(listApprovedCosmosContainerNames());
  const actualContainers = new Set(seedManifest.target?.containers?.map((container) => container.name) ?? []);
  for (const expected of expectedContainers) {
    if (!actualContainers.has(expected)) {
      failures.push({ code: 'TARGET_CONTAINER_MISSING', message: `Seed manifest target is missing approved container ${expected}.` });
    }
  }
  for (const container of seedManifest.target?.containers ?? []) {
    if (!expectedContainers.has(container.name) || container.partitionKeyPath !== '/tenantKey') {
      failures.push({ code: 'TARGET_CONTAINER_INVALID', message: `Target container ${container.name} is not approved or has the wrong partition key.` });
    }
  }
  return {
    status: failures.length === 0 ? 'passed' : 'failed',
    accountName: seedManifest.target?.accountName,
    databaseName: seedManifest.target?.databaseName,
    approvedContainerCount: approvedCosmosContainers.length,
    failures
  };
}

async function inspectPreWriteState({ client, seedDocuments, expectedCounts }) {
  const counts = {};
  const existingMatches = {};
  const conflicts = [];
  let existingMatchCount = 0;
  let missingCount = 0;

  for (const containerName of listApprovedCosmosContainerNames()) {
    const documents = seedDocuments[containerName] ?? [];
    counts[containerName] = await client.queryTenantCount({ containerName, tenantKey });
    existingMatches[containerName] = new Set();
    for (const document of documents) {
      const existing = await client.readDocument({ containerName, id: document.id, tenantKey });
      if (!existing) {
        missingCount += 1;
        continue;
      }
      if (documentsEqual(existing, document)) {
        existingMatches[containerName].add(document.id);
        existingMatchCount += 1;
      } else {
        conflicts.push({ container: containerName, id: document.id, reason: 'existing document differs from approved seed document' });
      }
    }
  }

  const actualTenantDocuments = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const extraTenantDocumentCount = Math.max(0, actualTenantDocuments - existingMatchCount);
  return {
    status: conflicts.length === 0 && extraTenantDocumentCount === 0 ? 'passed' : 'conflict',
    counts,
    expectedSeedDocuments: expectedCounts.total,
    actualTenantDocuments,
    existingMatchCount,
    missingCount,
    extraTenantDocumentCount,
    conflictCount: conflicts.length,
    conflicts,
    existingMatches
  };
}

async function executeMissingSeedDocuments({ client, seedDocuments, existingMatches, execution }) {
  for (const containerName of listApprovedCosmosContainerNames()) {
    const documents = seedDocuments[containerName] ?? [];
    if (!execution.byContainer[containerName]) {
      execution.byContainer[containerName] = { created: 0, skippedExisting: 0, expected: documents.length };
    }
    for (const document of documents) {
      if (existingMatches[containerName]?.has(document.id)) {
        execution.skippedExistingCount += 1;
        execution.byContainer[containerName].skippedExisting += 1;
        continue;
      }
      await client.createDocument({ containerName, document, tenantKey });
      execution.createdCount += 1;
      execution.byContainer[containerName].created += 1;
    }
  }
  return execution;
}

async function performReadback({ client, expectedCounts }) {
  const counts = {};
  const mismatches = [];
  for (const containerName of listApprovedCosmosContainerNames()) {
    const actual = await client.queryTenantCount({ containerName, tenantKey });
    counts[containerName] = actual;
    const expected = expectedCounts[containerName] ?? 0;
    if (actual !== expected) {
      mismatches.push({ container: containerName, expected, actual });
    }
  }
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  if (total !== expectedCounts.total) {
    mismatches.push({ container: 'total', expected: expectedCounts.total, actual: total });
  }
  return {
    status: mismatches.length === 0 ? 'passed' : 'failed',
    counts,
    total,
    expectedTotal: expectedCounts.total,
    mismatches
  };
}

async function writeLiveSeedReports({ outputRoot, result }) {
  result.completedAt = new Date().toISOString();
  const serializable = stripRuntimeOnlyFields(result);
  await writeJson(path.join(outputRoot, 'execution-manifest.json'), serializable);
  await writeJson(path.join(outputRoot, 'DATA_PLANE_ACCESS_RESULT.json'), serializable.dataPlaneAccess ?? {});
  await writeJson(path.join(outputRoot, 'PRE_WRITE_TARGET_STATE_RESULT.json'), serializable.preWriteTargetState ?? {});
  await writeJson(path.join(outputRoot, 'LIVE_SEED_EXECUTION_RESULT.json'), serializable.execution);
  await writeJson(path.join(outputRoot, 'READBACK_VERIFICATION_RESULT.json'), serializable.readback ?? {});
  await fs.writeFile(path.join(outputRoot, 'ROLLBACK_ABORT_PLAN.md'), renderRollbackAbortPlan(serializable), 'utf8');
  await fs.writeFile(path.join(outputRoot, 'EXECUTION_SUMMARY.md'), renderExecutionSummary(serializable), 'utf8');
  await writeChecksums(outputRoot);
}

function stripRuntimeOnlyFields(result) {
  const clone = structuredCloneSafe(result);
  if (clone.preWriteTargetState?.existingMatches) {
    clone.preWriteTargetState.existingMatches = Object.fromEntries(
      Object.entries(clone.preWriteTargetState.existingMatches).map(([containerName, value]) => [
        containerName,
        Array.isArray(value) ? value : [...value]
      ])
    );
  }
  return clone;
}

function documentsEqual(existing, expected) {
  return JSON.stringify(buildComparableDocument(existing)) === JSON.stringify(buildComparableDocument(expected));
}

function dataPlaneAccessBlocked(error) {
  return {
    status: 'blocked',
    authModeAttempted: 'azure-ad-rbac',
    keysListed: false,
    connectionStringsRead: false,
    sasGenerated: false,
    tokensPrinted: false,
    tokensPersisted: false,
    error: summarizeError(error)
  };
}

function preWriteBlocked(error) {
  return {
    status: 'blocked',
    error: summarizeError(error)
  };
}

function readbackBlocked(error) {
  return {
    status: 'blocked',
    error: summarizeError(error)
  };
}

function summarizeError(error) {
  if (error instanceof CosmosDataPlaneError) {
    return {
      name: error.name,
      statusCode: error.statusCode,
      code: error.code,
      operation: error.operation,
      message: error.message
    };
  }
  return {
    name: error?.name ?? 'Error',
    code: error?.code ?? 'UNKNOWN',
    message: String(error?.message ?? error).slice(0, 800)
  };
}

function blocker(code, message) {
  return { code, message };
}

function renderExecutionSummary(result) {
  return [
    '# Guarded Live Cosmos Seed Execution Summary',
    '',
    `Status: ${result.status}`,
    `Tenant key: ${tenantKey}`,
    `Target account: ${result.target.accountName}`,
    `Target database: ${result.target.databaseName}`,
    `Expected total documents: ${result.dryRunSource.expectedCounts.total}`,
    `Created documents: ${result.execution.createdCount}`,
    `Skipped existing documents: ${result.execution.skippedExistingCount}`,
    `Readback status: ${result.readback?.status ?? 'not-run'}`,
    '',
    '## Boundaries',
    '',
    '- Protected config read: false',
    '- Keys/listKeys used: false',
    '- Connection strings read: false',
    '- SAS generated: false',
    '- Tokens printed or persisted: false',
    '- CMS runtime switch performed: false',
    '- CMS writes performed: false',
    '- Deployment/indexing/live-page publication performed: false',
    ''
  ].join('\n');
}

function renderRollbackAbortPlan(result) {
  return [
    '# Rollback Abort Plan',
    '',
    'No rollback/delete operation is approved in Phase 2F-12P.',
    '',
    `Execution status: ${result.status}`,
    `Created documents: ${result.execution.createdCount}`,
    `Skipped existing documents: ${result.execution.skippedExistingCount}`,
    '',
    'If a future rollback is needed, require fresh owner approval and use tenant-scoped document IDs from the approved seed manifest and execution manifest.',
    ''
  ].join('\n');
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value, (_key, item) => {
    if (item instanceof Set) return [...item];
    return item;
  }));
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
