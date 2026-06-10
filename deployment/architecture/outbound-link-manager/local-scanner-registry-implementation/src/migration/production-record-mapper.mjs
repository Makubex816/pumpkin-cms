import { readRenderDecisionsEnvelope } from '../integrations/integration-common.mjs';
import {
  createMigrationRunId,
  deterministicId,
  finalizeCandidateRecord,
  migrationRecordIdFor,
  migrationTraceIdFor,
  stateHash,
  targetRecordIdFor
} from './deterministic-id-mapper.mjs';
import { containerNameForEntity, emptyRecordCollections, productionEntities, productionRecordSchemaVersion } from './target-entity-router.mjs';

export function normalizeMigrationProfile(rawProfile = {}) {
  const targetContainers = rawProfile.targetContainers ?? rawProfile.containers ?? {};
  return {
    schemaVersion: rawProfile.schemaVersion ?? '0.1.0',
    profileName: rawProfile.profileName ?? rawProfile.name ?? 'local-to-production-dry-run',
    providerMode: rawProfile.providerMode ?? 'local-to-production-dry-run',
    generatedAt: rawProfile.generatedAt ?? rawProfile.migration?.generatedAt ?? '2026-06-10T00:00:00.000Z',
    migrationRunId: rawProfile.migrationRunId ?? rawProfile.migration?.migrationRunId ?? null,
    targetProvider: {
      providerType: rawProfile.targetProvider?.providerType ?? rawProfile.providerType ?? 'provider-neutral-document-store',
      environment: rawProfile.targetProvider?.environment ?? 'production-candidate',
      accountReference: rawProfile.targetProvider?.accountReference ?? null,
      databaseName: rawProfile.targetProvider?.databaseName ?? null,
      partitionKey: rawProfile.targetProvider?.partitionKey ?? '/tenantKey',
      credentialReferenceId: rawProfile.targetProvider?.credentialReferenceId ?? 'credential-reference-required-no-value'
    },
    targetContainers,
    boundaries: {
      localOnly: true,
      dryRunOnly: true,
      productionWrites: false,
      liveProviderWrites: false,
      cmsWrites: false,
      protectedConfigReads: false,
      externalCrawling: false,
      ...(rawProfile.boundaries ?? {})
    }
  };
}

export async function mapStoreToProductionRecords({
  store,
  profile,
  renderedPath = null
}) {
  const normalizedProfile = normalizeMigrationProfile(profile);
  const migrationRunId = createMigrationRunId({
    tenantKey: store.tenant_id,
    siteKey: store.site_id,
    profile: normalizedProfile
  });
  const context = {
    tenantKey: store.tenant_id,
    siteKey: store.site_id,
    profile: normalizedProfile,
    migrationRunId,
    performedAt: normalizedProfile.generatedAt,
    targetIds: new Map()
  };

  const collections = emptyRecordCollections();
  collections.outbound_links = store.links.map((link) => mapLink(link, context));
  collections.outbound_link_instances = store.instances.map((instance) => mapInstance(instance, context));
  collections.outbound_link_policies = store.policies.map((policy) => mapPolicy(policy, context, store.policiesEnvelope?.active_policy_id));
  collections.outbound_link_scan_runs = store.scanRuns.map((scanRun) => mapScanRun(scanRun, context));
  collections.outbound_link_audit_logs = store.auditLogs.map((auditLog) => mapAuditLog(auditLog, context));
  const renderEnvelope = await readRenderDecisionsEnvelope({ renderedPath, store });
  const renderDecisions = renderEnvelope.render_decisions?.length > 0
    ? renderEnvelope.render_decisions
    : synthesizeRenderDecisions(store);
  collections.outbound_link_render_decisions = renderDecisions.map((decision) => mapRenderDecision(decision, context));
  collections.outbound_link_review_decisions = buildReviewDecisionCandidates(store, context);
  collections.outbound_link_bulk_actions = buildBulkActionCandidates(store, context);
  collections.outbound_link_rollback_plans = [buildRollbackPlanCandidate(collections, context)];
  collections.outbound_link_trace_logs = buildTraceLogCandidates(collections, context);

  return {
    schemaVersion: '0.1.0',
    migrationRunId,
    tenantKey: store.tenant_id,
    siteKey: store.site_id,
    providerMode: normalizedProfile.providerMode,
    profile: normalizedProfile,
    recordsByEntity: collections
  };
}

