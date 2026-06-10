import fs from 'node:fs/promises';
import path from 'node:path';
import { computeBundleChecksums, readChecksums, isChecksumExcluded } from '../checksum-writer.mjs';
import { listFilesRecursive } from '../utils/file-hash.mjs';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { bundleRelativePath, resolveTmpBundlePath, toPosixPath } from '../utils/safe-paths.mjs';
import { hasSecretLikeValue } from '../validators/backup-validator.mjs';
import {
  approvedCosmosContainers,
  cosmosSeedContractVersion,
  cosmosSeedPartitionKeyPath,
  isApprovedCosmosContainer,
  routeDocumentTypeToContainer
} from './cosmos-container-router.mjs';
import { isForbiddenSeedKey } from './cosmos-document-mapper.mjs';

const requiredFiles = [
  'seed-manifest.json',
  'SEED_PLAN.md',
  'READBACK_PLAN.md',
  'ROLLBACK_PLAN.md',
  'checksums.sha256'
];

const optionalValidationFiles = new Set(['VALIDATION_RESULT.json', 'VALIDATION_RESULT.md']);

export async function validateSeedDryRunPackage({ seedPath, expectedTenantKey = 'ice-rink-rentals' }) {
  const seedRoot = resolveTmpBundlePath(seedPath);
  const context = {
    seedRoot,
    expectedTenantKey,
    checks: [],
    failures: [],
    warnings: [],
    metrics: {
      checkedFilesCount: 0,
      totalDocuments: 0,
      checksumResult: 'not-run',
      secretLeakScanResult: 'not-run',
      pathSafetyResult: 'not-run',
      partitionResult: 'not-run',
      containerResult: 'not-run'
    }
  };

  await checkFolder(context);
  await checkRequiredFiles(context);
  const manifest = await checkManifest(context);
  const documentsByContainer = await checkSeedDocuments(context, manifest);
  checkTenantPartitioning(context, documentsByContainer);
  await checkChecksums(context);
  await checkNoProtectedPaths(context);
  await checkNoSecretLikeValues(context);

  const status = context.failures.length === 0 ? 'passed' : 'failed';
  return {
    schemaVersion: cosmosSeedContractVersion,
    validator: 'pumpkin-backup-center-cosmos-seed-dry-run-validator',
    status,
    generatedAt: new Date().toISOString(),
    dryRunOnly: true,
    summary: {
      checkedFilesCount: context.metrics.checkedFilesCount,
      totalDocuments: context.metrics.totalDocuments,
      checksumResult: context.metrics.checksumResult,
      secretLeakScanResult: context.metrics.secretLeakScanResult,
      pathSafetyResult: context.metrics.pathSafetyResult,
      partitionResult: context.metrics.partitionResult,
      containerResult: context.metrics.containerResult,
      warningCount: context.warnings.length,
      failureCount: context.failures.length
    },
    checks: context.checks,
    warnings: context.warnings,
    failures: context.failures,
    errors: context.failures
  };
}

export async function writeSeedValidationReports({ seedRoot, validation }) {
  await writeJson(path.join(seedRoot, 'VALIDATION_RESULT.json'), validation);
  await fs.writeFile(path.join(seedRoot, 'VALIDATION_RESULT.md'), renderSeedValidationMarkdown(validation), 'utf8');
}

function addCheck(context, checkId, status, summary) {
  context.checks.push({ checkId, status, summary });
}

function addFailure(context, code, pathValue, message) {
  context.failures.push({ code, path: pathValue, message });
}

async function checkFolder(context) {
  try {
    const stat = await fs.stat(context.seedRoot);
    if (!stat.isDirectory()) {
      addFailure(context, 'SEED_PACKAGE_NOT_FOLDER', '.', 'seed dry-run package must be a folder');
      addCheck(context, 'seed-folder', 'failed', 'Seed dry-run path is not a folder.');
      return;
    }
    addCheck(context, 'seed-folder', 'passed', 'Seed dry-run package is a folder.');
  } catch {
    addFailure(context, 'SEED_PACKAGE_MISSING', '.', 'seed dry-run package folder does not exist');
    addCheck(context, 'seed-folder', 'failed', 'Seed dry-run package is missing.');
  }
}

