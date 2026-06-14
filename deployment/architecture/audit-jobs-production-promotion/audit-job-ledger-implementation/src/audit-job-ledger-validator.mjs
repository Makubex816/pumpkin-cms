import {
  AUDIT_EVENT_TYPES,
  COMMON_TRACE_ID_FIELDS,
  EVENT_TRACE_REQUIREMENTS,
  EVIDENCE_TYPES,
  HIGH_CONFIDENCE_SECRET_PATTERNS,
  JOB_STATUSES,
  JOB_TYPES,
  LEDGER_SCHEMA_VERSION,
  OUTCOMES,
  PROMOTION_GATE_RESULTS,
  PROMOTION_GATE_STATES,
  PROTECTED_PATH_PATTERNS,
  REQUIRED_AUDIT_EVENT_FIELDS,
  REQUIRED_EVIDENCE_BINDING_FIELDS,
  REQUIRED_JOB_RUN_FIELDS,
  REQUIRED_LEDGER_FIELDS,
  REQUIRED_PROMOTION_GATE_FIELDS,
  REQUIRED_SECURITY_FALSE_FLAGS,
  SAFE_ID_PATTERN,
  SHA256_PATTERN
} from "./audit-job-ledger-schema.mjs";

const secretScanSkipKeys = new Set(["artifactHash"]);

export function validateLedger(ledger) {
  const failures = [];
  const add = (code, path, message) => {
    failures.push({ code, path, message });
  };

  if (!isPlainObject(ledger)) {
    add("LEDGER_NOT_OBJECT", "$", "Ledger root must be a JSON object.");
    return result(false, failures, emptySummary());
  }

  requireFields(ledger, REQUIRED_LEDGER_FIELDS, "$", add);

  if (ledger.schemaVersion !== LEDGER_SCHEMA_VERSION) {
    add("UNSUPPORTED_SCHEMA_VERSION", "$.schemaVersion", `Expected ${LEDGER_SCHEMA_VERSION}.`);
  }

  validateSafeId(ledger.ledgerId, "$.ledgerId", add);
  validateIsoDate(ledger.createdAt, "$.createdAt", add);
  validateSecurityBoundary(ledger.securityBoundary, "$.securityBoundary", add, { requireAllFlags: true });
  validateNoSecretLikeValues(ledger, "$", add);

  const evidenceBindings = Array.isArray(ledger.evidenceBindings) ? ledger.evidenceBindings : [];
  const evidenceIds = new Set();
  evidenceBindings.forEach((binding, index) => {
    validateEvidenceBinding(binding, `$.evidenceBindings[${index}]`, add);
    if (isPlainObject(binding) && typeof binding.evidenceId === "string") {
      if (evidenceIds.has(binding.evidenceId)) {
        add("DUPLICATE_EVIDENCE_ID", `$.evidenceBindings[${index}].evidenceId`, "Evidence IDs must be unique.");
      }
      evidenceIds.add(binding.evidenceId);
    }
  });

  const auditEvents = Array.isArray(ledger.auditEvents) ? ledger.auditEvents : [];
  const auditEventIds = new Set();
  auditEvents.forEach((event, index) => {
    validateAuditEvent(event, `$.auditEvents[${index}]`, evidenceIds, add);
    if (isPlainObject(event) && typeof event.auditEventId === "string") {
      if (auditEventIds.has(event.auditEventId)) {
        add("DUPLICATE_AUDIT_EVENT_ID", `$.auditEvents[${index}].auditEventId`, "Audit event IDs must be unique.");
      }
      auditEventIds.add(event.auditEventId);
    }
  });

  const jobRuns = Array.isArray(ledger.jobRuns) ? ledger.jobRuns : [];
  const jobRunIds = new Set();
  jobRuns.forEach((jobRun, index) => {
    validateJobRun(jobRun, `$.jobRuns[${index}]`, evidenceIds, auditEventIds, add);
    if (isPlainObject(jobRun) && typeof jobRun.jobRunId === "string") {
      if (jobRunIds.has(jobRun.jobRunId)) {
        add("DUPLICATE_JOB_RUN_ID", `$.jobRuns[${index}].jobRunId`, "Job run IDs must be unique.");
      }
      jobRunIds.add(jobRun.jobRunId);
    }
  });

  const promotionGates = Array.isArray(ledger.promotionGates) ? ledger.promotionGates : [];
  const gateIds = new Set();
  promotionGates.forEach((gate, index) => {
    validatePromotionGate(gate, `$.promotionGates[${index}]`, evidenceIds, add);
    if (isPlainObject(gate) && typeof gate.gateId === "string") {
      if (gateIds.has(gate.gateId)) {
        add("DUPLICATE_GATE_ID", `$.promotionGates[${index}].gateId`, "Promotion gate IDs must be unique.");
      }
      gateIds.add(gate.gateId);
    }
  });

  if (!Array.isArray(ledger.auditEvents) || ledger.auditEvents.length === 0) {
    add("EMPTY_AUDIT_EVENTS", "$.auditEvents", "Ledger must include at least one audit event.");
  }
  if (!Array.isArray(ledger.jobRuns) || ledger.jobRuns.length === 0) {
    add("EMPTY_JOB_RUNS", "$.jobRuns", "Ledger must include at least one job run.");
  }
  if (!Array.isArray(ledger.promotionGates) || ledger.promotionGates.length === 0) {
    add("EMPTY_PROMOTION_GATES", "$.promotionGates", "Ledger must include at least one promotion gate.");
  }
  if (!Array.isArray(ledger.evidenceBindings) || ledger.evidenceBindings.length === 0) {
    add("EMPTY_EVIDENCE_BINDINGS", "$.evidenceBindings", "Ledger must include at least one evidence binding.");
  }

  return result(failures.length === 0, failures, createSummary(ledger, failures));
}