function commonRecord({ entity, sourceRecord, context, sourceEntity = entity }) {
  const sourceRecordId = String(sourceRecord?.id ?? sourceRecord?.sourceRecordId ?? `${sourceEntity}_${context.migrationRunId}`);
  const targetRecordId = targetRecordIdFor({
    entity,
    tenantKey: context.tenantKey,
    siteKey: context.siteKey,
    sourceRecordId
  });
  context.targetIds.set(`${sourceEntity}:${sourceRecordId}`, targetRecordId);
  return {
    schemaVersion: productionRecordSchemaVersion,
    id: targetRecordId,
    targetRecordId,
    sourceRecordId,
    migrationRunId: context.migrationRunId,
    migrationRecordId: migrationRecordIdFor({ migrationRunId: context.migrationRunId, entity, sourceRecordId }),
    tenantKey: context.tenantKey,
    siteKey: context.siteKey,
    partitionKey: context.tenantKey,
    targetEntity: entity,
    entityType: entity,
    sourceEntity,
    sourceProvider: 'local-file-backed',
    providerMode: context.profile.providerMode,
    targetProviderType: context.profile.targetProvider.providerType,
    targetContainer: containerNameForEntity(context.profile, entity),
    recordVersion: 1,
    dryRunOnly: true,
    liveWriteAllowed: false,
    createdAt: sourceRecord?.created_at ?? sourceRecord?.createdAt ?? context.performedAt,
    updatedAt: sourceRecord?.updated_at ?? sourceRecord?.updatedAt ?? sourceRecord?.created_at ?? context.performedAt
  };
}

function finalRecord({ entity, sourceRecord, context, payload, sourceEntity = entity }) {
  return finalizeCandidateRecord({
    sourceRecord,
    record: {
      ...commonRecord({ entity, sourceRecord, context, sourceEntity }),
      ...payload
    }
  });
}

function targetId(context, sourceEntity, sourceRecordId) {
  return context.targetIds.get(`${sourceEntity}:${sourceRecordId}`)
    ?? targetRecordIdFor({ entity: sourceEntity, tenantKey: context.tenantKey, siteKey: context.siteKey, sourceRecordId });
}

function mapLink(link, context) {
  return finalRecord({
    entity: 'outbound_links',
    sourceRecord: link,
    context,
    payload: {
      originalUrl: link.original_url,
      normalizedUrl: link.normalized_url,
      domain: link.domain,
      status: link.status,
      firstDetectedAt: link.first_detected_at ?? null,
      lastDetectedAt: link.last_detected_at ?? null,
      detectionCount: link.detection_count ?? 0,
      createdBy: link.created_by ?? null,
      disabledBy: link.disabled_by ?? null,
      disabledAt: link.disabled_at ?? null,
      disabledReason: link.disabled_reason ?? null
    }
  });
}

function mapInstance(instance, context) {
  return finalRecord({
    entity: 'outbound_link_instances',
    sourceRecord: instance,
    context,
    payload: {
      outboundLinkId: targetId(context, 'outbound_links', instance.outbound_link_id),
      sourceOutboundLinkId: instance.outbound_link_id,
      pageId: instance.page_id ?? null,
      contentType: instance.content_type ?? null,
      contentBlockId: instance.content_block_id ?? null,
      fieldName: instance.field_name ?? null,
      anchorText: instance.anchor_text ?? null,
      locationPath: instance.location_path,
      isEnabled: instance.is_enabled === true,
      status: instance.status,
      firstDetectedAt: instance.first_detected_at ?? null,
      lastDetectedAt: instance.last_detected_at ?? null
    }
  });
}

