import fs from 'node:fs/promises';
import path from 'node:path';

export async function writeAbortRollbackChecklist({ outputRoot, evidence }) {
  const text = `# Abort And Rollback Checklist

Abort before write if any no-go condition is true.

Rollback context:

- rollbackPlanId: \`${evidence.rollbackPlanId ?? 'TBD-from-approved-package'}\`
- applyPlanId: \`${evidence.applyPlanId}\`
- stagingExecutionRunId: \`${evidence.stagingExecutionRunId}\`

Abort triggers:

- provider profile mismatch
- tenant/site mismatch
- Backup Center evidence missing
- runtime QA evidence missing
- Resource Registry evidence missing
- trace/audit continuity failure
- conflict detected before first write
- any protected config or secret access is required

Rollback expectations after any future approved write:

- stop additional writes immediately
- preserve trace/audit IDs
- read back affected records
- compare afterStateHash/readbackRecordHash
- restore from approved rollback package or Backup Center plan only
- document outcome before any retry
`;
  await fs.writeFile(path.join(outputRoot, 'ABORT_ROLLBACK_CHECKLIST.md'), text, 'utf8');
}
