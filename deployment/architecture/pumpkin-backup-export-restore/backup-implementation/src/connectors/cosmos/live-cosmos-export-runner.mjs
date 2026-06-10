import fs from 'node:fs/promises';
import path from 'node:path';
import { computeBundleChecksums, isChecksumExcluded, readChecksums, writeChecksums } from '../../checksum-writer.mjs';
import { approvedCosmosContainers, listApprovedCosmosContainerNames } from '../../cosmos-seed/cosmos-container-router.mjs';
import { CosmosAadDataPlaneClient, CosmosDataPlaneError } from '../../cosmos-seed/live-cosmos-aad-client.mjs';
import { listFilesRecursive } from '../../utils/file-hash.mjs';
import { bundleRelativePath, resolveTmpBundlePath, resolveTmpOutputPath, toPosixPath } from '../../utils/safe-paths.mjs';
import { readJson, writeJson } from '../../utils/json-writer.mjs';
import { hasSecretLikeValue } from '../../validators/backup-validator.mjs';
import {
  buildCosmosCollectionEnvelope,
  buildCosmosExportManifest,
  fileNameForLogicalCollection
} from './cosmos-export-manifest.mjs';

export const liveCosmosExportContractVersion = '0.2.0';

const tenantKey = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';
const expectedDocumentCount = 27;
const target = {
  resourceGroup: 'rg-ice-production-cosmos',
  accountName: 'cosmos-pumpkin-prod-eastus',
  databaseName: 'pumpkin-prod-cms',
  partitionKeyPath: '/tenantKey'
};
const validationReportFiles = new Set(['VALIDATION_RESULT.json', 'VALIDATION_RESULT.md']);