function mapPolicy(policy, context, activePolicyId) {
  return finalRecord({
    entity: 'outbound_link_policies',
    sourceRecord: policy,
    context,
    payload: {
      policyVersion: policy.policy_version ?? policy.version ?? policy.id,
      name: policy.name ?? policy.id,
      active: policy.id === activePolicyId,
      allowedDomains: policy.allowed_domains ?? [],
      blockedDomains: policy.blocked_domains ?? [],
      pendingReviewDomains: policy.pending_review_domains ?? [],
      reviewRequiredForNewDomains: policy.review_required_for_new_domains === true,
      defaultDisabledBehavior: policy.default_disabled_behavior ?? null,
      defaultRel: policy.default_rel ?? [],
      externalTargetBehavior: policy.external_target_behavior ?? null,
      source: policy.source ?? 'local-file-backed'
    }
  });
}

function mapScanRun(scanRun, context) {
  return finalRecord({
    entity: 'outbound_link_scan_runs',
    sourceRecord: scanRun,
    context,
    payload: {
      status: scanRun.status,
      mode: scanRun.mode ?? 'local-scan',
      startedAt: scanRun.started_at ?? null,
      completedAt: scanRun.completed_at ?? null,
      pagesScanned: scanRun.pages_scanned ?? 0,
      linksFound: scanRun.links_found ?? 0,
      newLinksFound: scanRun.new_links_found ?? 0,
      staleInstancesFound: scanRun.stale_instances_found ?? 0
    }
  });
}

function mapAuditLog(auditLog, context) {
  return finalRecord({
    entity: 'outbound_link_audit_logs',
    sourceRecord: auditLog,
    context,
    payload: {
      action: auditLog.action,
      recordType: auditLog.record_type,
      recordId: auditLog.record_id,
      actor: auditLog.actor ?? null,
      reason: auditLog.reason ?? null,
      createdAt: auditLog.created_at ?? context.performedAt,
      correlationId: auditLog.correlation_id ?? deterministicId('olcorr', [context.migrationRunId, auditLog.id], 12),
      before: auditLog.before ?? null,
      after: auditLog.after ?? null
    }
  });
}

function mapRenderDecision(decision, context) {
  return finalRecord({
    entity: 'outbound_link_render_decisions',
    sourceEntity: 'outbound_link_render_decisions',
    sourceRecord: {
      id: decision.id ?? `${decision.instance_id ?? decision.outbound_link_id}_${decision.render_action}`,
      ...decision
    },
    context,
    payload: {
      outboundLinkId: decision.outbound_link_id ? targetId(context, 'outbound_links', decision.outbound_link_id) : null,
      outboundLinkInstanceId: decision.instance_id ? targetId(context, 'outbound_link_instances', decision.instance_id) : null,
      sourceOutboundLinkId: decision.outbound_link_id ?? null,
      sourceInstanceId: decision.instance_id ?? null,
      pageId: decision.page_id ?? null,
      originalUrl: decision.original_url ?? null,
      normalizedUrl: decision.normalized_url ?? null,
      domain: decision.domain ?? null,
      anchorText: decision.anchor_text ?? null,
      linkStatus: decision.link_status ?? null,
      instanceStatus: decision.instance_status ?? null,
      policyStatus: decision.policy_status ?? null,
      renderAction: decision.render_action,
      reasonCode: decision.reason_code ?? null,
      safeRel: decision.safe_rel ?? [],
      safeTarget: decision.safe_target ?? null,
      renderedOutputIncluded: Boolean(decision.rendered_output)
    }
  });
}

