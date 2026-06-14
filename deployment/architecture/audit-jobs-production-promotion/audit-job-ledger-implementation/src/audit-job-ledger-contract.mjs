import { HIGH_CONFIDENCE_SECRET_PATTERNS } from "./audit-job-ledger-schema.mjs";
import { createLedgerViewerModel } from "./audit-job-ledger-view-model.mjs";

export const SHARED_VIEWER_MODEL_SCHEMA_VERSION = "audit-job-ledger-shared-viewer-model.v1";
export const READONLY_API_ENVELOPE_SCHEMA_VERSION = "audit-job-ledger-readonly-api-envelope.v1";
export const DEFAULT_CONTRACT_GENERATED_AT = "2026-06-13T21:43:09-04:00";
export const DEFAULT_CONTRACT_REQUEST_ID = "ajlapi_local_fixture_v2_9_6";
export const DEFAULT_CONTRACT_RUNTIME_HTTP_WARNING = "local_next_dev_server_listened_but_timed_out";

export const READONLY_PROVIDER_MODES = [
  "local-fixture-readonly",
  "admin-local-fixture-readonly",
  "future-pumpkin-api-readonly",
  "future-electron-cache-readonly"
];

export const REQUIRED_SHARED_VIEWER_MODEL_FIELDS = [
  "schemaVersion",
  "providerMode",
  "readOnly",
  "summary",
  "panels",
  "auditEvents",
  "jobRuns",
  "promotionGates",
  "evidenceBindings",
  "traceIds",
  "warnings",
  "blockers",
  "nextGates",
  "securityBoundary",
  "redactionPolicy",
  "generatedAt"
];

export const REQUIRED_API_ENVELOPE_FIELDS = [
  "ok",
  "requestId",
  "correlationId",
  "providerMode",
  "readOnly",
  "data",
  "warnings",
  "errors",
  "securityBoundary",
  "source"
];

export const REQUIRED_PANEL_IDS = [
  "release-summary",
  "promotion-gates",
  "job-runs",
  "audit-events",
  "evidence-bindings",
  "trace-explorer",
  "runtime-qa",
  "resource-registry-provider-profile",
  "outbound-link-manager",
  "backup-center",
  "indexing-deferred",
  "blockers-next-gates"
];

const secretScanSkipKeys = new Set(["artifactHash"]);
const secretControlKeys = new Set([
  "rawSecretsAllowed",
  "protectedConfigAllowed",
  "tokenLikeValuesAllowed",
  "disallowedSecretClasses"
]);
const forbiddenSecretKeyPattern = /(authorization|cookie|credential|deploymentToken|oauthToken|accessToken|refreshToken|apiKey|accountKey|connectionString|sharedAccessSignature|sas|secret)/i;
const authHeaderValuePattern = /\bBearer\s+[A-Za-z0-9._-]+/i;
const mutationMethodPattern = /^(POST|PUT|PATCH|DELETE)$/i;
const mutationIntentPattern = /(write|mutation|deploy|redeploy|delete|create|update|indexing|contact|submit|post)/i;

export function createSharedViewerModelContract(ledger, options = {}) {
  const viewerModel = createLedgerViewerModel(ledger);

  return {
    schemaVersion: SHARED_VIEWER_MODEL_SCHEMA_VERSION,
    providerMode: options.providerMode ?? "local-fixture-readonly",
    readOnly: true,
    summary: viewerModel.summary,
    panels: viewerModel.panels,
    auditEvents: viewerModel.auditEvents,
    jobRuns: viewerModel.jobRuns,
    promotionGates: viewerModel.promotionGates,
    evidenceBindings: viewerModel.evidenceBindings,
    traceIds: viewerModel.traceIds,
    warnings: viewerModel.warnings,
    blockers: viewerModel.blockers,
    nextGates: viewerModel.nextGates,
    securityBoundary: viewerModel.securityBoundary,
    redactionPolicy: createRedactionPolicy(),
    generatedAt: options.generatedAt ?? DEFAULT_CONTRACT_GENERATED_AT,
    legacyViewerModelVersion: viewerModel.viewerModelVersion,
    validation: viewerModel.validation
  };
}

