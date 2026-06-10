import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson, pathExists } from '../utils/json-writer.mjs';
import { resolveTmpOutputPath, toPackageRelative } from '../utils/safe-paths.mjs';
import { validateTenantPartitions } from './tenant-partition-validator.mjs';
import { validateStateHashes } from './state-hash-validator.mjs';
import { productionEntities, productionRecordFiles } from './target-entity-router.mjs';
import { validateChecksums } from './migration-checksum-writer.mjs';
import { writeMigrationValidationReport } from './migration-validation-report-writer.mjs';

const commonRequiredFields = [
  'id',
  'targetRecordId',
  'sourceRecordId',
  'migrationRunId',
  'migrationRecordId',
  'tenantKey',
  'siteKey',
  'partitionKey',
  'targetEntity',
  'providerMode',
  'sourceProvider',
  'dryRunOnly',
  'liveWriteAllowed',
  'beforeStateHash',
  'afterStateHash',
  'migrationRecordHash'
];

const requiredTraceFields = [
  'requestId',
  'actionId',
  'correlationId',
  'migrationRunId',
  'migrationRecordId',
  'tenantKey',
  'siteKey',
  'providerMode',
  'sourceRecordId',
  'targetRecordId',
  'targetEntity',
  'outboundLinkId',
  'outboundLinkInstanceId',
  'policyId',
  'policyVersion',
  'scanRunId',
  'reviewDecisionId',
  'bulkActionId',
  'auditEventIds',
  'rollbackPlanId',
  'affectedPageIds',
  'affectedInstanceIds',
  'beforeStateHash',
  'afterStateHash',
  'migrationRecordHash',
  'performedAt',
  'outcome',
  'blockReason',
  'validationResultId'
];

const secretPatterns = [
  new RegExp(['Account', 'Key='].join(''), 'i'),
  new RegExp(['Shared', 'Access', 'Signature'].join(''), 'i'),
  /\bBearer\s+[A-Za-z0-9._-]{10,}/,
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/,
  new RegExp(['-----BEGIN ', '[A-Z ]+', ' PRIVATE KEY-----'].join('')),
  new RegExp(['Default', 'Endpoints', 'Protocol='].join(''), 'i'),
  new RegExp(['\\bs', 'ig=', '[A-Za-z0-9%_-]{10,}'].join(''), 'i')
];

