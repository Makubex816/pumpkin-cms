import fs from 'node:fs/promises';
import path from 'node:path';
import { assertInsidePath, isInsidePath, resolveTmpOutputPath, tmpRoot } from '../utils/safe-paths.mjs';

export function resolveRestoreOutputPath(outputPath) {
  const outputRoot = resolveTmpOutputPath(outputPath);
  assertInsidePath(outputRoot, tmpRoot, 'restore output path');
  return outputRoot;
}

export function assertRestoreOutputSeparate({ bundleRoot, outputRoot }) {
  const resolvedBundleRoot = path.resolve(bundleRoot);
  const resolvedOutputRoot = path.resolve(outputRoot);
  if (resolvedBundleRoot === resolvedOutputRoot) {
    throw new Error('restore output path must be separate from source backup bundle');
  }
  if (isInsidePath(resolvedOutputRoot, resolvedBundleRoot)) {
    throw new Error('restore output path must not be inside source backup bundle');
  }
  if (isInsidePath(resolvedBundleRoot, resolvedOutputRoot)) {
    throw new Error('restore output path must not contain source backup bundle');
  }
}

export async function prepareRestoreOutput({ bundleRoot, outputPath, overwrite = false }) {
  const outputRoot = resolveRestoreOutputPath(outputPath);
  assertRestoreOutputSeparate({ bundleRoot, outputRoot });

  if (await pathExists(outputRoot)) {
    if (!overwrite) {
      throw new Error(`restore output already exists; pass --overwrite to replace: ${outputPath}`);
    }
    await fs.rm(outputRoot, { recursive: true, force: true });
  }

  await fs.mkdir(outputRoot, { recursive: true });
  return outputRoot;
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
