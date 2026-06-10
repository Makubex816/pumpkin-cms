import fs from 'node:fs/promises';
import path from 'node:path';

export async function writeSeedRollbackPlan({ outputRoot, seed }) {
  const lines = [
    '# Ice Cosmos Seed Rollback Plan',
    '',
    'This phase generated a dry-run package only, so there is nothing to roll back now.',
    '',
    '## Future Live Seed Rollback Preconditions',
    '',
    '1. Capture the exact approved seed manifest, checksums, migration run ID, and operator approval record before execution.',
    '2. Confirm Cosmos continuous backup policy and restore window for the target account before seed execution.',
    '3. Tag or stamp every future live seed document with the migration run ID from this package.',
    '4. Keep rollback tenant-scoped by `tenantKey`; never delete or overwrite cross-tenant data.',
    '',
    '## Future Rollback Options',
    '',
    '- Preferred: restore from platform backup or point-in-time recovery if the live seed corrupts existing data.',
    '- Targeted cleanup: delete only documents with the approved migration run ID and tenant key when rollback approval permits it.',
    '- Reconciliation: compare readback counts and sampled IDs against the approved manifest before and after cleanup.',
    '',
    '## Current State',
    '',
    `- Migration run ID: ${seed.migrationRunId}`,
    `- Tenant key: ${seed.tenantKey}`,
    '- Live Cosmos writes performed: false',
    '- CMS writes performed: false',
    '- Runtime switch performed: false',
    '',
    'No rollback command was executed or prepared with live credentials.',
    ''
  ];

  await fs.writeFile(path.join(outputRoot, 'ROLLBACK_PLAN.md'), `${lines.join('\n')}\n`, 'utf8');
}