export async function validateMigrationDryRun({ migrationPath, writeReport = true }) {
  const migrationRoot = resolveTmpOutputPath(migrationPath);
  const failures = [];
  const warnings = [];
  const manifestPath = path.join(migrationRoot, 'migration-manifest.json');
  const manifest = await readIfPresent(manifestPath);
  if (!manifest) {
    failures.push(failure('MIGRATION_MANIFEST_MISSING', 'migration-manifest.json is required', 'migration-manifest.json'));
  }

  const recordsByEntity = {};
  for (const entity of productionEntities) {
    const relativeFile = productionRecordFiles[entity];
    const envelope = await readIfPresent(path.join(migrationRoot, relativeFile));
    if (!envelope) {
      failures.push(failure('PRODUCTION_RECORD_FILE_MISSING', `${relativeFile} is required`, relativeFile));
      recordsByEntity[entity] = [];
      continue;
    }
    if (envelope.entity !== entity) {
      failures.push(failure('PRODUCTION_RECORD_ENTITY_MISMATCH', `${relativeFile} entity mismatch`, relativeFile));
    }
    recordsByEntity[entity] = envelope.records ?? [];
  }

  const tenantKey = manifest?.tenantKey ?? Object.values(recordsByEntity).flat()[0]?.tenantKey ?? null;
  const siteKey = manifest?.siteKey ?? Object.values(recordsByEntity).flat()[0]?.siteKey ?? null;
  for (const [entity, records] of Object.entries(recordsByEntity)) {
    for (const record of records) {
      for (const field of commonRequiredFields) {
        if (!Object.prototype.hasOwnProperty.call(record, field)) {
          failures.push(failure('PRODUCTION_RECORD_FIELD_MISSING', `${field} is required`, `${entity}:${record.id ?? 'unknown'}/${field}`));
        }
      }
      if (record.entityType !== entity) {
        failures.push(failure('PRODUCTION_RECORD_ENTITY_TYPE_INVALID', 'entityType must match collection entity', `${entity}:${record.id}`));
      }
      if (entity !== 'outbound_link_trace_logs' && record.targetEntity !== entity) {
        failures.push(failure('PRODUCTION_RECORD_TARGET_ENTITY_INVALID', 'targetEntity must match collection entity for non-trace records', `${entity}:${record.id}`));
      }
      if (record.dryRunOnly !== true || record.liveWriteAllowed !== false) {
        failures.push(failure('PRODUCTION_RECORD_BOUNDARY_INVALID', 'dry-run records must not allow live writes', `${entity}:${record.id}`));
      }
    }
  }

  failures.push(...validateTenantPartitions({ recordsByEntity, tenantKey, siteKey }));
  failures.push(...validateStateHashes({ recordsByEntity }));
  validateReferences({ recordsByEntity, failures });
  validateTraceRecords({ traceRecords: recordsByEntity.outbound_link_trace_logs, failures });
  scanSecretLikeValues({ manifest, recordsByEntity }, failures);

  if (await pathExists(path.join(migrationRoot, 'checksums.json'))) {
    const checksumValidation = await validateChecksums({ migrationPath });
    if (checksumValidation.status !== 'passed') {
      for (const item of checksumValidation.failures) failures.push(item);
    }
  } else {
    failures.push(failure('CHECKSUMS_MISSING', 'checksums.json is required', 'checksums.json'));
  }

  await requireFile(migrationRoot, 'ROLLBACK_PACKAGE.md', failures);
  await requireFile(migrationRoot, 'RESOURCE_REGISTRY_UPDATE_CANDIDATE.json', failures);
  await requireFile(migrationRoot, 'BACKUP_BEFORE_MIGRATION_REQUIREMENTS.md', failures);

  if (manifest) {
    for (const entity of productionEntities) {
      const actual = recordsByEntity[entity]?.length ?? 0;
      const expected = manifest.summary?.countsByEntity?.[entity];
      if (expected !== actual) {
        failures.push(failure('MANIFEST_COUNT_MISMATCH', `${entity} count mismatch`, `migration-manifest.json/summary/countsByEntity/${entity}`));
      }
    }
  }

  const validation = {
    schemaVersion: '0.1.0',
    validationType: 'pumpkin-outbound-link-production-migration-dry-run-validation',
    status: failures.length === 0 ? 'passed' : 'failed',
    generatedAt: manifest?.generatedAt ?? '2026-06-10T00:00:00.000Z',
    migrationRunId: manifest?.migrationRunId ?? null,
    tenantKey,
    siteKey,
    summary: {
      failureCount: failures.length,
      warningCount: warnings.length,
      countsByEntity: Object.fromEntries(productionEntities.map((entity) => [entity, recordsByEntity[entity]?.length ?? 0]))
    },
    failures,
    warnings,
    boundaries: {
      localOnly: true,
      dryRunOnly: true,
      productionWrites: false,
      liveProviderWrites: false,
      cmsWrites: false,
      protectedConfigReads: false,
      externalCrawling: false
    }
  };

  if (writeReport) {
    await writeJson(path.join(migrationRoot, 'VALIDATION_RESULT.json'), validation);
    await writeMigrationValidationReport({ migrationRoot, validation });
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

async function requireFile(root, relativeFile, failures) {
  if (!await pathExists(path.join(root, relativeFile))) {
    failures.push(failure('MIGRATION_REQUIRED_FILE_MISSING', `${relativeFile} is required`, relativeFile));
  }
}

function validateReferences({ recordsByEntity, failures }) {
  const linkIds = new Set(recordsByEntity.outbound_links.map((record) => record.targetRecordId));
  const instanceIds = new Set(recordsByEntity.outbound_link_instances.map((record) => record.targetRecordId));
  for (const instance of recordsByEntity.outbound_link_instances) {
    if (!linkIds.has(instance.outboundLinkId)) {
      failures.push(failure('INSTANCE_LINK_REFERENCE_MISSING', 'instance references missing outbound link candidate', `outbound_link_instances:${instance.id}/outboundLinkId`));
    }
  }
  for (const render of recordsByEntity.outbound_link_render_decisions) {
    if (render.outboundLinkId && !linkIds.has(render.outboundLinkId)) {
      failures.push(failure('RENDER_LINK_REFERENCE_MISSING', 'render decision references missing link candidate', `outbound_link_render_decisions:${render.id}/outboundLinkId`));
    }
    if (render.outboundLinkInstanceId && !instanceIds.has(render.outboundLinkInstanceId)) {
      failures.push(failure('RENDER_INSTANCE_REFERENCE_MISSING', 'render decision references missing instance candidate', `outbound_link_render_decisions:${render.id}/outboundLinkInstanceId`));
    }
  }
}

function validateTraceRecords({ traceRecords, failures }) {
  for (const trace of traceRecords ?? []) {
    for (const field of requiredTraceFields) {
      if (!Object.prototype.hasOwnProperty.call(trace, field)) {
        failures.push(failure('TRACE_FIELD_MISSING', `${field} is required`, `outbound_link_trace_logs:${trace.id ?? 'unknown'}/${field}`));
      }
    }
    if (!Array.isArray(trace.auditEventIds) || !Array.isArray(trace.affectedPageIds) || !Array.isArray(trace.affectedInstanceIds)) {
      failures.push(failure('TRACE_ARRAY_FIELD_INVALID', 'trace arrays are required', `outbound_link_trace_logs:${trace.id}`));
    }
  }
}

function scanSecretLikeValues(value, failures, pathName = '$') {
  if (value === null || value === undefined) return;
  if (typeof value === 'string') {
    if (secretPatterns.some((pattern) => pattern.test(value)) || hasUnredactedRiskyQueryValue(value)) {
      failures.push(failure('SECRET_LIKE_VALUE_DETECTED', 'secret-like value detected in migration candidate output', pathName));
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
  const text = String(value ?? '');
  const matches = text.matchAll(/(?:[?&])(?:token|key|api_key|apikey|signature|sig|auth|password|access_token|code)=([^&\s]+)/gi);
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
