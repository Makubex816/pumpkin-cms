export const localStoreSchemaVersion = '0.2.0';

export const localStoreFiles = {
  manifest: 'outbound-link-store-manifest.json',
  links: 'outbound-links.json',
  instances: 'outbound-link-instances.json',
  policies: 'outbound-link-policies.json',
  scanRuns: 'outbound-link-scan-runs.json',
  auditLogs: 'outbound-link-audit-logs.json',
  validationJson: 'VALIDATION_RESULT.json',
  validationMd: 'VALIDATION_RESULT.md'
};

export const linkStatuses = new Set([
  'active',
  'disabled',
  'pending_review',
  'domain_blocked',
  'stale',
  'broken_unverified',
  'archived'
]);

export const instanceStatuses = new Set([
  'enabled',
  'disabled',
  'hidden',
  'plain_text',
  'fallback',
  'pending_review',
  'stale'
]);

export const manuallyPreservedLinkStatuses = new Set([
  'disabled',
  'archived',
  'broken_unverified'
]);

export const manuallyPreservedInstanceStatuses = new Set([
  'disabled',
  'hidden',
  'plain_text',
  'fallback'
]);

export function storeFileList() {
  return [
    localStoreFiles.links,
    localStoreFiles.instances,
    localStoreFiles.policies,
    localStoreFiles.scanRuns,
    localStoreFiles.auditLogs,
    localStoreFiles.manifest
  ];
}
