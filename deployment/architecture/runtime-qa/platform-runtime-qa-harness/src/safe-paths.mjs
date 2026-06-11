import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const packageRoot = path.resolve(__dirname, '..');
export const repoRoot = path.resolve(packageRoot, '..', '..', '..', '..');
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

export function resolveRepoPath(inputPath) {
  const resolved = path.resolve(repoRoot, inputPath);
  assertInsidePath(resolved, repoRoot, 'repo path');
  assertNoProtectedPath(resolved);
  return resolved;
}

export function resolveFixturePath(inputPath) {
  const resolved = path.resolve(packageRoot, inputPath);
  assertInsidePath(resolved, fixturesRoot, 'fixture path');
  assertNoProtectedPath(resolved);
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

export function packageRelative(filePath) {
  const relative = path.relative(packageRoot, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`file is outside package: ${filePath}`);
  }
  return toPosixPath(relative);
}

export function repoRelative(filePath) {
  const relative = path.relative(repoRoot, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`file is outside repo: ${filePath}`);
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
    /(^|\/).*deployment[-_]?token.*$/,
    /(^|\/)\.next(\/|$)/,
    /(^|\/)node_modules(\/|$)/,
    /(^|\/)bin(\/|$)/,
    /(^|\/)obj(\/|$)/
  ];
  if (protectedPatterns.some((pattern) => pattern.test(normalized))) {
    throw new Error(`protected or generated path is blocked: ${filePath}`);
  }
}
