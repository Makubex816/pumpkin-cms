import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson, pathExists } from '../utils/json-writer.mjs';
import { resolveTmpOutputPath, toPackageRelative } from '../utils/safe-paths.mjs';
import { scanPackageForSecretLikeValues, validateEvidenceBundle } from './evidence-validator.mjs';

const requiredFiles = [
  'EXECUTION_PACKAGE_MANIFEST.json',
  'STAGING_TARGET_WORKSHEET.md',
  'PROVIDER_CAPABILITY_REVIEW.md',
  'RESOURCE_REGISTRY_REVIEW.md',
  'BACKUP_CENTER_PRE_EXECUTION_REVIEW.md',
  'FIRST_WRITE_BATCH_PLAN.md',
  'APPROVAL_MANIFEST.json',
  'OPERATOR_CHECKLIST.md',
  'READBACK_VERIFICATION_PLAN.md',
  'ABORT_ROLLBACK_CHECKLIST.md',
  'NO_GO_CONDITIONS.md'
];

export async function validateStagingExecutionPackage({ packagePath, writeReport = true }) {
  const packageRoot = resolveTmpOutputPath(packagePath);
  const failures = [];
  for (const file of requiredFiles) {
    if (!await pathExists(path.join(packageRoot, file))) {
      failures.push({ code: 'EXECUTION_PACKAGE_REQUIRED_FILE_MISSING', message: 'required package file is missing', path: file });
    }
  }

  const manifest = await readOptionalJson(path.join(packageRoot, 'EXECUTION_PACKAGE_MANIFEST.json'));
  const approval = await readOptionalJson(path.join(packageRoot, 'APPROVAL_MANIFEST.json'));
  if (!approval) {
    failures.push({ code: 'APPROVAL_MANIFEST_INVALID', message: 'approval manifest must parse as JSON', path: 'APPROVAL_MANIFEST.json' });
  }
  if (approval && approval.futureExplicitStagingWriteApprovalRequired !== true) {
    failures.push({ code: 'FUTURE_APPROVAL_NOT_REQUIRED', message: 'approval manifest must require explicit future staging write approval', path: 'APPROVAL_MANIFEST.json' });
  }
  if (approval && approval.futureApprovalGranted !== false) {
    failures.push({ code: 'FUTURE_APPROVAL_SHOULD_NOT_BE_GRANTED', message: 'approval manifest must not grant approval in Phase 2H-22', path: 'APPROVAL_MANIFEST.json' });
  }
  if (approval && approval.realStagingProviderWritePerformed !== false) {
    failures.push({ code: 'REAL_STAGING_WRITE_FLAG_INVALID', message: 'real staging provider write must be false', path: 'APPROVAL_MANIFEST.json' });
  }

  const evidenceValidation = await validateEvidenceBundle({ packagePath });
  failures.push(...evidenceValidation.failures);
  const noGoText = await readOptionalText(path.join(packageRoot, 'NO_GO_CONDITIONS.md'));
  if (!noGoText || !noGoText.includes('future explicit staging write approval is missing')) {
    failures.push({ code: 'NO_GO_CONDITIONS_INCOMPLETE', message: 'no-go conditions must include missing future approval', path: 'NO_GO_CONDITIONS.md' });
  }
  const readbackText = await readOptionalText(path.join(packageRoot, 'READBACK_VERIFICATION_PLAN.md'));
  if (!readbackText || !readbackText.includes('expected record count')) {
    failures.push({ code: 'READBACK_PLAN_INCOMPLETE', message: 'readback plan must include expected record count', path: 'READBACK_VERIFICATION_PLAN.md' });
  }
  const batchText = await readOptionalText(path.join(packageRoot, 'FIRST_WRITE_BATCH_PLAN.md'));
  if (!batchText || !batchText.includes('| Target entity | Target container | Expected records |')) {
    failures.push({ code: 'FIRST_WRITE_BATCH_PLAN_INCOMPLETE', message: 'first-write batch plan must include target entities and counts', path: 'FIRST_WRITE_BATCH_PLAN.md' });
  }

  const secretMatches = await scanPackageForSecretLikeValues({ packageRoot: packagePath });
  for (const match of secretMatches) {
    failures.push({ code: 'SECRET_LIKE_VALUE_FOUND', message: 'secret-like value found in execution package', path: match.file });
  }

  const validation = {
    schemaVersion: '0.1.0',
    validationType: 'pumpkin-outbound-link-staging-execution-package-validation',
    status: failures.length === 0 ? 'passed' : 'failed',
    packagePath: toPackageRelative(packageRoot),
    packageId: manifest?.packageId ?? approval?.packageId ?? null,
    ids: evidenceValidation.ids,
    summary: {
      requiredFileCount: requiredFiles.length,
      totalRecords: evidenceValidation.summary.totalRecords,
      countsByEntity: evidenceValidation.summary.countsByEntity,
      futureExplicitApprovalRequired: approval?.futureExplicitStagingWriteApprovalRequired === true,
      realStagingProviderWritePerformed: approval?.realStagingProviderWritePerformed === true,
      productionDatabaseMigrationPerformed: approval?.productionDatabaseMigrationPerformed === true,
      failureCount: failures.length
    },
    failures,
    boundaries: {
      packageUnderTmp: true,
      protectedConfigReads: false,
      realStagingProviderWrites: false,
      productionDatabaseMigration: false,
      cmsWrites: false,
      azureMutations: false,
      externalCrawling: false,
      deployment: false,
      searchConsoleIndexing: false,
      livePagePublication: false
    }
  };

  if (writeReport) {
    await writeJson(path.join(packageRoot, 'VALIDATION_RESULT.json'), validation);
    await fs.writeFile(path.join(packageRoot, 'VALIDATION_RESULT.md'), validationMarkdown(validation), 'utf8');
  }
  return validation;
}

