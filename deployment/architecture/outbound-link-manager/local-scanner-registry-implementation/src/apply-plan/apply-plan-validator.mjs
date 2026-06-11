import path from 'node:path';
import { readJson, writeJson, pathExists } from '../utils/json-writer.mjs';
import { resolveTmpOutputPath } from '../utils/safe-paths.mjs';
import { validateProviderProfile } from '../providers/provider-profile-validator.mjs';

const requiredFiles = [
  'apply-plan-manifest.json',
  'apply-plan-records.json',
  'provider-profile.json',
  'provider-capabilities.json',
  'trace-continuity-result.json',
  'resource-registry-update-candidate.json',
  'backup-center-pre-migration-check.json',
  'rollback-integration-result.json'
];

const recordRequiredFields = [
  'applyPlanId',
  'applyPlanRecordId',
  'migrationRunId',
  'migrationRecordId',
  'providerProfileId',
  'providerMode',
  'tenantKey',
  'siteKey',
  'partitionKey',
  'sourceRecordId',
  'targetRecordId',
  'targetEntity',
  'operation',
  'writeExecution',
  'dryRunOnly',
  'liveWriteAllowed',
  'beforeStateHash',
  'afterStateHash',
  'migrationRecordHash'
];

const secretPatterns = [
  /AccountKey=/i,
  /SharedAccessSignature/i,
  /DefaultEndpointsProtocol=/i,
  /\bBearer\s+[A-Za-z0-9._-]{10,}/,
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/,
  /-----BEGIN [A-Z ]+ PRIVATE KEY-----/
];

export async function validateApplyPlan({ applyPlanPath, writeReport = true }) {
  const root = resolveTmpOutputPath(applyPlanPath);
  const failures = [];
  for (const file of requiredFiles) {
    if (!await pathExists(path.join(root, file))) {
      failures.push(failure('APPLY_PLAN_REQUIRED_FILE_MISSING', `${file} is required`, file));
    }
  }
  const manifest = await readIfPresent(path.join(root, 'apply-plan-manifest.json'));
  const envelope = await readIfPresent(path.join(root, 'apply-plan-records.json'));
  const profile = await readIfPresent(path.join(root, 'provider-profile.json'));
  const capabilities = await readIfPresent(path.join(root, 'provider-capabilities.json'));
  const traceContinuity = await readIfPresent(path.join(root, 'trace-continuity-result.json'));
  const resourceRegistry = await readIfPresent(path.join(root, 'resource-registry-update-candidate.json'));
  const backupCheck = await readIfPresent(path.join(root, 'backup-center-pre-migration-check.json'));
  const rollbackIntegration = await readIfPresent(path.join(root, 'rollback-integration-result.json'));
  const records = envelope?.records ?? [];

  if (profile) {
    const profileValidation = validateProviderProfile(profile);
    if (profileValidation.status !== 'passed') {
      failures.push(...profileValidation.failures);
    }
  }
  if (capabilities?.summary?.canPerformLiveWrites !== false || capabilities?.summary?.liveWriteAllowed !== false) {
    failures.push(failure('APPLY_PLAN_LIVE_WRITE_CAPABILITY_INVALID', 'apply plan must not allow live writes', 'provider-capabilities.json'));
  }
  for (const record of records) {
    for (const field of recordRequiredFields) {
      if (!Object.prototype.hasOwnProperty.call(record, field)) {
        failures.push(failure('APPLY_PLAN_RECORD_FIELD_MISSING', `${field} is required`, `${record.applyPlanRecordId ?? 'unknown'}/${field}`));
      }
    }
    if (record.partitionKey !== record.tenantKey) {
      failures.push(failure('APPLY_PLAN_PARTITION_MISMATCH', 'partitionKey must equal tenantKey', `${record.applyPlanRecordId}/partitionKey`));
    }
    if (record.writeExecution !== 'not_executed' || record.dryRunOnly !== true || record.liveWriteAllowed !== false) {
      failures.push(failure('APPLY_PLAN_RECORD_BOUNDARY_INVALID', 'apply-plan record must remain no-write dry-run', record.applyPlanRecordId));
    }
  }
  if (manifest?.summary?.totalApplyPlanRecords !== records.length) {
    failures.push(failure('APPLY_PLAN_MANIFEST_COUNT_MISMATCH', 'manifest count must match apply-plan records', 'apply-plan-manifest.json/summary/totalApplyPlanRecords'));
  }
  for (const integration of [
    ['TRACE_CONTINUITY_FAILED', traceContinuity],
    ['BACKUP_CHECK_FAILED', backupCheck],
    ['ROLLBACK_INTEGRATION_FAILED', rollbackIntegration]
  ]) {
    if (integration[1]?.status !== 'passed') {
      failures.push(failure(integration[0], `${integration[0]} must pass`, integration[0]));
    }
  }
  if (resourceRegistry?.boundaries?.registryWritePerformed !== false || resourceRegistry?.targetProvider?.credentialValueIncluded !== false) {
    failures.push(failure('RESOURCE_REGISTRY_INTEGRATION_UNSAFE', 'resource registry integration must be candidate-only and credential-free', 'resource-registry-update-candidate.json'));
  }
  scanSecretLikeValues({ manifest, envelope, profile, capabilities, traceContinuity, resourceRegistry, backupCheck, rollbackIntegration }, failures);

  const validation = {
    schemaVersion: '0.1.0',
    validationType: 'pumpkin-outbound-link-apply-plan-validation',
    status: failures.length === 0 ? 'passed' : 'failed',
    applyPlanId: manifest?.applyPlanId ?? null,
    migrationRunId: manifest?.migrationRunId ?? null,
    providerProfileId: profile?.providerProfileId ?? null,
    providerMode: profile?.providerMode ?? null,
    summary: {
      applyPlanRecordCount: records.length,
      failureCount: failures.length
    },
    failures,
    boundaries: {
      liveProviderWrites: false,
      productionWrites: false,
      cmsWrites: false,
      protectedConfigReads: false,
      externalCrawling: false
    }
  };
  if (writeReport) {
    await writeJson(path.join(root, 'VALIDATION_RESULT.json'), validation);
    await writeValidationMarkdown({ root, validation });
  }
  return validation;
}

async function readIfPresent(filePath) {
  try {
    return await readJson(filePath);
  } catch {
    return null;
  }
}

async function writeValidationMarkdown({ root, validation }) {
  const markdown = `# Apply-Plan Validation

Status: ${validation.status}

Apply plan: ${validation.applyPlanId}

Provider profile: ${validation.providerProfileId}

Provider mode: ${validation.providerMode}

Records: ${validation.summary.applyPlanRecordCount}

Failures: ${validation.summary.failureCount}

${validation.failures.length === 0 ? '- none' : validation.failures.map((item) => `- ${item.code}: ${item.path}`).join('\n')}

Boundary: no live provider writes, production writes, CMS writes, protected config reads, external crawling, deployment, indexing, or live-page publication.
`;
  const fs = await import('node:fs/promises');
  await fs.writeFile(path.join(root, 'VALIDATION_RESULT.md'), markdown, 'utf8');
}

function scanSecretLikeValues(value, failures, pathName = '$') {
  if (value === null || value === undefined) return;
  if (typeof value === 'string') {
    if (secretPatterns.some((pattern) => pattern.test(value)) || hasUnredactedRiskyQueryValue(value)) {
      failures.push(failure('SECRET_LIKE_VALUE_DETECTED', 'secret-like value detected in apply-plan output', pathName));
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
