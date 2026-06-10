import path from 'node:path';
import { fileURLToPath } from 'node:url';

const thisDir = path.dirname(fileURLToPath(import.meta.url));
export const packageRoot = path.resolve(thisDir, '../..');
export const tmpRoot = path.join(packageRoot, '.tmp');

const archiveExtensions = new Set(['.zip', '.bak', '.backup', '.bacpac']);

export function resolvePackagePath(inputPath) {
  if (!inputPath || typeof inputPath !== 'string') {
    throw new Error('path is required');
  }
  const resolved = path.resolve(packageRoot, inputPath);
  assertInside(resolved, packageRoot, 'path must resolve inside the outbound link scanner package');
  return resolved;
}

export function resolveFixturePath(inputPath) {
  const resolved = resolvePackagePath(inputPath);
  assertInside(resolved, path.join(packageRoot, 'fixtures'), 'fixture path must resolve inside fixtures');
  return resolved;
}

export function resolveTmpOutputPath(inputPath) {
  if (!inputPath || typeof inputPath !== 'string') {
    throw new Error('output path is required');
  }
  const resolved = path.resolve(packageRoot, inputPath);
  assertInside(resolved, tmpRoot, 'generated output must resolve inside .tmp');
  if (archiveExtensions.has(path.extname(resolved).toLowerCase())) {
    throw new Error('generated output must be a folder, not an archive path');
  }
  return resolved;
}

export function resolveTmpScanPath(inputPath) {
  const resolved = resolveTmpOutputPath(inputPath);
  return resolved;
}

export function toPackageRelative(resolvedPath) {
  return path.relative(packageRoot, resolvedPath).replace(/\\/g, '/');
}

function assertInside(child, parent, message) {
  const relative = path.relative(parent, child);
  if (relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))) {
    return;
  }
  throw new Error(message);
}
