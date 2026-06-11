import fs from 'node:fs/promises';
import path from 'node:path';

export async function writeReadbackPlan({ outputRoot, evidence }) {
  const text = `# Readback Verification Plan

Future first scoped staging-provider write readback must verify:

- stagingExecutionRunId: \`${evidence.stagingExecutionRunId}\`
- expected readbackRunId lineage: \`${evidence.readbackRunId}\`
- tenantKey: \`${evidence.tenantKey}\`
- siteKey: \`${evidence.siteKey}\`
- expected record count: ${evidence.totalRecords}
- expected counts by entity:

${Object.entries(evidence.expectedCounts).map(([entity, count]) => `  - ${entity}: ${count}`).join('\n')}

Required checks:

- query only the approved tenant/site partition
- compare targetRecordId and targetEntity for every written record
- compare before/after/readback hashes where available
- stop on missing record, duplicate record, tenant mismatch, partition mismatch, checksum mismatch, or unexpected entity count
- write readback evidence under ignored output only
- do not perform CMS writes or live page publication
`;
  await fs.writeFile(path.join(outputRoot, 'READBACK_VERIFICATION_PLAN.md'), text, 'utf8');
}
