import { buildLinkId, shortHash } from './registry-builder.mjs';

export function buildInstances({ discoveries, links, priorInstances = [], now }) {
  const linksByNormalized = new Map(links.map((link) => [link.normalized_url, link]));
  const seenIds = new Set();
  const priorByLocation = new Map(priorInstances.map((instance) => [instance.location_path, instance]));
  const instances = [];

  for (const discovery of discoveries) {
    const link = linksByNormalized.get(discovery.normalized_url);
    const id = buildInstanceId(discovery.tenant_id, discovery.site_id, link?.id ?? buildLinkId(discovery.tenant_id, discovery.site_id, discovery.normalized_url), discovery.location_path);
    seenIds.add(id);
    const prior = priorInstances.find((item) => item.id === id) ?? priorByLocation.get(discovery.location_path);
    const previousStatus = prior?.status;
    const status = classifyInstanceStatus({ linkStatus: link?.status, previousStatus });
    instances.push({
      schemaVersion: '0.1.0',
      id,
      tenant_id: discovery.tenant_id,
      site_id: discovery.site_id,
      outbound_link_id: link.id,
      page_id: discovery.page_id,
      content_type: discovery.content_type,
      content_block_id: discovery.content_block_id,
      field_name: discovery.field_name,
      anchor_text: discovery.anchor_text,
      location_path: discovery.location_path,
      is_enabled: status === 'enabled',
      status,
      first_detected_at: prior?.first_detected_at ?? now,
      last_detected_at: now
    });
  }

  for (const prior of priorInstances) {
    if (seenIds.has(prior.id)) {
      continue;
    }
    instances.push({
      ...prior,
      schemaVersion: prior.schemaVersion ?? '0.1.0',
      status: 'stale',
      is_enabled: false
    });
  }

  return instances.sort((a, b) => a.location_path.localeCompare(b.location_path));
}

export function buildInstanceId(tenantId, siteId, outboundLinkId, locationPath) {
  return `oli_${shortHash(`${tenantId}|${siteId}|${outboundLinkId}|${locationPath}`)}`;
}

function classifyInstanceStatus({ linkStatus, previousStatus }) {
  if (['disabled', 'hidden', 'plain_text', 'fallback'].includes(previousStatus)) {
    return previousStatus;
  }
  if (linkStatus === 'pending_review' || linkStatus === 'domain_blocked') {
    return 'pending_review';
  }
  if (linkStatus === 'disabled') {
    return 'disabled';
  }
  return 'enabled';
}
