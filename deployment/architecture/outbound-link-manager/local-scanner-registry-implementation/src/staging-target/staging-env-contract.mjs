import path from 'node:path';
import { readJson } from '../utils/json-writer.mjs';
import { resolveTmpOutputPath, toPackageRelative } from '../utils/safe-paths.mjs';

export const stagingEnvContractFields = [
  {
    name: 'OLM_STAGING_PROVIDER_PROFILE_ID',
    description: 'Approved real scoped staging write provider profile ID'
  },
  {
    name: 'OLM_STAGING_PROVIDER_TYPE',
    description: 'Concrete approved staging provider type'
  },
  {
    name: 'OLM_STAGING_PROVIDER_MODE',
    description: 'Scoped staging write provider mode'
  },
  {
    name: 'OLM_STAGING_RESOURCE_SCOPE',
    description: 'Non-secret resource group, account scope, or provider scope'
  },
  {
    name: 'OLM_STAGING_ACCOUNT_OR_HOST',
    description: 'Non-secret staging account or host identifier'
  },
  {
    name: 'OLM_STAGING_DATABASE_OR_NAMESPACE',
    description: 'Non-secret database, container namespace, or provider namespace'
  },
  {
    name: 'OLM_STAGING_RBAC_OR_AUTH_MODE',
    description: 'RBAC or approved session auth mode, without keys or connection strings'
  },
  {
    name: 'OLM_STAGING_IDENTITY_OR_SESSION_TYPE',
    description: 'Approved principal, identity, or session type'
  },
  {
    name: 'OLM_STAGING_READBACK_METHOD',
    description: 'Concrete readback method for the real staging provider'
  },
  {
    name: 'OLM_STAGING_ROLLBACK_METHOD',
    description: 'Concrete rollback method tied to the approved first-write batch'
  }
];

const placeholderPattern = /\b(TBD|TODO|PLACEHOLDER|REPLACE_ME|CHANGEME)\b|^<.*>$/i;
const blockedProviderModes = new Map([
  ['staging-simulated', 'staging-simulated mode cannot authorize a real scoped staging write'],
  ['production-runtime', 'production-runtime mode is outside the scoped staging write boundary']
]);

export async function validateStagingEnvContract({
  env = process.env,
  packagePath = null,
  expectedApprovalManifestId = 'olapprove_508df3f03faa4f80',
  expectedFirstWriteBatchId = 'olbatch_b08e184fdc6565aa',
  expectedRecordCount = 48
} = {}) {
  const fields = stagingEnvContractFields.map((field) => classifyField(field, env[field.name]));
  const failures = [];

  for (const field of fields) {
    if (field.status === 'missing') {
      failures.push({
        code: 'OLM_STAGING_FIELD_MISSING',
        field: field.name,
        message: `${field.name} is required for a future real scoped staging write`
      });
    }
    if (field.status === 'placeholder') {
      failures.push({
        code: 'OLM_STAGING_FIELD_PLACEHOLDER',
        field: field.name,
        message: `${field.name} must not be a placeholder`
      });
    }
    if (field.status === 'blocked') {
      failures.push({
        code: 'OLM_STAGING_FIELD_BLOCKED',
        field: field.name,
        message: field.blockedReason
      });
    }
  }

  const packageLinkage = packagePath
    ? await validatePackageLinkage({
      packagePath,
      expectedApprovalManifestId,
      expectedFirstWriteBatchId,
      expectedRecordCount
    })
    : null;

  if (packageLinkage) {
    failures.push(...packageLinkage.failures);
  }

  return {
    schemaVersion: '0.1.0',
    resultType: 'pumpkin-outbound-link-staging-env-contract-validation',
    status: failures.length === 0 ? 'passed' : 'blocked',
    fields,
    packageLinkage,
    summary: {
      fieldCount: fields.length,
      presentCount: fields.filter((field) => field.status === 'present').length,
      missingCount: fields.filter((field) => field.status === 'missing').length,
      placeholderCount: fields.filter((field) => field.status === 'placeholder').length,
      blockedCount: fields.filter((field) => field.status === 'blocked').length,
      failureCount: failures.length
    },
    failures,
    boundaries: {
      presenceOnly: true,
      valuesPrinted: false,
      safeToCommitMetadataOnly: true,
      protectedConfigReads: false,
      secretExport: false,
      realStagingProviderWrites: false,
      azureMutations: false,
      productionDatabaseMigration: false,
      cmsWrites: false
    }
  };
}

