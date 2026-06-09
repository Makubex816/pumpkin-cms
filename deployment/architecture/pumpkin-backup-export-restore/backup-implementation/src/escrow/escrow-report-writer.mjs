import fs from 'node:fs/promises';
import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';

export async function writeEscrowNotice({ outputRoot, createdAt }) {
  await fs.writeFile(
    path.join(outputRoot, 'ESCROW_FAKE_ONLY_NOTICE.md'),
    [
      '# Escrow Fake Only Notice',
      '',
      `Generated: ${createdAt}`,
      '',
      'This escrow output is a local fake-fixture encryption prototype only.',
      '',
      '- No real secret was exported.',
      '- No protected config file was read.',
      '- No production escrow payload was created.',
      '- No private-key material was written.',
      '- No external system was modified.',
      ''
    ].join('\n'),
    'utf8'
  );
}

export async function writeEscrowValidationReports({ outputRoot, validation }) {
  await writeJson(path.join(outputRoot, 'escrow-validation-result.json'), validation);
  await fs.writeFile(
    path.join(outputRoot, 'ESCROW_VALIDATION_RESULT.md'),
    renderEscrowValidationMarkdown(validation),
    'utf8'
  );
}

export function renderEscrowValidationMarkdown(validation) {
  const lines = [
    '# Escrow Validation Result',
    '',
    `Status: ${validation.status}`,
    `Generated: ${validation.generatedAt}`,
    '',
    '## Summary',
    '',
    '| Field | Result |',
    '| --- | --- |',
    `| Required files | ${validation.summary.requiredFilesResult} |`,
    `| Payload encrypted | ${validation.summary.payloadEncryptedResult} |`,
    `| Recipient metadata | ${validation.summary.recipientMetadataResult} |`,
    `| Approval record | ${validation.summary.approvalRecordResult} |`,
    `| Private-key scan | ${validation.summary.privateKeyResult} |`,
    `| Secret-like scan | ${validation.summary.secretLikeResult} |`,
    `| Failures | ${validation.failures.length} |`,
    '',
    '## Failures',
    ''
  ];
  if (validation.failures.length === 0) {
    lines.push('None.');
  } else {
    for (const failure of validation.failures) {
      lines.push(`- ${failure.code} at ${failure.path}: ${failure.message}`);
    }
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}
