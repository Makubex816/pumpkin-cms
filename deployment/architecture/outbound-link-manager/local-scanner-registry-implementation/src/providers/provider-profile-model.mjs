export const providerProfileSchemaVersion = '0.1.0';

export const providerModes = [
  'local-dev',
  'fake-provider',
  'offline-bundle',
  'local-file-backed',
  'local-api-fake-provider',
  'staging-simulated',
  'live-readonly',
  'live-write-approved',
  'production-runtime'
];

export const localDryRunModes = [
  'local-dev',
  'fake-provider',
  'offline-bundle',
  'local-file-backed',
  'local-api-fake-provider',
  'staging-simulated'
];

const defaultContainers = {
  outbound_links: 'outbound-links',
  outbound_link_instances: 'outbound-link-instances',
  outbound_link_policies: 'outbound-link-policies',
  outbound_link_scan_runs: 'outbound-link-scan-runs',
  outbound_link_audit_logs: 'outbound-link-audit-logs',
  outbound_link_render_decisions: 'outbound-link-render-decisions',
  outbound_link_review_decisions: 'outbound-link-review-decisions',
  outbound_link_bulk_actions: 'outbound-link-bulk-actions',
  outbound_link_rollback_plans: 'outbound-link-rollback-plans',
  outbound_link_trace_logs: 'outbound-link-trace-logs'
};

export function normalizeProviderProfile(rawProfile = {}) {
  const providerMode = rawProfile.providerMode ?? rawProfile.mode ?? 'local-dev';
  const profileId = rawProfile.providerProfileId ?? rawProfile.profileId ?? `${providerMode}-profile`;
  const capabilities = normalizeCapabilities(providerMode, rawProfile.capabilities ?? {});
  const boundaries = normalizeBoundaries(rawProfile.boundaries ?? {}, capabilities);
  return {
    schemaVersion: rawProfile.schemaVersion ?? providerProfileSchemaVersion,
    providerProfileId: profileId,
    profileName: rawProfile.profileName ?? rawProfile.name ?? profileId,
    providerMode,
    environment: rawProfile.environment ?? environmentForMode(providerMode),
    providerType: rawProfile.providerType ?? rawProfile.targetProvider?.providerType ?? 'provider-neutral-document-store',
    targetProvider: {
      providerType: rawProfile.targetProvider?.providerType ?? rawProfile.providerType ?? 'provider-neutral-document-store',
      environment: rawProfile.targetProvider?.environment ?? rawProfile.environment ?? environmentForMode(providerMode),
      accountReference: rawProfile.targetProvider?.accountReference ?? null,
      databaseName: rawProfile.targetProvider?.databaseName ?? null,
      partitionKey: rawProfile.targetProvider?.partitionKey ?? '/tenantKey',
      credentialReferenceId: rawProfile.targetProvider?.credentialReferenceId ?? 'credential-reference-not-required-local',
      credentialValueIncluded: false
    },
    targetContainers: {
      ...defaultContainers,
      ...(rawProfile.targetContainers ?? rawProfile.containers ?? {})
    },
    capabilities,
    boundaries,
    approvals: {
      stagingWriteApproved: rawProfile.approvals?.stagingWriteApproved === true,
      liveWriteApproved: rawProfile.approvals?.liveWriteApproved === true,
      approvalReference: rawProfile.approvals?.approvalReference ?? null
    }
  };
}

function normalizeCapabilities(providerMode, rawCapabilities) {
  const localDryRun = localDryRunModes.includes(providerMode);
  const liveReadonly = providerMode === 'live-readonly';
  return {
    canReadCandidates: rawCapabilities.canReadCandidates ?? true,
    canPlanWrites: rawCapabilities.canPlanWrites ?? localDryRun,
    canSimulateWrites: rawCapabilities.canSimulateWrites ?? localDryRun,
    canExecuteStagingWrites: rawCapabilities.canExecuteStagingWrites ?? providerMode === 'staging-simulated',
    canPerformLiveWrites: false,
    canReadLive: rawCapabilities.canReadLive ?? liveReadonly,
    requiresBackupBeforeWrite: rawCapabilities.requiresBackupBeforeWrite ?? true,
    requiresRollbackPlan: rawCapabilities.requiresRollbackPlan ?? true,
    requiresTraceContinuity: rawCapabilities.requiresTraceContinuity ?? true,
    readsProtectedConfig: false,
    externalCalls: false,
    cmsWrites: false,
    azureMutations: false,
    liveProviderWrites: false,
    productionDatabaseMigration: false
  };
}

function normalizeBoundaries(rawBoundaries, capabilities) {
  return {
    localOnly: rawBoundaries.localOnly ?? true,
    simulatedOnly: rawBoundaries.simulatedOnly ?? true,
    dryRunOnly: rawBoundaries.dryRunOnly ?? true,
    liveProviderWrites: false,
    productionWrites: false,
    cmsWrites: false,
    protectedConfigReads: false,
    secretValuesIncluded: false,
    externalCrawling: false,
    azureMutations: false,
    deployment: false,
    searchConsoleIndexing: false,
    livePagePublication: false,
    canPerformLiveWrites: capabilities.canPerformLiveWrites
  };
}

function environmentForMode(providerMode) {
  if (providerMode === 'staging-simulated') return 'staging-simulated';
  if (providerMode === 'live-readonly' || providerMode === 'live-write-approved' || providerMode === 'production-runtime') return 'production';
  return 'local';
}