async function checkRequiredFiles(context) {
  const missing = [];
  for (const relativePath of requiredFiles) {
    try {
      await fs.access(path.join(context.seedRoot, relativePath));
    } catch {
      missing.push(relativePath);
      addFailure(context, 'REQUIRED_FILE_MISSING', relativePath, 'required seed dry-run file is missing');
    }
  }
  try {
    const stat = await fs.stat(path.join(context.seedRoot, 'seed-documents'));
    if (!stat.isDirectory()) throw new Error('not a directory');
  } catch {
    missing.push('seed-documents/');
    addFailure(context, 'REQUIRED_FOLDER_MISSING', 'seed-documents', 'seed-documents folder is missing');
  }
  addCheck(
    context,
    'required-files',
    missing.length === 0 ? 'passed' : 'failed',
    missing.length === 0 ? 'All required seed dry-run files exist.' : `Missing seed files: ${missing.join(', ')}`
  );
}

async function checkManifest(context) {
  let manifest;
  try {
    manifest = await readJson(path.join(context.seedRoot, 'seed-manifest.json'));
  } catch (error) {
    addFailure(context, 'MANIFEST_PARSE_ERROR', 'seed-manifest.json', error.message);
    addCheck(context, 'manifest-schema', 'failed', 'Seed manifest could not be parsed.');
    return null;
  }

  const problems = [];
  if (!isPlainObject(manifest)) problems.push('object');
  if (manifest.schemaVersion !== cosmosSeedContractVersion) problems.push('schemaVersion');
  if (manifest.phase !== '2F-12O') problems.push('phase');
  if (manifest.dryRunOnly !== true) problems.push('dryRunOnly');
  if (manifest.liveCosmosWritesPerformed !== false) problems.push('liveCosmosWritesPerformed');
  if (manifest.cmsWritesPerformed !== false) problems.push('cmsWritesPerformed');
  if (manifest.mediaDownloaded !== false) problems.push('mediaDownloaded');
  if (manifest.databaseExportPerformed !== false) problems.push('databaseExportPerformed');
  if (manifest.scope?.tenantKey !== context.expectedTenantKey) problems.push('scope.tenantKey');
  if (manifest.target?.partitionKeyPath !== cosmosSeedPartitionKeyPath) problems.push('target.partitionKeyPath');
  if (!Array.isArray(manifest.target?.containers)) problems.push('target.containers');

  if (Array.isArray(manifest.target?.containers)) {
    for (const container of manifest.target.containers) {
      if (!isPlainObject(container) || !isApprovedCosmosContainer(container.name) || container.partitionKeyPath !== cosmosSeedPartitionKeyPath) {
        addFailure(context, 'TARGET_CONTAINER_INVALID', 'seed-manifest.json', 'target containers must be approved and use /tenantKey');
      }
    }
  }
  if (manifest.boundaries?.sessionJwtDurableEscrowIncluded !== false) problems.push('boundaries.sessionJwtDurableEscrowIncluded');
  if (manifest.boundaries?.protectedConfigRead !== false) problems.push('boundaries.protectedConfigRead');
  if (manifest.boundaries?.azureCalled !== false) problems.push('boundaries.azureCalled');

  if (problems.length > 0) {
    addFailure(context, 'MANIFEST_SCHEMA_INVALID', 'seed-manifest.json', `manifest fields invalid: ${problems.join(', ')}`);
  }

  const failed = context.failures.some((failure) => failure.code.startsWith('MANIFEST_') || failure.code === 'TARGET_CONTAINER_INVALID');
  addCheck(context, 'manifest-schema', failed ? 'failed' : 'passed', failed ? 'Seed manifest has validation failures.' : 'Seed manifest is valid.');
  return manifest;
}