function validateAuditEvent(event, path, evidenceIds, add) {
  if (!isPlainObject(event)) {
    add("AUDIT_EVENT_NOT_OBJECT", path, "Audit event must be an object.");
    return;
  }

  requireFields(event, REQUIRED_AUDIT_EVENT_FIELDS, path, add);
  validateSafeId(event.auditEventId, `${path}.auditEventId`, add);
  validateIsoDate(event.occurredAt, `${path}.occurredAt`, add);

  if (!AUDIT_EVENT_TYPES.includes(event.eventType)) {
    add("UNSUPPORTED_EVENT_TYPE", `${path}.eventType`, `Unsupported audit event type: ${String(event.eventType)}.`);
  }
  if (!OUTCOMES.includes(event.outcome)) {
    add("UNSUPPORTED_OUTCOME", `${path}.outcome`, `Unsupported outcome: ${String(event.outcome)}.`);
  }

  validateEvidenceRefs(event.evidenceRefs, `${path}.evidenceRefs`, evidenceIds, add);
  validateTraceIds(event, path, add);
  validateSecurityBoundary(event.securityBoundary, `${path}.securityBoundary`, add);
  validateCommonStrings(event, path, ["v2Reference", "laneId", "tenantKey", "siteKey", "actor", "boundaryClass", "mutationClass"], add);
}

function validateTraceIds(event, path, add) {
  if (!isPlainObject(event.traceIds)) {
    add("TRACE_IDS_NOT_OBJECT", `${path}.traceIds`, "traceIds must be an object.");
    return;
  }

  const requiredTraceFields = [
    ...COMMON_TRACE_ID_FIELDS,
    ...(EVENT_TRACE_REQUIREMENTS[event.eventType] ?? [])
  ];

  for (const field of requiredTraceFields) {
    if (!hasPresentValue(event.traceIds[field])) {
      add("MISSING_TRACE_ID", `${path}.traceIds.${field}`, `Missing required trace ID ${field}.`);
    }
  }

  const equalityChecks = ["v2Reference", "laneId", "tenantKey", "siteKey", "auditEventId", "outcome"];
  for (const field of equalityChecks) {
    if (hasPresentValue(event.traceIds[field]) && event.traceIds[field] !== event[field]) {
      add("TRACE_ID_RECORD_MISMATCH", `${path}.traceIds.${field}`, `Trace field ${field} must match the audit event record.`);
    }
  }

  if (event.eventType === "production_static_release_deployed") {
    if (!hasPresentValue(event.traceIds.artifactHash)) {
      add("MISSING_ARTIFACT_HASH", `${path}.traceIds.artifactHash`, "Production static release events must include artifactHash.");
    } else if (!SHA256_PATTERN.test(event.traceIds.artifactHash)) {
      add("INVALID_ARTIFACT_HASH", `${path}.traceIds.artifactHash`, "artifactHash must be a lowercase SHA-256 hex string.");
    }
  }
}

