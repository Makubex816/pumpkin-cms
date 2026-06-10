import fs from 'node:fs/promises';
import path from 'node:path';

export async function writeMigrationValidationReport({ migrationRoot, validation }) {
  await fs.writeFile(path.join(migrationRoot, 'VALIDATION_RESULT.md'), renderMigrationValidationReport(validation), 'utf8');
}

export function renderMigrationValidationReport(validation) {
  const counts = Object.entries(validation.summary.countsByEntity ?? {})
    .map(([entity, count]) => `| ${entity} | ${count} |`)
    .join('\n');
  const failures = validation.failures.length > 0
    ? validation.failures.map((item) => `- ${item.code}: ${item.message} (${item.path})`).join('\n')
    : '- none';
  return `# Migration Dry-Run Validation

Status: ${validation.status}

Migration run: ${validation.migrationRunId ?? 'unknown'}

| Entity | Records |
| --- | ---: |
${counts}

## Failures

${failures}

Boundary: local/offline dry-run only. No production database migration, live provider writes, CMS writes, protected config reads, external crawling, Azure mutation, deployment, indexing, or live-page publication.
`;
}
