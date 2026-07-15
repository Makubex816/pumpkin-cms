export type FormReadinessOverallStatus = 'ready_forms_live' | 'forms_held_no_post' | 'live_proof_held' | 'external_runtime_freeze' | 'no_forms_present';

export interface FormReadinessSnapshot {
  tenantId: string;
  checkedAtUtc: string;
  definitionCount: number;
  activeDefinitionCount: number;
  instanceCount: number;
  mappedInstanceCount: number;
  unresolvedInstanceCount: number;
  noWritePreflightPassed: boolean;
  terminalResponseProofPassed: boolean;
  runtimeKeyProvisioned: boolean;
  runtimeKeyTenantScoped: boolean;
  controlledSubmissionPassed: boolean;
  proofFormEntryId: string;
  submissionId: string;
  correlationId: string;
  tenantAdminReadbackPassed: boolean;
  superAdminReadbackPassed: boolean;
  crossTenantIsolationPassed: boolean;
  previewNoPostPassed: boolean;
  notificationRecipientConfigured: boolean;
  externalEmailDeliveryStatus: string;
  publicFormMode: 'live' | 'no-post' | 'absent';
  overallStatus: FormReadinessOverallStatus;
  blockers: string[];
}
