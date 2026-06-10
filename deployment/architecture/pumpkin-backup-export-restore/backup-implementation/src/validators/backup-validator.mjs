import fs from 'node:fs/promises';
import path from 'node:path';
import { computeBundleChecksums, isChecksumExcluded, readChecksums } from '../checksum-writer.mjs';
import { listFilesRecursive } from '../utils/file-hash.mjs';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { bundleRelativePath, resolveTmpBundlePath, toPosixPath } from '../utils/safe-paths.mjs';

export const validationContractVersion = '0.2.0';

const requiredFolders = [
  'database',
  'cms-content',
  'media',
  'static',
  'config-inventory',
  'escrow'
];

const requiredFiles = [
  'manifest.json',
  'checksums.sha256',
  'BACKUP_SUMMARY.md',
  'RESTORE_INSTRUCTIONS.md',
  'database/DATABASE_EXPORT_NOT_INCLUDED.md',
  'database/database-export-plan.json',
  'cms-content/tenants.json',
  'cms-content/sites.json',
  'cms-content/pages.json',
  'cms-content/routes.json',
  'cms-content/forms.json',
  'cms-content/seo.json',
  'cms-content/redirects.json',
  'cms-content/theme.json',
  'media/media-assets.json',
  'media/MEDIA_BLOBS_NOT_INCLUDED.md',
  'static/static-output-manifest.json',
  'static/STATIC_OUTPUT_NOT_INCLUDED.md',
  'config-inventory/env-inventory.redacted.json',
  'config-inventory/CONFIG_VALUES_REDACTED.md',
  'escrow/ESCROW_NOT_INCLUDED.md'
];

const generatedSchemaFiles = [
  'database/database-export-plan.json',
  'database/cosmos-json/export-manifest.json',
  'database/cosmos-json/containers/tenants.json',
  'database/cosmos-json/containers/sites.json',
  'database/cosmos-json/containers/pages.json',
  'database/cosmos-json/containers/routes.json',
  'database/cosmos-json/containers/forms.json',
  'database/cosmos-json/containers/media-assets.json',
  'database/cosmos-json/containers/themes.json',
  'database/cosmos-json/containers/publish-runs.json',
  'database/cosmos-json/containers/import-runs.json',
  'database/cosmos-json/containers/users.json',
  'database/platform-evidence/cosmos/cosmos-platform-backup-evidence.json',
  'database/runtime-profile/runtime-profile.json',
  'media/media-assets.json',
  'media/blob-map/blob-inventory.json',
  'media/blob-map/blob-copy-plan.json',
  'media/blob-map/blob-map.json',
  'static/static-output-manifest.json',
  'config-inventory/env-inventory.redacted.json'
];

const volatileReportFiles = new Set(['VALIDATION_RESULT.md', 'validation-result.json']);
const manifestExcludedFiles = new Set(['manifest.json', 'checksums.sha256', ...volatileReportFiles]);
const allowedKinds = new Set([
  'summary',
  'restore-instructions',
  'database-plan',
  'cosmos-export',
  'cosmos-platform-evidence',
  'cms-content',
  'media-inventory',
  'media-blob-map',
  'media-blob-copy',
  'static-evidence',
  'config-inventory',
  'escrow-marker',
  'provider-source-metadata',
  'runtime-profile',
  'tenant-website-bundle'
]);
const allowedSensitivity = new Set(['redacted']);
const allowedSources = new Set(['fake-fixture', 'real-ice-readonly-standard']);
const allowedConfigPresence = new Set(['PRESENT', 'MISSING', 'EXCLUDED', 'UNKNOWN']);
const allowedRedactedValues = new Set(['REDACTED', 'NOT_COLLECTED', 'EXCLUDED', 'NOT_INCLUDED', 'PRESENT', 'MISSING', 'UNKNOWN', null]);

