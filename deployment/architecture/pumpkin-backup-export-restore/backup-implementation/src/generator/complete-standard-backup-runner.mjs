import fs from 'node:fs/promises';
import path from 'node:path';
import { createStandardBackup } from '../standard-backup-runner.mjs';
import { runLiveCosmosReadonlyExport } from '../connectors/cosmos/live-cosmos-export-runner.mjs';
import { runLiveMediaBlobCopyProof } from '../connectors/media/live-media-copy-runner.mjs';
import { createIceBackupFromLiveCosmosExport } from '../ice/ice-live-cosmos-backup-runner.mjs';
import { createRestorePlan } from '../restore/restore-plan-runner.mjs';
import { validateBackupBundle, writeValidationReports } from '../validators/backup-validator.mjs';
import { writeChecksums } from '../checksum-writer.mjs';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { packageRoot, resolveTmpOutputPath } from '../utils/safe-paths.mjs';
import { createDownloadPackage } from './download-package-writer.mjs';
import { productFileEntries, writeGeneratorProductFiles } from './operator-summary-writer.mjs';

const iceAnswers = 'fixtures/ice-cosmos-media-standard-backup.answers.json';

export async function createCompleteStandardBackupWorkflow({
  profile,
  outputPath,
  overwrite = false,
  now = new Date(),
  download = false,
  downloadOutputPath = null
}) {
  if (profile !== 'fake-complete') {
    throw new Error(`unsupported complete standard profile: ${profile}`);
  }
  const outputRoot = resolveTmpOutputPath(outputPath);
  const restoreOutputRoot = siblingOutputRoot(outputRoot, 'restore-plan');
  const createdAt = now.toISOString();

  const backup = await createStandardBackup({
    answersPath: iceAnswers,
    outputPath: outputRoot,
    scopeOverride: 'tenant',
    overwrite,
    now,
    connectors: {
      fakeCosmos: true,
      fakeMediaCopy: true,
      tenantWebsiteBundle: true
    }
  });

  return finalizeProductWorkflow({
    profile,
    bundleRoot: backup.bundleRoot,
    expectedCountsPath: null,
    restoreOutputRoot,
    createdAt,
    now,
    download,
    downloadOutputPath
  });
}

export async function createIceCompleteStandardBackupWorkflow({
  profile,
  outputPath,
  overwrite = false,
  now = new Date(),
  download = false,
  downloadOutputPath = null
}) {
  if (profile !== 'live-readonly') {
    throw new Error(`unsupported Ice complete standard profile: ${profile}`);
  }
  const outputRoot = resolveTmpOutputPath(outputPath);
  const workRoot = siblingOutputRoot(outputRoot, 'source-proofs');
  const cosmosOutputPath = path.join(workRoot, 'cosmos-export');
  const mediaOutputPath = path.join(workRoot, 'media-copy');
  const restoreOutputRoot = siblingOutputRoot(outputRoot, 'restore-plan');
  const createdAt = now.toISOString();

  const cosmos = await runLiveCosmosReadonlyExport({
    outputPath: cosmosOutputPath,
    overwrite,
    now
  });
  if (cosmos.status !== 'exported-and-validated') {
    throw new Error(`live-readonly Cosmos export did not complete: ${cosmos.status}`);
  }

  const media = await runLiveMediaBlobCopyProof({
    outputPath: mediaOutputPath,
    overwrite,
    now
  });
  if (media.status !== 'copied-and-validated') {
    throw new Error(`live-readonly media copy did not complete: ${media.status}`);
  }

  const backup = await createIceBackupFromLiveCosmosExport({
    exportPath: cosmos.outputRoot,
    mediaProofPath: media.outputRoot,
    outputPath: outputRoot,
    overwrite,
    now
  });

  return finalizeProductWorkflow({
    profile,
    bundleRoot: backup.bundleRoot,
    expectedCountsPath: backup.expectedCountsPath,
    restoreOutputRoot,
    createdAt,
    now,
    download,
    downloadOutputPath,
    liveProofs: {
      cosmosOutputRoot: cosmos.outputRoot,
      mediaOutputRoot: media.outputRoot,
      cosmosStatus: cosmos.status,
      mediaStatus: media.status
    }
  });
}

