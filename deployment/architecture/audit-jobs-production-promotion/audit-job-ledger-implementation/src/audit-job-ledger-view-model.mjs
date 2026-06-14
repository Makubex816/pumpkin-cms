import { validateLedger } from "./audit-job-ledger-validator.mjs";

const PANEL_DEFINITIONS = [
  ["release-summary", "Release Summary"],
  ["promotion-gates", "Promotion Gates"],
  ["job-runs", "Job Runs"],
  ["audit-events", "Audit Events"],
  ["evidence-bindings", "Evidence Bindings"],
  ["trace-explorer", "Trace Explorer"],
  ["runtime-qa", "Runtime QA"],
  ["resource-registry-provider-profile", "Resource Registry / Provider Profile"],
  ["outbound-link-manager", "Outbound Link Manager"],
  ["backup-center", "Backup Center"],
  ["indexing-deferred", "Indexing Deferred"],
  ["blockers-next-gates", "Blockers and Next Gates"]
];

const WRITE_BOUNDARY_FLAGS = [
  "deployment",
  "redeployment",
  "dnsChange",
  "customDomainMutation",
  "searchConsoleAction",
  "googleSitemapSubmission",
  "googleUrlInspectionApi",
  "googleIndexingApi",
  "indexingRequest",
  "crawlOrOutboundCheck",
  "contactFormSubmission",
  "contactEndpointPost",
  "cmsWrite",
  "mediaAssetWrite",
  "providerWrite",
  "azureMutation",
  "azureInfrastructureCreation",
  "azureInfrastructureMutation",
  "azureAppSettingsMutation",
  "rbacAssignment",
  "protectedConfigRead",
  "tokenUseOrPrint",
  "deploymentTokenUsed",
  "deploymentTokenPrintedOrExported",
  "oauthTokenUsedOrPrinted",
  "keyVaultSecretQuery",
  "keysListKeys",
  "connectionStringGenerated",
  "sasGenerated",
  "secretExport",
  "externalNetworkUsed",
  "writesPerformed"
];