function validateJobRun(jobRun, path, evidenceIds, auditEventIds, add) {
  if (!isPlainObject(jobRun)) {
    add("JOB_RUN_NOT_OBJECT", path, "Job run must be an object.");
    return;
  }

  requireFields(jobRun, REQUIRED_JOB_RUN_FIELDS, path, add);
  validateSafeId(jobRun.jobRunId, `${path}.jobRunId`, add);
  validateIsoDate(jobRun.startedAt, `${path}.startedAt`, add);
  validateIsoDate(jobRun.completedAt, `${path}.completedAt`, add);

  if (!JOB_TYPES.includes(jobRun.jobType)) {
    add("UNSUPPORTED_JOB_TYPE", `${path}.jobType`, `Unsupported job type: ${String(jobRun.jobType)}.`);
  }
  if (!JOB_STATUSES.includes(jobRun.status)) {
    add("UNSUPPORTED_JOB_STATUS", `${path}.status`, `Unsupported job status: ${String(jobRun.status)}.`);
  }
  if (!OUTCOMES.includes(jobRun.outcome)) {
    add("UNSUPPORTED_OUTCOME", `${path}.outcome`, `Unsupported outcome: ${String(jobRun.outcome)}.`);
  }

  validateEvidenceRefs(jobRun.inputRefs, `${path}.inputRefs`, evidenceIds, add);
  validateEvidenceRefs(jobRun.outputRefs, `${path}.outputRefs`, evidenceIds, add);
  validateEvidenceRefs(jobRun.validationRefs, `${path}.validationRefs`, evidenceIds, add);
  validateRefs(jobRun.auditEventIds, `${path}.auditEventIds`, auditEventIds, "UNKNOWN_AUDIT_EVENT_REF", add);
  validateSecurityBoundary(jobRun.securityBoundary, `${path}.securityBoundary`, add);

  if (isPlainObject(jobRun.mutationFlags)) {
    validateClosedFalseFlags(jobRun.mutationFlags, `${path}.mutationFlags`, add);
  }
}

function validatePromotionGate(gate, path, evidenceIds, add) {
  if (!isPlainObject(gate)) {
    add("PROMOTION_GATE_NOT_OBJECT", path, "Promotion gate must be an object.");
    return;
  }

  requireFields(gate, REQUIRED_PROMOTION_GATE_FIELDS, path, add);
  validateSafeId(gate.gateId, `${path}.gateId`, add);
  validateCommonStrings(gate, path, ["gateType", "v2Reference", "laneId", "approvalReference", "rollbackPlanId"], add);

  if (!PROMOTION_GATE_STATES.includes(gate.state)) {
    add("UNSUPPORTED_PROMOTION_GATE_STATE", `${path}.state`, `Unsupported promotion gate state: ${String(gate.state)}.`);
  }
  if (!PROMOTION_GATE_RESULTS.includes(gate.result)) {
    add("UNSUPPORTED_PROMOTION_GATE_RESULT", `${path}.result`, `Unsupported promotion gate result: ${String(gate.result)}.`);
  }

  validateEvidenceRefs(gate.requiredEvidence, `${path}.requiredEvidence`, evidenceIds, add);
  validateEvidenceRefs(gate.actualEvidence, `${path}.actualEvidence`, evidenceIds, add);

  if (!Array.isArray(gate.blockers)) {
    add("BLOCKERS_NOT_ARRAY", `${path}.blockers`, "blockers must be an array.");
  }

  if (gate.result === "complete" && !["passed", "complete", "closed"].includes(gate.state)) {
    add("PROMOTION_GATE_COMPLETE_WHILE_OPEN", `${path}.state`, "A complete gate result requires state passed, complete, or closed.");
  }

  if (Array.isArray(gate.blockers) && gate.result === "complete" && gate.blockers.length > 0) {
    add("PROMOTION_GATE_COMPLETE_WITH_BLOCKERS", `${path}.blockers`, "A complete gate must not retain blockers.");
  }

  if (Array.isArray(gate.requiredEvidence) && Array.isArray(gate.actualEvidence)) {
    const actual = new Set(gate.actualEvidence);
    for (const requiredId of gate.requiredEvidence) {
      if (!actual.has(requiredId)) {
        add("MISSING_GATE_EVIDENCE", `${path}.actualEvidence`, `Missing required evidence ${requiredId}.`);
      }
    }
  }
}