async function checkSeedDocuments(context, manifest) {
  const documentsByContainer = new Map();
  const expectedContainers = manifest?.target?.containers?.map((container) => container.name) ?? approvedCosmosContainers.map((container) => container.name);
  const before = context.failures.length;

  for (const containerName of expectedContainers) {
    if (!isApprovedCosmosContainer(containerName)) {
      addFailure(context, 'UNAPPROVED_CONTAINER', `seed-documents/${containerName}.json`, 'container is not approved for seed dry-run output');
      continue;
    }
    const relativePath = `seed-documents/${containerName}.json`;
    let documents;
    try {
      documents = await readJson(path.join(context.seedRoot, relativePath));
    } catch (error) {
      addFailure(context, 'SEED_DOCUMENT_FILE_MISSING', relativePath, error.message);
      continue;
    }
    if (!Array.isArray(documents)) {
      addFailure(context, 'SEED_DOCUMENT_FILE_INVALID', relativePath, 'seed document file must contain a JSON array');
      continue;
    }
    documentsByContainer.set(containerName, documents);
    context.metrics.totalDocuments += documents.length;
    documents.forEach((document, index) => validateDocument(context, document, containerName, `${relativePath}[${index}]`));
  }

  const passed = context.failures.length === before;
  context.metrics.containerResult = passed ? 'passed' : 'failed';
  addCheck(
    context,
    'seed-documents',
    passed ? 'passed' : 'failed',
    passed ? 'Seed documents are mapped to approved containers.' : 'Seed document mapping failures were found.'
  );
  return documentsByContainer;
}

function validateDocument(context, document, containerName, pathValue) {
  if (!isPlainObject(document)) {
    addFailure(context, 'SEED_DOCUMENT_INVALID', pathValue, 'seed document must be an object');
    return;
  }
  if (typeof document.id !== 'string' || document.id.length === 0) {
    addFailure(context, 'SEED_DOCUMENT_ID_MISSING', pathValue, 'seed document id is required');
  }
  if (document.tenantKey !== context.expectedTenantKey) {
    addFailure(context, 'TENANT_KEY_INVALID', pathValue, 'seed document tenantKey must match the approved Ice tenant');
  }
  if (containerName !== 'tenants' && typeof document.siteKey !== 'string') {
    addFailure(context, 'SITE_KEY_MISSING', pathValue, 'site-scoped seed documents must include siteKey');
  }
  try {
    const routed = routeDocumentTypeToContainer(document.documentType);
    if (routed !== containerName) {
      addFailure(context, 'CONTAINER_ROUTE_MISMATCH', pathValue, `documentType routes to ${routed}, not ${containerName}`);
    }
  } catch (error) {
    addFailure(context, 'DOCUMENT_TYPE_UNSUPPORTED', pathValue, error.message);
  }
  if (document.migrationMetadata?.dryRunOnly !== true) {
    addFailure(context, 'MIGRATION_METADATA_INVALID', pathValue, 'migration metadata must mark dryRunOnly true');
  }
  if (document.migrationMetadata?.target?.partitionKeyPath !== cosmosSeedPartitionKeyPath) {
    addFailure(context, 'PARTITION_KEY_PATH_INVALID', pathValue, 'migration target partition key path must be /tenantKey');
  }

  for (const hit of findForbiddenSeedData(document)) {
    addFailure(
      context,
      hit.kind === 'field' ? 'FORBIDDEN_FIELD' : 'FORBIDDEN_VALUE',
      `${pathValue}${hit.path.slice(1)}`,
      hit.kind === 'field' ? 'seed document contains a forbidden credential-like field name' : 'seed document contains a secret-like value'
    );
  }
}

function checkTenantPartitioning(context, documentsByContainer) {
  const before = context.failures.length;
  for (const [containerName, documents] of documentsByContainer) {
    for (const [index, document] of documents.entries()) {
      if (document?.tenantKey !== context.expectedTenantKey) {
        addFailure(context, 'PARTITION_TENANT_MISMATCH', `seed-documents/${containerName}.json[${index}]`, 'document partition tenantKey mismatch');
      }
    }
  }
  const passed = context.failures.length === before;
  context.metrics.partitionResult = passed ? 'passed' : 'failed';
  addCheck(
    context,
    'tenant-partitioning',
    passed ? 'passed' : 'failed',
    passed ? 'All generated documents use /tenantKey with the Ice tenant key.' : 'Tenant partitioning failures were found.'
  );
}

