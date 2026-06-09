import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson } from '../utils/json-writer.mjs';

export async function writeFakeConfigInventory({ bundleRoot, request }) {
  const source = await readJson(request.fixtureRefs.configInventory);
  const variables = source.variables ?? [];
  const outputDir = path.join(bundleRoot, 'config-inventory');
  await fs.mkdir(outputDir, { recursive: true });
  await writeJson(path.join(outputDir, 'env-inventory.redacted.json'), {
    schemaVersion: '0.2.0',
    source: 'fake-fixture',
    scope: request.scope,
    valuesIncluded: false,
    variables
  });
  await fs.writeFile(
    path.join(outputDir, 'CONFIG_VALUES_REDACTED.md'),
    [
      '# Config Values Redacted',
      '',
      'This prototype writes fixture config names and redacted statuses only.',
      '',
      '- No protected config file was read.',
      '- No environment variable value was read.',
      '- No secret value is included.',
      ''
    ].join('\n'),
    'utf8'
  );
  return [
    { path: 'config-inventory/env-inventory.redacted.json', kind: 'config-inventory', required: true, sensitivity: 'redacted', schemaRef: null },
    { path: 'config-inventory/CONFIG_VALUES_REDACTED.md', kind: 'config-inventory', required: true, sensitivity: 'redacted', schemaRef: null }
  ];
}
