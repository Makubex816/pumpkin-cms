import fs from 'node:fs/promises';
import path from 'node:path';
import { readLocalStore } from './local-store-reader.mjs';
import { writeJson, pathExists } from '../utils/json-writer.mjs';
import { resolveTmpExportPath } from '../utils/safe-paths.mjs';

export async function exportLocalStore({
  storePath,
  outputPath,
  overwrite = false,
  now = new Date()
}) {
  const timestamp = typeof now === 'string' ? now : now.toISOString();
  const store = await readLocalStore(storePath);
  const outputRoot = resolveTmpExportPath(outputPath);
  if (await pathExists(outputRoot)) {
    if (!overwrite) {
      throw new Error(`export output already exists: ${outputPath}`);
    }
    await fs.rm(outputRoot, { recursive: true, force: true });
  }

  const tenantBundleRoot = path.join(outputRoot, 'tenant-bundle', 'outbound-links');
  const backupRoot = path.join(outputRoot, 'backup-candidate', 'cms-content');
  await fs.mkdir(tenantBundleRoot, { recursive: true });
  await fs.mkdir(backupRoot, { recursive: true });

  const linksEnvelope = {
    schemaVersion: store.linksEnvelope.schemaVersion,
    tenant_id: store.tenant_id,
    site_id: store.site_id,
    outbound_links: store.links
  };
  const instancesEnvelope = {
    schemaVersion: store.instancesEnvelope.schemaVersion,
    tenant_id: store.tenant_id,
    site_id: store.site_id,
    outbound_link_instances: store.instances
  };
  const policiesEnvelope = {
    schemaVersion: store.policiesEnvelope.schemaVersion,
    tenant_id: store.tenant_id,
    site_id: store.site_id,
    active_policy_id: store.policiesEnvelope.active_policy_id,
    outbound_link_policies: store.policies
  };
  const scanRunsEnvelope = {
    schemaVersion: store.scanRunsEnvelope.schemaVersion,
    tenant_id: store.tenant_id,
    site_id: store.site_id,
    outbound_link_scan_runs: store.scanRuns
  };
  const auditSummary = {
    schemaVersion: store.auditLogsEnvelope.schemaVersion,
    tenant_id: store.tenant_id,
    site_id: store.site_id,
    audit_log_count: store.auditLogs.length,
    actions: countBy(store.auditLogs, 'action'),
    latest_audit_at: store.auditLogs.at(-1)?.created_at ?? null
  };

  await writeJson(path.join(tenantBundleRoot, 'outbound-links.json'), linksEnvelope);
  await writeJson(path.join(tenantBundleRoot, 'outbound-link-instances.json'), instancesEnvelope);
  await writeJson(path.join(tenantBundleRoot, 'outbound-link-policy.json'), policiesEnvelope);
  await writeJson(path.join(tenantBundleRoot, 'outbound-link-scan-runs.json'), scanRunsEnvelope);
  await writeJson(path.join(backupRoot, 'outbound-links.json'), linksEnvelope);
  await writeJson(path.join(backupRoot, 'outbound-link-instances.json'), instancesEnvelope);
  await writeJson(path.join(backupRoot, 'outbound-link-policies.json'), policiesEnvelope);
  await writeJson(path.join(backupRoot, 'outbound-link-scan-runs.json'), scanRunsEnvelope);
  await writeJson(path.join(backupRoot, 'outbound-link-audit-summary.json'), auditSummary);

  const manifest = {
    schemaVersion: '0.2.0',
    export_type: 'pumpkin-outbound-link-local-store-export',
    tenant_id: store.tenant_id,
    site_id: store.site_id,
    generated_at: timestamp,
    source_store_manifest: store.manifest,
    files: [
      'tenant-bundle/outbound-links/outbound-links.json',
      'tenant-bundle/outbound-links/outbound-link-instances.json',
      'tenant-bundle/outbound-links/outbound-link-policy.json',
      'tenant-bundle/outbound-links/outbound-link-scan-runs.json',
      'backup-candidate/cms-content/outbound-links.json',
      'backup-candidate/cms-content/outbound-link-instances.json',
      'backup-candidate/cms-content/outbound-link-policies.json',
      'backup-candidate/cms-content/outbound-link-scan-runs.json',
      'backup-candidate/cms-content/outbound-link-audit-summary.json'
    ],
    boundaries: {
      local_only: true,
      backup_zip_created: false,
      external_http_crawling: false,
      cms_api_calls: false,
      cms_writes: false
    }
  };
  await writeJson(path.join(outputRoot, 'EXPORT_MANIFEST.json'), manifest);

  return {
    outputRoot,
    manifest,
    summary: {
      linkCount: store.links.length,
      instanceCount: store.instances.length,
      policyCount: store.policies.length,
      scanRunCount: store.scanRuns.length,
      auditLogCount: store.auditLogs.length
    }
  };
}

function countBy(records, field) {
  const counts = {};
  for (const record of records) {
    const key = record[field] ?? 'unknown';
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}