export async function runLiveCosmosReadonlyExport({
  outputPath,
  overwrite = false,
  client = null,
  now = new Date(),
  expectedTotalDocuments = expectedDocumentCount
}) {
  const outputRoot = resolveTmpOutputPath(outputPath);
  if (await pathExists(outputRoot)) {
    if (!overwrite) throw new Error(`output already exists; pass --overwrite to replace: ${outputPath}`);
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(outputRoot, { recursive: true });

  const createdAt = now.toISOString();
  const result = baseResult({ outputRoot, createdAt, expectedTotalDocuments });
  const dataPlaneClient = client ?? new CosmosAadDataPlaneClient({
    accountName: target.accountName,
    databaseName: target.databaseName
  });

  try {
    result.dataPlaneAccess = await dataPlaneClient.verifyAccess({ containerName: 'tenants', tenantKey });
  } catch (error) {
    result.status = 'blocked';
    result.blockers.push(blocker('DATA_PLANE_ACCESS_UNAVAILABLE', 'Safe AAD/RBAC Cosmos data-plane read access was unavailable; no export was performed.'));
    result.error = summarizeError(error);
    await writeBlockedReports({ outputRoot, result });
    return result;
  }

  const containersDir = path.join(outputRoot, 'containers');
  await fs.mkdir(containersDir, { recursive: true });

  const recordSets = [];
  for (const container of approvedCosmosContainers) {
    const records = await dataPlaneClient.queryTenantDocuments({ containerName: container.name, tenantKey });
    const count = await dataPlaneClient.queryTenantCount({ containerName: container.name, tenantKey });
    const fileName = fileNameForLogicalCollection(container.name);
    const relativePath = `containers/${fileName}`;
    await writeJson(
      path.join(outputRoot, relativePath),
      buildCosmosCollectionEnvelope({
        name: container.name,
        records,
        scope: { scopeType: 'tenant', tenantKey, siteKey },
        createdAt,
        mode: 'live-readonly-portable-json',
        fakeOnly: false,
        liveCosmosExportPerformed: true,
        source: 'azure-cosmos-aad-rbac-readonly'
      })
    );
    recordSets.push({
      logicalCollection: container.name,
      path: relativePath,
      recordCount: records.length,
      countQueryResult: count
    });
  }

  const exportManifest = buildCosmosExportManifest({
    scope: { scopeType: 'tenant', tenantKey, siteKey },
    account: { accountName: target.accountName, source: 'azure-readonly-metadata' },
    database: { databaseName: target.databaseName, source: 'azure-readonly-metadata' },
    containers: {
      containers: approvedCosmosContainers.map((container) => ({
        name: container.name,
        partitionKeyPath: container.partitionKeyPath,
        documentTypes: [...container.documentTypes]
      }))
    },
    recordSets,
    createdAt,
    mode: 'live-readonly-portable-json',
    fakeOnly: false,
    liveCosmosExportPerformed: true,
    source: 'azure-cosmos-aad-rbac-readonly',
    dataPlaneAccess: result.dataPlaneAccess,
    boundaries: result.boundaries
  });
  await writeJson(path.join(outputRoot, 'export-manifest.json'), exportManifest);
  result.exportManifest = exportManifest;
  result.recordSetCount = recordSets.length;
  result.totalRecordCount = exportManifest.totalRecordCount;
  result.status = 'exported';
  await writeJson(path.join(outputRoot, 'LIVE_COSMOS_EXPORT_RESULT.json'), publicResult(result));
  await fs.writeFile(path.join(outputRoot, 'EXPORT_SUMMARY.md'), renderExportSummary(result), 'utf8');
  await writeChecksums(outputRoot);

  const validation = await validateLiveCosmosExportPackage({
    exportPath: outputRoot,
    expectedTenantKey: tenantKey,
    expectedTotalDocuments
  });
  await writeLiveCosmosExportValidationReports({ exportRoot: outputRoot, validation });
  result.validation = validation;
  result.status = validation.status === 'passed' ? 'exported-and-validated' : 'failed-validation';
  await writeJson(path.join(outputRoot, 'LIVE_COSMOS_EXPORT_RESULT.json'), publicResult(result));
  await writeChecksums(outputRoot);
  const finalValidation = await validateLiveCosmosExportPackage({
    exportPath: outputRoot,
    expectedTenantKey: tenantKey,
    expectedTotalDocuments
  });
  await writeLiveCosmosExportValidationReports({ exportRoot: outputRoot, validation: finalValidation });
  result.validation = finalValidation;
  result.status = finalValidation.status === 'passed' ? 'exported-and-validated' : 'failed-validation';
  await writeJson(path.join(outputRoot, 'LIVE_COSMOS_EXPORT_RESULT.json'), publicResult(result));
  await writeChecksums(outputRoot);
  return result;
}

export async function validateLiveCosmosExportPackage({
  exportPath,
  expectedTenantKey = tenantKey,
  expectedTotalDocuments = expectedDocumentCount
}) {
  const exportRoot = resolveTmpBundlePath(exportPath);
  const context = {
    exportRoot,
    expectedTenantKey,
    expectedTotalDocuments,
    checks: [],
    failures: [],
    warnings: [],
    metrics: {
      checkedFilesCount: 0,
      checksumResult: 'not-run',
      checksumEntries: 0,
      checksumFilesChecked: 0,
      tenantScopeResult: 'not-run',
      containerResult: 'not-run',
      secretLeakScanResult: 'not-run',
      pathSafetyResult: 'not-run',
      totalRecordCount: 0
    }
  };

  await checkExportFolder(context);
  await checkRequiredExportFiles(context);
  const manifest = await checkExportManifest(context);
  await checkExportContainers(context, manifest);
  await checkExportChecksums(context);
  await checkNoProtectedPaths(context);
  await checkNoSecretLikeValues(context);

  const status = context.failures.length === 0 ? 'passed' : 'failed';
  return {
    schemaVersion: liveCosmosExportContractVersion,
    validator: 'pumpkin-backup-center-live-cosmos-export-validator',
    status,
    generatedAt: new Date().toISOString(),
    readOnlyDataPlaneAccessOnly: true,
    summary: {
      checkedFilesCount: context.metrics.checkedFilesCount,
      totalRecordCount: context.metrics.totalRecordCount,
      expectedTotalDocuments,
      checksumResult: context.metrics.checksumResult,
      checksumEntries: context.metrics.checksumEntries,
      checksumFilesChecked: context.metrics.checksumFilesChecked,
      tenantScopeResult: context.metrics.tenantScopeResult,
      containerResult: context.metrics.containerResult,
      secretLeakScanResult: context.metrics.secretLeakScanResult,
      pathSafetyResult: context.metrics.pathSafetyResult,
      warningCount: context.warnings.length,
      failureCount: context.failures.length
    },
    checks: context.checks,
    warnings: context.warnings,
    failures: context.failures,
    errors: context.failures
  };
}

export async function writeLiveCosmosExportValidationReports({ exportRoot, validation }) {
  await writeJson(path.join(exportRoot, 'VALIDATION_RESULT.json'), validation);
  await fs.writeFile(path.join(exportRoot, 'VALIDATION_RESULT.md'), renderValidationMarkdown(validation), 'utf8');
}

function baseResult({ outputRoot, createdAt, expectedTotalDocuments }) {
  return {
    schemaVersion: liveCosmosExportContractVersion,
    phase: '2F-12R',
    status: 'started',
    generatedAt: createdAt,
    outputRoot,
    target: {
      ...target,
      tenantKey,
      siteKey
    },
    dataPlaneAccess: null,
    recordSetCount: 0,
    totalRecordCount: 0,
    expectedTotalDocuments,
    exportManifest: null,
    validation: null,
    boundaries: {
      readOnlyDataPlaneAccessOnly: true,
      protectedConfigRead: false,
      keysListed: false,
      connectionStringsRead: false,
      sasGenerated: false,
      tokensPrinted: false,
      tokensPersisted: false,
      cosmosWritesPerformed: false,
      cmsRuntimeSwitchPerformed: false,
      cmsWritesPerformed: false,
      mediaBlobDownloadPerformed: false,
      deploymentPerformed: false,
      searchConsoleOrIndexingPerformed: false,
      livePagePublicationPerformed: false,
      generatedTmpOutputStaged: false
    },
    blockers: [],
    error: null
  };
}

async function writeBlockedReports({ outputRoot, result }) {
  await writeJson(path.join(outputRoot, 'LIVE_COSMOS_EXPORT_RESULT.json'), publicResult(result));
  await fs.writeFile(path.join(outputRoot, 'EXPORT_SUMMARY.md'), renderExportSummary(result), 'utf8');
  await writeChecksums(outputRoot);
}

async function checkExportFolder(context) {
  try {
    const stat = await fs.stat(context.exportRoot);
    if (!stat.isDirectory()) throw new Error('not a directory');
    addCheck(context, 'export-folder', 'passed', 'Live Cosmos export path is a folder.');
  } catch {
    addFailure(context, 'EXPORT_PACKAGE_MISSING', '.', 'live Cosmos export package folder does not exist');
    addCheck(context, 'export-folder', 'failed', 'Live Cosmos export path is missing.');
  }
}

async function checkRequiredExportFiles(context) {
  const required = ['export-manifest.json', 'checksums.sha256', 'LIVE_COSMOS_EXPORT_RESULT.json', 'EXPORT_SUMMARY.md'];
  const missing = [];
  for (const relativePath of required) {
    try {
      await fs.access(path.join(context.exportRoot, relativePath));
    } catch {
      missing.push(relativePath);
      addFailure(context, 'REQUIRED_FILE_MISSING', relativePath, 'required live export file is missing');
    }
  }
  try {
    const stat = await fs.stat(path.join(context.exportRoot, 'containers'));
    if (!stat.isDirectory()) throw new Error('not a directory');
  } catch {
    missing.push('containers/');
    addFailure(context, 'REQUIRED_FOLDER_MISSING', 'containers', 'containers folder is missing');
  }
  addCheck(
    context,
    'required-files',
    missing.length === 0 ? 'passed' : 'failed',
    missing.length === 0 ? 'All required live export files exist.' : `Missing live export files: ${missing.join(', ')}`
  );
}

async function checkExportManifest(context) {
  let manifest;
  try {
    manifest = await readJson(path.join(context.exportRoot, 'export-manifest.json'));
  } catch (error) {
    addFailure(context, 'MANIFEST_PARSE_ERROR', 'export-manifest.json', error.message);
    addCheck(context, 'manifest-schema', 'failed', 'Export manifest could not be parsed.');
    return null;
  }

  const problems = [];
  if (!isPlainObject(manifest)) problems.push('object');
  if (manifest.schemaVersion !== liveCosmosExportContractVersion) problems.push('schemaVersion');
  if (manifest.provider !== 'cosmos') problems.push('provider');
  if (manifest.mode !== 'live-readonly-portable-json') problems.push('mode');
  if (manifest.fakeOnly !== false) problems.push('fakeOnly');
  if (manifest.liveCosmosExportPerformed !== true) problems.push('liveCosmosExportPerformed');
  if (manifest.readOnlyDataPlaneAccess !== true) problems.push('readOnlyDataPlaneAccess');
  if (manifest.protectedConfigRead !== false) problems.push('protectedConfigRead');
  if (manifest.keysListed !== false) problems.push('keysListed');
  if (manifest.connectionStringsRead !== false) problems.push('connectionStringsRead');
  if (manifest.sasGenerated !== false) problems.push('sasGenerated');
  if (manifest.tokensPrinted !== false || manifest.tokensPersisted !== false) problems.push('tokenBoundaries');
  if (manifest.cosmosWritesPerformed !== false) problems.push('cosmosWritesPerformed');
  if (manifest.tenantScope?.tenantKey !== context.expectedTenantKey) problems.push('tenantScope.tenantKey');
  if (manifest.account?.name !== target.accountName) problems.push('account.name');
  if (manifest.database?.name !== target.databaseName) problems.push('database.name');
  if (!Array.isArray(manifest.recordSets)) problems.push('recordSets');
  if (manifest.totalRecordCount !== context.expectedTotalDocuments) problems.push('totalRecordCount');

  if (problems.length > 0) {
    addFailure(context, 'MANIFEST_SCHEMA_INVALID', 'export-manifest.json', `manifest fields invalid: ${problems.join(', ')}`);
  }
  context.metrics.totalRecordCount = Number(manifest?.totalRecordCount ?? 0);
  addCheck(
    context,
    'manifest-schema',
    problems.length === 0 ? 'passed' : 'failed',
    problems.length === 0 ? 'Live Cosmos export manifest is valid.' : 'Live Cosmos export manifest has validation failures.'
  );
  return manifest;
}

async function checkExportContainers(context, manifest) {
  const before = context.failures.length;
  const expectedContainers = new Set(listApprovedCosmosContainerNames());
  const seenContainers = new Set();
  let tenantScopePassed = true;

  for (const recordSet of manifest?.recordSets ?? []) {
    if (!isPlainObject(recordSet) || typeof recordSet.logicalCollection !== 'string') {
      addFailure(context, 'RECORD_SET_INVALID', 'export-manifest.json', 'record set entry is invalid');
      continue;
    }
    if (!expectedContainers.has(recordSet.logicalCollection)) {
      addFailure(context, 'UNAPPROVED_CONTAINER', recordSet.logicalCollection, 'record set is not an approved Cosmos container');
      continue;
    }
    seenContainers.add(recordSet.logicalCollection);
    const envelope = await readEnvelope(context, recordSet.path);
    if (!envelope) continue;
    if (envelope.provider !== 'cosmos' || envelope.mode !== 'live-readonly-portable-json') {
      addFailure(context, 'COLLECTION_ENVELOPE_INVALID', recordSet.path, 'collection envelope provider/mode is invalid');
    }
    if (envelope.logicalCollection !== recordSet.logicalCollection) {
      addFailure(context, 'COLLECTION_ENVELOPE_MISMATCH', recordSet.path, 'collection envelope logicalCollection does not match manifest');
    }
    if (!Array.isArray(envelope.records) || envelope.recordCount !== envelope.records.length || recordSet.recordCount !== envelope.records.length) {
      addFailure(context, 'COLLECTION_RECORD_COUNT_MISMATCH', recordSet.path, 'record count does not match records array');
    }
    if (recordSet.countQueryResult !== undefined && recordSet.countQueryResult !== envelope.records.length) {
      addFailure(context, 'COUNT_QUERY_MISMATCH', recordSet.path, 'count query did not match exported records array');
    }
    for (const [index, record] of (envelope.records ?? []).entries()) {
      if (!isPlainObject(record)) {
        addFailure(context, 'COSMOS_RECORD_INVALID', `${recordSet.path}[${index}]`, 'exported record must be an object');
        tenantScopePassed = false;
        continue;
      }
      if (record.tenantKey !== context.expectedTenantKey) {
        addFailure(context, 'TENANT_KEY_INVALID', `${recordSet.path}[${index}]`, 'exported record tenantKey is outside the approved Ice scope');
        tenantScopePassed = false;
      }
      for (const key of Object.keys(record)) {
        if (key.startsWith('_')) {
          addFailure(context, 'COSMOS_SYSTEM_FIELD_PRESENT', `${recordSet.path}[${index}].${key}`, 'Cosmos system fields must be stripped from portable export records');
        }
      }
    }
  }

  for (const containerName of expectedContainers) {
    if (!seenContainers.has(containerName)) {
      addFailure(context, 'APPROVED_CONTAINER_MISSING', `containers/${fileNameForLogicalCollection(containerName)}`, 'approved container export is missing');
    }
  }
  context.metrics.containerResult = context.failures.length === before ? 'passed' : 'failed';
  context.metrics.tenantScopeResult = tenantScopePassed ? 'passed' : 'failed';
  addCheck(
    context,
    'approved-containers',
    context.metrics.containerResult,
    context.metrics.containerResult === 'passed' ? 'All approved Cosmos containers are exported.' : 'Container export validation failed.'
  );
  addCheck(
    context,
    'tenant-scope',
    context.metrics.tenantScopeResult,
    context.metrics.tenantScopeResult === 'passed' ? 'All exported records are scoped to the Ice tenant.' : 'Tenant scope failures were found.'
  );
}

async function readEnvelope(context, relativePath) {
  if (!isSafeRelativePath(relativePath)) {
    addFailure(context, 'RECORD_SET_PATH_INVALID', relativePath, 'record set path must be safe and export-relative');
    return null;
  }
  try {
    return await readJson(path.join(context.exportRoot, relativePath));
  } catch (error) {
    addFailure(context, 'COLLECTION_EXPORT_MISSING', relativePath, error.message);
    return null;
  }
}

async function checkExportChecksums(context) {
  const before = context.failures.length;
  let expected;
  try {
    expected = await readChecksums(context.exportRoot);
  } catch (error) {
    addFailure(context, 'CHECKSUM_PARSE_ERROR', 'checksums.sha256', error.message);
    addCheck(context, 'checksums', 'failed', 'Checksum file could not be parsed.');
    context.metrics.checksumResult = 'failed';
    return;
  }
  const expectedByPath = new Map();
  const seen = new Set();
  for (const entry of expected) {
    if (!isSafeRelativePath(entry.path)) {
      addFailure(context, 'CHECKSUM_FILE_PATH_INVALID', entry.path, 'checksum path must be export-relative and safe');
      continue;
    }
    if (seen.has(entry.path)) {
      addFailure(context, 'CHECKSUM_DUPLICATE', entry.path, 'checksum path is duplicated');
      continue;
    }
    seen.add(entry.path);
    if (entry.path === 'checksums.sha256' || validationReportFiles.has(entry.path)) {
      addFailure(context, 'CHECKSUM_EXCLUDED_FILE_LISTED', entry.path, 'checksums must not list itself or volatile validation files');
      continue;
    }
    expectedByPath.set(entry.path, entry.sha256);
  }

  const actual = await computeBundleChecksums(context.exportRoot).catch(() => []);
  const actualPaths = new Set(actual.map((entry) => entry.path));
  context.metrics.checksumEntries = expected.length;
  context.metrics.checksumFilesChecked = actual.length;
  for (const entry of actual) {
    const expectedHash = expectedByPath.get(entry.path);
    if (!expectedHash) {
      addFailure(context, 'CHECKSUM_MISSING', entry.path, 'file is missing from checksums.sha256');
    } else if (expectedHash !== entry.sha256) {
      addFailure(context, 'CHECKSUM_MISMATCH', entry.path, 'file checksum does not match checksums.sha256');
    }
  }
  for (const entry of expected) {
    if (!isChecksumExcluded(entry.path) && !actualPaths.has(entry.path)) {
      addFailure(context, 'CHECKSUM_FILE_MISSING', entry.path, 'checksums.sha256 references a missing file');
    }
  }
  context.metrics.checksumResult = context.failures.length === before ? 'passed' : 'failed';
  addCheck(
    context,
    'checksums',
    context.metrics.checksumResult,
    context.metrics.checksumResult === 'passed' ? 'Checksum verification passed.' : 'Checksum failures were found.'
  );
}

async function checkNoProtectedPaths(context) {
  const files = await listPackageFiles(context);
  const protectedPaths = files
    .map((filePath) => bundleRelativePath(context.exportRoot, filePath))
    .filter((relativePath) => isProtectedOrSecretRiskPath(relativePath));
  for (const relativePath of protectedPaths) {
    addFailure(context, 'PROTECTED_PATH_PRESENT', relativePath, 'protected or secret-risk file path is present in live export output');
  }
  context.metrics.pathSafetyResult = protectedPaths.length === 0 ? 'passed' : 'failed';
  addCheck(
    context,
    'protected-paths',
    context.metrics.pathSafetyResult,
    context.metrics.pathSafetyResult === 'passed' ? 'No protected paths detected.' : 'Protected paths detected.'
  );
}

async function checkNoSecretLikeValues(context) {
  const files = await listPackageFiles(context);
  const hits = [];
  for (const filePath of files) {
    const relativePath = bundleRelativePath(context.exportRoot, filePath);
    if (isChecksumExcluded(relativePath) || validationReportFiles.has(relativePath)) continue;
    const text = await fs.readFile(filePath, 'utf8').catch(() => '');
    text.split(/\r?\n/).forEach((line, index) => {
      if (hasSecretLikeValue(line)) {
        hits.push({ path: relativePath, line: index + 1 });
      }
    });
  }
  for (const hit of hits) {
    addFailure(context, 'SECRET_LIKE_VALUE', hit.path, `secret-like value pattern at line ${hit.line}`);
  }
  context.metrics.secretLeakScanResult = hits.length === 0 ? 'passed' : 'failed';
  addCheck(
    context,
    'secret-leak-scan',
    context.metrics.secretLeakScanResult,
    context.metrics.secretLeakScanResult === 'passed' ? 'No secret-like values detected.' : 'Secret-like values detected.'
  );
}

async function listPackageFiles(context) {
  const files = await listFilesRecursive(context.exportRoot).catch(() => []);
  context.metrics.checkedFilesCount = files.length;
  return files;
}

function publicResult(result) {
  return {
    schemaVersion: result.schemaVersion,
    phase: result.phase,
    status: result.status,
    generatedAt: result.generatedAt,
    target: result.target,
    dataPlaneAccess: result.dataPlaneAccess,
    recordSetCount: result.recordSetCount,
    totalRecordCount: result.totalRecordCount,
    expectedTotalDocuments: result.expectedTotalDocuments,
    validationStatus: result.validation?.status ?? 'not-run',
    boundaries: result.boundaries,
    blockers: result.blockers,
    error: result.error
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

function renderExportSummary(result) {
  return [
    '# Live Cosmos Export Summary',
    '',
    `Status: ${result.status}`,
    `Tenant key: ${tenantKey}`,
    `Target account: ${target.accountName}`,
    `Target database: ${target.databaseName}`,
    `Record sets: ${result.recordSetCount}`,
    `Total records: ${result.totalRecordCount}`,
    `Expected records: ${result.expectedTotalDocuments}`,
    `Validation: ${result.validation?.status ?? 'not-run'}`,
    '',
    '## Boundaries',
    '',
    '- AAD/RBAC data-plane read/query only: true',
    '- Cosmos writes performed: false',
    '- Keys/listKeys used: false',
    '- Connection strings read: false',
    '- SAS generated: false',
    '- Tokens printed or persisted: false',
    '- CMS runtime switch/CMS writes/media blob downloads/deployment/indexing/live publication: false',
    ''
  ].join('\n');
}

function renderValidationMarkdown(validation) {
  const lines = [
    '# Live Cosmos Export Validation Result',
    '',
    `Status: ${validation.status}`,
    `Generated: ${validation.generatedAt}`,
    `Schema Version: ${validation.schemaVersion}`,
    '',
    '## Summary',
    '',
    '| Field | Result |',
    '| --- | --- |',
    `| Total records | ${validation.summary.totalRecordCount} |`,
    `| Expected records | ${validation.summary.expectedTotalDocuments} |`,
    `| Checksum result | ${validation.summary.checksumResult} |`,
    `| Tenant scope | ${validation.summary.tenantScopeResult} |`,
    `| Container result | ${validation.summary.containerResult} |`,
    `| Secret-leak scan | ${validation.summary.secretLeakScanResult} |`,
    `| Path safety | ${validation.summary.pathSafetyResult} |`,
    `| Warnings | ${validation.summary.warningCount} |`,
    `| Failures | ${validation.summary.failureCount} |`,
    '',
    '## Checks',
    '',
    '| Check | Status | Summary |',
    '| --- | --- | --- |'
  ];
  for (const check of validation.checks) {
    lines.push(`| ${escapeMarkdownCell(check.checkId)} | ${escapeMarkdownCell(check.status)} | ${escapeMarkdownCell(check.summary)} |`);
  }
  lines.push('', '## Warnings', '');
  if (validation.warnings.length === 0) {
    lines.push('None.');
  } else {
    for (const warning of validation.warnings) {
      lines.push(`- ${warning.code} at ${toPosixPath(warning.path)}: ${warning.message}`);
    }
  }
  lines.push('', '## Failures', '');
  if (validation.failures.length === 0) {
    lines.push('None.');
  } else {
    for (const failure of validation.failures) {
      lines.push(`- ${failure.code} at ${toPosixPath(failure.path)}: ${failure.message}`);
    }
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function addCheck(context, checkId, status, summary) {
  context.checks.push({ checkId, status, summary });
}

function addFailure(context, code, pathValue, message) {
  context.failures.push({ code, path: pathValue, message });
}

function blocker(code, message) {
  return { code, message };
}

function isSafeRelativePath(value) {
  if (typeof value !== 'string' || value.length === 0) return false;
  if (value.includes('\\') || value.startsWith('/') || /^[A-Za-z]:/.test(value)) return false;
  if (value === '.' || value.endsWith('/')) return false;
  if (value.split('/').some((part) => part === '' || part === '.' || part === '..')) return false;
  return path.posix.normalize(value) === value;
}

function isProtectedOrSecretRiskPath(relativePath) {
  const lower = toPosixPath(relativePath).toLowerCase();
  const protectedPathPattern = [
    'credential',
    'auth[-_]?' + 'header',
    'coo' + 'kie',
    'connection[-_]?' + 'string',
    'storage[-_]?' + 'key',
    'private[-_]?' + 'key'
  ].join('|');
  const escrowRiskPattern = [
    'encrypted-' + 'secrets',
    'escrow-' + 'payload',
    'decrypted',
    'plaintext',
    'j' + 'wt',
    'to' + 'ken'
  ].join('|');
  return (
    /(^|\/)\.env(\.|$)/.test(lower) ||
    /(^|\/)appsettings\.development\.json$/.test(lower) ||
    /(^|\/)local\.settings\.json$/.test(lower) ||
    new RegExp(protectedPathPattern).test(lower) ||
    new RegExp(escrowRiskPattern).test(lower)
  );
}

function escapeMarkdownCell(value) {
  return String(value).replace(/\|/g, '/');
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
