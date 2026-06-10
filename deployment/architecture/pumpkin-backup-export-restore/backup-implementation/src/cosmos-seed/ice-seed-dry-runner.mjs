import fs from 'node:fs/promises';
import path from 'node:path';
import { writeChecksums } from '../checksum-writer.mjs';
import { resolveRuntimeProfileFromFixture } from '../provider/runtime-profile-model.mjs';
import { validateBackupBundle, writeValidationReports } from '../validators/backup-validator.mjs';
import { readJson } from '../utils/json-writer.mjs';
import { fixturesRoot, isInsidePath, resolveFixturePath, resolveTmpBundlePath, resolveTmpOutputPath } from '../utils/safe-paths.mjs';
import { mapIceBackupToCosmosSeed } from './cosmos-document-mapper.mjs';
import { writeSeedDryRunPackage } from './seed-manifest-writer.mjs';
import { validateSeedDryRunPackage, writeSeedValidationReports } from './tenant-partition-validator.mjs';

const defaultProviderFixturePath = 'fixtures/provider-source.ice.future-target-cosmos.json';
const defaultRuntimeFixturePath = 'fixtures/runtime-profile.ice.future-target-cosmos.json';

export async function createIceCosmosSeedDryRun({
  sourcePath,
  outputPath,
  overwrite = false,
  providerFixturePath = defaultProviderFixturePath,
  runtimeFixturePath = defaultRuntimeFixturePath,
  now = new Date()
}) {
  const bundleRoot = resolveTmpBundlePath(sourcePath);
  const outputRoot = resolveTmpOutputPath(outputPath);
  assertOutputSeparateFromSource({ bundleRoot, outputRoot });

  const baselineValidation = await validateBackupBundle({ bundlePath: bundleRoot, mode: 'baseline' });
  await writeValidationReports({ bundleRoot, validation: baselineValidation });
  if (baselineValidation.status !== 'passed') {
    const codes = baselineValidation.failures.map((failure) => failure.code).join(', ');
    throw new Error(`Cosmos seed dry-run refused invalid source backup bundle: ${codes}`);
  }

  if (await pathExists(outputRoot)) {
    if (!overwrite) throw new Error(`output already exists; pass --overwrite to replace: ${outputPath}`);
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(outputRoot, { recursive: true });

  const providerFixture = await readJson(assertFixturePath(providerFixturePath));
  const runtimeResolved = await resolveRuntimeProfileFromFixture({ fixturePath: runtimeFixturePath });
  const createdAt = now.toISOString();
  const seed = await mapIceBackupToCosmosSeed({
    bundleRoot,
    providerFixture,
    runtimeProfile: runtimeResolved.profile,
    createdAt
  });

  const manifest = await writeSeedDryRunPackage({
    outputRoot,
    seed,
    baselineValidation,
    runtimeProfileValidation: runtimeResolved.validation
  });
  const checksums = await writeChecksums(outputRoot);
  const validation = await validateSeedDryRunPackage({ seedPath: outputRoot, expectedTenantKey: seed.tenantKey });
  await writeSeedValidationReports({ seedRoot: outputRoot, validation });
  if (validation.status !== 'passed') {
    const codes = validation.failures.map((failure) => failure.code).join(', ');
    throw new Error(`Cosmos seed dry-run package failed validation: ${codes}`);
  }

  return {
    bundleRoot,
    outputRoot,
    seed,
    manifest,
    checksums,
    validation,
    baselineValidation,
    runtimeProfile: runtimeResolved.profile,
    runtimeProfileValidation: runtimeResolved.validation
  };
}

function assertOutputSeparateFromSource({ bundleRoot, outputRoot }) {
  if (bundleRoot === outputRoot || isInsidePath(outputRoot, bundleRoot) || isInsidePath(bundleRoot, outputRoot)) {
    throw new Error('Cosmos seed output must not overlap the source backup bundle');
  }
}

function assertFixturePath(inputPath) {
  const resolved = resolveFixturePath(inputPath);
  if (!isInsidePath(resolved, fixturesRoot)) {
    throw new Error('provider/runtime fixture path must stay inside fixtures');
  }
  return resolved;
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
