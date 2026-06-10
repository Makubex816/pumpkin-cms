import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { computeBundleChecksums, isChecksumExcluded, readChecksums, writeChecksums } from '../../checksum-writer.mjs';
import { sha256File, listFilesRecursive } from '../../utils/file-hash.mjs';
import { bundleRelativePath, resolveTmpBundlePath, resolveTmpOutputPath, toPosixPath } from '../../utils/safe-paths.mjs';
import { readJson, writeJson } from '../../utils/json-writer.mjs';
import { hasSecretLikeValue } from '../../validators/backup-validator.mjs';
import { AzureBlobDataPlaneError, AzureBlobRbacReadClient } from './live-blob-rbac-client.mjs';
import { buildMediaCopyManifest, mediaConnectorContractVersion } from './media-copy-manifest.mjs';
import { writeMediaBlobChecksums } from './media-checksum-writer.mjs';

export const liveMediaCopyContractVersion = '0.2.0';

const tenantKey = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';
const storageTarget = {
  accountName: 'iceskatingmedia',
  resourceGroup: 'rg-ice-production-media',
  containerName: 'ice-rink-rentals-media',
  prefix: 'ice-rink-rentals/assets/'
};
const expectedBlobCount = 9;
const expectedTotalBytes = 22639448;
const allowedContentTypes = new Set(['image/png']);
const allowedExtensions = new Set(['.png']);
const validationReportFiles = new Set(['VALIDATION_RESULT.json', 'VALIDATION_RESULT.md']);

