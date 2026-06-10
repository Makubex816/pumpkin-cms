import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { resolveTmpOutputPath } from '../utils/safe-paths.mjs';
import { errorCatalog, errorCodes } from '../api/contracts/error-codes.mjs';

const secretPatterns = [
  new RegExp(['Account', 'Key='].join(''), 'i'),
  new RegExp(['Shared', 'Access', 'Signature'].join(''), 'i'),
  /\bBearer\s+[A-Za-z0-9._-]{10,}/,
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/,
  new RegExp(['-----BEGIN ', '[A-Z ]+', ' PRIVATE KEY-----'].join('')),
  new RegExp(['Default', 'Endpoints', 'Protocol='].join(''), 'i'),
  new RegExp(['\\bs', 'ig=', '[A-Za-z0-9%_-]{10,}'].join(''), 'i')
];

export async function validateApiResponse({ responsePath, writeReport = true }) {
  const resolved = resolveTmpOutputPath(responsePath);
  const responseFile = await resolveResponseFile(resolved);
  const failures = [];
  let response = null;
  try {
    response = await readJson(responseFile);
  } catch (error) {
    failures.push({ code: 'API_RESPONSE_JSON_INVALID', path: responseFile, message: error.message });
  }
  if (response) {
    validateEnvelope(response, failures);
    scanSecretLikeValues(response, failures);
  }
  const result = {
    schemaVersion: '0.1.0',
    validator: 'pumpkin-outbound-link-api-response-validator',
    status: failures.length === 0 ? 'passed' : 'failed',
    summary: {
      failureCount: failures.length,
      ok: response?.ok ?? null,
      code: response?.code ?? null,
      statusCode: response?.status ?? null
    },
    failures,
    boundaries: {
      outputUnderTmp: true,
      externalHttpCrawling: false,
      cmsApiCalls: false,
      cmsWrites: false,
      protectedConfigReads: false
    }
  };
  if (writeReport) {
    const reportRoot = (await isDirectory(resolved)) ? resolved : path.dirname(resolved);
    await writeJson(path.join(reportRoot, 'API_RESPONSE_VALIDATION_RESULT.json'), result);
    await fs.writeFile(path.join(reportRoot, 'API_RESPONSE_VALIDATION_RESULT.md'), renderValidationMarkdown(result), 'utf8');
  }
  return result;
}

export function validateEnvelope(response, failures = []) {
  for (const field of ['ok', 'status', 'code', 'message', 'data', 'errors', 'meta', 'tenantKey', 'siteKey', 'requestId']) {
    if (!(field in response)) {
      failures.push({ code: 'API_RESPONSE_FIELD_MISSING', path: field, message: `${field} is required` });
    }
  }
  if (typeof response.ok !== 'boolean') {
    failures.push({ code: 'API_RESPONSE_OK_INVALID', path: 'ok', message: 'ok must be boolean' });
  }
  if (!Number.isInteger(response.status)) {
    failures.push({ code: 'API_RESPONSE_STATUS_INVALID', path: 'status', message: 'status must be integer' });
  }
  if (response.ok && response.status >= 400) {
    failures.push({ code: 'API_RESPONSE_STATUS_INCONSISTENT', path: 'status', message: 'ok responses must not use error status codes' });
  }
  if (!response.ok && response.status < 400) {
    failures.push({ code: 'API_RESPONSE_STATUS_INCONSISTENT', path: 'status', message: 'error responses must use error status codes' });
  }
  if (response.ok && response.code !== errorCodes.OK) {
    failures.push({ code: 'API_RESPONSE_CODE_INCONSISTENT', path: 'code', message: 'success envelopes must use OK code' });
  }
  if (!response.ok && !errorCatalog[response.code]) {
    failures.push({ code: 'API_RESPONSE_CODE_UNKNOWN', path: 'code', message: `unknown error code ${response.code}` });
  }
  if (!Array.isArray(response.errors)) {
    failures.push({ code: 'API_RESPONSE_ERRORS_INVALID', path: 'errors', message: 'errors must be an array' });
  }
  if (!response.tenantKey || !response.siteKey) {
    failures.push({ code: 'API_RESPONSE_SCOPE_MISSING', path: 'tenantKey/siteKey', message: 'tenantKey and siteKey are required' });
  }
  validatePaginationMeta(response, failures);
  return failures;
}

async function resolveResponseFile(resolvedPath) {
  if (await isDirectory(resolvedPath)) {
    return path.join(resolvedPath, 'API_RESPONSE.json');
  }
  return resolvedPath;
}

async function isDirectory(resolvedPath) {
  try {
    const stat = await fs.stat(resolvedPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

function validatePaginationMeta(response, failures) {
  const pagination = response.meta?.pagination;
  if (!pagination) {
    return;
  }
  for (const field of ['page', 'pageSize', 'totalItems', 'totalPages']) {
    if (!Number.isInteger(pagination[field]) || pagination[field] < 0) {
      failures.push({ code: 'API_RESPONSE_PAGINATION_INVALID', path: `meta.pagination.${field}`, message: `${field} must be a non-negative integer` });
    }
  }
  if (pagination.page < 1 || pagination.pageSize < 1 || pagination.totalPages < 1) {
    failures.push({ code: 'API_RESPONSE_PAGINATION_INVALID', path: 'meta.pagination', message: 'page, pageSize, and totalPages must be positive' });
  }
}

function scanSecretLikeValues(value, failures, pathName = '$') {
  if (value === null || value === undefined) {
    return;
  }
  if (typeof value === 'string') {
    if (secretPatterns.some((pattern) => pattern.test(value))) {
      failures.push({ code: 'API_RESPONSE_SECRET_LIKE_VALUE', path: pathName, message: 'secret-like value detected in API response' });
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanSecretLikeValues(item, failures, `${pathName}[${index}]`));
    return;
  }
  if (typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      scanSecretLikeValues(nested, failures, `${pathName}.${key}`);
    }
  }
}

function renderValidationMarkdown(result) {
  return `# API Response Validation Result

Status: ${result.status}

| Metric | Value |
| --- | --- |
| Failure count | ${result.summary.failureCount} |
| Envelope ok | ${result.summary.ok} |
| Envelope code | ${result.summary.code} |
| HTTP-like status | ${result.summary.statusCode} |

Boundaries: local-only validation, no external HTTP crawling, no CMS/API calls, no CMS writes, and no protected config reads.
`;
}

