import fs from 'node:fs/promises';
import path from 'node:path';
import { writeJson, pathExists } from '../utils/json-writer.mjs';
import { resolveTmpStorePath } from '../utils/safe-paths.mjs';
import { localStoreFiles, localStoreSchemaVersion, storeFileList } from './store-files.mjs';

export async function writeLocalStore({ store, outputPath, overwrite = false, now = new Date() }) {
  const outputRoot = resolveTmpStorePath(outputPath);
  if (await pathExists(outputRoot)) {
    if (!overwrite) {
      throw new Error(`store output already exists: ${outputPath}`);
    }
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(outputRoot, { recursive: true });

  const timestamp = typeof now === 'string' ? now : now.toISOString();
  const tenantId = store.tenant_id;
  const siteId = store.site_id;
  const manifest = {
    ...(store.manifest ?? {}),
    schemaVersion: localStoreSchemaVersion,
    store_type: 'pumpkin-outbound-link-local-store',
    tenant_id: tenantId,
    site_id: siteId,
    updated_at: timestamp,
    files: storeFileList(),
    compatibility: {
      tenant_bundle_outbound_links: true,
      backup_center_cms_content: true,
      ...(store.manifest?.compatibility ?? {})
    },
    boundaries: {
      local_only: true,
      external_http_crawling: false,
      cms_api_calls: false,
      cms_writes: false,
      protected_config_reads: false,
      ...(store.manifest?.boundaries ?? {})
    }
  };

  await writeJson(path.join(outputRoot, localStoreFiles.links), {
    schemaVersion: localStoreSchemaVersion,
    tenant_id: tenantId,
    site_id: siteId,
    outbound_links: sortById(store.links)
  });
  await writeJson(path.join(outputRoot, localStoreFiles.instances), {
    schemaVersion: localStoreSchemaVersion,
    tenant_id: tenantId,
    site_id: siteId,
    outbound_link_instances: sortById(store.instances)
  });
  await writeJson(path.join(outputRoot, localStoreFiles.policies), {
    schemaVersion: localStoreSchemaVersion,
    tenant_id: tenantId,
    site_id: siteId,
    active_policy_id: store.policiesEnvelope?.active_policy_id ?? store.policies?.[0]?.id ?? null,
    outbound_link_policies: sortById(store.policies)
  });
  await writeJson(path.join(outputRoot, localStoreFiles.scanRuns), {
    schemaVersion: localStoreSchemaVersion,
    tenant_id: tenantId,
    site_id: siteId,
    outbound_link_scan_runs: sortScanRuns(store.scanRuns)
  });
  await writeJson(path.join(outputRoot, localStoreFiles.auditLogs), {
    schemaVersion: localStoreSchemaVersion,
    tenant_id: tenantId,
    site_id: siteId,
    outbound_link_audit_logs: sortAuditLogs(store.auditLogs)
  });
  await writeJson(path.join(outputRoot, localStoreFiles.manifest), manifest);

  return outputRoot;
}

function sortById(records = []) {
  return [...records].sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

function sortScanRuns(records = []) {
  return [...records].sort((a, b) => String(a.started_at ?? a.id).localeCompare(String(b.started_at ?? b.id)));
}

function sortAuditLogs(records = []) {
  return [...records].sort((a, b) => String(a.created_at ?? a.id).localeCompare(String(b.created_at ?? b.id)));
}
