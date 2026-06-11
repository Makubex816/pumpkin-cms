import path from 'node:path';
import { readJson, writeJson, pathExists } from '../utils/json-writer.mjs';
import { resolveTmpOutputPath } from '../utils/safe-paths.mjs';
import { validateStagingExecutionChecksums } from './staging-execution-checksum-writer.mjs';
import { stagingExecutionBoundaries, stagingExecutionSchemaVersion, stagingTraceFields } from './staging-execution-store.mjs';

const requiredFiles = [
  'staging-execution-manifest.json',
  'staging-execution-records.json',
  'staging-provider-store/staging-provider-store-index.json',
  'provider-state-report.json',
  'readback-result.json',
  'execution-readback-comparison.json',
  'dry-run-replay-validation.json',
  'trace-audit-rollback-persistence.json',
  'resource-registry-refresh-candidate.json',
  'backup-pre-execution-verification.json',
  'staging-readiness-summary.json',
  'checksums.json',
  'checksums.sha256'
];

const secretPatterns = [
  /AccountKey=/i,
  /SharedAccessSignature/i,
  /DefaultEndpointsProtocol=/i,
  /\bBearer\s+[A-Za-z0-9._-]{10,}/,
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/,
  /-----BEGIN [A-Z ]+ PRIVATE KEY-----/
];

export async function validateStagingExecution({ executionPath, writeReport = true }) {
  const root = resolveTmpOutputPath(executionPath);
  const failures = [];
  for (const file of requiredFiles) {
    if (!await pathExists(path.join(root, file))) {
      failures.push(failure('STAGING_EXECUTION_REQUIRED_FILE_MISSING', `${file} is required`, file));
    }
  }
  const manifest = await readIfPresent(path.join(root, 'staging-execution-manifest.json'));
  const executionEnvelope = await readIfPresent(path.join(root, 'staging-execution-records.json'));
  const providerState = await readIfPresent(path.join(root, 'provider-state-report.json'));
  const readback = await readIfPresent(path.join(root, 'readback-result.json'));
  const comparison = await readIfPresent(path.join(root, 'execution-readback-comparison.json'));
  const replay = await readIfPresent(path.join(root, 'dry-run-replay-validation.json'));
  const traceAuditRollback = await readIfPresent(path.join(root, 'trace-audit-rollback-persistence.json'));
  const resourceRegistry = await readIfPresent(path.join(root, 'resource-registry-refresh-candidate.json'));
  const backup = await readIfPresent(path.join(root, 'backup-pre-execution-verification.json'));
  const readiness = await readIfPresent(path.join(root, 'staging-readiness-summary.json'));
  const records = executionEnvelope?.records ?? [];

  for (const record of records) {
    for (const field of stagingTraceFields) {
      if (!Object.prototype.hasOwnProperty.call(record, field)) {
        failures.push(failure('STAGING_EXECUTION_TRACE_FIELD_MISSING', `${field} is required`, `${record.stagingExecutionRecordId ?? 'unknown'}/${field}`));
      }
    }
    if (record.tenantKey !== record.partitionKey) {
      failures.push(failure('STAGING_EXECUTION_PARTITION_MISMATCH', 'partitionKey must equal tenantKey', `${record.stagingExecutionRecordId}/partitionKey`));
    }
    if (record.liveWriteAllowed !== false || record.productionWriteAllowed !== false || record.writeExecution !== 'staging_simulated_tmp_write') {
      failures.push(failure('STAGING_EXECUTION_BOUNDARY_INVALID', 'record must be staging-simulated .tmp execution only', record.stagingExecutionRecordId));
    }
  }
  if (manifest?.summary?.totalExecutionRecords !== records.length) {
    failures.push(failure('STAGING_EXECUTION_MANIFEST_COUNT_MISMATCH', 'manifest count must match execution record count', 'staging-execution-manifest.json/summary/totalExecutionRecords'));
  }
  for (const [code, result] of [
    ['PROVIDER_STATE_FAILED', providerState],
    ['READBACK_FAILED', readback],
    ['EXECUTION_READBACK_COMPARISON_FAILED', comparison],
    ['DRY_RUN_REPLAY_FAILED', replay],
    ['TRACE_AUDIT_ROLLBACK_FAILED', traceAuditRollback],
    ['RESOURCE_REGISTRY_REFRESH_FAILED', resourceRegistry],
    ['BACKUP_PRE_EXECUTION_FAILED', backup],
    ['STAGING_READINESS_FAILED', readiness]
  ]) {
    if (result?.status !== 'passed') {
      failures.push(failure(code, `${code} must pass`, code));
    }
  }
  if (resourceRegistry?.boundaries?.registryWritePerformed !== false || resourceRegistry?.targetProvider?.credentialValueIncluded !== false) {
    failures.push(failure('RESOURCE_REGISTRY_REFRESH_UNSAFE', 'resource registry refresh must be candidate-only and credential-free', 'resource-registry-refresh-candidate.json'));
  }
  if (backup?.boundaries?.backupCreated !== false || backup?.boundaries?.liveProviderWrites !== false) {
    failures.push(failure('BACKUP_PRE_EXECUTION_UNSAFE', 'backup pre-execution verification must not create live backups or live writes', 'backup-pre-execution-verification.json'));
  }
  const checksumValidation = await safeChecksumValidation(root);
  if (checksumValidation.status !== 'passed') {
    failures.push(...checksumValidation.failures);
  }
  scanSecretLikeValues({ manifest, executionEnvelope, providerState, readback, comparison, replay, traceAuditRollback, resourceRegistry, backup, readiness }, failures);

  const validation = {
    schemaVersion: stagingExecutionSchemaVersion,
    validationType: 'pumpkin-outbound-link-staging-execution-validation',
    status: failures.length === 0 ? 'passed' : 'failed',
    stagingExecutionRunId: manifest?.stagingExecutionRunId ?? null,
    readbackRunId: manifest?.readbackRunId ?? null,
    applyPlanId: manifest?.applyPlanId ?? null,
    providerProfileId: manifest?.providerProfileId ?? null,
    providerMode: manifest?.providerMode ?? null,
    summary: {
      executionRecordCount: records.length,
      failureCount: failures.length,
      checksumStatus: checksumValidation.status
    },
    failures,
    boundaries: stagingExecutionBoundaries()
  };
  if (writeReport) {
    await writeJson(path.join(root, 'VALIDATION_RESULT.json'), validation);
    await writeValidationMarkdown({ root, validation });
  }
  return validation;
}