function classifyField(field, rawValue) {
  const present = typeof rawValue === 'string' && rawValue.trim().length > 0;
  if (!present) {
    return fieldResult(field, 'missing');
  }

  const trimmed = rawValue.trim();
  if (placeholderPattern.test(trimmed)) {
    return fieldResult(field, 'placeholder');
  }

  if (field.name === 'OLM_STAGING_PROVIDER_MODE') {
    const blockedReason = blockedProviderModes.get(trimmed.toLowerCase());
    if (blockedReason) {
      return fieldResult(field, 'blocked', { blockedReason });
    }
  }

  return fieldResult(field, 'present');
}

function fieldResult(field, status, extra = {}) {
  return {
    name: field.name,
    description: field.description,
    present: status !== 'missing',
    status,
    safeToCommitMetadataOnly: true,
    valuePrinted: false,
    secretClassification: 'presence-only-redacted',
    ...extra
  };
}

async function validatePackageLinkage({
  packagePath,
  expectedApprovalManifestId,
  expectedFirstWriteBatchId,
  expectedRecordCount
}) {
  const resolved = resolveTmpOutputPath(packagePath);
  const manifest = await readJson(path.join(resolved, 'EXECUTION_PACKAGE_MANIFEST.json'));
  const approval = await readJson(path.join(resolved, 'APPROVAL_MANIFEST.json'));
  const failures = [];

  if (manifest.approvalManifestId !== expectedApprovalManifestId) {
    failures.push({
      code: 'APPROVAL_MANIFEST_LINKAGE_MISMATCH',
      field: 'approvalManifestId',
      message: 'approval manifest ID does not match the approved Phase 2H-23B contract'
    });
  }
  if (approval.approvalManifestId !== expectedApprovalManifestId) {
    failures.push({
      code: 'APPROVAL_MANIFEST_FILE_MISMATCH',
      field: 'approvalManifestId',
      message: 'approval manifest file ID does not match the approved Phase 2H-23B contract'
    });
  }
  if (manifest.firstWriteBatch?.batchId !== expectedFirstWriteBatchId) {
    failures.push({
      code: 'FIRST_WRITE_BATCH_LINKAGE_MISMATCH',
      field: 'firstWriteBatch.batchId',
      message: 'first-write batch ID does not match the approved Phase 2H-23B contract'
    });
  }
  if (approval.firstWriteBatch?.batchId !== expectedFirstWriteBatchId) {
    failures.push({
      code: 'FIRST_WRITE_BATCH_APPROVAL_MISMATCH',
      field: 'firstWriteBatch.batchId',
      message: 'approval manifest first-write batch ID does not match the approved Phase 2H-23B contract'
    });
  }
  if (manifest.expectedRecordCount !== expectedRecordCount) {
    failures.push({
      code: 'EXPECTED_RECORD_COUNT_MISMATCH',
      field: 'expectedRecordCount',
      message: 'execution package record count does not match the approved Phase 2H-23B contract'
    });
  }
  if (approval.firstWriteBatch?.expectedRecordCount !== expectedRecordCount) {
    failures.push({
      code: 'APPROVAL_RECORD_COUNT_MISMATCH',
      field: 'firstWriteBatch.expectedRecordCount',
      message: 'approval manifest record count does not match the approved Phase 2H-23B contract'
    });
  }
  if (manifest.providerMode === 'production-runtime' || approval.providerMode === 'production-runtime') {
    failures.push({
      code: 'PRODUCTION_RUNTIME_MODE_BLOCKED',
      field: 'providerMode',
      message: 'production-runtime mode is not allowed in the scoped staging package'
    });
  }
  if (manifest.realStagingProviderWritePerformed || approval.realStagingProviderWritePerformed) {
    failures.push({
      code: 'REAL_STAGING_WRITE_ALREADY_RECORDED',
      field: 'realStagingProviderWritePerformed',
      message: 'execution package must not record a prior real staging write for this closure pass'
    });
  }

  return {
    status: failures.length === 0 ? 'passed' : 'blocked',
    packagePath: toPackageRelative(resolved),
    approvalManifestIdMatched: manifest.approvalManifestId === expectedApprovalManifestId
      && approval.approvalManifestId === expectedApprovalManifestId,
    firstWriteBatchIdMatched: manifest.firstWriteBatch?.batchId === expectedFirstWriteBatchId
      && approval.firstWriteBatch?.batchId === expectedFirstWriteBatchId,
    expectedRecordCountMatched: manifest.expectedRecordCount === expectedRecordCount
      && approval.firstWriteBatch?.expectedRecordCount === expectedRecordCount,
    providerMode: manifest.providerMode,
    futureApprovalRequired: manifest.futureExplicitStagingWriteApprovalRequired === true,
    realStagingProviderWritePerformed: manifest.realStagingProviderWritePerformed === true
      || approval.realStagingProviderWritePerformed === true,
    failures
  };
}