export async function writeExecutionPackageChecksums({ packagePath }) {
  const packageRoot = resolveTmpOutputPath(packagePath);
  const files = (await listFiles(packageRoot))
    .map((file) => path.relative(packageRoot, file).replaceAll('\\', '/'))
    .filter((file) => !['checksums.sha256', 'checksums.json'].includes(file))
    .sort();
  const checksums = [];
  for (const file of files) {
    const bytes = await fs.readFile(path.join(packageRoot, file));
    checksums.push({ file, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
  }
  await writeJson(path.join(packageRoot, 'checksums.json'), {
    schemaVersion: '0.1.0',
    checksumType: 'pumpkin-outbound-link-staging-execution-package-checksums',
    files: checksums
  });
  await fs.writeFile(path.join(packageRoot, 'checksums.sha256'), `${checksums.map((item) => `${item.sha256}  ${item.file}`).join('\n')}\n`, 'utf8');
  return checksums;
}

export async function inspectStagingExecutionPackage({ packagePath }) {
  const packageRoot = resolveTmpOutputPath(packagePath);
  const validation = await readJson(path.join(packageRoot, 'VALIDATION_RESULT.json'));
  const approval = await readJson(path.join(packageRoot, 'APPROVAL_MANIFEST.json'));
  return {
    packagePath: toPackageRelative(packageRoot),
    packageId: approval.packageId,
    status: validation.status,
    providerProfileId: approval.providerProfileId,
    providerMode: approval.providerMode,
    tenantKey: approval.tenantKey,
    siteKey: approval.siteKey,
    expectedRecordCount: approval.firstWriteBatch.expectedRecordCount,
    futureExplicitStagingWriteApprovalRequired: approval.futureExplicitStagingWriteApprovalRequired,
    realStagingProviderWritePerformed: approval.realStagingProviderWritePerformed,
    failureCount: validation.summary.failureCount
  };
}

function validationMarkdown(validation) {
  return `# Staging Execution Package Validation

Status: ${validation.status}

- packagePath: \`${validation.packagePath}\`
- migrationRunId: \`${validation.ids.migrationRunId}\`
- applyPlanId: \`${validation.ids.applyPlanId}\`
- stagingExecutionRunId: \`${validation.ids.stagingExecutionRunId}\`
- readbackRunId: \`${validation.ids.readbackRunId}\`
- runtimeQaRunId: \`${validation.ids.runtimeQaRunId}\`
- total records: ${validation.summary.totalRecords}
- future explicit approval required: \`${validation.summary.futureExplicitApprovalRequired}\`
- real staging provider write performed: \`${validation.summary.realStagingProviderWritePerformed}\`

Failures:
${validation.failures.length === 0 ? '- none' : validation.failures.map((failure) => `- ${failure.code}: ${failure.path}`).join('\n')}
`;
}

async function readOptionalJson(filePath) {
  try {
    return await readJson(filePath);
  } catch {
    return null;
  }
}

async function readOptionalText(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
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