export async function validateBackupBundle({ bundlePath, mode = 'baseline' }) {
  const validationMode = normalizeValidationMode(mode);
  const bundleRoot = resolveTmpBundlePath(bundlePath);
  const context = {
    bundleRoot,
    checks: [],
    failures: [],
    warnings: [],
    metrics: {
      checkedFilesCount: 0,
      checksumResult: 'not-run',
      checksumEntries: 0,
      checksumFilesChecked: 0,
      escrowExclusionResult: 'not-run',
      secretLeakScanResult: 'not-run',
      pathSafetyResult: 'not-run',
      manifestFileListResult: 'not-run',
      connectorProofResult: 'not-run'
    }
  };

  await checkBundleFolder(context);
  await checkRequiredFolders(context);
  await checkRequiredFiles(context);
  const manifest = await checkManifest(context);
  await checkManifestFiles(context, manifest);
  await checkGeneratedJsonSchemas(context);
  await checkConnectorProof(context, manifest, validationMode);
  await checkConfigInventory(context);
  await checkChecksums(context);
  await checkEscrowAbsent(context);
  await checkNoProtectedPaths(context);
  await checkNoSecretLikeValues(context);

  const status = context.failures.length === 0 ? 'passed' : 'failed';
  return {
    schemaVersion: validationContractVersion,
    validator: 'pumpkin-backup-center-local-validator',
    mode: validationMode,
    status,
    generatedAt: new Date().toISOString(),
    bundleFormat: 'folder',
    summary: {
      checkedFilesCount: context.metrics.checkedFilesCount,
      checksumResult: context.metrics.checksumResult,
      checksumEntries: context.metrics.checksumEntries,
      checksumFilesChecked: context.metrics.checksumFilesChecked,
      escrowExclusionResult: context.metrics.escrowExclusionResult,
      secretLeakScanResult: context.metrics.secretLeakScanResult,
      pathSafetyResult: context.metrics.pathSafetyResult,
      manifestFileListResult: context.metrics.manifestFileListResult,
      connectorProofResult: context.metrics.connectorProofResult,
      warningCount: context.warnings.length,
      failureCount: context.failures.length
    },
    checks: context.checks,
    warnings: context.warnings,
    failures: context.failures,
    errors: context.failures
  };
}

export async function writeValidationReports({ bundleRoot, validation }) {
  await writeJson(path.join(bundleRoot, 'validation-result.json'), validation);
  await fs.writeFile(
    path.join(bundleRoot, 'VALIDATION_RESULT.md'),
    renderValidationMarkdown(validation),
    'utf8'
  );
}

function addCheck(context, checkId, status, summary) {
  context.checks.push({ checkId, status, summary });
}

function addFailure(context, code, pathValue, message) {
  context.failures.push({ code, path: pathValue, message });
}

function addWarning(context, code, pathValue, message) {
  context.warnings.push({ code, path: pathValue, message });
}

function normalizeValidationMode(mode) {
  const selected = mode ?? 'baseline';
  if (selected !== 'baseline' && selected !== 'database-backup-proof' && selected !== 'production-restore-proof') {
    throw new Error(`unsupported validation mode: ${selected}`);
  }
  return selected;
}

async function listBundleFiles(context) {
  try {
    const files = await listFilesRecursive(context.bundleRoot);
    context.metrics.checkedFilesCount = files.length;
    return files;
  } catch {
    return [];
  }
}

async function checkBundleFolder(context) {
  try {
    const stat = await fs.stat(context.bundleRoot);
    if (!stat.isDirectory()) {
      addFailure(context, 'BUNDLE_NOT_FOLDER', '.', 'backup bundle must be a folder, not an archive or file');
      addCheck(context, 'bundle-folder', 'failed', 'Bundle path is not a folder.');
      return;
    }
    addCheck(context, 'bundle-folder', 'passed', 'Bundle is a folder.');
  } catch {
    addFailure(context, 'BUNDLE_MISSING', '.', 'backup bundle folder does not exist');
    addCheck(context, 'bundle-folder', 'failed', 'Bundle folder is missing.');
  }
}

async function checkRequiredFolders(context) {
  const missing = [];
  for (const relativePath of requiredFolders) {
    try {
      const stat = await fs.stat(path.join(context.bundleRoot, relativePath));
      if (!stat.isDirectory()) {
        throw new Error('not a directory');
      }
    } catch {
      missing.push(relativePath);
      addFailure(context, 'REQUIRED_FOLDER_MISSING', relativePath, 'required backup folder is missing');
    }
  }
  addCheck(
    context,
    'required-folders',
    missing.length === 0 ? 'passed' : 'failed',
    missing.length === 0 ? 'All required standard backup folders exist.' : `Missing required folders: ${missing.join(', ')}`
  );
}

async function checkRequiredFiles(context) {
  const missing = [];
  for (const relativePath of requiredFiles) {
    try {
      await fs.access(path.join(context.bundleRoot, relativePath));
    } catch {
      missing.push(relativePath);
      const code =
        relativePath === 'manifest.json'
          ? 'MANIFEST_MISSING'
          : relativePath === 'RESTORE_INSTRUCTIONS.md'
            ? 'RESTORE_INSTRUCTIONS_MISSING'
            : relativePath === 'config-inventory/env-inventory.redacted.json'
              ? 'CONFIG_INVENTORY_MISSING'
              : 'REQUIRED_FILE_MISSING';
      addFailure(context, code, relativePath, 'required backup file is missing');
    }
  }
  addCheck(
    context,
    'required-files',
    missing.length === 0 ? 'passed' : 'failed',
    missing.length === 0 ? 'All required standard backup files exist.' : `Missing required files: ${missing.join(', ')}`
  );
}

