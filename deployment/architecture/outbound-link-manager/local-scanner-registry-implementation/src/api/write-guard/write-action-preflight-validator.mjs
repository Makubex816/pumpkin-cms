import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson, pathExists } from '../../utils/json-writer.mjs';
import { resolveTmpOutputPath, toPackageRelative } from '../../utils/safe-paths.mjs';

const requiredTraceFields = [
  'requestId',
  'actionId',
  'correlationId',
  'tenantKey',
  'siteKey',
  'actorId',
  'actorRole',
  'providerMode',
  'approvalState',
  'auditEventIds',
  'rollbackPlanId',
  'affectedPageIds',
  'affectedInstanceIds',
  'beforeStateHash',
  'afterStateHash',
  'performedAt',
  'reason',
  'outcome',
  'validationResultId'
];

export async function validateApiWritePreflight({ resultPath }) {
  const resultRoot = resolveTmpOutputPath(resultPath);
  const failures = [];
  const responsePath = path.join(resultRoot, 'API_WRITE_RESPONSE.json');
  const tracePath = path.join(resultRoot, 'TRACE_LOG.json');
  if (!await pathExists(responsePath)) {
    failures.push(failure('API_WRITE_RESPONSE_MISSING', 'API_WRITE_RESPONSE.json is required', 'API_WRITE_RESPONSE.json'));
  }
  if (!await pathExists(tracePath)) {
    failures.push(failure('TRACE_LOG_MISSING', 'TRACE_LOG.json is required', 'TRACE_LOG.json'));
  }

  const response = await readIfPresent(responsePath);
  const trace = await readIfPresent(tracePath);

  if (response) {
    if (response.responseType !== 'pumpkin-outbound-link-api-write-action-response') {
      failures.push(failure('RESPONSE_TYPE_INVALID', 'response type is invalid', 'API_WRITE_RESPONSE.json/responseType'));
    }
    if (response.liveWriteAllowed !== false) {
      failures.push(failure('LIVE_WRITE_FLAG_INVALID', 'liveWriteAllowed must be false', 'API_WRITE_RESPONSE.json/liveWriteAllowed'));
    }
    if (response.simulatedOnly !== true) {
      failures.push(failure('SIMULATED_ONLY_FLAG_INVALID', 'simulatedOnly must be true', 'API_WRITE_RESPONSE.json/simulatedOnly'));
    }
    if (!response.requestId || !response.actionId || !response.correlationId) {
      failures.push(failure('TRACE_IDS_MISSING', 'requestId, actionId, and correlationId are required', 'API_WRITE_RESPONSE.json'));
    }
    if (response.applied && (!Array.isArray(response.auditEventIds) || response.auditEventIds.length === 0)) {
      failures.push(failure('AUDIT_IDS_MISSING', 'applied writes require auditEventIds', 'API_WRITE_RESPONSE.json/auditEventIds'));
    }
    if (response.applied && !response.rollbackPlanId) {
      failures.push(failure('ROLLBACK_ID_MISSING', 'applied writes require rollbackPlanId', 'API_WRITE_RESPONSE.json/rollbackPlanId'));
    }
  }

  if (trace) {
    for (const field of requiredTraceFields) {
      if (trace[field] === undefined || trace[field] === null) {
        failures.push(failure('TRACE_FIELD_MISSING', `${field} is required`, `TRACE_LOG.json/${field}`));
      }
    }
    if (hasUnredactedRiskyQueryValue(trace.normalizedUrl)) {
      failures.push(failure('TRACE_URL_NOT_REDACTED', 'trace normalizedUrl contains risky query value', 'TRACE_LOG.json/normalizedUrl'));
    }
    if (trace.boundaries?.liveWriteAllowed !== false || trace.boundaries?.externalHttpCrawling !== false) {
      failures.push(failure('TRACE_BOUNDARY_INVALID', 'trace boundaries must keep live writes and external crawling false', 'TRACE_LOG.json/boundaries'));
    }
  }

  const validation = {
    schemaVersion: '0.1.0',
    validationType: 'pumpkin-outbound-link-api-write-preflight-validation',
    status: failures.length === 0 ? 'passed' : 'failed',
    generatedAt: new Date().toISOString(),
    resultPath: toPackageRelative(resultRoot),
    summary: {
      failureCount: failures.length,
      requestId: response?.requestId ?? null,
      actionId: response?.actionId ?? null,
      providerMode: response?.providerMode ?? null,
      applied: response?.applied ?? false,
      code: response?.code ?? null
    },
    failures
  };
  await writeJson(path.join(resultRoot, 'API_WRITE_PREFLIGHT_VALIDATION.json'), validation);
  await fs.writeFile(path.join(resultRoot, 'API_WRITE_PREFLIGHT_VALIDATION.md'), renderMarkdown(validation), 'utf8');
  return validation;
}

async function readIfPresent(filePath) {
  return await pathExists(filePath) ? readJson(filePath) : null;
}

function failure(code, message, pathValue) {
  return { code, message, path: pathValue };
}

function hasUnredactedRiskyQueryValue(value) {
  const text = String(value ?? '');
  const matches = text.matchAll(/(?:[?&])(?:token|key|api_key|apikey|signature|sig|auth|password|access_token|code)=([^&\s]+)/gi);
  for (const match of matches) {
    if (decodeURIComponent(match[1]).toLowerCase() !== 'redacted') {
      return true;
    }
  }
  return false;
}

function renderMarkdown(validation) {
  const lines = [
    '# API Write Preflight Validation',
    '',
    `- Status: ${validation.status}`,
    `- Request: ${validation.summary.requestId ?? 'unknown'}`,
    `- Action: ${validation.summary.actionId ?? 'unknown'}`,
    `- Provider mode: ${validation.summary.providerMode ?? 'unknown'}`,
    `- Applied: ${validation.summary.applied}`,
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