async function finalizeProductWorkflow({
  profile,
  bundleRoot,
  expectedCountsPath,
  restoreOutputRoot,
  createdAt,
  now,
  download,
  downloadOutputPath,
  liveProofs = null
}) {
  await writeGeneratorProductFiles({
    bundleRoot,
    profile,
    generatedAt: createdAt,
    stage: 'pre-restore'
  });
  await rewriteManifestForGenerator({ bundleRoot, profile, createdAt, liveProofs });
  await writeChecksums(bundleRoot);
  const preRestoreValidation = await validateBackupBundle({ bundlePath: bundleRoot, mode: 'production-restore-proof' });
  await writeValidationReports({ bundleRoot, validation: preRestoreValidation });
  if (preRestoreValidation.status !== 'passed') {
    throw new Error(`generator pre-restore bundle validation failed: ${preRestoreValidation.failures.map((failure) => failure.code).join(', ')}`);
  }

  const restoreArgs = {
    bundlePath: bundleRoot,
    outputPath: restoreOutputRoot,
    mode: 'production-restore-proof',
    overwrite: true,
    now
  };
  if (expectedCountsPath) {
    restoreArgs.expectedCountsPath = expectedCountsPath;
  }
  const restore = await createRestorePlan(restoreArgs);

  await writeGeneratorProductFiles({
    bundleRoot,
    profile,
    generatedAt: createdAt,
    validation: preRestoreValidation,
    restorePlan: restore.plan,
    stage: 'post-restore'
  });
  await rewriteManifestForGenerator({ bundleRoot, profile, createdAt, liveProofs });
  await writeChecksums(bundleRoot);
  const finalValidation = await validateBackupBundle({ bundlePath: bundleRoot, mode: 'production-restore-proof' });
  await writeValidationReports({ bundleRoot, validation: finalValidation });
  if (finalValidation.status !== 'passed') {
    throw new Error(`generator final bundle validation failed: ${finalValidation.failures.map((failure) => failure.code).join(', ')}`);
  }

  let downloadResult = null;
  if (download) {
    downloadResult = await createDownloadPackage({
      bundlePath: bundleRoot,
      outputPath: downloadOutputPath ?? siblingOutputRoot(bundleRoot, 'download'),
      overwrite: true,
      mode: 'production-restore-proof',
      now
    });
  }

  await writeGeneratorProductFiles({
    bundleRoot,
    profile,
    generatedAt: createdAt,
    validation: finalValidation,
    restorePlan: restore.plan,
    download: downloadResult,
    stage: 'complete'
  });
  await rewriteManifestForGenerator({ bundleRoot, profile, createdAt, liveProofs });
  await writeChecksums(bundleRoot);
  const finalReportValidation = await validateBackupBundle({ bundlePath: bundleRoot, mode: 'production-restore-proof' });
  await writeValidationReports({ bundleRoot, validation: finalReportValidation });
  if (finalReportValidation.status !== 'passed') {
    throw new Error(`generator report bundle validation failed: ${finalReportValidation.failures.map((failure) => failure.code).join(', ')}`);
  }

  return {
    profile,
    bundleRoot,
    restoreOutputRoot: restore.outputRoot,
    expectedCountsPath,
    validation: finalReportValidation,
    restorePlan: restore.plan,
    download: downloadResult,
    liveProofs,
    manifest: await readJson(path.join(bundleRoot, 'manifest.json'))
  };
}

async function rewriteManifestForGenerator({ bundleRoot, profile, createdAt, liveProofs }) {
  const manifestPath = path.join(bundleRoot, 'manifest.json');
  const manifest = await readJson(manifestPath);
  const productEntries = productFileEntries();
  const productPaths = new Set(productEntries.map((entry) => entry.path));
  const existingEntries = (manifest.files ?? []).filter((entry) => !productPaths.has(entry.path));
  manifest.files = [...existingEntries, ...productEntries].sort((a, b) => a.path.localeCompare(b.path));
  manifest.contentFileCount = manifest.files.length;
  manifest.createdBy = 'backup-center-phase-2f13-unified-generator';
  manifest.requestedBy = profile === 'live-readonly'
    ? 'phase-2f13-approved-live-readonly-unified-generator'
    : 'phase-2f13-local-fake-unified-generator';
  manifest.generator = {
    schemaVersion: '0.2.0',
    phase: '2F-13',
    profile,
    generatedAt: createdAt,
    oneCommandWorkflow: true,
    resourceRegistryIncluded: 'reference-only',
    restorePlanIncluded: true,
    operatorSummaryIncluded: true,
    downloadPackageOptional: true,
    liveProofs: liveProofs
      ? {
        cosmosOutput: path.relative(packageRoot, liveProofs.cosmosOutputRoot).replace(/\\/g, '/'),
        mediaOutput: path.relative(packageRoot, liveProofs.mediaOutputRoot).replace(/\\/g, '/'),
        cosmosStatus: liveProofs.cosmosStatus,
        mediaStatus: liveProofs.mediaStatus
      }
      : null,
    boundaries: {
      cmsRuntimeSwitch: false,
      cmsWrites: false,
      cosmosWrites: false,
      storageMutation: false,
      protectedConfigRead: false,
      deployment: false,
      searchConsoleOrIndexing: false,
      livePagePublication: false
    }
  };
  manifest.componentStatus = {
    ...manifest.componentStatus,
    resourceRegistry: {
      status: 'reference-included',
      mode: 'redacted-reference',
      path: 'resource-registry/resource-registry-reference.json',
      encryptedVaultPayloadIncluded: false
    },
    generator: {
      status: 'complete',
      profile,
      operatorSummaryPath: 'operator/OPERATOR_SUMMARY.md',
      retentionCleanupPath: 'operator/RETENTION_AND_CLEANUP.md',
      restorePlanSummaryPath: 'RESTORE_PLAN.md'
    }
  };
  manifest.warnings = unique([
    ...(manifest.warnings ?? []),
    'Unified generator workflow product files are included.',
    'Resource Registry is included as a redacted reference only.',
    'Restore plan remains dry-run only.',
    'Generated download packages, if created, remain outside the bundle under ignored .tmp output.'
  ]);
  await writeJson(manifestPath, manifest);
}

function siblingOutputRoot(outputRoot, suffix) {
  const resolved = resolveTmpOutputPath(outputRoot);
  return path.join(path.dirname(resolved), `${path.basename(resolved)}-${suffix}`);
}

function unique(items) {
  return [...new Set(items)];
}
