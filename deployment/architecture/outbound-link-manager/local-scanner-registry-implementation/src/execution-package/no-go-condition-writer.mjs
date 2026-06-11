import fs from 'node:fs/promises';
import path from 'node:path';
import { defaultNoGoConditions } from './approval-manifest-writer.mjs';

export async function writeNoGoConditions({ outputRoot }) {
  const conditions = defaultNoGoConditions();
  const text = `# No-Go Conditions

The future first scoped staging-provider write must not start if any condition below is true.

${conditions.map((condition) => `- ${condition}`).join('\n')}

These conditions are hard stops, not warnings.
`;
  await fs.writeFile(path.join(outputRoot, 'NO_GO_CONDITIONS.md'), text, 'utf8');
  return conditions;
}
