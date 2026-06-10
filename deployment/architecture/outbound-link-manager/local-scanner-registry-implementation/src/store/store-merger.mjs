import path from 'node:path';
import { appendAuditLog } from '../audit/audit-log-writer.mjs';
import { validateScanOutput } from '../validators/outbound-link-validator.mjs';
import { readJson } from '../utils/json-writer.mjs';
import { resolveTmpScanPath } from '../utils/safe-paths.mjs';
import { applyPolicyToStore, classifyInstanceStatus } from '../policies/policy-applier.mjs';
import {
  localStoreSchemaVersion,
  manuallyPreservedInstanceStatuses,
  manuallyPreservedLinkStatuses
} from './store-files.mjs';
import { cloneStore, readLocalStore } from './local-store-reader.mjs';
import { writeLocalStore } from './local-store-writer.mjs';

export async function mergeScanIntoStore({
  storePath,
  scanPath,
  outputPath,
  overwrite = false,
  now = new Date(),
  markMissingStale = true
}) {
  const timestamp = typeof now === 'string' ? now : now.toISOString();
  const validation = await validateScanOutput({ scanPath, writeReport: false });
  if (validation.status !== 'passed') {
    throw new Error('scan output must validate before merge');
  }

  const store = cloneStore(await readLocalStore(storePath));
  const scanRoot = resolveTmpScanPath(scanPath);
  const scanLinksEnvelope = await readJson(path.join(scanRoot, 'outbound-links.json'));
  const scanInstancesEnvelope = await readJson(path.join(scanRoot, 'outbound-link-instances.json'));
  const scanRun = await readJson(path.join(scanRoot, 'outbound-link-scan-run.json'));

  assertSameScope(store, scanLinksEnvelope, 'scan links');
  assertSameScope(store, scanInstancesEnvelope, 'scan instances');
  assertSameScope(store, scanRun, 'scan run');

  const linksResult = mergeLinks({
    existingLinks: store.links,
    scanLinks: scanLinksEnvelope.outbound_links ?? [],
    scanRun,
    timestamp,
    markMissingStale
  });
  const instancesResult = mergeInstances({
    existingInstances: store.instances,
    scanInstances: scanInstancesEnvelope.outbound_link_instances ?? [],
    links: linksResult.links,
    scanRun,
    timestamp,
    markMissingStale
  });

  const nextStore = {
    ...store,
    links: linksResult.links,
    instances: instancesResult.instances,
    scanRuns: appendScanRun(store.scanRuns, scanRun, timestamp)
  };
  const policyResult = applyPolicyToStore(nextStore, { now: timestamp });
  const audited = appendAuditLog(policyResult.store, {
    action: 'scan_merged',
    recordType: 'scan_run',
    recordId: scanRun.id,
    actor: 'local-cli',
    reason: 'merged local scan output into file-backed store',
    before: {
      link_count: store.links.length,
      instance_count: store.instances.length
    },
    after: {
      link_count: policyResult.store.links.length,
      instance_count: policyResult.store.instances.length,
      new_links: linksResult.newLinkCount,
      updated_links: linksResult.updatedLinkCount,
      stale_links: linksResult.staleLinkCount,
      new_instances: instancesResult.newInstanceCount,
      updated_instances: instancesResult.updatedInstanceCount,
      stale_instances: instancesResult.staleInstanceCount,
      policy_changed_links: policyResult.changedLinkCount,
      policy_changed_instances: policyResult.changedInstanceCount
    },
    now: timestamp
  });

  const outputRoot = await writeLocalStore({
    store: audited,
    outputPath,
    overwrite,
    now: timestamp
  });

  return {
    outputRoot,
    summary: {
      linkCount: audited.links.length,
      instanceCount: audited.instances.length,
      scanRunCount: audited.scanRuns.length,
      auditLogCount: audited.auditLogs.length,
      ...linksResult.summary,
      ...instancesResult.summary
    }
  };
}