async function checkManifest(context) {
  let manifest;
  try {
    manifest = await readJson(path.join(context.bundleRoot, 'manifest.json'));
  } catch (error) {
    addFailure(context, 'MANIFEST_PARSE_ERROR', 'manifest.json', error.message);
    addCheck(context, 'manifest-schema', 'failed', 'Manifest JSON could not be parsed.');
    return null;
  }

  if (!isPlainObject(manifest)) {
    addFailure(context, 'MANIFEST_SCHEMA_INVALID', 'manifest.json', 'manifest must be a JSON object');
    addCheck(context, 'manifest-schema', 'failed', 'Manifest is not an object.');
    return null;
  }

  const problems = [];
  if (manifest.manifestVersion !== validationContractVersion) problems.push('manifestVersion');
  if (manifest.bundleContractVersion !== validationContractVersion) problems.push('bundleContractVersion');
  if (manifest.validatorContractVersion !== validationContractVersion) problems.push('validatorContractVersion');
  if (manifest.backupMode !== 'standard') problems.push('backupMode');
  if (manifest.bundleFormat !== 'folder') problems.push('bundleFormat');
  if (manifest.includesEscrow !== false) problems.push('includesEscrow');
  if (manifest.checksumAlgorithm !== 'sha256') problems.push('checksumAlgorithm');
  if (typeof manifest.createdAt !== 'string' || Number.isNaN(Date.parse(manifest.createdAt))) problems.push('createdAt');
  if (typeof manifest.createdBy !== 'string' || manifest.createdBy.length === 0) problems.push('createdBy');
  if (typeof manifest.requestedBy !== 'string' || manifest.requestedBy.length === 0) problems.push('requestedBy');
  if (typeof manifest.source !== 'string' || !allowedSources.has(manifest.source)) problems.push('source');
  if (!Array.isArray(manifest.files) || manifest.files.length === 0) problems.push('files');
  if (typeof manifest.contentFileCount !== 'number' || manifest.contentFileCount !== manifest.files?.length) {
    problems.push('contentFileCount');
  }
  if (!isPlainObject(manifest.schemaReferences) || typeof manifest.schemaReferences.backupManifest !== 'string') {
    problems.push('schemaReferences');
  }

  if (problems.length > 0) {
    addFailure(context, 'MANIFEST_SCHEMA_INVALID', 'manifest.json', `manifest fields invalid: ${problems.join(', ')}`);
  }

  validateManifestScope(context, manifest);
  validateManifestFileEntries(context, manifest);

  const failed = context.failures.some((failure) =>
    failure.code.startsWith('MANIFEST_') || failure.code === 'SCOPE_TENANT_MISMATCH'
  );
  addCheck(
    context,
    'manifest-schema',
    failed ? 'failed' : 'passed',
    failed ? 'Manifest contract has validation failures.' : 'Manifest contract is valid for Phase 2F-4.'
  );
  return manifest;
}

function validateManifestScope(context, manifest) {
  if (!isPlainObject(manifest.scope)) {
    addFailure(context, 'MANIFEST_SCOPE_INVALID', 'manifest.json', 'manifest.scope must be an object');
    return;
  }

  const { scopeType, tenantKey, siteKey } = manifest.scope;
  if (scopeType !== 'tenant' && scopeType !== 'platform') {
    addFailure(context, 'MANIFEST_SCOPE_INVALID', 'manifest.json', 'scope.scopeType must be tenant or platform');
    return;
  }

  if (scopeType === 'tenant') {
    if (typeof tenantKey !== 'string' || tenantKey.length === 0 || manifest.tenantKey !== tenantKey) {
      addFailure(context, 'SCOPE_TENANT_MISMATCH', 'manifest.json', 'tenant scope must include a matching tenantKey');
    }
    if (siteKey !== null && typeof siteKey !== 'string') {
      addFailure(context, 'MANIFEST_SCOPE_INVALID', 'manifest.json', 'tenant scope siteKey must be null or string');
    }
    return;
  }

  if (tenantKey !== null || siteKey !== null || manifest.tenantKey !== null) {
    addFailure(context, 'SCOPE_TENANT_MISMATCH', 'manifest.json', 'platform scope must not include tenant or site keys');
  }
}