export function createLedgerViewerModel(ledger) {
  const validation = validateLedger(ledger);
  const auditEvents = Array.isArray(ledger?.auditEvents) ? ledger.auditEvents : [];
  const jobRuns = Array.isArray(ledger?.jobRuns) ? ledger.jobRuns : [];
  const promotionGates = Array.isArray(ledger?.promotionGates) ? ledger.promotionGates : [];
  const evidenceBindings = Array.isArray(ledger?.evidenceBindings) ? ledger.evidenceBindings : [];

  const evidenceById = new Map(evidenceBindings.map((evidence) => [evidence.evidenceId, evidence]));
  const auditEventViewModels = auditEvents.map((event) => createAuditEventViewModel(event, evidenceById));
  const jobRunViewModels = jobRuns.map((jobRun) => createJobRunViewModel(jobRun, evidenceById));
  const promotionGateViewModels = promotionGates.map((gate) => createPromotionGateViewModel(gate, evidenceById));
  const evidenceViewModels = evidenceBindings.map(createEvidenceBindingViewModel);
  const traceModel = createTraceModel(auditEvents);

  const hasDeployment = auditEvents.some((event) => event.eventType === "production_static_release_deployed" && event.outcome === "passed");
  const hasRoutesPassed = auditEvents.some((event) => event.eventType === "production_route_verification_passed" && event.outcome === "passed");
  const hasContactVerified = auditEvents.some((event) => event.eventType === "contact_form_live_submission_verified" && event.outcome === "passed");
  const hasIndexingDeferred = auditEvents.some((event) => event.eventType === "indexing_deferred_hard_stop")
    || promotionGates.some((gate) => gate.gateType === "indexing_state_explicit" && gate.result === "deferred_non_blocking");
  const hasFutureBoundary = auditEvents.some((event) => event.eventType === "future_boundary_created")
    || promotionGates.some((gate) => gate.gateType === "future_boundary_created");
  const blockedGates = promotionGateViewModels.filter((gate) => gate.state === "blocked" || gate.result?.startsWith("blocked"));
  const missingEvidenceGates = promotionGateViewModels.filter((gate) => gate.missingEvidenceRefs.length > 0);

  const releaseState = validation.ok && hasDeployment && hasRoutesPassed && hasContactVerified
    ? "complete"
    : validation.ok
      ? "warning"
      : "invalid_ledger";
  const indexingState = hasIndexingDeferred ? "deferred" : "warning";
  const boundaryState = validation.ok && isNoWriteBoundarySatisfied(ledger?.securityBoundary) ? "read_only" : "warning";

  const warnings = createWarnings({
    validation,
    hasIndexingDeferred,
    missingEvidenceGates,
    boundaryState
  });
  const blockers = createBlockers({ blockedGates, missingEvidenceGates, validation });
  const nextGates = createNextGates({ hasFutureBoundary, hasIndexingDeferred });

  const summary = {
    status: validation.ok ? "read_only" : "invalid_ledger",
    v2Reference: ledger?.v2Reference ?? null,
    laneId: ledger?.laneId ?? null,
    tenantKey: ledger?.tenantKey ?? null,
    siteKey: ledger?.siteKey ?? null,
    releaseState,
    indexingState,
    boundaryState,
    counts: {
      auditEvents: auditEventViewModels.length,
      jobRuns: jobRunViewModels.length,
      promotionGates: promotionGateViewModels.length,
      evidenceBindings: evidenceViewModels.length,
      traceEntries: traceModel.entries.length,
      warnings: warnings.length,
      blockers: blockers.length,
      nextGates: nextGates.length
    }
  };

  const panels = createPanels({
    validation,
    summary,
    auditEvents: auditEventViewModels,
    jobRuns: jobRunViewModels,
    promotionGates: promotionGateViewModels,
    evidenceBindings: evidenceViewModels,
    traceModel,
    hasIndexingDeferred,
    hasFutureBoundary,
    blockedGates,
    warnings,
    blockers,
    nextGates
  });

  return {
    ok: validation.ok,
    viewerModelVersion: "audit-job-ledger-viewer.v1",
    summary,
    panels,
    auditEvents: auditEventViewModels,
    jobRuns: jobRunViewModels,
    promotionGates: promotionGateViewModels,
    evidenceBindings: evidenceViewModels,
    traceIds: traceModel,
    warnings,
    blockers,
    nextGates,
    securityBoundary: createSecurityBoundaryView(ledger?.securityBoundary),
    validation: {
      ok: validation.ok,
      failureCount: validation.failures.length,
      failures: validation.failures
    }
  };
}

export function searchTraceIds(viewerModel, query) {
  const normalizedQuery = String(query ?? "").toLowerCase();
  if (normalizedQuery.length === 0) {
    return [];
  }

  return (viewerModel?.traceIds?.entries ?? []).filter((entry) => entry.searchText.includes(normalizedQuery));
}

function createAuditEventViewModel(event, evidenceById) {
  return {
    id: event.auditEventId,
    type: event.eventType,
    outcome: event.outcome,
    occurredAt: event.occurredAt,
    actor: event.actor,
    boundaryClass: event.boundaryClass,
    mutationClass: event.mutationClass,
    evidenceRefs: event.evidenceRefs ?? [],
    evidenceSummaries: (event.evidenceRefs ?? []).map((id) => evidenceById.get(id)?.summary ?? null).filter(Boolean),
    traceIdCount: Object.keys(event.traceIds ?? {}).length,
    correlationId: event.traceIds?.correlationId ?? null,
    boundaryGateId: event.traceIds?.boundaryGateId ?? null,
    readOnlySafety: createCompactSafety(event.securityBoundary)
  };
}

function createJobRunViewModel(jobRun, evidenceById) {
  const evidenceRefs = unique([
    ...(jobRun.inputRefs ?? []),
    ...(jobRun.outputRefs ?? []),
    ...(jobRun.validationRefs ?? [])
  ]);

  return {
    id: jobRun.jobRunId,
    type: jobRun.jobType,
    status: jobRun.status,
    outcome: jobRun.outcome,
    startedAt: jobRun.startedAt,
    completedAt: jobRun.completedAt,
    auditEventIds: jobRun.auditEventIds ?? [],
    evidenceRefs,
    evidenceCount: evidenceRefs.length,
    evidenceSummaries: evidenceRefs.map((id) => evidenceById.get(id)?.summary ?? null).filter(Boolean),
    readOnlySafety: createCompactSafety(jobRun.securityBoundary)
  };
}

