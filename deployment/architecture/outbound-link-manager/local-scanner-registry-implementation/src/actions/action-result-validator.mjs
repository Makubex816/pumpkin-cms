import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson, pathExists } from '../utils/json-writer.mjs';
import { resolveTmpOutputPath, toPackageRelative } from '../utils/safe-paths.mjs';

export async function validateActionResult({ resultPath }) {
  const resultRoot = resolveTmpOutputPath(resultPath);
  const failures = [];
  const actionResultPath = path.join(resultRoot, 'ACTION_RESULT.json');
  const impactPath = path.join(resultRoot, 'PUBLISHING_IMPACT.json');
  const rollbackPath = path.join(resultRoot, 'ROLLBACK_PLAN.json');
  const auditPath = path.join(resultRoot, 'ACTION_AUDIT_LOG.json');

  if (!await pathExists(actionResultPath)) {
    failures.push(failure('ACTION_RESULT_MISSING', 'ACTION_RESULT.json is required', 'ACTION_RESULT.json'));
  }
  if (!await pathExists(impactPath)) {
    failures.push(failure('PUBLISHING_IMPACT_MISSING', 'PUBLISHING_IMPACT.json is required', 'PUBLISHING_IMPACT.json'));
  }
  if (!await pathExists(rollbackPath)) {
    failures.push(failure('ROLLBACK_PLAN_MISSING', 'ROLLBACK_PLAN.json is required', 'ROLLBACK_PLAN.json'));
  }

  const actionResult = await readIfPresent(actionResultPath);
  const impact = await readIfPresent(impactPath);
  const rollbackPlan = await readIfPresent(rollbackPath);

  if (actionResult) {
    if (actionResult.resultType !== 'pumpkin-outbound-link-local-write-action-result') {
      failures.push(failure('RESULT_TYPE_INVALID', 'action result type is invalid', 'ACTION_RESULT.json/resultType'));
    }
    if (!['simulated', 'blocked'].includes(actionResult.status)) {
      failures.push(failure('RESULT_STATUS_INVALID', 'action result status must be simulated or blocked', 'ACTION_RESULT.json/status'));
    }
    assertLocalBoundaries(actionResult.boundaries, failures, 'ACTION_RESULT.json/boundaries');
    if (actionResult.approval?.productionWriteApproved !== false) {
      failures.push(failure('PRODUCTION_WRITE_FLAG_INVALID', 'productionWriteApproved must be false', 'ACTION_RESULT.json/approval'));
    }
    if (actionResult.status === 'simulated') {
      if (!actionResult.artifacts?.sandboxStore) {
        failures.push(failure('SANDBOX_STORE_MISSING', 'simulated actions must write a sandbox store', 'ACTION_RESULT.json/artifacts'));
      }
      if (!await pathExists(auditPath)) {
        failures.push(failure('ACTION_AUDIT_MISSING', 'simulated actions must write ACTION_AUDIT_LOG.json', 'ACTION_AUDIT_LOG.json'));
      }
    }
    if (actionResult.status === 'blocked' && actionResult.artifacts?.sandboxStore) {
      failures.push(failure('BLOCKED_SANDBOX_STORE_WRITTEN', 'blocked actions must not write a sandbox store', 'ACTION_RESULT.json/artifacts'));
    }
  }

  if (impact) {
    if (impact.impactType !== 'pumpkin-outbound-link-publishing-impact') {
      failures.push(failure('IMPACT_TYPE_INVALID', 'publishing impact type is invalid', 'PUBLISHING_IMPACT.json/impactType'));
    }
    assertLocalBoundaries(impact.boundaries, failures, 'PUBLISHING_IMPACT.json/boundaries');
  }

  if (rollbackPlan) {
    if (rollbackPlan.rollbackType !== 'pumpkin-outbound-link-local-action-rollback-plan') {
      failures.push(failure('ROLLBACK_TYPE_INVALID', 'rollback plan type is invalid', 'ROLLBACK_PLAN.json/rollbackType'));
    }
    if (rollbackPlan.executableAgainstLiveSystems !== false || rollbackPlan.rollbackExecutionImplemented !== false) {
      failures.push(failure('ROLLBACK_EXECUTION_FLAG_INVALID', 'rollback execution must remain unimplemented for live systems', 'ROLLBACK_PLAN.json'));
    }
    assertLocalBoundaries(rollbackPlan.boundaries, failures, 'ROLLBACK_PLAN.json/boundaries');
  }

  const status = failures.length === 0 ? 'passed' : 'failed';
  const validation = {
    schemaVersion: '0.1.0',
    validationType: 'pumpkin-outbound-link-local-action-result-validation',
    status,
    generatedAt: new Date().toISOString(),
    resultPath: toPackageRelative(resultRoot),
    summary: {
      failureCount: failures.length,
      action: actionResult?.action ?? null,
      resultStatus: actionResult?.status ?? null,
      changeCount: actionResult?.summary?.changeCount ?? 0,
      affectedLinkCount: actionResult?.summary?.affectedLinkCount ?? 0,
      affectedInstanceCount: actionResult?.summary?.affectedInstanceCount ?? 0
    },
    failures
  };

  await writeJson(path.join(resultRoot, 'ACTION_RESULT_VALIDATION.json'), validation);
  await fs.writeFile(
    path.join(resultRoot, 'ACTION_RESULT_VALIDATION.md'),
    renderValidationMarkdown(validation),
    'utf8'
  );
  return validation;
}

function assertLocalBoundaries(boundaries = {}, failures, pathPrefix) {
  const expected = {
    localOnly: true,
    externalHttpCrawling: false,
    cmsApiCalls: false,
    cmsWrites: false,
    protectedConfigReads: false,
    productionWriteApproved: false
  };
  for (const [key, value] of Object.entries(expected)) {
    if (boundaries[key] !== value) {
      failures.push(failure('BOUNDARY_INVALID', `${key} must be ${value}`, `${pathPrefix}/${key}`));
    }
  }
}

async function readIfPresent(filePath) {
  if (!await pathExists(filePath)) {
    return null;
  }
  return readJson(filePath);
}

function failure(code, message, pathValue) {
  return { code, message, path: pathValue };
}

function renderValidationMarkdown(validation) {
  const lines = [
    '# Action Result Validation',
    '',
    `- Status: ${validation.status}`,
    `- Action: ${validation.summary.action ?? 'unknown'}`,
    `- Result status: ${validation.summary.resultStatus ?? 'unknown'}`,
    `- Changes: ${validation.summary.changeCount}`,
    `- Affected links: ${validation.summary.affectedLinkCount}`,
    `- Affected instances: ${validation.summary.affectedInstanceCount}`,
    `- Failures: ${validation.summary.failureCount}`
  ];
  if (validation.failures.length > 0) {
    lines.push('', '## Failures');
    for (const item of validation.failures) {
      lines.push(`- ${item.code}: ${item.message} (${item.path})`);
    }
  }
  return `${lines.join('\n')}\n`;
}
