import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { bundleRelativePath } from './safe-paths.mjs';

export async function sha256File(filePath) {
  const data = await fs.readFile(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

export async function listFilesRecursive(rootDir) {
  const files = [];

  async function visit(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await visit(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }

  await visit(rootDir);
  return files.sort((a, b) => bundleRelativePath(rootDir, a).localeCompare(bundleRelativePath(rootDir, b)));
}