export function createReadOnlyApiEnvelope(ledger, options = {}) {
  const data = createSharedViewerModelContract(ledger, options);
  const correlationId = options.correlationId ?? data.traceIds.correlationIds[0] ?? "corr-audit-job-ledger-readonly-contract";
  const ok = data.summary.status === "read_only" && data.securityBoundary.noWriteBoundarySatisfied === true;

  return {
    schemaVersion: READONLY_API_ENVELOPE_SCHEMA_VERSION,
    ok,
    status: ok ? 200 : 422,
    code: ok ? "OK" : "AUDIT_JOB_LEDGER_CONTRACT_INVALID",
    message: ok
      ? "Read-only audit job ledger viewer contract response."
      : "Audit job ledger viewer contract response contains validation blockers.",
    requestId: options.requestId ?? DEFAULT_CONTRACT_REQUEST_ID,
    correlationId,
    providerMode: data.providerMode,
    readOnly: true,
    data,
    warnings: data.warnings,
    errors: ok ? [] : data.blockers,
    securityBoundary: data.securityBoundary,
    source: {
      kind: options.sourceKind ?? "local_fixture",
      fixturePath: options.fixturePath ?? null,
      ledgerSchemaVersion: ledger?.schemaVersion ?? null,
      viewerModelVersion: data.legacyViewerModelVersion,
      generatedFrom: "validated-ledger-viewer-model",
      runtimeHttpWarning: options.runtimeHttpWarning ?? DEFAULT_CONTRACT_RUNTIME_HTTP_WARNING
    },
    tenantKey: data.summary.tenantKey,
    siteKey: data.summary.siteKey,
    meta: {
      mode: "local-readonly-contract",
      localOnly: true,
      readOnly: true,
      providerMode: data.providerMode,
      externalHttpCrawling: false,
      cmsApiCalls: false,
      cmsWrites: false,
      providerWrites: false,
      protectedConfigReads: false,
      writeActionsAllowed: false,
      deployment: false,
      searchConsoleIndexing: false,
      runtimeHttpWarning: options.runtimeHttpWarning ?? DEFAULT_CONTRACT_RUNTIME_HTTP_WARNING
    }
  };
}

export function validateSharedViewerModelContract(model) {
  const failures = [];
  const add = (code, path, message) => failures.push({ code, path, message });

  if (!isPlainObject(model)) {
    add("CONTRACT_NOT_OBJECT", "$", "Shared viewer model contract must be a JSON object.");
    return result(false, failures, sharedViewerSummary(model));
  }

  requireFields(model, REQUIRED_SHARED_VIEWER_MODEL_FIELDS, "$", add);

  if (model.schemaVersion !== SHARED_VIEWER_MODEL_SCHEMA_VERSION) {
    add("UNSUPPORTED_SHARED_VIEWER_SCHEMA", "$.schemaVersion", `Expected ${SHARED_VIEWER_MODEL_SCHEMA_VERSION}.`);
  }

  validateReadOnlyProviderMode(model.providerMode, "$.providerMode", add);

  if (model.readOnly !== true) {
    add("CONTRACT_NOT_READ_ONLY", "$.readOnly", "Shared viewer contract must set readOnly true.");
  }

  validateIsoDate(model.generatedAt, "$.generatedAt", add);
  validateSummary(model.summary, "$.summary", add);
  validatePanels(model.panels, "$.panels", add);
  validateTraceModel(model.traceIds, "$.traceIds", add);
  validateArrayField(model.auditEvents, "$.auditEvents", add);
  validateArrayField(model.jobRuns, "$.jobRuns", add);
  validateArrayField(model.promotionGates, "$.promotionGates", add);
  validateArrayField(model.evidenceBindings, "$.evidenceBindings", add);
  validateArrayField(model.warnings, "$.warnings", add);
  validateArrayField(model.blockers, "$.blockers", add);
  validateArrayField(model.nextGates, "$.nextGates", add);
  validateSecurityBoundary(model.securityBoundary, "$.securityBoundary", add);
  validateRedactionPolicy(model.redactionPolicy, "$.redactionPolicy", add);
  validateCountConsistency(model, "$", add);
  validateIndexingDeferred(model, "$", add);
  validateNoEnabledMutations(model, "$", add);
  validateNoSecretLikeValues(model, "$", add);

  return result(failures.length === 0, failures, sharedViewerSummary(model));
}