function validateEvidenceBinding(binding, path, add) {
  if (!isPlainObject(binding)) {
    add("EVIDENCE_BINDING_NOT_OBJECT", path, "Evidence binding must be an object.");
    return;
  }

  requireFields(binding, REQUIRED_EVIDENCE_BINDING_FIELDS, path, add);
  validateSafeId(binding.evidenceId, `${path}.evidenceId`, add);
  validateCommonStrings(binding, path, ["evidenceType", "sourceRef", "safePath", "summary"], add);

  if (!EVIDENCE_TYPES.includes(binding.evidenceType)) {
    add("UNSUPPORTED_EVIDENCE_TYPE", `${path}.evidenceType`, `Unsupported evidence type: ${String(binding.evidenceType)}.`);
  }

  validateSafePath(binding.safePath, `${path}.safePath`, add);

  if (binding.evidenceType === "production_artifact_hash") {
    if (!hasPresentValue(binding.artifactHash)) {
      add("MISSING_ARTIFACT_HASH", `${path}.artifactHash`, "production_artifact_hash evidence must include artifactHash.");
    } else if (!SHA256_PATTERN.test(binding.artifactHash)) {
      add("INVALID_ARTIFACT_HASH", `${path}.artifactHash`, "artifactHash must be a lowercase SHA-256 hex string.");
    }
  }
}

function validateSecurityBoundary(boundary, path, add, options = {}) {
  if (!isPlainObject(boundary)) {
    add("SECURITY_BOUNDARY_NOT_OBJECT", path, "securityBoundary must be an object.");
    return;
  }

  if (boundary.localOnly !== true) {
    add("SECURITY_LOCAL_ONLY_NOT_TRUE", `${path}.localOnly`, "localOnly must be true for V2.9.2 ledger validation.");
  }

  if (options.requireAllFlags === true) {
    validateClosedFalseFlags(boundary, path, add);
    return;
  }

  validateProvidedClosedFlags(boundary, path, add);
}

function validateClosedFalseFlags(flags, path, add) {
  for (const flag of REQUIRED_SECURITY_FALSE_FLAGS) {
    if (!(flag in flags)) {
      add("MISSING_SECURITY_FLAG", `${path}.${flag}`, `Missing security flag ${flag}.`);
    } else if (flags[flag] !== false) {
      add("FORBIDDEN_SECURITY_FLAG_TRUE", `${path}.${flag}`, `Security flag ${flag} must remain false in the no-write validator foundation.`);
    }
  }
}

function validateProvidedClosedFlags(flags, path, add) {
  for (const flag of REQUIRED_SECURITY_FALSE_FLAGS) {
    if (flag in flags && flags[flag] !== false) {
      add("FORBIDDEN_SECURITY_FLAG_TRUE", `${path}.${flag}`, `Security flag ${flag} must remain false in the no-write validator foundation.`);
    }
  }
}

function validateEvidenceRefs(refs, path, evidenceIds, add) {
  validateRefs(refs, path, evidenceIds, "UNKNOWN_EVIDENCE_REF", add);
}

function validateRefs(refs, path, allowedRefs, code, add) {
  if (!Array.isArray(refs)) {
    add("REFS_NOT_ARRAY", path, "Reference field must be an array.");
    return;
  }

  if (refs.length === 0) {
    add("EMPTY_REFS", path, "Reference arrays must not be empty.");
  }

  refs.forEach((ref, index) => {
    if (typeof ref !== "string" || ref.length === 0) {
      add("INVALID_REF", `${path}[${index}]`, "References must be non-empty strings.");
      return;
    }
    if (!allowedRefs.has(ref)) {
      add(code, `${path}[${index}]`, `Unknown reference ${ref}.`);
    }
  });
}