function mergeLinks({ existingLinks, scanLinks, scanRun, timestamp, markMissingStale }) {
  const byNormalized = new Map(existingLinks.map((link) => [`${link.tenant_id}|${link.site_id}|${link.normalized_url}`, { ...link }]));
  const discoveredKeys = new Set();
  let newLinkCount = 0;
  let updatedLinkCount = 0;
  let staleLinkCount = 0;

  for (const scanLink of scanLinks) {
    const key = `${scanLink.tenant_id}|${scanLink.site_id}|${scanLink.normalized_url}`;
    discoveredKeys.add(key);
    const existing = byNormalized.get(key);
    if (!existing) {
      newLinkCount += 1;
      byNormalized.set(key, {
        ...scanLink,
        schemaVersion: localStoreSchemaVersion,
        first_detected_at: scanLink.created_at ?? timestamp,
        last_detected_at: timestamp,
        detection_count: 1,
        last_scan_run_id: scanRun.id,
        status_source: 'local-scan'
      });
      continue;
    }
    updatedLinkCount += 1;
    const status = manuallyPreservedLinkStatuses.has(existing.status) ? existing.status : scanLink.status;
    byNormalized.set(key, {
      ...existing,
      schemaVersion: localStoreSchemaVersion,
      original_url: existing.original_url ?? scanLink.original_url,
      domain: scanLink.domain,
      normalized_url: scanLink.normalized_url,
      status,
      first_detected_at: existing.first_detected_at ?? existing.created_at ?? scanLink.created_at ?? timestamp,
      last_detected_at: timestamp,
      detection_count: (existing.detection_count ?? 0) + 1,
      last_scan_run_id: scanRun.id,
      updated_at: timestamp,
      status_preserved_from_prior: status === existing.status && status !== scanLink.status
    });
  }

  if (markMissingStale) {
    for (const [key, link] of byNormalized.entries()) {
      if (discoveredKeys.has(key) || manuallyPreservedLinkStatuses.has(link.status)) {
        continue;
      }
      staleLinkCount += 1;
      byNormalized.set(key, {
        ...link,
        status: 'stale',
        status_source: 'local-scan-missing',
        last_missing_at: timestamp,
        updated_at: timestamp
      });
    }
  }

  const links = [...byNormalized.values()].sort((a, b) => a.normalized_url.localeCompare(b.normalized_url));
  return {
    links,
    newLinkCount,
    updatedLinkCount,
    staleLinkCount,
    summary: {
      newLinkCount,
      updatedLinkCount,
      staleLinkCount
    }
  };
}

function mergeInstances({ existingInstances, scanInstances, links, scanRun, timestamp, markMissingStale }) {
  const byId = new Map(existingInstances.map((instance) => [instance.id, { ...instance }]));
  const seenIds = new Set();
  const linksById = new Map(links.map((link) => [link.id, link]));
  let newInstanceCount = 0;
  let updatedInstanceCount = 0;
  let staleInstanceCount = 0;

  for (const scanInstance of scanInstances) {
    seenIds.add(scanInstance.id);
    const existing = byId.get(scanInstance.id);
    const link = linksById.get(scanInstance.outbound_link_id);
    if (!existing) {
      newInstanceCount += 1;
      const status = classifyInstanceStatus(scanInstance, link);
      byId.set(scanInstance.id, {
        ...scanInstance,
        schemaVersion: localStoreSchemaVersion,
        status,
        is_enabled: status === 'enabled',
        first_detected_at: scanInstance.first_detected_at ?? timestamp,
        last_detected_at: timestamp,
        detection_count: 1,
        last_scan_run_id: scanRun.id,
        status_source: 'local-scan'
      });
      continue;
    }
    updatedInstanceCount += 1;
    const status = manuallyPreservedInstanceStatuses.has(existing.status)
      ? existing.status
      : classifyInstanceStatus(scanInstance, link);
    byId.set(scanInstance.id, {
      ...existing,
      schemaVersion: localStoreSchemaVersion,
      page_id: scanInstance.page_id,
      content_type: scanInstance.content_type,
      content_block_id: scanInstance.content_block_id,
      field_name: scanInstance.field_name,
      anchor_text: scanInstance.anchor_text,
      location_path: scanInstance.location_path,
      status,
      is_enabled: status === 'enabled',
      first_detected_at: existing.first_detected_at ?? scanInstance.first_detected_at ?? timestamp,
      last_detected_at: timestamp,
      detection_count: (existing.detection_count ?? 0) + 1,
      last_scan_run_id: scanRun.id,
      updated_at: timestamp,
      status_preserved_from_prior: status === existing.status && status !== scanInstance.status
    });
  }

  if (markMissingStale) {
    for (const [id, instance] of byId.entries()) {
      if (seenIds.has(id) || instance.status === 'stale') {
        continue;
      }
      staleInstanceCount += 1;
      byId.set(id, {
        ...instance,
        status: 'stale',
        is_enabled: false,
        status_source: 'local-scan-missing',
        last_missing_at: timestamp,
        updated_at: timestamp
      });
    }
  }

  const instances = [...byId.values()].sort((a, b) => a.location_path.localeCompare(b.location_path));
  return {
    instances,
    newInstanceCount,
    updatedInstanceCount,
    staleInstanceCount,
    summary: {
      newInstanceCount,
      updatedInstanceCount,
      staleInstanceCount
    }
  };
}

function appendScanRun(scanRuns, scanRun, timestamp) {
  const filtered = scanRuns.filter((item) => item.id !== scanRun.id);
  return [...filtered, {
    ...scanRun,
    schemaVersion: localStoreSchemaVersion,
    merged_at: timestamp,
    source: 'local-scan-output'
  }];
}

function assertSameScope(store, envelope, label) {
  if (envelope.tenant_id !== store.tenant_id || envelope.site_id !== store.site_id) {
    throw new Error(`${label} scope does not match local store`);
  }
}