export function validateReadOnlyApiEnvelope(envelope) {
  const failures = [];
  const add = (code, path, message) => failures.push({ code, path, message });

  if (!isPlainObject(envelope)) {
    add("CONTRACT_NOT_OBJECT", "$", "Read-only API envelope must be a JSON object.");
    return result(false, failures, apiEnvelopeSummary(envelope));
  }

  requireFields(envelope, REQUIRED_API_ENVELOPE_FIELDS, "$", add);

  if (envelope.schemaVersion !== READONLY_API_ENVELOPE_SCHEMA_VERSION) {
    add("UNSUPPORTED_API_ENVELOPE_SCHEMA", "$.schemaVersion", `Expected ${READONLY_API_ENVELOPE_SCHEMA_VERSION}.`);
  }

  if (typeof envelope.ok !== "boolean") {
    add("API_ENVELOPE_OK_NOT_BOOLEAN", "$.ok", "Envelope ok must be a boolean.");
  }

  validateNonEmptyString(envelope.requestId, "$.requestId", add);
  validateNonEmptyString(envelope.correlationId, "$.correlationId", add);
  validateReadOnlyProviderMode(envelope.providerMode, "$.providerMode", add);

  if (envelope.readOnly !== true) {
    add("API_ENVELOPE_NOT_READ_ONLY", "$.readOnly", "API envelope must set readOnly true.");
  }

  validateArrayField(envelope.warnings, "$.warnings", add);
  validateArrayField(envelope.errors, "$.errors", add);
  validateSecurityBoundary(envelope.securityBoundary, "$.securityBoundary", add);
  validateEnvelopeSource(envelope.source, "$.source", add);

  const viewerValidation = validateSharedViewerModelContract(envelope.data);
  for (const failure of viewerValidation.failures) {
    add(failure.code, `$.data${failure.path === "$" ? "" : failure.path.slice(1)}`, failure.message);
  }

  if (isPlainObject(envelope.data) && envelope.providerMode !== envelope.data.providerMode) {
    add("API_PROVIDER_MODE_MISMATCH", "$.providerMode", "Envelope providerMode must match data.providerMode.");
  }

  if (isPlainObject(envelope.data) && envelope.securityBoundary !== envelope.data.securityBoundary) {
    const envelopeBoundary = JSON.stringify(envelope.securityBoundary);
    const dataBoundary = JSON.stringify(envelope.data.securityBoundary);
    if (envelopeBoundary !== dataBoundary) {
      add("API_SECURITY_BOUNDARY_MISMATCH", "$.securityBoundary", "Envelope securityBoundary must match data.securityBoundary.");
    }
  }

  if (envelope.ok === true && Array.isArray(envelope.errors) && envelope.errors.length > 0) {
    add("API_OK_WITH_ERRORS", "$.errors", "Successful read-only envelope must not include errors.");
  }

  validateNoEnabledMutations(envelope, "$", add);
  validateNoSecretLikeValues(envelope, "$", add);

  return result(failures.length === 0, failures, apiEnvelopeSummary(envelope));
}

function createRedactionPolicy() {
  return {
    policyVersion: "audit-job-ledger-redaction.v1",
    rawSecretsAllowed: false,
    rawPiiAllowed: false,
    protectedConfigAllowed: false,
    tokenLikeValuesAllowed: false,
    disallowedSecretClasses: [
      "oauth_tokens",
      "deployment_tokens",
      "storage_keys",
      "connection_strings",
      "sas_urls",
      "cookies",
      "auth_headers",
      "private_keys"
    ],
    allowedSensitiveSurrogates: [
      "artifactHash",
      "correlationId",
      "safePath",
      "evidenceId"
    ]
  };
}