function synthesizeRenderDecisions(store) {
  const linksById = new Map(store.links.map((link) => [link.id, link]));
  return store.instances.map((instance) => {
    const link = linksById.get(instance.outbound_link_id);
    return {
      id: `render_${instance.id}`,
      tenant_id: store.tenant_id,
      site_id: store.site_id,
      page_id: instance.page_id ?? null,
      instance_id: instance.id,
      outbound_link_id: instance.outbound_link_id,
      original_url: link?.original_url ?? null,
      normalized_url: link?.normalized_url ?? null,
      domain: link?.domain ?? null,
      anchor_text: instance.anchor_text ?? null,
      link_status: link?.status ?? 'unknown',
      instance_status: instance.status,
      policy_status: link?.status === 'domain_blocked' ? 'blocked' : 'local-store-derived',
      render_action: renderActionFor(link?.status, instance.status),
      reason_code: 'migration_dry_run_synthesized',
      safe_rel: ['noopener', 'noreferrer'],
      safe_target: '_blank'
    };
  });
}

function renderActionFor(linkStatus, instanceStatus) {
  if (linkStatus === 'domain_blocked') return 'domain_blocked_plain_text';
  if (linkStatus === 'pending_review' || instanceStatus === 'pending_review') return 'pending_review_plain_text';
  if (linkStatus === 'disabled' || instanceStatus === 'disabled') return 'disabled_span';
  if (instanceStatus === 'plain_text') return 'plain_text';
  if (instanceStatus === 'hidden') return 'hidden';
  if (instanceStatus === 'fallback') return 'fallback_anchor';
  return 'active_anchor';
}

function buildReviewDecisionCandidates(store, context) {
  return store.links
    .filter((link) => ['pending_review', 'domain_blocked', 'disabled'].includes(link.status))
    .map((link) => finalRecord({
      entity: 'outbound_link_review_decisions',
      sourceEntity: 'outbound_links',
      sourceRecord: {
        ...link,
        id: `review_${link.id}`
      },
      context,
      payload: {
        outboundLinkId: targetId(context, 'outbound_links', link.id),
        sourceOutboundLinkId: link.id,
        decision: decisionForStatus(link.status),
        affectedDomain: link.domain,
        normalizedUrl: link.normalized_url,
        reason: link.disabled_reason ?? `preserve ${link.status} during migration dry-run`,
        approvalReference: `migration-dry-run-${link.status}`,
        reviewDecisionId: deterministicId('olrd', [context.migrationRunId, link.id, link.status], 12)
      }
    }));
}

function decisionForStatus(status) {
  if (status === 'domain_blocked') return 'preserve_blocked';
  if (status === 'disabled') return 'preserve_disabled';
  return 'requires_review';
}

function buildBulkActionCandidates(store, context) {
  const domains = new Map();
  for (const link of store.links) {
    if (!domains.has(link.domain)) domains.set(link.domain, []);
    domains.get(link.domain).push(link);
  }
  return [...domains.entries()]
    .filter(([, links]) => links.length > 1 || links.some((link) => link.status !== 'active'))
    .map(([domain, links]) => finalRecord({
      entity: 'outbound_link_bulk_actions',
      sourceEntity: 'outbound_links',
      sourceRecord: {
        id: `bulk_${domain}`,
        domain,
        links
      },
      context,
      payload: {
        bulkActionId: deterministicId('olba', [context.migrationRunId, domain], 12),
        action: 'migration_domain_scope_summary',
        domain,
        affectedLinkIds: links.map((link) => targetId(context, 'outbound_links', link.id)),
        affectedSourceLinkIds: links.map((link) => link.id),
        affectedInstanceIds: store.instances
          .filter((instance) => links.some((link) => link.id === instance.outbound_link_id))
          .map((instance) => targetId(context, 'outbound_link_instances', instance.id)),
        approvalReference: 'migration-dry-run-domain-summary',
        outcome: 'dry_run_only'
      }
    }));
}

