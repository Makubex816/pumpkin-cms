import { toPosixPath } from '../utils/safe-paths.mjs';

export function renderRestorePlanMarkdown(plan) {
  const lines = [
    '# Restore Plan',
    '',
    `Status: ${plan.status}`,
    `Generated: ${plan.generatedAt}`,
    `Dry run only: ${plan.dryRunOnly}`,
    `Source bundle: ${plan.sourceBundle}`,
    `Output: ${plan.outputRoot}`,
    '',
    '## Scope',
    '',
    `- Type: ${plan.scope.scopeType}`,
    `- Tenant: ${plan.scope.tenantKey ?? 'platform'}`,
    `- Site: ${plan.scope.siteKey ?? 'platform'}`,
    '',
    '## Planned Steps',
    '',
    '| Step | Writes real system | Summary |',
    '| --- | --- | --- |'
  ];
  for (const step of plan.plannedSteps) {
    lines.push(`| ${step.stepId} | ${step.writesRealSystem} | ${escapeMarkdownCell(step.summary)} |`);
  }
  lines.push('', '## Inventory Counts', '', renderCountsTable(plan.inventoryCounts));
  lines.push('', '## Boundaries', '');
  for (const [name, value] of Object.entries(plan.boundaries)) {
    lines.push(`- ${name}: ${value}`);
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

export function renderRestoreValidationMarkdown(plan) {
  const lines = [
    '# Restore Validation Result',
    '',
    `Status: ${plan.status}`,
    `Generated: ${plan.generatedAt}`,
    '',
    '## Backup Validation',
    '',
    `- Status: ${plan.backupValidation.status}`,
    `- Checksum result: ${plan.backupValidation.summary.checksumResult}`,
    `- Escrow exclusion: ${plan.backupValidation.summary.escrowExclusionResult}`,
    `- Secret-leak scan: ${plan.backupValidation.summary.secretLeakScanResult}`,
    '',
    '## Count Comparison',
    '',
    '| Name | Expected | Actual | Status |',
    '| --- | --- | --- | --- |'
  ];
  for (const comparison of plan.countComparison.comparisons) {
    lines.push(`| ${comparison.name} | ${comparison.expected} | ${comparison.actual} | ${comparison.status} |`);
  }
  lines.push('', '## Failures', '');
  if (plan.failures.length === 0) {
    lines.push('None.');
  } else {
    for (const failure of plan.failures) {
      lines.push(`- ${failure.code} at ${toPosixPath(failure.path)}: ${failure.message}`);
    }
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

export function renderRestoreTargetNotWrittenMarkdown(plan) {
  return [
    '# Restore Target Not Written',
    '',
    'This restore validation output is a dry-run plan only.',
    '',
    `Generated: ${plan.generatedAt}`,
    `Source bundle: ${plan.sourceBundle}`,
    '',
    '- No database import was run.',
    '- No CMS/API restore was run.',
    '- No MediaAsset restore was run.',
    '- No blob/media restore was run.',
    '- No static output restore was run.',
    '- No secret export occurred.',
    '- No encrypted escrow payload was created.',
    '- No external system was modified.',
    ''
  ].join('\n');
}

function renderCountsTable(counts) {
  const lines = ['| Name | Count |', '| --- | --- |'];
  for (const [name, count] of Object.entries(counts)) {
    lines.push(`| ${name} | ${count} |`);
  }
  return lines.join('\n');
}

function escapeMarkdownCell(value) {
  return String(value).replace(/\|/g, '/');
}
