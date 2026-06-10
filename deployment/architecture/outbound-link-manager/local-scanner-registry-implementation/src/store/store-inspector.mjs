import { readLocalStore } from './local-store-reader.mjs';
import { getActivePolicy } from '../policies/policy-applier.mjs';

export async function inspectLocalStore(storePath) {
  const store = await readLocalStore(storePath);
  const activePolicy = getActivePolicy(store);
  return {
    tenant_id: store.tenant_id,
    site_id: store.site_id,
    linkCount: store.links.length,
    instanceCount: store.instances.length,
    policyCount: store.policies.length,
    scanRunCount: store.scanRuns.length,
    auditLogCount: store.auditLogs.length,
    activePolicyId: activePolicy?.id ?? null,
    domains: [...new Set(store.links.map((link) => link.domain))].sort(),
    linksByStatus: countBy(store.links, 'status'),
    instancesByStatus: countBy(store.instances, 'status')
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
