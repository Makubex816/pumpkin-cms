import { buildDefaultPolicy, normalizePolicy } from '../policies/policy-normalizer.mjs';
import { localStoreSchemaVersion, storeFileList } from './store-files.mjs';

export function createEmptyLocalStore({
  tenantId,
  siteId,
  now = new Date(),
  policy = null
}) {
  if (!tenantId || !siteId) {
    throw new Error('tenant and site are required');
  }
  const timestamp = typeof now === 'string' ? now : now.toISOString();
  const activePolicy = policy
    ? normalizePolicy(policy, { tenantId, siteId, now: timestamp })
    : buildDefaultPolicy({ tenantId, siteId, now: timestamp });

  return {
    tenant_id: tenantId,
    site_id: siteId,
    manifest: {
      schemaVersion: localStoreSchemaVersion,
      store_type: 'pumpkin-outbound-link-local-store',
      tenant_id: tenantId,
      site_id: siteId,
      created_at: timestamp,
      updated_at: timestamp,
      generated_by: 'pumpkin-outbound-link-manager-local-cli',
      files: storeFileList(),
      compatibility: {
        tenant_bundle_outbound_links: true,
        backup_center_cms_content: true
      },
      boundaries: {
        local_only: true,
        external_http_crawling: false,
        cms_api_calls: false,
        cms_writes: false,
        protected_config_reads: false
      }
    },
    links: [],
    instances: [],
    policies: [activePolicy],
    policiesEnvelope: {
      active_policy_id: activePolicy.id
    },
    scanRuns: [],
    auditLogs: []
  };
}
