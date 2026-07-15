export const FORM_READINESS_GATE_IDS = Object.freeze([
  'tenantCreated', 'tenantAdminCreatedAndScopeProven', 'notificationMetadataConfigured',
  'canonicalDefinitionInventory', 'effectiveInstanceInventory', 'allInstancesMapped',
  'allPublicDefinitionsActive', 'fieldIdentityReconciled', 'consentContract', 'honeypotContract',
  'hiddenIdentifiers', 'runtimeKeyProvisioned', 'runtimeKeyHardcopyMetadata', 'previewNoPost',
  'allDefinitionsPreflighted', 'terminal400', 'terminal401', 'terminal404',
  'controlledSubmission', 'exactlyOneFormEntry', 'submissionIdReadback', 'correlationIdReadback',
  'tenantAdminOwnEntry', 'tenantAdminCrossTenantDenied', 'superAdminReadback',
  'formEntryBackupRepresentation', 'externalEmailClassified', 'runtimeNoRegression',
  'operationalCloseout', 'publicFormActivationApproved'
]);

export function evaluateFormReadinessGate(evidence = {}) {
  const gates = FORM_READINESS_GATE_IDS.map((id) => ({ id, passed: evidence[id] === true }));
  const blockers = gates.filter((gate) => !gate.passed).map((gate) => gate.id);
  return {
    gateCount: gates.length,
    passedCount: gates.length - blockers.length,
    gates,
    blockers,
    publicFormMode: blockers.length === 0 ? 'live' : 'no-post',
    overallStatus: blockers.length === 0 ? 'ready_forms_live' : 'forms_held_no_post'
  };
}

export function assertPublicFormActivation(evidence = {}) {
  const result = evaluateFormReadinessGate(evidence);
  if (result.blockers.length > 0) {
    const error = new Error(`Public forms remain held: ${result.blockers.join(', ')}`);
    error.code = 'FORMS_HELD_NO_POST';
    error.readiness = result;
    throw error;
  }
  return result;
}
