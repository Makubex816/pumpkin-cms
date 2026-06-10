import { shortHash } from '../registry/registry-builder.mjs';

export function simulateScanRunCreation({ store, request }) {
  const scanRun = {
    schemaVersion: '0.2.0',
    id: `olsr_local_action_${shortHash(`${request.operationId}|${store.scanRuns.length}`)}`,
    tenant_id: store.tenant_id,
    site_id: store.site_id,
    status: 'simulated_local_only',
    mode: 'local-offline-action-simulation',
    started_at: request.now,
    completed_at: request.now,
    pages_scanned: request.payload.pagesScanned ?? 0,
    links_found: store.links.length,
    new_links_found: 0,
    stale_instances_found: store.instances.filter((instance) => instance.status === 'stale').length,
    external_http_crawling: false,
    cms_api_calls: false,
    cms_writes: false
  };
  const nextStore = {
    ...store,
    scanRuns: [...store.scanRuns.filter((item) => item.id !== scanRun.id), scanRun]
  };
  return {
    nextStore,
    recordType: 'outbound_link_scan_run',
    recordId: scanRun.id,
    affectedLinkIds: store.links.map((link) => link.id),
    affectedInstanceIds: store.instances.map((instance) => instance.id),
    changes: [{
      recordType: 'outbound_link_scan_run',
      recordId: scanRun.id,
      previousValue: null,
      newValue: scanRun
    }],
    before: null,
    after: scanRun
  };
}
