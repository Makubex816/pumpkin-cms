import fs from 'node:fs/promises';
import path from 'node:path';
import { resolveBackupRequest, pathExists } from './backup-scope-resolver.mjs';
import { writeStandardBundle } from './standard-bundle-writer.mjs';
import { validateBackupBundle, writeValidationReports } from './validators/backup-validator.mjs';
import { resolveTmpOutputPath } from './utils/safe-paths.mjs';

export async function createStandardBackup({
  answersPath,
  outputPath,
  scopeOverride,
  overwrite = false,
  now = new Date(),
  connectors = {}
}) {
  const bundleRoot = resolveTmpOutputPath(outputPath);
  const request = await resolveBackupRequest({ answersPath, scopeOverride });

  if (await pathExists(bundleRoot)) {
    if (!overwrite) {
      throw new Error(`output already exists; pass --overwrite to replace: ${outputPath}`);
    }
    await fs.rm(bundleRoot, { recursive: true, force: true });
  }

  await fs.mkdir(path.dirname(bundleRoot), { recursive: true });
  const createdAt = now.toISOString();
  const writeResult = await writeStandardBundle({ bundleRoot, request, createdAt, connectors });
  const validationMode = connectors.fakeCosmos && connectors.fakeMediaCopy ? 'production-restore-proof' : 'baseline';
  const validation = await validateBackupBundle({ bundlePath: bundleRoot, mode: validationMode });
  await writeValidationReports({ bundleRoot, validation });

  if (validation.status !== 'passed') {
    throw new Error(`generated backup failed validation: ${validation.failures.map((failure) => failure.code).join(', ')}`);
  }

  return {
    bundleRoot,
    request,
    manifest: writeResult.manifest,
    checksums: writeResult.checksums,
    validation,
    connectors: writeResult.connectorResults
  };
}