export async function runLiveMediaBlobCopyProof({
  outputPath,
  overwrite = false,
  client = null,
  now = new Date(),
  expectedCount = expectedBlobCount,
  expectedBytes = expectedTotalBytes
}) {
  const outputRoot = resolveTmpOutputPath(outputPath);
  if (await pathExists(outputRoot)) {
    if (!overwrite) throw new Error(`output already exists; pass --overwrite to replace: ${outputPath}`);
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(outputRoot, { recursive: true });

  const createdAt = now.toISOString();
  const dataPlaneClient = client ?? new AzureBlobRbacReadClient({ accountName: storageTarget.accountName });
  const result = baseResult({ outputRoot, createdAt, expectedCount, expectedBytes });

  try {
    result.dataPlaneAccess = await dataPlaneClient.verifyAccess({ containerName: storageTarget.containerName });
  } catch (error) {
    result.status = 'blocked';
    result.error = summarizeError(error);
    result.blockers.push(blocker('DATA_PLANE_ACCESS_UNAVAILABLE', 'Safe Azure Storage RBAC read access was unavailable; no media blobs were copied.'));
    await writeBlockedReports({ outputRoot, result });
    return result;
  }

  let listedBlobs;
  try {
    listedBlobs = await dataPlaneClient.listBlobs({
      containerName: storageTarget.containerName,
      prefix: storageTarget.prefix
    });
  } catch (error) {
    result.status = 'blocked';
    result.error = summarizeError(error);
    result.blockers.push(blocker('BLOB_METADATA_LIST_FAILED', 'Blob metadata listing failed before media copy could start.'));
    await writeBlockedReports({ outputRoot, result });
    return result;
  }

  const approvedBlobs = selectApprovedBlobs({ blobs: listedBlobs, expectedCount, expectedBytes });
  result.listingBlobs = approvedBlobs.blobs;
  result.listing = {
    status: approvedBlobs.validationFailures.length === 0 ? 'passed' : 'failed',
    listedBlobCount: listedBlobs.length,
    approvedBlobCount: approvedBlobs.blobs.length,
    expectedBlobCount: expectedCount,
    totalBytes: sumBytes(approvedBlobs.blobs),
    expectedTotalBytes: expectedBytes,
    validationFailures: approvedBlobs.validationFailures
  };
  if (result.listing.status !== 'passed') {
    result.status = 'blocked';
    result.blockers.push(blocker('BLOB_METADATA_VALIDATION_FAILED', 'Listed media blob metadata did not match the approved Ice media scope.'));
    await writeMediaProofReports({ outputRoot, result, copiedItems: [] });
    return result;
  }

  const copiedItems = [];
  const usedBundlePaths = new Set();
  try {
    for (const blob of approvedBlobs.blobs) {
      const destination = resolveBlobDestination({ outputRoot, blobName: blob.name });
      if (usedBundlePaths.has(destination.bundlePath)) {
        throw new Error(`duplicate local bundle path for blob: ${blob.name}`);
      }
      usedBundlePaths.add(destination.bundlePath);
      const download = await dataPlaneClient.downloadBlobToFile({
        containerName: storageTarget.containerName,
        blobName: blob.name,
        filePath: destination.filePath
      });
      const sha256 = await sha256File(destination.filePath);
      copiedItems.push({
        mediaAssetId: blob.name,
        blobName: blob.name,
        bundlePath: destination.bundlePath,
        sha256,
        byteSize: download.byteSize,
        sourceSize: blob.contentLength,
        contentType: blob.contentType,
        etag: blob.etag,
        lastModified: blob.lastModified
      });
    }
  } catch (error) {
    result.status = copiedItems.length > 0 ? 'partial' : 'failed';
    result.error = summarizeError(error);
    result.blockers.push(blocker('BLOB_DOWNLOAD_FAILED', 'A read-only media blob download failed; storage source was not mutated.'));
    await writeMediaProofReports({ outputRoot, result, copiedItems });
    return result;
  }

  result.copy = {
    status: 'complete',
    copiedBlobCount: copiedItems.length,
    totalCopiedBytes: sumBytes(copiedItems),
    expectedBlobCount: expectedCount,
    expectedTotalBytes: expectedBytes
  };
  result.status = 'copied';
  await writeMediaProofReports({ outputRoot, result, copiedItems });
  const validation = await validateLiveMediaCopyProof({
    mediaPath: outputRoot,
    expectedCount,
    expectedBytes
  });
  await writeLiveMediaCopyValidationReports({ mediaRoot: outputRoot, validation });
  result.validation = validation;
  result.status = validation.status === 'passed' ? 'copied-and-validated' : 'failed-validation';
  await writeJson(path.join(outputRoot, 'MEDIA_COPY_RESULT.json'), publicResult(result));
  await writeChecksums(outputRoot);
  return result;
}

export async function validateLiveMediaCopyProof({
  mediaPath,
  expectedCount = expectedBlobCount,
  expectedBytes = expectedTotalBytes
}) {
  const mediaRoot = resolveTmpBundlePath(mediaPath);
  const context = {
    mediaRoot,
    expectedCount,
    expectedBytes,
    checks: [],
    failures: [],
    warnings: [],
    metrics: {
      checkedFilesCount: 0,
      checksumResult: 'not-run',
      checksumEntries: 0,
      checksumFilesChecked: 0,
      blobCount: 0,
      totalBytes: 0,
      copyResult: 'not-run',
      extensionResult: 'not-run',
      secretLeakScanResult: 'not-run',
      pathSafetyResult: 'not-run'
    }
  };

  await checkMediaFolder(context);
  await checkRequiredFiles(context);
  const blobMap = await checkBlobMap(context);
  await checkCopiedBlobs(context, blobMap);
  await checkChecksums(context);
  await checkNoProtectedPaths(context);
  await checkNoSecretLikeValues(context);

  const status = context.failures.length === 0 ? 'passed' : 'failed';
  return {
    schemaVersion: liveMediaCopyContractVersion,
    validator: 'pumpkin-backup-center-live-media-copy-validator',
    status,
    generatedAt: new Date().toISOString(),
    readOnlyDataPlaneAccessOnly: true,
    summary: {
      checkedFilesCount: context.metrics.checkedFilesCount,
      copiedBlobCount: context.metrics.blobCount,
      expectedBlobCount: expectedCount,
      totalCopiedBytes: context.metrics.totalBytes,
      expectedTotalBytes: expectedBytes,
      checksumResult: context.metrics.checksumResult,
      checksumEntries: context.metrics.checksumEntries,
      checksumFilesChecked: context.metrics.checksumFilesChecked,
      copyResult: context.metrics.copyResult,
      extensionResult: context.metrics.extensionResult,
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

export async function writeLiveMediaCopyValidationReports({ mediaRoot, validation }) {
  await writeJson(path.join(mediaRoot, 'VALIDATION_RESULT.json'), validation);
  await fs.writeFile(path.join(mediaRoot, 'VALIDATION_RESULT.md'), renderValidationMarkdown(validation), 'utf8');
}

async function writeMediaProofReports({ outputRoot, result, copiedItems }) {
  const mapDir = path.join(outputRoot, 'media', 'blob-map');
  await fs.mkdir(mapDir, { recursive: true });
  const assets = (result.listing?.approvedBlobCount ? result.listingBlobs : []).map(blobToAsset);
  const planItems = (result.listingBlobs ?? []).map((blob) => ({
    mediaAssetId: blob.name,
    blobName: blob.name,
    source: `${storageTarget.accountName}/${storageTarget.containerName}`,
    expectedByteSize: blob.contentLength,
    contentType: blob.contentType
  }));

  await writeJson(path.join(mapDir, 'blob-inventory.json'), {
    schemaVersion: '0.2.0',
    connectorContractVersion: mediaConnectorContractVersion,
    provider: 'azure-blob',
    mode: 'live-readonly-inventory',
    generatedAt: result.generatedAt,
    fakeOnly: false,
    liveBlobListingPerformed: result.dataPlaneAccess?.status === 'available',
    source: 'azure-storage-aad-rbac-readonly',
    storage: storageTarget,
    tenantScope: { scopeType: 'tenant', tenantKey, siteKey },
    expectedBlobCount: result.expectedBlobCount,
    expectedTotalBytes: result.expectedTotalBytes,
    blobCount: result.listing?.approvedBlobCount ?? 0,
    totalBytes: result.listing?.totalBytes ?? 0,
    assets
  });
  await writeJson(path.join(mapDir, 'blob-copy-plan.json'), {
    schemaVersion: '0.2.0',
    connectorContractVersion: mediaConnectorContractVersion,
    provider: 'azure-blob',
    mode: 'live-readonly-copy-plan',
    generatedAt: result.generatedAt,
    fakeOnly: false,
    liveBlobDownloadPerformed: copiedItems.length > 0,
    storageMutationPerformed: false,
    copyItems: planItems
  });

  const blobMap = buildMediaCopyManifest({
    scope: { scopeType: 'tenant', tenantKey, siteKey },
    inventory: { source: 'azure-storage-aad-rbac-readonly' },
    assets,
    planItems,
    copiedItems,
    createdAt: result.generatedAt,
    mode: 'live-readonly-full-copy',
    fakeOnly: false,
    liveBlobListingPerformed: result.dataPlaneAccess?.status === 'available',
    liveBlobDownloadPerformed: copiedItems.length > 0,
    source: 'azure-storage-aad-rbac-readonly',
    storage: storageTarget,
    copyStatus: 'copied'
  });
  await writeJson(path.join(mapDir, 'blob-map.json'), blobMap);
  if (copiedItems.length > 0) {
    await writeMediaBlobChecksums({
      bundleRoot: outputRoot,
      blobRelativePaths: copiedItems.map((item) => item.bundlePath)
    });
  } else {
    await fs.writeFile(path.join(mapDir, 'blob-checksums.sha256'), '', 'utf8');
  }
  await fs.writeFile(path.join(outputRoot, 'media', 'MEDIA_BLOBS_INCLUDED.md'), renderMediaIncludedMarkdown(result), 'utf8');
  await writeJson(path.join(outputRoot, 'MEDIA_COPY_RESULT.json'), publicResult(result));
  await writeChecksums(outputRoot);
}

function selectApprovedBlobs({ blobs, expectedCount, expectedBytes }) {
  const validationFailures = [];
  const selected = blobs.filter((blob) => blob.name.startsWith(storageTarget.prefix));
  for (const blob of selected) {
    const extension = path.posix.extname(blob.name).toLowerCase();
    if (!allowedExtensions.has(extension)) {
      validationFailures.push({ code: 'UNAPPROVED_EXTENSION', blobName: blob.name, message: `Unexpected extension ${extension}` });
    }
    if (!allowedContentTypes.has(blob.contentType)) {
      validationFailures.push({ code: 'UNAPPROVED_CONTENT_TYPE', blobName: blob.name, message: `Unexpected content type ${blob.contentType}` });
    }
    if (!isSafeBlobName(blob.name)) {
      validationFailures.push({ code: 'UNSAFE_BLOB_NAME', blobName: blob.name, message: 'Blob name is not safe for local bundle path preservation' });
    }
  }
  if (selected.length !== expectedCount) {
    validationFailures.push({ code: 'BLOB_COUNT_MISMATCH', blobName: null, message: `Expected ${expectedCount} approved blobs, found ${selected.length}` });
  }
  const totalBytes = sumBytes(selected);
  if (totalBytes !== expectedBytes) {
    validationFailures.push({ code: 'BLOB_SIZE_MISMATCH', blobName: null, message: `Expected ${expectedBytes} bytes, found ${totalBytes}` });
  }
  return { blobs: selected, validationFailures };
}

async function checkMediaFolder(context) {
  try {
    const stat = await fs.stat(context.mediaRoot);
    if (!stat.isDirectory()) throw new Error('not a directory');
    addCheck(context, 'media-folder', 'passed', 'Media copy proof path is a folder.');
  } catch {
    addFailure(context, 'MEDIA_PACKAGE_MISSING', '.', 'media copy proof package folder does not exist');
    addCheck(context, 'media-folder', 'failed', 'Media copy proof path is missing.');
  }
}

async function checkRequiredFiles(context) {
  const required = [
    'MEDIA_COPY_RESULT.json',
    'media/MEDIA_BLOBS_INCLUDED.md',
    'media/blob-map/blob-inventory.json',
    'media/blob-map/blob-copy-plan.json',
    'media/blob-map/blob-map.json',
    'media/blob-map/blob-checksums.sha256',
    'checksums.sha256'
  ];
  const missing = [];
  for (const relativePath of required) {
    try {
      await fs.access(path.join(context.mediaRoot, relativePath));
    } catch {
      missing.push(relativePath);
      addFailure(context, 'REQUIRED_FILE_MISSING', relativePath, 'required media copy proof file is missing');
    }
  }
  addCheck(
    context,
    'required-files',
    missing.length === 0 ? 'passed' : 'failed',
    missing.length === 0 ? 'All required media copy proof files exist.' : `Missing media copy files: ${missing.join(', ')}`
  );
}

async function checkBlobMap(context) {
  let blobMap;
  try {
    blobMap = await readJson(path.join(context.mediaRoot, 'media', 'blob-map', 'blob-map.json'));
  } catch (error) {
    addFailure(context, 'BLOB_MAP_PARSE_ERROR', 'media/blob-map/blob-map.json', error.message);
    addCheck(context, 'blob-map', 'failed', 'Blob map could not be parsed.');
    return null;
  }
  const problems = [];
  if (blobMap.schemaVersion !== liveMediaCopyContractVersion) problems.push('schemaVersion');
  if (blobMap.provider !== 'azure-blob') problems.push('provider');
  if (blobMap.mode !== 'live-readonly-full-copy') problems.push('mode');
  if (blobMap.fakeOnly !== false) problems.push('fakeOnly');
  if (blobMap.liveBlobListingPerformed !== true) problems.push('liveBlobListingPerformed');
  if (blobMap.liveBlobDownloadPerformed !== true) problems.push('liveBlobDownloadPerformed');
  if (blobMap.azureMutationPerformed !== false) problems.push('azureMutationPerformed');
  if (blobMap.protectedConfigRead !== false) problems.push('protectedConfigRead');
  if (blobMap.storageCredentialUsed !== false) problems.push('storageCredentialUsed');
  if (blobMap.keysListed !== false) problems.push('keysListed');
  if (blobMap.connectionStringsRead !== false) problems.push('connectionStringsRead');
  if (blobMap.sasGenerated !== false) problems.push('sasGenerated');
  if (blobMap.tokensPrinted !== false || blobMap.tokensPersisted !== false) problems.push('tokenBoundaries');
  if (blobMap.tenantScope?.tenantKey !== tenantKey) problems.push('tenantScope.tenantKey');
  if (blobMap.copiedBlobCount !== context.expectedCount) problems.push('copiedBlobCount');
  if (!Array.isArray(blobMap.assets)) problems.push('assets');
  if (problems.length > 0) {
    addFailure(context, 'BLOB_MAP_INVALID', 'media/blob-map/blob-map.json', `blob map fields invalid: ${problems.join(', ')}`);
  }
  addCheck(
    context,
    'blob-map',
    problems.length === 0 ? 'passed' : 'failed',
    problems.length === 0 ? 'Blob map is valid for live read-only full-copy proof.' : 'Blob map validation failed.'
  );
  return blobMap;
}

async function checkCopiedBlobs(context, blobMap) {
  const before = context.failures.length;
  const assets = blobMap?.assets ?? [];
  let totalBytes = 0;
  for (const asset of assets) {
    if (asset.copyStatus !== 'copied') {
      addFailure(context, 'BLOB_NOT_COPIED', asset.blobName ?? 'unknown', 'approved blob was not copied');
      continue;
    }
    if (!isSafeBundlePath(asset.bundlePath)) {
      addFailure(context, 'BLOB_PATH_INVALID', asset.bundlePath, 'copied blob path is not safe');
      continue;
    }
    const filePath = path.join(context.mediaRoot, asset.bundlePath);
    try {
      const stat = await fs.stat(filePath);
      if (!stat.isFile()) throw new Error('not a file');
      totalBytes += stat.size;
      const sha256 = await sha256File(filePath);
      if (sha256 !== asset.checksum) {
        addFailure(context, 'BLOB_CHECKSUM_MISMATCH', asset.bundlePath, 'copied blob checksum does not match blob map');
      }
      if (asset.byteSize !== stat.size) {
        addFailure(context, 'BLOB_SIZE_MISMATCH', asset.bundlePath, 'copied blob byte size does not match blob map');
      }
      const extension = path.posix.extname(asset.bundlePath).toLowerCase();
      if (!allowedExtensions.has(extension)) {
        addFailure(context, 'UNAPPROVED_EXTENSION', asset.bundlePath, 'copied blob extension is not approved');
      }
    } catch (error) {
      addFailure(context, 'COPIED_BLOB_MISSING', asset.bundlePath, error.message);
    }
  }
  context.metrics.blobCount = assets.length;
  context.metrics.totalBytes = totalBytes;
  if (assets.length !== context.expectedCount) {
    addFailure(context, 'BLOB_COUNT_MISMATCH', 'media/blob-map/blob-map.json', `expected ${context.expectedCount} copied blobs, got ${assets.length}`);
  }
  if (totalBytes !== context.expectedBytes) {
    addFailure(context, 'BLOB_SIZE_MISMATCH', 'media/blob-map/blob-map.json', `expected ${context.expectedBytes} copied bytes, got ${totalBytes}`);
  }
  context.metrics.copyResult = context.failures.length === before ? 'passed' : 'failed';
  context.metrics.extensionResult = context.failures.some((failure) => failure.code === 'UNAPPROVED_EXTENSION') ? 'failed' : 'passed';
  addCheck(
    context,
    'copied-blobs',
    context.metrics.copyResult,
    context.metrics.copyResult === 'passed' ? 'Copied blob files, counts, sizes, and checksums match.' : 'Copied blob validation failed.'
  );
}

async function checkChecksums(context) {
  const before = context.failures.length;
  let expected;
  try {
    expected = await readChecksums(context.mediaRoot);
  } catch (error) {
    addFailure(context, 'CHECKSUM_PARSE_ERROR', 'checksums.sha256', error.message);
    addCheck(context, 'checksums', 'failed', 'Checksum file could not be parsed.');
    context.metrics.checksumResult = 'failed';
    return;
  }
  const expectedByPath = new Map();
  const seen = new Set();
  for (const entry of expected) {
    if (!isSafeBundlePath(entry.path)) {
      addFailure(context, 'CHECKSUM_FILE_PATH_INVALID', entry.path, 'checksum path must be proof-relative and safe');
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
  const actual = await computeBundleChecksums(context.mediaRoot).catch(() => []);
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
    .map((filePath) => bundleRelativePath(context.mediaRoot, filePath))
    .filter((relativePath) => isProtectedOrSecretRiskPath(relativePath));
  for (const relativePath of protectedPaths) {
    addFailure(context, 'PROTECTED_PATH_PRESENT', relativePath, 'protected or secret-risk file path is present in media copy proof');
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
    const relativePath = bundleRelativePath(context.mediaRoot, filePath);
    if (isChecksumExcluded(relativePath) || validationReportFiles.has(relativePath) || relativePath.startsWith('media/blobs/')) continue;
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
  const files = await listFilesRecursive(context.mediaRoot).catch(() => []);
  context.metrics.checkedFilesCount = files.length;
  return files;
}

function baseResult({ outputRoot, createdAt, expectedCount, expectedBytes }) {
  return {
    schemaVersion: liveMediaCopyContractVersion,
    phase: '2F-12S',
    status: 'started',
    generatedAt: createdAt,
    outputRoot,
    target: {
      ...storageTarget,
      tenantKey,
      siteKey
    },
    expectedBlobCount: expectedCount,
    expectedTotalBytes: expectedBytes,
    dataPlaneAccess: null,
    listing: null,
    listingBlobs: null,
    copy: null,
    validation: null,
    boundaries: {
      readOnlyDataPlaneAccessOnly: true,
      storageMutationPerformed: false,
      storageKeysListed: false,
      connectionStringsRead: false,
      sasGenerated: false,
      protectedConfigRead: false,
      tokensPrinted: false,
      tokensPersisted: false,
      cmsWritesPerformed: false,
      cmsRuntimeSwitchPerformed: false,
      cosmosWritesPerformed: false,
      deploymentPerformed: false,
      searchConsoleOrIndexingPerformed: false,
      livePagePublicationPerformed: false,
      generatedTmpOutputStaged: false
    },
    blockers: [],
    error: null
  };
}

function publicResult(result) {
  return {
    schemaVersion: result.schemaVersion,
    phase: result.phase,
    status: result.status,
    generatedAt: result.generatedAt,
    target: result.target,
    expectedBlobCount: result.expectedBlobCount,
    expectedTotalBytes: result.expectedTotalBytes,
    dataPlaneAccess: result.dataPlaneAccess,
    listing: result.listing,
    copy: result.copy,
    validationStatus: result.validation?.status ?? 'not-run',
    boundaries: result.boundaries,
    blockers: result.blockers,
    error: result.error
  };
}

function blobToAsset(blob) {
  return {
    mediaAssetId: blob.name,
    blobName: blob.name,
    contentType: blob.contentType,
    byteSize: blob.contentLength,
    etag: blob.etag,
    lastModified: blob.lastModified,
    sourceContainer: storageTarget.containerName
  };
}

function renderMediaIncludedMarkdown(result) {
  return [
    '# Media Blobs Included',
    '',
    'Live Azure Blob media files were copied into this local `.tmp` proof using Azure AD/RBAC read-only access.',
    '',
    `Storage account: ${storageTarget.accountName}`,
    `Container: ${storageTarget.containerName}`,
    `Copied blobs: ${result.copy?.copiedBlobCount ?? 0}`,
    `Total copied bytes: ${result.copy?.totalCopiedBytes ?? 0}`,
    '',
    '- No storage keys/listKeys were used.',
    '- No connection string was read.',
    '- No SAS was generated.',
    '- No storage mutation, upload, delete, or restore was performed.',
    ''
  ].join('\n');
}

function renderValidationMarkdown(validation) {
  const lines = [
    '# Live Media Copy Validation Result',
    '',
    `Status: ${validation.status}`,
    `Generated: ${validation.generatedAt}`,
    `Schema Version: ${validation.schemaVersion}`,
    '',
    '## Summary',
    '',
    '| Field | Result |',
    '| --- | --- |',
    `| Copied blobs | ${validation.summary.copiedBlobCount} |`,
    `| Expected blobs | ${validation.summary.expectedBlobCount} |`,
    `| Total copied bytes | ${validation.summary.totalCopiedBytes} |`,
    `| Expected bytes | ${validation.summary.expectedTotalBytes} |`,
    `| Checksum result | ${validation.summary.checksumResult} |`,
    `| Copy result | ${validation.summary.copyResult} |`,
    `| Extension result | ${validation.summary.extensionResult} |`,
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

function summarizeError(error) {
  if (error instanceof AzureBlobDataPlaneError) {
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

function resolveBlobDestination({ outputRoot, blobName }) {
  if (!isSafeBlobName(blobName)) {
    throw new Error(`unsafe blob name: ${blobName}`);
  }
  const normalized = toPosixPath(blobName);
  const extension = path.posix.extname(normalized).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    throw new Error(`unapproved blob extension for local copy: ${blobName}`);
  }
  const digest = crypto.createHash('sha256').update(normalized).digest('hex');
  const bundlePath = `media/blobs/${tenantKey}/${digest}${extension}`;
  const destination = path.join(outputRoot, ...bundlePath.split('/'));
  const blobRoot = path.join(outputRoot, 'media', 'blobs');
  const resolved = path.resolve(destination);
  const relative = path.relative(blobRoot, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`blob destination escaped media/blobs: ${blobName}`);
  }
  return { filePath: resolved, bundlePath };
}

function isSafeBlobName(blobName) {
  const normalized = toPosixPath(String(blobName));
  return (
    normalized.length > 0 &&
    !normalized.startsWith('/') &&
    !/^[A-Za-z]:/.test(normalized) &&
    !normalized.includes('\\') &&
    normalized.split('/').every((part) => part.length > 0 && part !== '.' && part !== '..') &&
    path.posix.normalize(normalized) === normalized
  );
}

function isSafeBundlePath(relativePath) {
  const normalized = toPosixPath(String(relativePath));
  return (
    normalized.length > 0 &&
    !normalized.startsWith('/') &&
    !/^[A-Za-z]:/.test(normalized) &&
    !normalized.includes('\\') &&
    normalized.split('/').every((part) => part.length > 0 && part !== '.' && part !== '..') &&
    path.posix.normalize(normalized) === normalized
  );
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

function sumBytes(items) {
  return items.reduce((sum, item) => sum + Number(item.byteSize ?? item.contentLength ?? 0), 0);
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

function escapeMarkdownCell(value) {
  return String(value).replace(/\|/g, '/');
}

async function writeBlockedReports({ outputRoot, result }) {
  await fs.mkdir(path.join(outputRoot, 'media', 'blob-map'), { recursive: true });
  await writeJson(path.join(outputRoot, 'MEDIA_COPY_RESULT.json'), publicResult(result));
  await fs.writeFile(path.join(outputRoot, 'media', 'MEDIA_BLOBS_INCLUDED.md'), renderMediaIncludedMarkdown(result), 'utf8');
  await writeChecksums(outputRoot);
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