function createPromotionGateViewModel(gate, evidenceById) {
  const requiredEvidence = gate.requiredEvidence ?? [];
  const actualEvidence = gate.actualEvidence ?? [];
  const actual = new Set(actualEvidence);
  const missingEvidenceRefs = requiredEvidence.filter((id) => !actual.has(id));

  return {
    id: gate.gateId,
    type: gate.gateType,
    state: gate.state,
    result: gate.result,
    blockers: gate.blockers ?? [],
    requiredEvidence,
    actualEvidence,
    missingEvidenceRefs,
    approvalReference: gate.approvalReference,
    rollbackPlanId: gate.rollbackPlanId,
    evidenceSummaries: actualEvidence.map((id) => evidenceById.get(id)?.summary ?? null).filter(Boolean)
  };
}

function createEvidenceBindingViewModel(evidence) {
  return {
    id: evidence.evidenceId,
    type: evidence.evidenceType,
    sourceRef: evidence.sourceRef,
    safePath: evidence.safePath,
    summary: evidence.summary,
    hasArtifactHash: typeof evidence.artifactHash === "string"
  };
}

function createTraceModel(auditEvents) {
  const entries = [];
  const byField = {};

  for (const event of auditEvents) {
    for (const [field, value] of Object.entries(event.traceIds ?? {})) {
      const entry = {
        field,
        value,
        auditEventId: event.auditEventId,
        eventType: event.eventType,
        correlationId: event.traceIds?.correlationId ?? null,
        searchText: [
          field,
          value,
          event.auditEventId,
          event.eventType,
          event.traceIds?.correlationId
        ].filter(Boolean).join(" ").toLowerCase()
      };
      entries.push(entry);
      byField[field] = (byField[field] ?? 0) + 1;
    }
  }

  return {
    entries,
    byField,
    correlationIds: unique(entries.map((entry) => entry.correlationId).filter(Boolean)),
    searchableFields: Object.keys(byField).sort()
  };
}

function createPanels(context) {
  const panelStates = {
    "release-summary": context.summary.releaseState,
    "promotion-gates": stateFromGates(context.promotionGates, context.validation.ok),
    "job-runs": context.validation.ok ? "complete" : "invalid_ledger",
    "audit-events": context.validation.ok ? "complete" : "invalid_ledger",
    "evidence-bindings": context.validation.ok ? "complete" : "invalid_ledger",
    "trace-explorer": context.traceModel.entries.length > 0 ? "complete" : "missing_evidence",
    "runtime-qa": hasEvent(context.auditEvents, "runtime_qa_passed") ? "complete" : "missing_evidence",
    "resource-registry-provider-profile": hasEvent(context.auditEvents, "resource_registry_validation_passed") && hasEvent(context.auditEvents, "provider_profile_validation_passed") ? "complete" : "missing_evidence",
    "outbound-link-manager": hasEvent(context.auditEvents, "olm_publish_gate_passed") ? "complete" : "missing_evidence",
    "backup-center": hasEvent(context.auditEvents, "backup_evidence_available") ? "complete" : "missing_evidence",
    "indexing-deferred": context.hasIndexingDeferred ? "deferred" : "warning",
    "blockers-next-gates": context.blockers.length > 0 ? "blocked" : context.hasFutureBoundary ? "future_boundary_required" : "warning"
  };

  return PANEL_DEFINITIONS.map(([id, title]) => ({
    id,
    title,
    state: panelStates[id],
    readOnly: true,
    counts: createPanelCounts(id, context),
    safetyLabel: "read_only_no_write_actions"
  }));
}

function createPanelCounts(id, context) {
  if (id === "promotion-gates") {
    return { total: context.promotionGates.length, blocked: context.blockedGates.length };
  }
  if (id === "job-runs") {
    return { total: context.jobRuns.length };
  }
  if (id === "audit-events") {
    return { total: context.auditEvents.length };
  }
  if (id === "evidence-bindings") {
    return { total: context.evidenceBindings.length };
  }
  if (id === "trace-explorer") {
    return { total: context.traceModel.entries.length, correlations: context.traceModel.correlationIds.length };
  }
  if (id === "blockers-next-gates") {
    return { warnings: context.warnings.length, blockers: context.blockers.length, nextGates: context.nextGates.length };
  }
  return { total: 1 };
}