async function checkChecksums(context) {
  const before = context.failures.length;
  let expected;
  try {
    expected = await readChecksums(context.seedRoot);
  } catch (error) {
    addFailure(context, 'CHECKSUM_PARSE_ERROR', 'checksums.sha256', error.message);
    addCheck(context, 'checksums', 'failed', 'Checksum file could not be parsed.');
    context.metrics.checksumResult = 'failed';
    return;
  }

  const expectedByPath = new Map();
  for (const entry of expected) {
    if (entry.path === 'checksums.sha256' || optionalValidationFiles.has(entry.path)) {
      addFailure(context, 'CHECKSUM_EXCLUDED_FILE_LISTED', entry.path, 'checksums must not list volatile validation files or itself');
      continue;
    }
    expectedByPath.set(entry.path, entry.sha256);
  }

  const actual = await computeBundleChecksums(context.seedRoot).catch(() => []);
  const actualPaths = new Set(actual.map((entry) => entry.path));
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

  const passed = context.failures.length === before;
  context.metrics.checksumResult = passed ? 'passed' : 'failed';
  addCheck(context, 'checksums', passed ? 'passed' : 'failed', passed ? 'Checksum verification passed.' : 'Checksum failures were found.');
}

async function checkNoProtectedPaths(context) {
  const files = await listPackageFiles(context);
  const protectedPaths = files
    .map((filePath) => bundleRelativePath(context.seedRoot, filePath))
    .filter((relativePath) => isProtectedOrSecretRiskPath(relativePath));
  for (const relativePath of protectedPaths) {
    addFailure(context, 'PROTECTED_PATH_PRESENT', relativePath, 'protected or secret-risk file path is present in seed dry-run package');
  }
  context.metrics.pathSafetyResult = protectedPaths.length === 0 ? 'passed' : 'failed';
  addCheck(
    context,
    'protected-paths',
    protectedPaths.length === 0 ? 'passed' : 'failed',
    protectedPaths.length === 0 ? 'No protected paths detected.' : 'Protected paths detected.'
  );
}

async function checkNoSecretLikeValues(context) {
  const files = await listPackageFiles(context);
  const hits = [];
  for (const filePath of files) {
    const relativePath = bundleRelativePath(context.seedRoot, filePath);
    if (isChecksumExcluded(relativePath) || optionalValidationFiles.has(relativePath)) continue;
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
    hits.length === 0 ? 'passed' : 'failed',
    hits.length === 0 ? 'No secret-like values detected.' : 'Secret-like values detected.'
  );
}

async function listPackageFiles(context) {
  const files = await listFilesRecursive(context.seedRoot).catch(() => []);
  context.metrics.checkedFilesCount = files.length;
  return files;
}

function findForbiddenSeedData(value, pathValue = '$') {
  const hits = [];
  if (Array.isArray(value)) {
    value.forEach((item, index) => hits.push(...findForbiddenSeedData(item, `${pathValue}[${index}]`)));
    return hits;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (isForbiddenSeedKey(key)) {
        hits.push({ kind: 'field', path: `${pathValue}.${key}` });
      }
      hits.push(...findForbiddenSeedData(child, `${pathValue}.${key}`));
    }
    return hits;
  }
  if (typeof value === 'string' && hasSecretLikeValue(`value: "${value}"`)) {
    hits.push({ kind: 'value', path: pathValue });
  }
  return hits;
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

function renderSeedValidationMarkdown(validation) {
  const lines = [
    '# Cosmos Seed Dry-Run Validation Result',
    '',
    `Status: ${validation.status}`,
    `Generated: ${validation.generatedAt}`,
    `Schema Version: ${validation.schemaVersion}`,
    '',
    '## Summary',
    '',
    '| Field | Result |',
    '| --- | --- |',
    `| Checked files | ${validation.summary.checkedFilesCount} |`,
    `| Total documents | ${validation.summary.totalDocuments} |`,
    `| Checksum result | ${validation.summary.checksumResult} |`,
    `| Secret-leak scan | ${validation.summary.secretLeakScanResult} |`,
    `| Path safety | ${validation.summary.pathSafetyResult} |`,
    `| Partition result | ${validation.summary.partitionResult} |`,
    `| Container result | ${validation.summary.containerResult} |`,
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

function escapeMarkdownCell(value) {
  return String(value).replace(/\|/g, '/');
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
