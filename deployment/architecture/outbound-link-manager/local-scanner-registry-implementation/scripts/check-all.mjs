import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const roots = ['src', 'test'];
const files = [];

for (const root of roots) {
  files.push(...await listMjs(path.join(packageRoot, root)));
}

for (const file of files.sort()) {
  const result = spawnSync(process.execPath, ['--check', file], {
    cwd: packageRoot,
    encoding: 'utf8'
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
}

console.log(`syntax check passed: ${files.length} files`);

async function listMjs(root) {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listMjs(fullPath));
    } else if (entry.name.endsWith('.mjs')) {
      files.push(fullPath);
    }
  }
  return files;
}