function validateManifestFileEntries(context, manifest) {
  if (!Array.isArray(manifest.files)) {
    return;
  }

  const seen = new Set();
  for (const [index, entry] of manifest.files.entries()) {
    if (!isPlainObject(entry)) {
      addFailure(context, 'MANIFEST_FILE_ENTRY_INVALID', `manifest.files[${index}]`, 'manifest file entry must be an object');
      continue;
    }

    if (!isSafeBundleRelativePath(entry.path)) {
      addFailure(context, 'MANIFEST_FILE_PATH_INVALID', `manifest.files[${index}]`, 'manifest file path must be a safe bundle-relative path');
      continue;
    }
    if (manifestExcludedFiles.has(entry.path)) {
      addFailure(context, 'MANIFEST_FILE_ENTRY_INVALID', entry.path, 'manifest files must not include manifest, checksum, or validation report files');
    }
    if (seen.has(entry.path)) {
      addFailure(context, 'MANIFEST_FILE_DUPLICATE', entry.path, 'manifest file path is duplicated');
    }
    seen.add(entry.path);

    if (!allowedKinds.has(entry.kind)) {
      addFailure(context, 'MANIFEST_FILE_ENTRY_INVALID', entry.path, 'manifest file entry kind is invalid');
    }
    if (entry.required !== true) {
      addFailure(context, 'MANIFEST_FILE_ENTRY_INVALID', entry.path, 'manifest file entry must be required');
    }
    if (!allowedSensitivity.has(entry.sensitivity)) {
      addFailure(context, 'MANIFEST_FILE_ENTRY_INVALID', entry.path, 'manifest file entry sensitivity must be redacted');
    }
    if (!Object.hasOwn(entry, 'schemaRef') || (entry.schemaRef !== null && typeof entry.schemaRef !== 'string')) {
      addFailure(context, 'MANIFEST_FILE_ENTRY_INVALID', entry.path, 'manifest file entry schemaRef must be null or string');
    }
  }
}

async function checkManifestFiles(context, manifest) {
  if (!manifest || !Array.isArray(manifest.files)) {
    return;
  }
  const manifestFiles = new Set(
    manifest.files
      .map((entry) => entry.path)
      .filter((relativePath) => isSafeBundleRelativePath(relativePath) && !manifestExcludedFiles.has(relativePath))
  );
  const allFiles = await listBundleFiles(context);
  const actualContentFiles = allFiles
    .map((filePath) => bundleRelativePath(context.bundleRoot, filePath))
    .filter((relativePath) => !manifestExcludedFiles.has(relativePath));

  const missingFromDisk = [...manifestFiles].filter((relativePath) => !actualContentFiles.includes(relativePath));
  const missingFromManifest = actualContentFiles.filter((relativePath) => !manifestFiles.has(relativePath));
  for (const relativePath of missingFromDisk) {
    addFailure(context, 'MANIFEST_FILE_MISSING_ON_DISK', relativePath, 'manifest file entry is missing on disk');
  }
  for (const relativePath of missingFromManifest) {
    addFailure(context, 'FILE_NOT_IN_MANIFEST', relativePath, 'generated file is not listed in manifest');
  }
  const passed = missingFromDisk.length === 0 && missingFromManifest.length === 0;
  context.metrics.manifestFileListResult = passed ? 'passed' : 'failed';
  addCheck(
    context,
    'manifest-file-list',
    passed ? 'passed' : 'failed',
    passed ? 'Manifest file list matches generated content files.' : 'Manifest file list differs from generated content files.'
  );
}

async function checkGeneratedJsonSchemas(context) {
  const before = context.failures.length;
  for (const relativePath of generatedSchemaFiles) {
    let value;
    try {
      value = await readJson(path.join(context.bundleRoot, relativePath));
    } catch {
      continue;
    }
    if (!isPlainObject(value) || typeof value.schemaVersion !== 'string' || value.schemaVersion.length === 0) {
      addFailure(context, 'SCHEMA_VERSION_MISSING', relativePath, 'generated JSON envelope must include schemaVersion');
    } else if (value.schemaVersion !== validationContractVersion) {
      addFailure(context, 'SCHEMA_VERSION_INVALID', relativePath, `schemaVersion must be ${validationContractVersion}`);
    }
  }
  addCheck(
    context,
    'generated-schema-versions',
    context.failures.length === before ? 'passed' : 'failed',
    context.failures.length === before ? 'Generated JSON envelopes include schema versions.' : 'Generated JSON schema version checks failed.'
  );
}

async function checkConnectorProof(context, manifest, mode) {
  if (!manifest) {
    return;
  }
  if (mode === 'baseline') {
    context.metrics.connectorProofResult = 'not-required';
    addCheck(context, 'connector-proof', 'passed', 'Baseline mode allows partial database/media connector components.');
    return;
  }

  const before = context.failures.length;
  await checkCosmosProof(context, manifest);
  if (mode === 'database-backup-proof') {
    const passed = context.failures.length === before;
    context.metrics.connectorProofResult = passed ? 'passed' : 'failed';
    addCheck(
      context,
      'connector-proof',
      passed ? 'passed' : 'failed',
      passed
        ? 'Database backup proof mode has a complete Cosmos portable JSON component.'
        : 'Database backup proof mode found missing or invalid Cosmos export artifacts.'
    );
    return;
  }

  await checkMediaProof(context, manifest);
  await checkTenantWebsiteBundleProof(context, manifest);

  const passed = context.failures.length === before;
  context.metrics.connectorProofResult = passed ? 'passed' : 'failed';
  addCheck(
    context,
    'connector-proof',
    passed ? 'passed' : 'failed',
    passed
      ? 'Production restore proof mode has complete fake Cosmos, fake media, and tenant website bundle components.'
      : 'Production restore proof mode found missing connector artifacts.'
  );
}

