import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const packageRoot = path.resolve(__dirname, '..', '..');
export const tmpRoot = path.join(packageRoot, '.tmp');
export const fixturesRoot = path.join(packageRoot, 'fixtures');

export function toPosixPath(value) {
  return value.split(path.sep).join('/');
}

export function isInsidePath(child, parent) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

export function assertInsidePath(child, parent, label = 'path') {
  if (!isInsidePath(child, parent)) {
    throw new Error(`${label} must stay inside ${parent}`);
  }
}

export function resolvePackagePath(inputPath) {
  const resolved = path.resolve(packageRoot, inputPath);
  assertInsidePath(resolved, packageRoot, 'package path');
  assertNoProtectedPath(resolved);
  return resolved;
}

export function resolveFixturePath(inputPath) {
  const resolved = resolvePackagePath(inputPath);
  assertInsidePath(resolved, fixturesRoot, 'fixture path');
  return resolved;
}

export function resolveTmpOutputPath(inputPath) {
  const resolved = path.resolve(packageRoot, inputPath);
  assertInsidePath(resolved, tmpRoot, 'output path');
  assertNoProtectedPath(resolved);
  return resolved;
}

export function resolveTmpInputPath(inputPath) {
  const resolved = path.resolve(packageRoot, inputPath);
  assertInsidePath(resolved, tmpRoot, 'input path');
  assertNoProtectedPath(resolved);
  return resolved;
}

export function packageRelativePath(filePath) {
  const relative = path.relative(packageRoot, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`file is outside package: ${filePath}`);
  }
  return toPosixPath(relative);
}

export function outputRelativePath(outputRoot, filePath) {
  const relative = path.relative(outputRoot, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`file is outside output: ${filePath}`);
  }
  return toPosixPath(relative);
}

export function assertNoProtectedPath(filePath) {
  const normalized = toPosixPath(filePath).toLowerCase();
  const protectedPatterns = [
    /(^|\/)\.env(\.|$)/,
    /(^|\/)appsettings\.development\.json$/,
    /(^|\/)local\.settings\.json$/,
    /(^|\/).*credential[-_]?values.*$/,
    /(^|\/).*plaintext[-_]?credentials.*$/,
    /(^|\/).*auth[-_]?header.*$/,
    /(^|\/).*cookie.*$/,
    /(^|\/).*connection[-_]?string.*$/,
    /(^|\/).*storage[-_]?key.*$/,
    /(^|\/).*private[-_]?key.*$/,
    /(^|\/).*deployment[-_]?token.*$/
  ];
  if (protectedPatterns.some((pattern) => pattern.test(normalized))) {
    throw new Error(`protected or secret-risk path is blocked: ${filePath}`);
  }
}