function buildRollbackPlanCandidate(collections, context) {
  const entityCounts = Object.fromEntries(
    productionEntities
      .filter((entity) => entity !== 'outbound_link_rollback_plans' && entity !== 'outbound_link_trace_logs')
      .map((entity) => [entity, collections[entity].length])
  );
  return finalRecord({
    entity: 'outbound_link_rollback_plans',
    sourceEntity: 'migration_run',
    sourceRecord: {
      id: `rollback_${context.migrationRunId}`,
      entityCounts
    },
    context,
    payload: {
      rollbackPlanId: deterministicId('olrp', [context.migrationRunId, 'migration-dry-run'], 12),
      executableAgainstLiveSystems: false,
      rollbackExecutionImplemented: false,
      summary: {
        entityCounts,
        totalCandidateRecords: Object.values(entityCounts).reduce((sum, count) => sum + count, 0)
      },
      changes: Object.entries(entityCounts).map(([entity, count]) => ({
        entity,
        operation: 'delete_candidates_if_written_in_future',
        count
      }))
    }
  });
}

function buildTraceLogCandidates(collections, context) {
  const rollbackPlan = collections.outbound_link_rollback_plans[0];
  const traceSources = productionEntities
    .filter((entity) => entity !== 'outbound_link_trace_logs')
    .flatMap((entity) => collections[entity].map((record) => ({ entity, record })));

  return traceSources.map(({ entity, record }) => {
    const sourceRecord = {
      id: `trace_${record.migrationRecordId}`,
      targetEntity: entity,
      sourceRecordId: record.sourceRecordId,
      targetRecordId: record.targetRecordId
    };
    return finalRecord({
      entity: 'outbound_link_trace_logs',
      sourceEntity: entity,
      sourceRecord,
      context,
      payload: {
        requestId: deterministicId('olreq', [context.migrationRunId, entity, record.sourceRecordId], 12),
        actionId: deterministicId('olact', [context.migrationRunId, entity, record.targetRecordId], 12),
        correlationId: deterministicId('olcorr', [context.migrationRunId, record.migrationRecordId], 12),
        migrationRunId: context.migrationRunId,
        migrationRecordId: record.migrationRecordId,
        providerMode: context.profile.providerMode,
        sourceRecordId: record.sourceRecordId,
        targetRecordId: record.targetRecordId,
        targetEntity: entity,
        outboundLinkId: record.outboundLinkId ?? (entity === 'outbound_links' ? record.targetRecordId : null),
        outboundLinkInstanceId: record.outboundLinkInstanceId ?? (entity === 'outbound_link_instances' ? record.targetRecordId : null),
        policyId: record.policyId ?? (entity === 'outbound_link_policies' ? record.targetRecordId : null),
        policyVersion: record.policyVersion ?? null,
        scanRunId: record.scanRunId ?? (entity === 'outbound_link_scan_runs' ? record.targetRecordId : null),
        reviewDecisionId: record.reviewDecisionId ?? (entity === 'outbound_link_review_decisions' ? record.targetRecordId : null),
        bulkActionId: record.bulkActionId ?? (entity === 'outbound_link_bulk_actions' ? record.targetRecordId : null),
        auditEventIds: entity === 'outbound_link_audit_logs' ? [record.targetRecordId] : [],
        rollbackPlanId: rollbackPlan?.rollbackPlanId ?? null,
        affectedPageIds: pageIdsForRecord(record),
        affectedInstanceIds: instanceIdsForRecord(record),
        beforeStateHash: record.beforeStateHash,
        afterStateHash: record.afterStateHash,
        migrationRecordHash: record.migrationRecordHash,
        performedAt: context.performedAt,
        outcome: 'dry_run_candidate_generated',
        blockReason: null,
        validationResultId: deterministicId('olvr', [context.migrationRunId, entity, record.targetRecordId], 12),
        boundaries: {
          localOnly: true,
          dryRunOnly: true,
          liveWriteAllowed: false,
          cmsWrites: false,
          protectedConfigReads: false,
          externalCrawling: false
        }
      }
    });
  });
}

function pageIdsForRecord(record) {
  if (record.pageId) return [record.pageId];
  if (Array.isArray(record.affectedPageIds)) return record.affectedPageIds;
  return [];
}

function instanceIdsForRecord(record) {
  if (record.outboundLinkInstanceId) return [record.outboundLinkInstanceId];
  if (Array.isArray(record.affectedInstanceIds)) return record.affectedInstanceIds;
  return [];
}