async function checkCosmosProof(context, manifest) {
  const database = manifest.componentStatus?.database;
  if (database?.provider !== 'cosmos' || database?.mode !== 'portable-json' || database?.status !== 'complete') {
    addFailure(context, 'COSMOS_EXPORT_MISSING', 'manifest.json', 'production restore proof mode requires complete Cosmos portable JSON component status');
    return;
  }

  const exportManifestPath = database.exportManifestPath ?? 'database/cosmos-json/export-manifest.json';
  const exportManifest = await readRequiredJson(context, exportManifestPath, 'COSMOS_EXPORT_MISSING');
  if (!exportManifest) return;
  if (exportManifest.provider !== 'cosmos' || !isSupportedCosmosExportMode(exportManifest.mode)) {
    addFailure(context, 'COSMOS_EXPORT_INVALID', exportManifestPath, 'Cosmos export manifest provider/mode is invalid');
  }
  if (!hasValidCosmosExportBoundaries(exportManifest)) {
    addFailure(context, 'COSMOS_EXPORT_BOUNDARY_INVALID', exportManifestPath, 'Cosmos export boundary fields are invalid for the selected export mode');
  }
  if (!Array.isArray(exportManifest.recordSets) || exportManifest.recordSets.length === 0) {
    addFailure(context, 'COSMOS_EXPORT_EMPTY', exportManifestPath, 'Cosmos export manifest must list record sets');
    return;
  }
  for (const recordSet of exportManifest.recordSets) {
    const recordSetPath = resolveCosmosRecordSetPath(exportManifestPath, recordSet?.path);
    if (!isPlainObject(recordSet) || !recordSetPath || !isSafeBundleRelativePath(recordSetPath)) {
      addFailure(context, 'COSMOS_EXPORT_INVALID', exportManifestPath, 'Cosmos record set path is invalid');
      continue;
    }
    const envelope = await readRequiredJson(context, recordSetPath, 'COSMOS_EXPORT_MISSING');
    if (!envelope) continue;
    if (envelope.provider !== 'cosmos' || envelope.logicalCollection !== recordSet.logicalCollection) {
      addFailure(context, 'COSMOS_EXPORT_INVALID', recordSetPath, 'Cosmos collection envelope does not match manifest');
    }
    if (envelope.mode !== exportManifest.mode || envelope.fakeOnly !== exportManifest.fakeOnly) {
      addFailure(context, 'COSMOS_EXPORT_INVALID', recordSetPath, 'Cosmos collection envelope mode/fakeOnly does not match manifest');
    }
    if (!Array.isArray(envelope.records) || envelope.recordCount !== envelope.records.length) {
      addFailure(context, 'COSMOS_EXPORT_COUNT_MISMATCH', recordSetPath, 'Cosmos collection record count does not match records array');
    }
    for (const [index, record] of (envelope.records ?? []).entries()) {
      if (record?.tenantKey !== exportManifest.tenantScope?.tenantKey) {
        addFailure(context, 'COSMOS_EXPORT_TENANT_MISMATCH', `${recordSetPath}[${index}]`, 'Cosmos export record tenantKey does not match export scope');
      }
    }
  }
}

function resolveCosmosRecordSetPath(exportManifestPath, recordSetPath) {
  if (typeof recordSetPath !== 'string' || recordSetPath.length === 0) return null;
  if (recordSetPath.startsWith('database/')) return recordSetPath;
  return path.posix.join(path.posix.dirname(exportManifestPath), recordSetPath);
}

function isSupportedCosmosExportMode(mode) {
  return mode === 'fake-portable-json' || mode === 'live-readonly-portable-json';
}

