import fs from 'node:fs/promises';
import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';
import { packageRoot } from '../utils/safe-paths.mjs';
import {
  renderRestorePlanMarkdown,
  renderRestoreTargetNotWrittenMarkdown,
  renderRestoreValidationMarkdown
} from './restore-validation-reporter.mjs';

export async function writeRestorePlanReports({ outputRoot, bundleRoot, validation, inventory, comparison, createdAt }) {
  const plan = buildRestorePlan({ outputRoot, bundleRoot, validation, inventory, comparison, createdAt });
  await writeJson(path.join(outputRoot, 'restore-plan.json'), plan);
  await fs.writeFile(path.join(outputRoot, 'RESTORE_PLAN.md'), renderRestorePlanMarkdown(plan), 'utf8');
  await writeJson(path.join(outputRoot, 'RESTORE_VALIDATION_RESULT.json'), {
    schemaVersion: plan.schemaVersion,
    status: plan.status,
    generatedAt: plan.generatedAt,
    dryRunOnly: plan.dryRunOnly,
    backupValidation: plan.backupValidation,
    countComparison: plan.countComparison,
    failures: plan.failures,
    boundaries: plan.boundaries
  });
  await fs.writeFile(
    path.join(outputRoot, 'RESTORE_VALIDATION_RESULT.md'),
    renderRestoreValidationMarkdown(plan),
    'utf8'
  );
  await fs.writeFile(
    path.join(outputRoot, 'RESTORE_TARGET_NOT_WRITTEN.md'),
    renderRestoreTargetNotWrittenMarkdown(plan),
    'utf8'
  );
  return plan;
}

function buildRestorePlan({ outputRoot, bundleRoot, validation, inventory, comparison, createdAt }) {
  const failures = [
    ...comparison.failures,
    ...buildBoundaryFailures(inventory)
  ];
  const status = validation.status === 'passed' && failures.length === 0 ? 'passed' : 'failed';
  return {
    schemaVersion: '0.1.0',
    restoreValidationContractVersion: '0.1.0',
    generatedAt: createdAt,
    status,
    dryRunOnly: true,
    restoreExecuted: false,
    sourceBundle: path.relative(packageRoot, bundleRoot),
    outputRoot: path.relative(packageRoot, outputRoot),
    scope: inventory.scope,
    backupValidation: {
      status: validation.status,
      schemaVersion: validation.schemaVersion,
      summary: validation.summary
    },
    inventoryCounts: inventory.counts,
    countComparison: comparison,
    configInventory: inventory.configInventory,
    escrow: inventory.escrow,
    plannedSteps: buildPlannedSteps(inventory),
    failures,
    boundaries: {
      databaseImport: false,
      cmsApiRestore: false,
      mediaAssetRestore: false,
      blobRestore: false,
      staticOutputRestore: false,
      protectedConfigRead: false,
      secretExport: false,
      encryptedEscrowPayloadCreated: false,
      escrowRestore: false,
      externalSystemMutation: false,
      livePagePublication: false
    }
  };
}

function buildPlannedSteps(inventory) {
  return [
    {
      stepId: 'validate-backup-bundle',
      writesRealSystem: false,
      summary: 'Backup manifest, file list, checksums, path safety, config redaction, and escrow exclusion were validated first.'
    },
    {
      stepId: 'read-backup-inventory',
      writesRealSystem: false,
      summary: `Read backup inventory counts for ${inventory.counts.tenants} tenant entries, ${inventory.counts.pages} page entries, and ${inventory.counts.mediaAssets} media asset entries.`
    },
    {
      stepId: 'compare-expected-counts',
      writesRealSystem: false,
      summary: 'Compared backup inventory counts against approved local expected-count evidence.'
    },
    {
      stepId: 'prepare-dry-run-plan',
      writesRealSystem: false,
      summary: 'Prepared a restore plan only; no target database, CMS, media, static output, or config store was written.'
    }
  ];
}

function buildBoundaryFailures(inventory) {
  const failures = [];
  if (!inventory.escrow.markerExists) {
    failures.push({
      code: 'RESTORE_ESCROW_MARKER_MISSING',
      path: 'escrow/ESCROW_NOT_INCLUDED.md',
      message: 'standard backup restore dry-run requires the escrow-not-included marker'
    });
  }
  if (inventory.escrow.extraFileCount > 0) {
    failures.push({
      code: 'RESTORE_ESCROW_PAYLOAD_PRESENT',
      path: 'escrow',
      message: 'standard backup restore dry-run refuses escrow payload files'
    });
  }
  if (!inventory.configInventory.redactedOnly) {
    failures.push({
      code: 'RESTORE_CONFIG_NOT_REDACTED',
      path: 'config-inventory/env-inventory.redacted.json',
      message: 'restore dry-run requires redacted config inventory only'
    });
  }
  return failures;
}