function validateSummary(summary, path, add) {
  if (!isPlainObject(summary)) {
    add("SUMMARY_NOT_OBJECT", path, "summary must be an object.");
    return;
  }

  requireFields(summary, ["status", "releaseState", "indexingState", "boundaryState", "counts"], path, add);

  if (!["read_only", "invalid_ledger"].includes(summary.status)) {
    add("UNSUPPORTED_SUMMARY_STATUS", `${path}.status`, "summary.status must be read_only or invalid_ledger.");
  }

  if (summary.indexingState !== "deferred") {
    add("INDEXING_NOT_DEFERRED", `${path}.indexingState`, "Google/Search Console/indexing must remain deferred.");
  }

  if (summary.boundaryState !== "read_only") {
    add("BOUNDARY_STATE_NOT_READ_ONLY", `${path}.boundaryState`, "summary.boundaryState must remain read_only.");
  }

  if (!isPlainObject(summary.counts)) {
    add("SUMMARY_COUNTS_NOT_OBJECT", `${path}.counts`, "summary.counts must be an object.");
  }
}

function validatePanels(panels, path, add) {
  if (!Array.isArray(panels)) {
    add("PANELS_NOT_ARRAY", path, "panels must be an array.");
    return;
  }

  const panelIds = panels.map((panel) => panel?.id);
  for (const requiredId of REQUIRED_PANEL_IDS) {
    if (!panelIds.includes(requiredId)) {
      add("REQUIRED_PANEL_MISSING", path, `Missing panel ${requiredId}.`);
    }
  }

  panels.forEach((panel, index) => {
    if (!isPlainObject(panel)) {
      add("PANEL_NOT_OBJECT", `${path}[${index}]`, "panel must be an object.");
      return;
    }
    requireFields(panel, ["id", "title", "state", "readOnly", "counts", "safetyLabel"], `${path}[${index}]`, add);
    if (panel.readOnly !== true) {
      add("PANEL_NOT_READ_ONLY", `${path}[${index}].readOnly`, "panel.readOnly must be true.");
    }
    if (panel.safetyLabel !== "read_only_no_write_actions") {
      add("PANEL_SAFETY_LABEL_INVALID", `${path}[${index}].safetyLabel`, "panel.safetyLabel must be read_only_no_write_actions.");
    }
  });
}

function validateTraceModel(traceIds, path, add) {
  if (!isPlainObject(traceIds)) {
    add("TRACE_MODEL_NOT_OBJECT", path, "traceIds must be an object.");
    return;
  }

  requireFields(traceIds, ["entries", "byField", "correlationIds", "searchableFields"], path, add);
  validateArrayField(traceIds.entries, `${path}.entries`, add);
  validateArrayField(traceIds.correlationIds, `${path}.correlationIds`, add);
  validateArrayField(traceIds.searchableFields, `${path}.searchableFields`, add);
}

function validateSecurityBoundary(boundary, path, add) {
  if (!isPlainObject(boundary)) {
    add("SECURITY_BOUNDARY_NOT_OBJECT", path, "securityBoundary must be an object.");
    return;
  }

  if (boundary.localOnly !== true) {
    add("SECURITY_LOCAL_ONLY_NOT_TRUE", `${path}.localOnly`, "localOnly must be true.");
  }
  if (boundary.noWriteBoundarySatisfied !== true) {
    add("NO_WRITE_BOUNDARY_NOT_SATISFIED", `${path}.noWriteBoundarySatisfied`, "noWriteBoundarySatisfied must be true.");
  }
  if (!Array.isArray(boundary.openFlags)) {
    add("SECURITY_OPEN_FLAGS_NOT_ARRAY", `${path}.openFlags`, "openFlags must be an array.");
  } else if (boundary.openFlags.length > 0) {
    add("SECURITY_OPEN_FLAGS_PRESENT", `${path}.openFlags`, "openFlags must be empty for the read-only contract.");
  }
}