function hasValidCosmosExportBoundaries(exportManifest) {
  if (exportManifest.mode === 'fake-portable-json') {
    return exportManifest.liveCosmosExportPerformed === false && exportManifest.protectedConfigRead === false;
  }
  if (exportManifest.mode !== 'live-readonly-portable-json') {
    return false;
  }
  return (
    exportManifest.fakeOnly === false &&
    exportManifest.liveCosmosExportPerformed === true &&
    exportManifest.readOnlyDataPlaneAccess === true &&
    exportManifest.protectedConfigRead === false &&
    exportManifest.keysListed === false &&
    exportManifest.connectionStringsRead === false &&
    exportManifest.sasGenerated === false &&
    exportManifest.tokensPrinted === false &&
    exportManifest.tokensPersisted === false &&
    exportManifest.cosmosWritesPerformed === false &&
    exportManifest.cmsRuntimeSwitchPerformed === false &&
    exportManifest.cmsWritesPerformed === false &&
    exportManifest.mediaBlobDownloadPerformed === false &&
    exportManifest.deploymentPerformed === false &&
    exportManifest.searchConsoleOrIndexingPerformed === false &&
    exportManifest.livePagePublicationPerformed === false
  );
}

async function checkMediaProof(context, manifest) {
  const media = manifest.componentStatus?.media;
  if (media?.provider !== 'azure-blob' || media?.mode !== 'full-copy' || media?.status !== 'complete') {
    addFailure(context, 'MEDIA_BLOB_COPY_MISSING', 'manifest.json', 'production restore proof mode requires complete fake media full-copy component status');
    return;
  }

  const blobMapPath = media.blobMapPath ?? 'media/blob-map/blob-map.json';
  const blobMap = await readRequiredJson(context, blobMapPath, 'MEDIA_BLOB_COPY_MISSING');
  if (!blobMap) return;
  if (blobMap.provider !== 'azure-blob' || !isSupportedMediaBlobMapMode(blobMap.mode)) {
    addFailure(context, 'MEDIA_BLOB_COPY_INVALID', blobMapPath, 'Media blob map provider/mode is invalid');
  }
  if (!hasValidMediaBlobMapBoundaries(blobMap)) {
    addFailure(context, 'MEDIA_BLOB_COPY_BOUNDARY_INVALID', blobMapPath, 'Media blob map boundary fields are invalid for the selected proof mode');
  }
  if (!Array.isArray(blobMap.assets) || blobMap.copiedBlobCount < 1) {
    addFailure(context, 'MEDIA_BLOB_COPY_MISSING', blobMapPath, 'Media blob map must include copied fake blobs');
    return;
  }
  for (const asset of blobMap.assets) {
    if (!isCopiedMediaStatus(asset.copyStatus) || !isSafeBundleRelativePath(asset.bundlePath)) {
      addFailure(context, 'MEDIA_BLOB_COPY_MISSING', blobMapPath, 'Every media asset must include a copied fake blob path');
      continue;
    }
    await readRequiredFile(context, asset.bundlePath, 'MEDIA_BLOB_COPY_MISSING');
  }
}

function isSupportedMediaBlobMapMode(mode) {
  return mode === 'fake-full-copy' || mode === 'live-readonly-full-copy';
}

function hasValidMediaBlobMapBoundaries(blobMap) {
  if (blobMap.mode === 'fake-full-copy') {
    return blobMap.liveBlobDownloadPerformed === false && blobMap.storageCredentialUsed === false;
  }
  if (blobMap.mode !== 'live-readonly-full-copy') {
    return false;
  }
  return (
    blobMap.fakeOnly === false &&
    blobMap.liveBlobListingPerformed === true &&
    blobMap.liveBlobDownloadPerformed === true &&
    blobMap.azureMutationPerformed === false &&
    blobMap.protectedConfigRead === false &&
    blobMap.storageCredentialUsed === false &&
    blobMap.keysListed === false &&
    blobMap.connectionStringsRead === false &&
    blobMap.sasGenerated === false &&
    blobMap.tokensPrinted === false &&
    blobMap.tokensPersisted === false
  );
}

function isCopiedMediaStatus(status) {
  return status === 'fake-copied' || status === 'copied';
}

async function checkTenantWebsiteBundleProof(context, manifest) {
  const tenantWebsiteBundle = manifest.componentStatus?.tenantWebsiteBundle;
  if (tenantWebsiteBundle?.status !== 'complete' || !isSafeBundleRelativePath(tenantWebsiteBundle.manifestPath)) {
    addFailure(context, 'TENANT_WEBSITE_BUNDLE_MISSING', 'manifest.json', 'production restore proof mode requires a tenant website bundle manifest');
    return;
  }
  await readRequiredJson(context, tenantWebsiteBundle.manifestPath, 'TENANT_WEBSITE_BUNDLE_MISSING');
}

async function readRequiredJson(context, relativePath, code) {
  try {
    return await readJson(path.join(context.bundleRoot, relativePath));
  } catch (error) {
    addFailure(context, code, relativePath, error.message);
    return null;
  }
}

async function readRequiredFile(context, relativePath, code) {
  try {
    await fs.access(path.join(context.bundleRoot, relativePath));
  } catch (error) {
    addFailure(context, code, relativePath, error.message);
  }
}