async function safeChecksumValidation(root) {
  try {
    return await validateStagingExecutionChecksums({ outputRoot: root });
  } catch (error) {
    return {
      status: 'failed',
      failures: [failure('STAGING_EXECUTION_CHECKSUM_VALIDATION_FAILED', error.message, 'checksums.json')]
    };
  }
}

async function readIfPresent(filePath) {
  try {
    return await readJson(filePath);
  } catch {
    return null;
  }
}

async function writeValidationMarkdown({ root, validation }) {
  const fs = await import('node:fs/promises');
  const markdown = `# Staging Execution Validation

Status: ${validation.status}

Staging execution: ${validation.stagingExecutionRunId}

Readback: ${validation.readbackRunId}

Apply plan: ${validation.applyPlanId}

Provider profile: ${validation.providerProfileId}

Provider mode: ${validation.providerMode}

Records: ${validation.summary.executionRecordCount}

Failures: ${validation.summary.failureCount}

${validation.failures.length === 0 ? '- none' : validation.failures.map((item) => `- ${item.code}: ${item.path}`).join('\n')}

Boundary: staging-simulated .tmp writes only. No live provider writes, production DB migration, CMS writes, protected config reads, external crawling, Azure mutation, deployment, indexing, or live-page publication.
`;
  await fs.writeFile(path.join(root, 'VALIDATION_RESULT.md'), markdown, 'utf8');
}

function scanSecretLikeValues(value, failures, pathName = '$') {
  if (value === null || value === undefined) return;
  if (typeof value === 'string') {
    if (secretPatterns.some((pattern) => pattern.test(value)) || hasUnredactedRiskyQueryValue(value)) {
      failures.push(failure('SECRET_LIKE_VALUE_DETECTED', 'secret-like value detected in staging execution output', pathName));
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

function hasUnredactedRiskyQueryValue(value) {
  const matches = String(value ?? '').matchAll(/(?:[?&])(?:token|key|api_key|apikey|signature|sig|auth|password|access_token|code)=([^&\s]+)/gi);
  for (const match of matches) {
    if (decodeURIComponent(match[1]).toLowerCase() !== 'redacted') {
      return true;
    }
  }
  return false;
}

function failure(code, message, pathValue) {
  return { code, message, path: pathValue };
}
