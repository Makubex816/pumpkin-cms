import { walkFixtureSources } from './field-path-walker.mjs';
import { extractUrlsFromString } from './url-extractor.mjs';
import { deriveAnchorText } from './anchor-text-extractor.mjs';
import { normalizeOutboundUrl } from '../registry/url-normalizer.mjs';
import { buildRegistry } from '../registry/registry-builder.mjs';
import { buildInstances } from '../registry/instance-builder.mjs';

export function scanFixture(fixture, { now = new Date() } = {}) {
  const tenantId = fixture.tenant_id;
  const siteId = fixture.site_id;
  if (!tenantId || !siteId) {
    throw new Error('fixture must include tenant_id and site_id');
  }

  const timestamp = now.toISOString();
  const entries = walkFixtureSources(fixture);
  const discoveries = [];
  const ignoredLinks = [];

  for (const entry of entries) {
    const extractedUrls = extractUrlsFromString(entry.value, { fieldName: entry.fieldName });
    for (const extracted of extractedUrls) {
      const normalized = normalizeOutboundUrl(extracted.rawUrl);
      if (normalized.status !== 'normalized') {
        ignoredLinks.push({
          original_url: normalized.original_url,
          reason: normalized.reason,
          location_path: entry.path,
          field_name: entry.fieldName,
          extraction_type: extracted.extractionType
        });
        continue;
      }
      discoveries.push({
        tenant_id: tenantId,
        site_id: siteId,
        page_id: entry.context.page_id,
        content_type: entry.context.content_type,
        content_block_id: entry.context.content_block_id,
        field_name: entry.fieldName,
        anchor_text: deriveAnchorText({
          extractedAnchorText: extracted.anchorText,
          value: entry.value,
          fieldName: entry.fieldName
        }),
        location_path: entry.path,
        extraction_type: extracted.extractionType,
        original_url: normalized.original_url,
        normalized_url: normalized.normalized_url,
        domain: normalized.domain
      });
    }
  }

  const priorState = fixture.priorState ?? {};
  const outboundLinks = buildRegistry({
    discoveries,
    priorLinks: priorState.outbound_links ?? [],
    policy: fixture.policy ?? {},
    now: timestamp
  });
  const outboundLinkInstances = buildInstances({
    discoveries,
    links: outboundLinks,
    priorInstances: priorState.outbound_link_instances ?? [],
    now: timestamp
  });

  const scanRun = {
    schemaVersion: '0.1.0',
    id: `scan_${timestamp.replace(/[^0-9]/g, '')}`,
    tenant_id: tenantId,
    site_id: siteId,
    mode: fixture.mode ?? 'local-fixture',
    status: 'completed',
    started_at: timestamp,
    completed_at: timestamp,
    pages_scanned: countPages(fixture),
    links_found: discoveries.length,
    new_links_found: outboundLinks.filter((link) => link.created_by === 'local-scanner' && link.created_at === timestamp).length,
    stale_instances_found: outboundLinkInstances.filter((instance) => instance.status === 'stale').length,
    errors: []
  };

  return {
    fixtureName: fixture.fixtureName ?? 'fixture',
    tenant_id: tenantId,
    site_id: siteId,
    discoveries,
    ignoredLinks,
    outbound_links: outboundLinks,
    outbound_link_instances: outboundLinkInstances,
    scan_run: scanRun,
    summary: {
      outboundLinkCount: outboundLinks.length,
      instanceCount: outboundLinkInstances.length,
      ignoredLinkCount: ignoredLinks.length,
      pagesScanned: scanRun.pages_scanned,
      staleInstanceCount: scanRun.stale_instances_found
    }
  };
}

function countPages(fixture) {
  const sources = Array.isArray(fixture.sources) ? fixture.sources : [];
  const pageIds = new Set();
  for (const source of sources) {
    if (source.page_id) {
      pageIds.add(source.page_id);
    }
  }
  return pageIds.size || sources.length;
}
