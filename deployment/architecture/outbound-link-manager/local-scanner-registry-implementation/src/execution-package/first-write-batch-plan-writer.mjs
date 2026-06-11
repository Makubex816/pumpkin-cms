import fs from 'node:fs/promises';
import path from 'node:path';
import { buildFirstWriteBatch } from './approval-manifest-writer.mjs';

export async function writeFirstWriteBatchPlan({ outputRoot, source, evidence }) {
  const batch = buildFirstWriteBatch({ source, evidence });
  const rows = batch.targetEntities.map((item) => (
    `| ${item.targetEntity} | ${item.targetContainer} | ${item.expectedCount} |`
  )).join('\n');
  const text = `# First Write Batch Plan

Status: future explicit staging write approval required.

- batchId: \`${batch.batchId}\`
- strategy: \`${batch.strategy}\`
- max records: ${batch.maxRecords}
- expected records: ${batch.expectedRecordCount}
- stop on conflict: \`${batch.stopOnConflict}\`
- stop on readback mismatch: \`${batch.stopOnReadbackMismatch}\`

| Target entity | Target container | Expected records |
| --- | --- | ---: |
${rows}

This plan is a package-builder artifact only. No real staging-provider write was performed.
`;
  await fs.writeFile(path.join(outputRoot, 'FIRST_WRITE_BATCH_PLAN.md'), text, 'utf8');
  return batch;
}