function createWarnings({ validation, hasIndexingDeferred, missingEvidenceGates, boundaryState }) {
  const warnings = validation.failures.map((failure) => ({
    code: failure.code,
    state: "invalid_ledger",
    severity: "warning",
    message: failure.message,
    path: failure.path
  }));

  if (hasIndexingDeferred) {
    warnings.push({
      code: "INDEXING_DEFERRED",
      state: "deferred",
      severity: "info",
      message: "Google/Search Console/indexing remains deferred by hard stop."
    });
  }

  for (const gate of missingEvidenceGates) {
    warnings.push({
      code: "MISSING_GATE_EVIDENCE",
      state: "missing_evidence",
      severity: "warning",
      message: `Promotion gate ${gate.id} is missing evidence.`,
      gateId: gate.id
    });
  }

  if (boundaryState !== "read_only") {
    warnings.push({
      code: "READ_ONLY_BOUNDARY_WARNING",
      state: "warning",
      severity: "warning",
      message: "No-write boundary is incomplete or not fully closed."
    });
  }

  return warnings;
}

function createBlockers({ blockedGates, missingEvidenceGates, validation }) {
  const blockers = [
    ...blockedGates.map((gate) => ({
      code: "PROMOTION_GATE_BLOCKED",
      state: "blocked",
      gateId: gate.id,
      message: `Promotion gate ${gate.id} is blocked.`
    })),
    ...missingEvidenceGates.map((gate) => ({
      code: "MISSING_GATE_EVIDENCE",
      state: "missing_evidence",
      gateId: gate.id,
      message: `Promotion gate ${gate.id} is missing required evidence.`
    }))
  ];

  if (!validation.ok) {
    blockers.push({
      code: "INVALID_LEDGER",
      state: "invalid_ledger",
      message: "Viewer must stay read-only and show validation failures before trusting this ledger."
    });
  }

  return blockers;
}

function createNextGates({ hasFutureBoundary, hasIndexingDeferred }) {
  const nextGates = [];

  if (hasFutureBoundary) {
    nextGates.push({
      id: "future-boundary-required",
      state: "future_boundary_required",
      label: "Future explicit approval required before any runtime/write boundary."
    });
  }

  if (hasIndexingDeferred) {
    nextGates.push({
      id: "google-indexing-deferred",
      state: "deferred",
      label: "Google/Search Console/indexing remains deferred until a separate explicit approval."
    });
  }

  return nextGates;
}

function createSecurityBoundaryView(boundary) {
  const openFlags = WRITE_BOUNDARY_FLAGS.filter((flag) => boundary?.[flag] !== false);

  return {
    localOnly: boundary?.localOnly === true,
    noWriteBoundarySatisfied: openFlags.length === 0 && boundary?.localOnly === true,
    openFlags,
    closedFlags: WRITE_BOUNDARY_FLAGS.filter((flag) => boundary?.[flag] === false)
  };
}

function createCompactSafety(boundary) {
  return {
    localOnly: boundary?.localOnly === true,
    writesPerformed: boundary?.writesPerformed ?? null,
    externalNetworkUsed: boundary?.externalNetworkUsed ?? null,
    protectedConfigRead: boundary?.protectedConfigRead ?? null
  };
}

function isNoWriteBoundarySatisfied(boundary) {
  return boundary?.localOnly === true && WRITE_BOUNDARY_FLAGS.every((flag) => boundary?.[flag] === false);
}

function stateFromGates(gates, isValid) {
  if (!isValid) {
    return "invalid_ledger";
  }
  if (gates.some((gate) => gate.state === "blocked" || gate.result?.startsWith("blocked"))) {
    return "blocked";
  }
  if (gates.some((gate) => gate.missingEvidenceRefs.length > 0)) {
    return "missing_evidence";
  }
  return "complete";
}

function hasEvent(events, eventType) {
  return events.some((event) => event.type === eventType || event.eventType === eventType);
}

function unique(values) {
  return [...new Set(values)];
}
