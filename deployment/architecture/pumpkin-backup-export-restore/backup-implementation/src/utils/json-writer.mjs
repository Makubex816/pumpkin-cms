import fs from 'node:fs/promises';
import path from 'node:path';

export function stableStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, stableStringify(value), 'utf8');
}

export async function readJson(filePath) {
  const text = await fs.readFile(filePath, 'utf8');
  return JSON.parse(text);
}
