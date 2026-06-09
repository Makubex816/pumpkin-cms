import fs from 'node:fs/promises';
import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';

export async function writeFakeDatabasePlan({ bundleRoot, request, createdAt }) {
  const outputDir = path.join(bundleRoot, 'database');
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, 'DATABASE_EXPORT_NOT_INCLUDED.md'),
    [
      '# Database Export Not Included',
      '',
      'Phase 2F-3 is a local-only standard backup prototype.',
      '',
      '- No real database export was run.',
      '- No connection string was read.',
      '- No database artifact was created.',
      '- Future database export requires a separate approval gate.',
      ''
    ].join('\n'),
    'utf8'
  );
  await writeJson(path.join(outputDir, 'database-export-plan.json'), {
    status: 'not_included',
    reason: 'local prototype uses placeholder database export planner only',
    scope: request.scope,
    createdAt,
    productionDatabaseTouched: false,
    connectionStringRead: false,
    exportArtifactCreated: false
  });
  return [
    { path: 'database/DATABASE_EXPORT_NOT_INCLUDED.md', kind: 'database-plan', required: true, sensitivity: 'redacted', schemaRef: null },
    { path: 'database/database-export-plan.json', kind: 'database-plan', required: true, sensitivity: 'redacted', schemaRef: null }
  ];
}
