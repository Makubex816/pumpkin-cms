import path from 'node:path';
import { readJson } from '../utils/json-writer.mjs';
import { resolveTmpStorePath } from '../utils/safe-paths.mjs';
import { localStoreFiles } from './store-files.mjs';

export async function readLocalStore(storePath) {
  const storeRoot = resolveTmpStorePath(storePath);
  const manifest = await readJson(path.join(storeRoot, localStoreFiles.manifest));
  const linksEnvelope = await readJson(path.join(storeRoot, localStoreFiles.links));
  const instancesEnvelope = await readJson(path.join(storeRoot, localStoreFiles.instances));
  const policiesEnvelope = await readJson(path.join(storeRoot, localStoreFiles.policies));
  const scanRunsEnvelope = await readJson(path.join(storeRoot, localStoreFiles.scanRuns));
  const auditLogsEnvelope = await readJson(path.join(storeRoot, localStoreFiles.auditLogs));

  return {
    root: storeRoot,
    tenant_id: manifest.tenant_id,
    site_id: manifest.site_id,
    manifest,
    linksEnvelope,
    instancesEnvelope,
    policiesEnvelope,
    scanRunsEnvelope,
    auditLogsEnvelope,
    links: linksEnvelope.outbound_links ?? [],
    instances: instancesEnvelope.outbound_link_instances ?? [],
    policies: policiesEnvelope.outbound_link_policies ?? [],
    scanRuns: scanRunsEnvelope.outbound_link_scan_runs ?? [],
    auditLogs: auditLogsEnvelope.outbound_link_audit_logs ?? []
  };
}

export function cloneStore(store) {
  return JSON.parse(JSON.stringify({
    tenant_id: store.tenant_id,
    site_id: store.site_id,
    manifest: store.manifest,
    links: store.links,
    instances: store.instances,
    policies: store.policies,
    policiesEnvelope: store.policiesEnvelope,
    scanRuns: store.scanRuns,
    auditLogs: store.auditLogs
  }));
}