function validateRedactionPolicy(policy, path, add) {
  if (!isPlainObject(policy)) {
    add("REDACTION_POLICY_NOT_OBJECT", path, "redactionPolicy must be an object.");
    return;
  }

  for (const [field, expected] of Object.entries({
    rawSecretsAllowed: false,
    rawPiiAllowed: false,
    protectedConfigAllowed: false,
    tokenLikeValuesAllowed: false
  })) {
    if (policy[field] !== expected) {
      add("REDACTION_POLICY_OPEN", `${path}.${field}`, `${field} must be false.`);
    }
  }
}

function validateEnvelopeSource(source, path, add) {
  if (!isPlainObject(source)) {
    add("SOURCE_NOT_OBJECT", path, "source must be an object.");
    return;
  }

  requireFields(source, ["kind", "viewerModelVersion", "generatedFrom", "runtimeHttpWarning"], path, add);
  if (!["local_fixture", "validated_ledger", "future_api", "future_electron_cache"].includes(source.kind)) {
    add("UNSUPPORTED_SOURCE_KIND", `${path}.kind`, "source.kind must identify the read-only data source.");
  }
  if (source.runtimeHttpWarning !== DEFAULT_CONTRACT_RUNTIME_HTTP_WARNING) {
    add("RUNTIME_HTTP_WARNING_NOT_CARRIED", `${path}.runtimeHttpWarning`, "V2.9.5 runtime HTTP warning must be carried forward.");
  }
}

function validateCountConsistency(model, path, add) {
  const counts = model?.summary?.counts;
  if (!isPlainObject(counts)) {
    return;
  }

  const checks = [
    ["auditEvents", "auditEvents"],
    ["jobRuns", "jobRuns"],
    ["promotionGates", "promotionGates"],
    ["evidenceBindings", "evidenceBindings"]
  ];

  for (const [countField, arrayField] of checks) {
    if (typeof counts[countField] === "number" && Array.isArray(model[arrayField]) && counts[countField] !== model[arrayField].length) {
      add("VIEWER_COUNT_MISMATCH", `${path}.summary.counts.${countField}`, `${countField} must match ${arrayField}.length.`);
    }
  }

  if (typeof counts.traceEntries === "number" && Array.isArray(model?.traceIds?.entries) && counts.traceEntries !== model.traceIds.entries.length) {
    add("VIEWER_COUNT_MISMATCH", `${path}.summary.counts.traceEntries`, "traceEntries must match traceIds.entries.length.");
  }
}

function validateIndexingDeferred(model, path, add) {
  const hasDeferredGate = Array.isArray(model?.nextGates)
    && model.nextGates.some((gate) => gate?.id === "google-indexing-deferred" && gate?.state === "deferred");
  const hasDeferredPanel = Array.isArray(model?.panels)
    && model.panels.some((panel) => panel?.id === "indexing-deferred" && panel?.state === "deferred");

  if (!hasDeferredGate) {
    add("GOOGLE_INDEXING_DEFERRED_GATE_MISSING", `${path}.nextGates`, "google-indexing-deferred next gate must be present.");
  }
  if (!hasDeferredPanel) {
    add("INDEXING_DEFERRED_PANEL_MISSING", `${path}.panels`, "indexing-deferred panel must be present and deferred.");
  }
}