async function checkConfigInventory(context) {
  let inventory;
  try {
    inventory = await readJson(path.join(context.bundleRoot, 'config-inventory/env-inventory.redacted.json'));
  } catch (error) {
    addFailure(context, 'CONFIG_INVENTORY_INVALID', 'config-inventory/env-inventory.redacted.json', error.message);
    addCheck(context, 'config-inventory-redacted', 'failed', 'Config inventory could not be parsed.');
    return;
  }

  const before = context.failures.length;
  if (!isPlainObject(inventory)) {
    addFailure(context, 'CONFIG_INVENTORY_INVALID', 'config-inventory/env-inventory.redacted.json', 'config inventory must be an object');
  }
  if (inventory.valuesIncluded !== false) {
    addFailure(context, 'CONFIG_VALUES_INCLUDED', 'config-inventory/env-inventory.redacted.json', 'standard backup config inventory must not include values');
  }
  if (!Array.isArray(inventory.variables)) {
    addFailure(context, 'CONFIG_INVENTORY_INVALID', 'config-inventory/env-inventory.redacted.json', 'variables must be an array');
  } else {
    for (const [index, variable] of inventory.variables.entries()) {
      const pathValue = `config-inventory/env-inventory.redacted.json:variables[${index}]`;
      if (!isPlainObject(variable)) {
        addFailure(context, 'CONFIG_INVENTORY_INVALID', pathValue, 'variable entry must be an object');
        continue;
      }
      if (typeof variable.name !== 'string' || variable.name.length === 0) {
        addFailure(context, 'CONFIG_INVENTORY_INVALID', pathValue, 'variable name is required');
      }
      if (!allowedConfigPresence.has(variable.presence)) {
        addFailure(context, 'CONFIG_INVENTORY_INVALID', pathValue, 'variable presence must be a presence marker');
      }
      if (!allowedRedactedValues.has(variable.value)) {
        addFailure(context, 'CONFIG_VALUE_NOT_REDACTED', pathValue, 'variable value must be a redacted marker only');
      }
      if (typeof variable.escrowEligible !== 'boolean') {
        addFailure(context, 'CONFIG_INVENTORY_INVALID', pathValue, 'escrowEligible must be boolean');
      }
    }
  }
  addCheck(
    context,
    'config-inventory-redacted',
    context.failures.length === before ? 'passed' : 'failed',
    context.failures.length === before ? 'Config inventory contains only redacted presence markers.' : 'Config inventory redaction checks failed.'
  );
}

async function checkChecksums(context) {
  const before = context.failures.length;
  let expected;
  try {
    expected = await readChecksums(context.bundleRoot);
  } catch (error) {
    addFailure(context, 'CHECKSUM_PARSE_ERROR', 'checksums.sha256', error.message);
    addCheck(context, 'checksums', 'failed', 'Checksum file could not be parsed.');
    context.metrics.checksumResult = 'failed';
    return;
  }

  const expectedByPath = new Map();
  const seen = new Set();
  for (const entry of expected) {
    if (!isSafeBundleRelativePath(entry.path)) {
      addFailure(context, 'CHECKSUM_FILE_PATH_INVALID', entry.path, 'checksum path must be bundle-relative and safe');
      continue;
    }
    if (seen.has(entry.path)) {
      addFailure(context, 'CHECKSUM_DUPLICATE', entry.path, 'checksum path is duplicated');
      continue;
    }
    seen.add(entry.path);
    if (entry.path === 'checksums.sha256') {
      addFailure(context, 'CHECKSUM_INCLUDES_SELF', entry.path, 'checksums.sha256 must not include itself');
      continue;
    }
    if (volatileReportFiles.has(entry.path)) {
      addFailure(context, 'CHECKSUM_EXCLUDED_FILE_LISTED', entry.path, 'volatile validation report files must not be in checksums.sha256');
      continue;
    }
    expectedByPath.set(entry.path, entry.sha256);
  }

  const actual = await computeBundleChecksums(context.bundleRoot).catch(() => []);
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
    if (isSafeBundleRelativePath(entry.path) && !isChecksumExcluded(entry.path) && !actualPaths.has(entry.path)) {
      addFailure(context, 'CHECKSUM_FILE_MISSING', entry.path, 'checksums.sha256 references a missing file');
    }
  }

  const passed = context.failures.length === before;
  context.metrics.checksumResult = passed ? 'passed' : 'failed';
  addCheck(
    context,
    'checksums',
    passed ? 'passed' : 'failed',
    passed ? 'Checksum verification passed.' : 'Checksum verification found tampering or contract failures.'
  );
}

