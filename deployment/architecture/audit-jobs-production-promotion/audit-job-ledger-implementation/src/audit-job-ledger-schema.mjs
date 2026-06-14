export const LEDGER_SCHEMA_VERSION = "audit-job-ledger.v1";

export const REQUIRED_LEDGER_FIELDS = [
  "schemaVersion",
  "ledgerId",
  "v2Reference",
  "laneId",
  "tenantKey",
  "siteKey",
  "createdAt",
  "auditEvents",
  "jobRuns",
  "promotionGates",
  "evidenceBindings",
  "securityBoundary"
];

export const REQUIRED_AUDIT_EVENT_FIELDS = [
  "auditEventId",
  "eventType",
  "v2Reference",
  "laneId",
  "tenantKey",
  "siteKey",
  "occurredAt",
  "outcome",
  "evidenceRefs",
  "traceIds",
  "actor",
  "boundaryClass",
  "mutationClass",
  "securityBoundary"
];

export const REQUIRED_JOB_RUN_FIELDS = [
  "jobRunId",
  "jobType",
  "v2Reference",
  "laneId",
  "tenantKey",
  "siteKey",
  "startedAt",
  "completedAt",
  "status",
  "outcome",
  "inputRefs",
  "outputRefs",
  "validationRefs",
  "auditEventIds",
  "securityBoundary"
];

export const REQUIRED_PROMOTION_GATE_FIELDS = [
  "gateId",
  "gateType",
  "v2Reference",
  "laneId",
  "requiredEvidence",
  "actualEvidence",
  "state",
  "blockers",
  "approvalReference",
  "rollbackPlanId",
  "result"
];

export const REQUIRED_EVIDENCE_BINDING_FIELDS = [
  "evidenceId",
  "evidenceType",
  "sourceRef",
  "safePath",
  "summary"
];

export const AUDIT_EVENT_TYPES = [
  "production_static_release_deployed",
  "production_route_verification_passed",
  "production_route_verification_failed",
  "contact_form_live_submission_verified",
  "contact_form_live_submission_failed",
  "indexing_deferred_hard_stop",
  "runtime_qa_passed",
  "resource_registry_validation_passed",
  "provider_profile_validation_passed",
  "olm_publish_gate_passed",
  "backup_evidence_available",
  "rollback_abort_plan_recorded",
  "future_boundary_created"
];

export const JOB_TYPES = [
  "static_build_validation",
  "static_output_validation",
  "staging_package_validation",
  "runtime_qa",
  "resource_registry_validation",
  "provider_profile_validation",
  "olm_publish_gate_validation",
  "production_deployment_attempt",
  "production_route_check",
  "contact_form_live_verification",
  "indexing_deferred_record",
  "rollback_abort_plan_review"
];

export const OUTCOMES = [
  "passed",
  "failed",
  "blocked",
  "deferred",
  "complete"
];

export const JOB_STATUSES = [
  "planned",
  "approved_for_one_action",
  "running",
  "passed",
  "failed",
  "blocked",
  "deferred",
  "superseded",
  "cancelled"
];

export const PROMOTION_GATE_STATES = [
  "draft",
  "evidence_collecting",
  "evidence_ready",
  "operator_review",
  "approved_for_explicit_boundary",
  "running",
  "passed",
  "failed",
  "blocked",
  "deferred",
  "complete",
  "closed",
  "cancelled"
];

export const PROMOTION_GATE_RESULTS = [
  "ready_for_explicit_approval",
  "blocked_missing_evidence",
  "blocked_safety_boundary",
  "deferred_non_blocking",
  "complete"
];

export const EVIDENCE_TYPES = [
  "root_report",
  "result_package",
  "production_artifact_hash",
  "deployment_record",
  "route_check_summary",
  "contact_form_verification_summary",
  "indexing_deferral_record",
  "runtime_qa_summary",
  "resource_registry_summary",
  "provider_profile_summary",
  "olm_publish_gate_summary",
  "backup_evidence_summary",
  "rollback_abort_plan",
  "next_phase_prompt",
  "source_of_truth_doc",
  "canonical_index_doc"
];

export const REQUIRED_SECURITY_FALSE_FLAGS = [
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
  "rawSecretsStored",
  "rawPiiStored",
  "protectedConfigValuesStored",
  "rawContactPayloadStored",
  "externalNetworkUsed",
  "writesPerformed",
  "gitAddAll"
];

export const COMMON_TRACE_ID_FIELDS = [
  "v2Reference",
  "laneId",
  "tenantKey",
  "siteKey",
  "auditEventId",
  "correlationId",
  "approvalReference",
  "outcome"
];

export const EVENT_TRACE_REQUIREMENTS = {
  production_static_release_deployed: [
    "jobRunId",
    "artifactRunId",
    "artifactHash",
    "deploymentId"
  ],
  production_route_verification_passed: [
    "jobRunId",
    "routeCheckId"
  ],
  production_route_verification_failed: [
    "jobRunId",
    "routeCheckId"
  ],
  contact_form_live_submission_verified: [
    "jobRunId",
    "boundaryGateId"
  ],
  contact_form_live_submission_failed: [
    "jobRunId",
    "boundaryGateId"
  ],
  indexing_deferred_hard_stop: [
    "boundaryGateId"
  ],
  runtime_qa_passed: [
    "jobRunId",
    "runtimeQaRunId"
  ],
  resource_registry_validation_passed: [
    "jobRunId",
    "resourceRegistryValidationId"
  ],
  provider_profile_validation_passed: [
    "jobRunId",
    "providerProfileValidationId"
  ],
  olm_publish_gate_passed: [
    "jobRunId",
    "olmValidationId"
  ],
  backup_evidence_available: [],
  rollback_abort_plan_recorded: [
    "rollbackPlanId"
  ],
  future_boundary_created: [
    "boundaryGateId"
  ]
};

export const PROTECTED_PATH_PATTERNS = [
  ".env.local",
  "appsettings.Development.json",
  "local.settings.json",
  "credential",
  "credentials",
  "cookie",
  "cookies",
  "auth",
  "token",
  "secret",
  "keyvault",
  "private-key"
];

export const HIGH_CONFIDENCE_SECRET_PATTERNS = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\b(AKIA|ASIA)[A-Z0-9]{16}\b/,
  /\bsk-[A-Za-z0-9]{20,}\b/,
  /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\b/,
  /AccountKey\s*=/i,
  /SharedAccessSignature\s*=/i,
  /\bsig=[A-Za-z0-9%]{16,}/i
];

export const SHA256_PATTERN = /^[a-f0-9]{64}$/;
export const SAFE_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/;