function validateNoEnabledMutations(value, path, add) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => validateNoEnabledMutations(item, `${path}[${index}]`, add));
    return;
  }

  if (!isPlainObject(value)) {
    return;
  }

  const method = typeof value.method === "string"
    ? value.method
    : typeof value.httpMethod === "string"
      ? value.httpMethod
      : "";
  const combinedText = Object.values(value)
    .filter((item) => typeof item === "string")
    .join(" ");

  if (value.writeActionsAllowed === true) {
    add("WRITE_ACTIONS_ALLOWED", `${path}.writeActionsAllowed`, "writeActionsAllowed must not be true.");
  }

  if (
    mutationMethodPattern.test(method)
    || (value.enabled === true && mutationIntentPattern.test(combinedText))
    || (value.disabled === false && mutationIntentPattern.test(combinedText))
  ) {
    add("MUTATION_ACTION_NOT_DISABLED", path, "Mutation-like actions must not appear as enabled or callable.");
  }

  for (const [key, item] of Object.entries(value)) {
    validateNoEnabledMutations(item, `${path}.${key}`, add);
  }
}

function validateNoSecretLikeValues(value, path, add, parentKey = "") {
  if (typeof value === "string") {
    if (secretScanSkipKeys.has(parentKey)) {
      return;
    }
    if (authHeaderValuePattern.test(value)) {
      add("SECRET_LIKE_VALUE", path, "Auth-header-like value found in contract JSON.");
      return;
    }
    for (const pattern of HIGH_CONFIDENCE_SECRET_PATTERNS) {
      if (pattern.test(value)) {
        add("SECRET_LIKE_VALUE", path, "High-confidence secret-like value found in contract JSON.");
        return;
      }
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => validateNoSecretLikeValues(item, `${path}[${index}]`, add, parentKey));
    return;
  }

  if (isPlainObject(value)) {
    for (const [key, item] of Object.entries(value)) {
      if (!secretControlKeys.has(key) && forbiddenSecretKeyPattern.test(key)) {
        add("SECRET_FIELD_NOT_ALLOWED", `${path}.${key}`, `Secret-like field name ${key} is not allowed in the contract.`);
      }
      validateNoSecretLikeValues(item, `${path}.${key}`, add, key);
    }
  }
}

function validateReadOnlyProviderMode(value, path, add) {
  if (typeof value !== "string" || !READONLY_PROVIDER_MODES.includes(value)) {
    add("UNSUPPORTED_PROVIDER_MODE", path, `providerMode must be one of ${READONLY_PROVIDER_MODES.join(", ")}.`);
  }
}

function validateArrayField(value, path, add) {
  if (!Array.isArray(value)) {
    add("ARRAY_FIELD_REQUIRED", path, "Field must be an array.");
  }
}

function validateNonEmptyString(value, path, add) {
  if (typeof value !== "string" || value.length === 0) {
    add("MISSING_STRING_FIELD", path, "Field must be a non-empty string.");
  }
}

function validateIsoDate(value, path, add) {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    add("INVALID_ISO_DATE", path, "Field must be an ISO-parseable timestamp string.");
  }
}

function requireFields(record, fields, path, add) {
  for (const field of fields) {
    if (!(field in record)) {
      add("MISSING_REQUIRED_FIELD", `${path}.${field}`, `Missing required field ${field}.`);
    }
  }
}

function sharedViewerSummary(model) {
  return {
    schemaVersion: model?.schemaVersion ?? null,
    providerMode: model?.providerMode ?? null,
    readOnly: model?.readOnly ?? null,
    status: model?.summary?.status ?? null,
    panelCount: Array.isArray(model?.panels) ? model.panels.length : 0,
    warningCount: Array.isArray(model?.warnings) ? model.warnings.length : 0,
    blockerCount: Array.isArray(model?.blockers) ? model.blockers.length : 0
  };
}

function apiEnvelopeSummary(envelope) {
  return {
    schemaVersion: envelope?.schemaVersion ?? null,
    ok: envelope?.ok ?? null,
    requestId: envelope?.requestId ?? null,
    providerMode: envelope?.providerMode ?? null,
    readOnly: envelope?.readOnly ?? null,
    dataSchemaVersion: envelope?.data?.schemaVersion ?? null,
    sourceKind: envelope?.source?.kind ?? null
  };
}

function result(ok, failures, summary) {
  return {
    ok,
    failures,
    summary
  };
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