function validateSafePath(value, path, add) {
  if (typeof value !== "string" || value.length === 0) {
    add("INVALID_SAFE_PATH", path, "safePath must be a non-empty string.");
    return;
  }

  const normalized = value.replace(/\\/g, "/");
  if (/^[a-zA-Z]:\//.test(normalized) || normalized.startsWith("/") || normalized.includes("..")) {
    add("UNSAFE_EVIDENCE_PATH", path, "safePath must be repo-relative and must not traverse directories.");
  }

  const lower = normalized.toLowerCase();
  for (const pattern of PROTECTED_PATH_PATTERNS) {
    if (lower.includes(pattern.toLowerCase())) {
      add("PROTECTED_EVIDENCE_PATH", path, `safePath references protected material pattern ${pattern}.`);
    }
  }
}

function validateNoSecretLikeValues(value, path, add, parentKey = "") {
  if (typeof value === "string") {
    if (secretScanSkipKeys.has(parentKey)) {
      return;
    }
    for (const pattern of HIGH_CONFIDENCE_SECRET_PATTERNS) {
      if (pattern.test(value)) {
        add("SECRET_LIKE_VALUE", path, "High-confidence secret-like value found in ledger JSON.");
        return;
      }
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => validateNoSecretLikeValues(item, `${path}[${index}]`, add));
    return;
  }

  if (isPlainObject(value)) {
    for (const [key, item] of Object.entries(value)) {
      validateNoSecretLikeValues(item, `${path}.${key}`, add, key);
    }
  }
}

function validateSafeId(value, path, add) {
  if (typeof value !== "string" || !SAFE_ID_PATTERN.test(value)) {
    add("INVALID_ID", path, "ID must be a non-empty safe identifier.");
  }
}

function validateIsoDate(value, path, add) {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    add("INVALID_ISO_DATE", path, "Timestamp must be an ISO-parseable string.");
  }
}

function validateCommonStrings(record, path, fields, add) {
  for (const field of fields) {
    if (typeof record[field] !== "string" || record[field].length === 0) {
      add("MISSING_STRING_FIELD", `${path}.${field}`, `${field} must be a non-empty string.`);
    }
  }
}

function requireFields(record, fields, path, add) {
  for (const field of fields) {
    if (!(field in record)) {
      add("MISSING_REQUIRED_FIELD", `${path}.${field}`, `Missing required field ${field}.`);
    }
  }
}

function hasPresentValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function createSummary(ledger, failures) {
  const auditEvents = Array.isArray(ledger.auditEvents) ? ledger.auditEvents : [];
  const jobRuns = Array.isArray(ledger.jobRuns) ? ledger.jobRuns : [];
  const promotionGates = Array.isArray(ledger.promotionGates) ? ledger.promotionGates : [];
  const evidenceBindings = Array.isArray(ledger.evidenceBindings) ? ledger.evidenceBindings : [];

  return {
    ledgerId: ledger.ledgerId ?? null,
    schemaVersion: ledger.schemaVersion ?? null,
    v2Reference: ledger.v2Reference ?? null,
    laneId: ledger.laneId ?? null,
    counts: {
      auditEvents: auditEvents.length,
      jobRuns: jobRuns.length,
      promotionGates: promotionGates.length,
      evidenceBindings: evidenceBindings.length,
      failures: failures.length
    },
    eventTypes: uniqueSorted(auditEvents.map((event) => event?.eventType)),
    jobTypes: uniqueSorted(jobRuns.map((jobRun) => jobRun?.jobType)),
    gateStates: uniqueSorted(promotionGates.map((gate) => gate?.state)),
    gateResults: uniqueSorted(promotionGates.map((gate) => gate?.result))
  };
}

function emptySummary() {
  return {
    ledgerId: null,
    schemaVersion: null,
    v2Reference: null,
    laneId: null,
    counts: {
      auditEvents: 0,
      jobRuns: 0,
      promotionGates: 0,
      evidenceBindings: 0,
      failures: 1
    },
    eventTypes: [],
    jobTypes: [],
    gateStates: [],
    gateResults: []
  };
}

function result(ok, failures, summary) {
  return {
    ok,
    failures,
    summary
  };
}

function uniqueSorted(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))].sort();
}
