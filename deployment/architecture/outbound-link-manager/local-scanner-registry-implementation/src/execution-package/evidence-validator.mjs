import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, pathExists } from '../utils/json-writer.mjs';
import { resolveTmpOutputPath, toPackageRelative } from '../utils/safe-paths.mjs';

export async function validateEvidenceBundle({ packagePath }) {
  const packageRoot = resolveTmpOutputPath(packagePath);
  const evidenceRoot = path.join(packageRoot, 'evidence');
  const failures = [];

  const migrationManifest = await readRequiredJson({ failures, filePath: path.join(evidenceRoot, 'migration', 'migration-manifest.json'), code: 'MIGRATION_MANIFEST_MISSING' });
  const migrationValidation = await readRequiredJson({ failures, filePath: path.join(evidenceRoot, 'migration', 'VALIDATION_RESULT.json'), code: 'MIGRATION_VALIDATION_MISSING' });
  const applyPlanManifest = await readRequiredJson({ failures, filePath: path.join(evidenceRoot, 'apply-plan', 'apply-plan-manifest.json'), code: 'APPLY_PLAN_MANIFEST_MISSING' });
  const applyPlanValidation = await readRequiredJson({ failures, filePath: path.join(evidenceRoot, 'apply-plan', 'VALIDATION_RESULT.json'), code: 'APPLY_PLAN_VALIDATION_MISSING' });
  const stagingManifest = await readRequiredJson({ failures, filePath: path.join(evidenceRoot, 'staging-execution', 'staging-execution-manifest.json'), code: 'STAGING_EXECUTION_MANIFEST_MISSING' });
  const stagingValidation = await readRequiredJson({ failures, filePath: path.join(evidenceRoot, 'staging-execution', 'VALIDATION_RESULT.json'), code: 'STAGING_EXECUTION_VALIDATION_MISSING' });
  const runtimeQa = await readRuntimeQa({ failures, evidenceRoot });
  const backupPreExecution = await readRequiredJson({ failures, filePath: path.join(evidenceRoot, 'staging-execution', 'backup-pre-execution-verification.json'), code: 'BACKUP_PRE_EXECUTION_MISSING' });
  const resourceRegistry = await readRequiredJson({ failures, filePath: path.join(evidenceRoot, 'staging-execution', 'resource-registry-refresh-candidate.json'), code: 'RESOURCE_REGISTRY_REFRESH_MISSING' });
  const traceAuditRollback = await readRequiredJson({ failures, filePath: path.join(evidenceRoot, 'staging-execution', 'trace-audit-rollback-persistence.json'), code: 'TRACE_AUDIT_ROLLBACK_MISSING' });
  const providerProfile = await readRequiredJson({ failures, filePath: path.join(evidenceRoot, 'staging-execution', 'provider-profile.json'), code: 'PROVIDER_PROFILE_MISSING' });
  const providerCapabilities = await readRequiredJson({ failures, filePath: path.join(evidenceRoot, 'provider-capability', 'provider-capabilities.json'), code: 'PROVIDER_CAPABILITY_MISSING' });

  for (const [name, value] of [
    ['migration', migrationValidation],
    ['applyPlan', applyPlanValidation],
    ['stagingExecution', stagingValidation],
    ['backupPreExecution', backupPreExecution],
    ['resourceRegistry', resourceRegistry],
    ['traceAuditRollback', traceAuditRollback],
    ['providerCapabilities', providerCapabilities],
    ['runtimeQa', runtimeQa]
  ]) {
    if (value && value.status !== 'passed') {
      failures.push({
        code: `${name.toUpperCase()}_NOT_PASSED`,
        message: `${name} evidence status must be passed`,
        path: name
      });
    }
  }

  if (!providerProfile?.providerProfileId) {
    failures.push({ code: 'PROVIDER_PROFILE_ID_MISSING', message: 'provider profile ID is required', path: 'providerProfileId' });
  }
  if (!providerProfile?.providerMode) {
    failures.push({ code: 'PROVIDER_MODE_MISSING', message: 'provider mode is required', path: 'providerMode' });
  }
  if (!stagingManifest?.tenantKey || !stagingManifest?.siteKey) {
    failures.push({ code: 'TENANT_SITE_SCOPE_MISSING', message: 'tenantKey and siteKey are required', path: 'tenantKey/siteKey' });
  }
  if ((stagingManifest?.summary?.totalExecutionRecords ?? 0) <= 0) {
    failures.push({ code: 'EXPECTED_ENTITY_COUNTS_MISSING', message: 'expected entity counts must be explicit and nonzero', path: 'summary.totalExecutionRecords' });
  }

  return {
    schemaVersion: '0.1.0',
    validationType: 'pumpkin-outbound-link-staging-execution-package-evidence-validation',
    status: failures.length === 0 ? 'passed' : 'failed',
    packagePath: toPackageRelative(packageRoot),
    ids: {
      migrationRunId: migrationManifest?.migrationRunId ?? null,
      applyPlanId: applyPlanManifest?.applyPlanId ?? null,
      stagingExecutionRunId: stagingManifest?.stagingExecutionRunId ?? null,
      readbackRunId: stagingManifest?.readbackRunId ?? null,
      runtimeQaRunId: runtimeQa?.runtimeQaRunId ?? runtimeQa?.evidenceId ?? runtimeQa?.requestId ?? null,
      providerProfileId: providerProfile?.providerProfileId ?? null,
      providerMode: providerProfile?.providerMode ?? null,
      tenantKey: stagingManifest?.tenantKey ?? null,
      siteKey: stagingManifest?.siteKey ?? null
    },
    summary: {
      totalRecords: stagingManifest?.summary?.totalExecutionRecords ?? 0,
      countsByEntity: stagingManifest?.summary?.countsByEntity ?? {},
      failureCount: failures.length
    },
    failures
  };
}

async function readRuntimeQa({ failures, evidenceRoot }) {
  for (const file of ['RUNTIME_QA_EVIDENCE.json', 'ADMIN_RUNTIME_QA_RESULT.json']) {
    const filePath = path.join(evidenceRoot, 'runtime-qa', file);
    if (await pathExists(filePath)) {
      return readJson(filePath);
    }
  }
  failures.push({
    code: 'RUNTIME_QA_EVIDENCE_MISSING',
    message: 'runtime QA evidence or equivalent runtime QA evidence ID is required',
    path: 'evidence/runtime-qa'
  });
  return null;
}

async function readRequiredJson({ failures, filePath, code }) {
  try {
    return await readJson(filePath);
  } catch {
    failures.push({
      code,
      message: 'required evidence file is missing or invalid JSON',
      path: filePath.replaceAll('\\', '/')
    });
    return null;
  }
}

export async function scanPackageForSecretLikeValues({ packageRoot }) {
  const root = resolveTmpOutputPath(packageRoot);
  const files = await listFiles(root);
  const secretPatterns = [
    /AccountKey=/i,
    /SharedAccessSignature=/i,
    /(?:^|[?&])sig=[A-Za-z0-9%._-]{16,}/i,
    /Bearer\s+[A-Za-z0-9._-]{20,}/i,
    /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/
  ];
  const matches = [];
  for (const file of files.filter((item) => !item.endsWith('checksums.sha256'))) {
    const text = await fs.readFile(file, 'utf8');
    for (const pattern of secretPatterns) {
      if (pattern.test(text)) {
        matches.push({
          file: path.relative(root, file).replaceAll('\\', '/'),
          pattern: String(pattern)
        });
      }
    }
  }
  return matches;
}

async function listFiles(root) {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}