async function checkEscrowAbsent(context) {
  const escrowDir = path.join(context.bundleRoot, 'escrow');
  const escrowFiles = await listFilesRecursive(escrowDir).catch(() => []);
  const disallowed = escrowFiles
    .map((filePath) => bundleRelativePath(context.bundleRoot, filePath))
    .filter((relativePath) => relativePath !== 'escrow/ESCROW_NOT_INCLUDED.md');

  const encryptedPayloads = disallowed.filter((relativePath) =>
    /encrypted-secrets\.|escrow-payload|secret|decrypted|plaintext/i.test(relativePath)
  );
  for (const relativePath of disallowed) {
    addFailure(
      context,
      encryptedPayloads.includes(relativePath) ? 'ESCROW_PAYLOAD_PRESENT' : 'UNEXPECTED_ESCROW_FILE',
      relativePath,
      'standard backups must not include escrow payload files'
    );
  }
  context.metrics.escrowExclusionResult = disallowed.length === 0 ? 'passed' : 'failed';
  addCheck(
    context,
    'escrow-exclusion',
    disallowed.length === 0 ? 'passed' : 'failed',
    disallowed.length === 0 ? 'Standard backup contains only ESCROW_NOT_INCLUDED.md.' : 'Standard backup contains disallowed escrow files.'
  );
}

async function checkNoProtectedPaths(context) {
  const files = await listBundleFiles(context);
  const protectedPaths = files
    .map((filePath) => bundleRelativePath(context.bundleRoot, filePath))
    .filter((relativePath) => isProtectedOrSecretRiskPath(relativePath));
  for (const relativePath of protectedPaths) {
    addFailure(context, 'PROTECTED_PATH_PRESENT', relativePath, 'protected or secret-risk file path is present in bundle');
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
  const files = await listBundleFiles(context);
  const hits = [];
  for (const filePath of files) {
    const relativePath = bundleRelativePath(context.bundleRoot, filePath);
    if (isChecksumExcluded(relativePath)) continue;
    const text = await fs.readFile(filePath, 'utf8').catch(() => '');
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
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

export function hasSecretLikeValue(line) {
  const headerFields = ['author' + 'ization', 'coo' + 'kie'].join('|');
  const bearerPrefix = 'bear' + 'er';
  const cloudKeyPrefix = 'AK' + 'IA';
  const connectionPattern =
    'Default' + 'Endpoints' + 'Protocol=https;' + 'Account' + 'Name=[^;]+;' + 'Account' + 'Key=[^;]+';
  const privateKeyPattern = '-----BEGIN (RSA |EC |OPENSSH |)PRIVATE ' + 'KEY-----';
  const namedSecretFields = [
    'pass' + 'word',
    'client_' + 'secret',
    'access_' + 'token',
    'refresh_' + 'token',
    'connection' + 'string',
    'connection_' + 'string',
    'storage' + 'key',
    'storage_' + 'key'
  ].join('|');
  const genericSecretFields = ['api[_-]?' + 'key', 'j' + 'wt', 'to' + 'ken', 'se' + 'cret'].join('|');
  const patterns = [
    new RegExp(`(${headerFields})\\s*[:=]\\s*[^\\s\`]+`, 'i'),
    new RegExp(`${bearerPrefix}\\s+[A-Za-z0-9._-]{10,}`, 'i'),
    new RegExp(`${'ey' + 'J'}[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}`),
    new RegExp(`${cloudKeyPrefix}[0-9A-Z]{16}`),
    new RegExp(connectionPattern, 'i'),
    new RegExp(privateKeyPattern),
    new RegExp(`["']?(${namedSecretFields})["']?\\s*[:=]\\s*["'][^"'\\s]{4,}`, 'i'),
    new RegExp(`["']?(${genericSecretFields})["']?\\s*[:=]\\s*["'](?!PLACEHOLDER|REDACTED|NOT_COLLECTED|EXCLUDED|NOT_INCLUDED|false|none|null)[^"'\\s]{8,}`, 'i')
  ];
  return patterns.some((pattern) => pattern.test(line));
}

function isSafeBundleRelativePath(value) {
  if (typeof value !== 'string' || value.length === 0) return false;
  if (value.includes('\\')) return false;
  if (value.startsWith('/') || /^[A-Za-z]:/.test(value)) return false;
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

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function renderValidationMarkdown(validation) {
  const lines = [
    '# Validation Result',
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
    `| Checksum result | ${validation.summary.checksumResult} |`,
    `| Checksum entries | ${validation.summary.checksumEntries} |`,
    `| Checksum files checked | ${validation.summary.checksumFilesChecked} |`,
    `| Escrow exclusion | ${validation.summary.escrowExclusionResult} |`,
    `| Secret-leak scan | ${validation.summary.secretLeakScanResult} |`,
    `| Path safety | ${validation.summary.pathSafetyResult} |`,
    `| Manifest file list | ${validation.summary.manifestFileListResult} |`,
    `| Connector proof | ${validation.summary.connectorProofResult} |`,
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
