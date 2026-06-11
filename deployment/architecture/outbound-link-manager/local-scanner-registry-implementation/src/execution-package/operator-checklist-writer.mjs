import fs from 'node:fs/promises';
import path from 'node:path';

export async function writeOperatorChecklist({ outputRoot, evidence }) {
  const text = `# Operator Checklist

Before a future first scoped staging-provider write:

- [ ] Confirm approval manifest references tenantKey \`${evidence.tenantKey}\`.
- [ ] Confirm approval manifest references siteKey \`${evidence.siteKey}\`.
- [ ] Confirm provider profile ID \`${evidence.providerProfileId}\`.
- [ ] Confirm provider mode is explicitly approved for the future phase.
- [ ] Confirm Backup Center pre-execution evidence passed.
- [ ] Confirm runtime QA evidence passed.
- [ ] Confirm Resource Registry refresh candidate passed and contains no secret values.
- [ ] Confirm first-write batch count is ${evidence.totalRecords}.
- [ ] Confirm readback plan and abort/rollback checklist are accepted.
- [ ] Confirm no-go conditions are false.
- [ ] Confirm no generated .tmp evidence will be staged.

This checklist is not approval by itself.
`;
  await fs.writeFile(path.join(outputRoot, 'OPERATOR_CHECKLIST.md'), text, 'utf8');
}
