import { deterministicId } from '../migration/deterministic-id-mapper.mjs';
import { productionEntities } from '../migration/target-entity-router.mjs';

export function createApplyPlanId({ migrationRunId, profile, tenantKey, siteKey }) {
  return deterministicId('olaplan', [migrationRunId, profile.providerProfileId, profile.providerMode, tenantKey, siteKey], 16);
}

export function mapMigrationToApplyPlanRecords({ migration, profile }) {
  const applyPlanId = createApplyPlanId({
    migrationRunId: migration.manifest.migrationRunId,
    profile,
    tenantKey: migration.manifest.tenantKey,
    siteKey: migration.manifest.siteKey
  });
  const traceByMigrationRecordId = new Map(
    (migration.recordsByEntity.outbound_link_trace_logs ?? []).map((trace) => [trace.migrationRecordId, trace])
  );
  return productionEntities.flatMap((entity) => {
    const sourceRecords = migration.recordsByEntity[entity] ?? [];
    return sourceRecords.map((record, index) => mapRecord({
      entity,
      index,
      record,
      trace: traceByMigrationRecordId.get(record.migrationRecordId) ?? (entity === 'outbound_link_trace_logs' ? record : null),
      applyPlanId,
      profile,
      migration
    }));
  });
}

function mapRecord({ entity, index, record, trace, applyPlanId, profile, migration }) {
  const applyPlanRecordId = deterministicId('olaprec', [
    applyPlanId,
    entity,
    record.migrationRecordId,
    record.targetRecordId,
    index
  ], 18);
  return {
    schemaVersion: '0.1.0',
    recordType: 'pumpkin-outbound-link-apply-plan-record',
    id: applyPlanRecordId,
    requestId: trace?.requestId ?? deterministicId('olreq', [applyPlanRecordId, 'request'], 12),
    actionId: trace?.actionId ?? deterministicId('olact', [applyPlanRecordId, 'action'], 12),
    correlationId: trace?.correlationId ?? deterministicId('olcorr', [applyPlanRecordId, 'correlation'], 12),
    migrationRunId: migration.manifest.migrationRunId,
    migrationRecordId: record.migrationRecordId,
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    applyPlanId,
    applyPlanRecordId,
    tenantKey: record.tenantKey,
    siteKey: record.siteKey,
    partitionKey: record.partitionKey,
    sourceRecordId: record.sourceRecordId,
    targetRecordId: record.targetRecordId,
    targetEntity: entity,
    sourceEntity: record.sourceEntity ?? entity,
    targetContainer: record.targetContainer ?? profile.targetContainers[entity] ?? entity,
    operation: operationForEntity(entity),
    writeExecution: 'not_executed',
    dryRunOnly: true,
    liveWriteAllowed: false,
    productionWriteAllowed: false,
    requiresFutureApproval: true,
    outboundLinkId: record.outboundLinkId ?? trace?.outboundLinkId ?? (entity === 'outbound_links' ? record.targetRecordId : null),
    outboundLinkInstanceId: record.outboundLinkInstanceId ?? trace?.outboundLinkInstanceId ?? (entity === 'outbound_link_instances' ? record.targetRecordId : null),
    policyId: record.policyId ?? trace?.policyId ?? (entity === 'outbound_link_policies' ? record.targetRecordId : null),
    policyVersion: record.policyVersion ?? trace?.policyVersion ?? null,
    scanRunId: record.scanRunId ?? trace?.scanRunId ?? (entity === 'outbound_link_scan_runs' ? record.targetRecordId : null),
    reviewDecisionId: record.reviewDecisionId ?? trace?.reviewDecisionId ?? (entity === 'outbound_link_review_decisions' ? record.targetRecordId : null),
    bulkActionId: record.bulkActionId ?? trace?.bulkActionId ?? (entity === 'outbound_link_bulk_actions' ? record.targetRecordId : null),
    auditEventIds: Array.isArray(trace?.auditEventIds) ? trace.auditEventIds : [],
    rollbackPlanId: record.rollbackPlanId ?? trace?.rollbackPlanId ?? rollbackPlanIdFromMigration(migration),
    affectedPageIds: record.pageId ? [record.pageId] : Array.isArray(trace?.affectedPageIds) ? trace.affectedPageIds : [],
    affectedInstanceIds: Array.isArray(record.affectedInstanceIds)
      ? record.affectedInstanceIds
      : Array.isArray(trace?.affectedInstanceIds)
        ? trace.affectedInstanceIds
        : [],
    beforeStateHash: record.beforeStateHash,
    afterStateHash: record.afterStateHash,
    migrationRecordHash: record.migrationRecordHash,
    sourceMigrationTraceRecordId: trace?.targetRecordId ?? null,
    sourceMigrationTraceId: trace?.id ?? null,
    performedAt: profile.generatedAt ?? migration.manifest.generatedAt ?? '2026-06-10T00:00:00.000Z',
    outcome: 'planned_no_write',
    blockReason: null,
    validationResultId: deterministicId('olapval', [applyPlanRecordId, 'validation'], 12),
    boundaries: {
      localOnly: true,
      simulatedOnly: true,
      dryRunOnly: true,
      liveWriteAllowed: false,
      productionWriteAllowed: false,
      cmsWrites: false,
      protectedConfigReads: false,
      externalCrawling: false
    }
  };
}

function operationForEntity(entity) {
  if (entity === 'outbound_link_trace_logs') return 'would_write_trace_log';
  if (entity === 'outbound_link_rollback_plans') return 'would_write_rollback_plan';
  return 'would_upsert_candidate';
}

function rollbackPlanIdFromMigration(migration) {
  return migration.rollbackPackage?.rollbackPlanId
    ?? migration.recordsByEntity.outbound_link_rollback_plans?.[0]?.rollbackPlanId
    ?? null;
}
