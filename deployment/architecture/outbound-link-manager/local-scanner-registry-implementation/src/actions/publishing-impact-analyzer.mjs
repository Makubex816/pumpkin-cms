export function analyzePublishingImpact({ store, request, affectedLinkIds = [], affectedInstanceIds = [], domain = null }) {
  const linkIds = new Set(affectedLinkIds);
  const instanceIds = new Set(affectedInstanceIds);
  for (const instance of store.instances) {
    if (linkIds.has(instance.outbound_link_id)) {
      instanceIds.add(instance.id);
    }
  }
  for (const instance of store.instances) {
    const link = store.links.find((item) => item.id === instance.outbound_link_id);
    if (domain && link?.domain === domain) {
      linkIds.add(link.id);
      instanceIds.add(instance.id);
    }
  }

  const affectedInstances = store.instances.filter((instance) => instanceIds.has(instance.id));
  const affectedLinks = store.links.filter((link) => linkIds.has(link.id));
  const affectedPages = new Set(affectedInstances.map((instance) => instance.page_id).filter(Boolean));
  const sourceTypes = new Set(affectedInstances.map((instance) => instance.source_type ?? instance.content_type ?? 'unknown'));
  const domains = new Set(affectedLinks.map((link) => link.domain).filter(Boolean));

  return {
    schemaVersion: '0.1.0',
    impactType: 'pumpkin-outbound-link-publishing-impact',
    action: request.action,
    tenantKey: request.tenantKey,
    siteKey: request.siteKey,
    generatedAt: request.now,
    summary: {
      affectedLinkCount: affectedLinks.length,
      affectedInstanceCount: affectedInstances.length,
      affectedPageCount: affectedPages.size,
      affectedDomainCount: domains.size,
      publishedPageCount: 0,
      draftPageCount: 0,
      staticRebuildMayBeNeeded: affectedInstances.length > 0
    },
    affectedLinks: affectedLinks.map((link) => ({
      id: link.id,
      domain: link.domain,
      normalizedUrl: link.normalized_url,
      status: link.status
    })),
    affectedInstances: affectedInstances.map((instance) => ({
      id: instance.id,
      outboundLinkId: instance.outbound_link_id,
      pageId: instance.page_id ?? null,
      sourceType: instance.source_type ?? instance.content_type ?? null,
      fieldName: instance.field_name ?? null,
      status: instance.status
    })),
    groupings: {
      pages: Array.from(affectedPages).sort(),
      domains: Array.from(domains).sort(),
      sourceTypes: Array.from(sourceTypes).sort()
    },
    boundaries: localBoundaries()
  };
}

export function localBoundaries() {
  return {
    localOnly: true,
    externalHttpCrawling: false,
    cmsApiCalls: false,
    cmsWrites: false,
    protectedConfigReads: false,
    productionWriteApproved: false
  };
}
