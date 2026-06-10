import fs from 'node:fs/promises';
import path from 'node:path';

export async function writeSeedReadbackPlan({ outputRoot, seed }) {
  const lines = [
    '# Ice Cosmos Seed Readback Plan',
    '',
    'This is a future execution plan only. Phase 2F-12O performed no Cosmos reads or writes.',
    '',
    '## Target',
    '',
    `- Tenant key: ${seed.tenantKey}`,
    `- Site key: ${seed.siteKey}`,
    `- Cosmos account: ${seed.target.accountName}`,
    `- Database: ${seed.target.databaseName}`,
    '- Partition key path: `/tenantKey`',
    '',
    '## Future Readback Gates',
    '',
    '1. Confirm a new owner approval explicitly permits live Cosmos seed execution and readback.',
    '2. Confirm seed manifest checksum matches the approved package.',
    '3. Confirm every approved container still uses `/tenantKey`.',
    '4. Run tenant-scoped readback only; do not issue cross-tenant count queries.',
    '5. Compare live counts with `seed-manifest.json` document counts.',
    '6. Sample deterministic IDs from each non-empty container and verify `tenantKey` plus `migrationMetadata.migrationRunId`.',
    '',
    '## Planned Tenant-Scoped Queries',
    '',
    '| Container | Expected count | Readback intent |',
    '| --- | ---: | --- |'
  ];
  for (const [container, count] of Object.entries(seed.counts).sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`| ${container} | ${count} | Count documents where tenantKey equals approved Ice tenant. |`);
  }
  lines.push(
    '',
    '## Non-Goals',
    '',
    '- No readback was run in this phase.',
    '- No keys, connection strings, or SAS values are needed for this plan.',
    '- No database export, media download, runtime switch, CMS write, deployment, or indexing action is part of readback.',
    ''
  );

  await fs.writeFile(path.join(outputRoot, 'READBACK_PLAN.md'), `${lines.join('\n')}\n`, 'utf8');
}
