import { validateBackupBundle, writeValidationReports } from '../validators/backup-validator.mjs';
import { resolveTmpBundlePath } from '../utils/safe-paths.mjs';
import { compareRestoreCounts, loadExpectedRestoreCounts } from './restore-count-comparator.mjs';
import { readRestoreInventory } from './restore-inventory-reader.mjs';
import { writeRestorePlanReports } from './restore-plan-writer.mjs';
import { prepareRestoreOutput } from './restore-target-safety.mjs';

export async function createRestorePlan({
  bundlePath,
  outputPath,
  expectedCountsPath,
  overwrite = false,
  now = new Date()
}) {
  const bundleRoot = resolveTmpBundlePath(bundlePath);
  const validation = await validateBackupBundle({ bundlePath: bundleRoot });
  await writeValidationReports({ bundleRoot, validation });
  if (validation.status !== 'passed') {
    const codes = validation.failures.map((failure) => failure.code).join(', ');
    throw new Error(`restore dry-run refused invalid backup bundle: ${codes}`);
  }

  const outputRoot = await prepareRestoreOutput({ bundleRoot, outputPath, overwrite });
  const inventory = await readRestoreInventory({ bundleRoot });
  const expectedCounts = await loadExpectedRestoreCounts(expectedCountsPath);
  const comparison = compareRestoreCounts({
    manifest: inventory.manifest,
    actualCounts: inventory.counts,
    expectedCounts
  });
  const plan = await writeRestorePlanReports({
    outputRoot,
    bundleRoot,
    validation,
    inventory,
    comparison,
    createdAt: now.toISOString()
  });

  if (plan.status !== 'passed') {
    const codes = plan.failures.map((failure) => failure.code).join(', ');
    throw new Error(`restore dry-run failed validation: ${codes}`);
  }

  return {
    bundleRoot,
    outputRoot,
    validation,
    inventory,
    comparison,
    plan
  };
}
