export const GateStatus = Object.freeze({
  NOT_STARTED: "not_started",
  BLOCKED: "blocked",
  NEEDS_USER_INPUT: "needs_user_input",
  READY_FOR_REVIEW: "ready_for_review",
  APPROVED: "approved",
  IN_PROGRESS: "in_progress",
  PASSED: "passed",
  FAILED: "failed",
  SKIPPED: "skipped",
  DEFERRED: "deferred",
  ROLLBACK_REQUIRED: "rollback_required",
  COMPLETE: "complete"
});

export function hasBlockingFindings(findings) {
  return findings.some((finding) => finding.blocksGate || finding.severity === "error" || finding.severity === "critical");
}

export function buildGateStatuses(findings) {
  return [
    buildGate("required-files", "Required file discovery", findings),
    buildGate("json-parse", "JSON parse validation", findings),
    buildGate("schema-validation", "Basic JSON schema validation", findings),
    buildGate("simple-cross-file", "Simple cross-file validation", findings),
    buildGate("url-safety", "Offline URL safety scan", findings),
    buildGate("secret-patterns", "Offline secret-pattern scan", findings),
    {
      gateId: "external-checks",
      status: GateStatus.SKIPPED,
      summary: "External checks are out of scope for Phase 2A-1.",
      blockingFindingCodes: [],
      ownerActionRequired: false
    },
    {
      gateId: "deeper-cross-file-validation",
      status: GateStatus.DEFERRED,
      summary: "Media, form, SEO, deployment-profile, and extension validation are planned for Phase 2A-2.",
      blockingFindingCodes: [],
      ownerActionRequired: false
    }
  ];
}

function buildGate(gateId, summary, findings) {
  const blockingCodes = findings
    .filter((finding) => finding.gateId === gateId && (finding.blocksGate || finding.severity === "error" || finding.severity === "critical"))
    .map((finding) => finding.code);

  const hasWarnings = findings.some((finding) => finding.gateId === gateId && finding.severity === "warning");

  return {
    gateId,
    status: blockingCodes.length > 0 ? GateStatus.FAILED : GateStatus.PASSED,
    summary: blockingCodes.length > 0 ? `${summary} found blocking issues.` : hasWarnings ? `${summary} passed with warnings.` : `${summary} passed.`,
    blockingFindingCodes: blockingCodes,
    ownerActionRequired: blockingCodes.length > 0
  };
}

export function createFinding({
  severity,
  code,
  file = null,
  jsonPointer = null,
  field = null,
  route = null,
  message,
  ownerExplanation,
  operatorDetail,
  nextAction,
  gateId,
  blocksGate = severity === "error" || severity === "critical"
}) {
  return {
    severity,
    code,
    file,
    jsonPointer,
    field,
    route,
    message,
    ownerExplanation,
    operatorDetail,
    nextAction,
    gateId,
    blocksGate
  };
}
