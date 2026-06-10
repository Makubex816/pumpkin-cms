export function simulateBulkActionPreflight({ store, request }) {
  const domain = request.target.domain;
  if (!domain && request.action !== 'bulk_page_instances') {
    throw new Error('bulk domain action requires target.domain');
  }
  const isPageInstanceAction = request.action === 'bulk_page_instances';
  const matchedLinks = store.links.filter((link) => {
    if (isPageInstanceAction) return false;
    return link.domain === domain;
  });
  const matchedLinkIds = new Set(matchedLinks.map((link) => link.id));
  const matchedInstances = store.instances.filter((instance) => {
    if (isPageInstanceAction) {
      return instance.page_id === request.target.pageId;
    }
    return matchedLinkIds.has(instance.outbound_link_id);
  });
  const status = request.action === 'bulk_domain_review' ? 'pending_review' : 'disabled';
  const nextLinks = store.links.map((link) => {
    if (isPageInstanceAction) return link;
    if (!matchedLinkIds.has(link.id)) return link;
    return {
      ...link,
      status,
      status_source: 'local-bulk-action-simulation',
      lifecycle_reason: request.reason,
      updated_at: request.now,
      disabled_at: status === 'disabled' ? request.now : link.disabled_at ?? null,
      disabled_by: status === 'disabled' ? request.actor.actorId : link.disabled_by ?? null,
      disabled_reason: status === 'disabled' ? request.reason : link.disabled_reason ?? null
    };
  });
  const nextInstances = store.instances.map((instance) => {
    if (!matchedInstances.some((item) => item.id === instance.id)) return instance;
    const instanceStatus = request.action === 'bulk_page_instances'
      ? request.target.instanceStatus ?? request.payload.status ?? 'plain_text'
      : status === 'disabled'
        ? 'plain_text'
        : 'pending_review';
    return {
      ...instance,
      status: instanceStatus,
      is_enabled: instanceStatus === 'enabled',
      status_source: 'local-bulk-action-simulation',
      lifecycle_reason: request.reason,
      updated_at: request.now
    };
  });
  return {
    nextStore: {
      ...store,
      links: nextLinks,
      instances: nextInstances
    },
    recordType: 'bulk_action',
    recordId: request.operationId,
    affectedLinkIds: isPageInstanceAction
      ? [...new Set(matchedInstances.map((instance) => instance.outbound_link_id))]
      : matchedLinks.map((link) => link.id),
    affectedInstanceIds: matchedInstances.map((instance) => instance.id),
    changes: [
      ...matchedLinks.map((link) => {
        const updated = nextLinks.find((item) => item.id === link.id);
        return {
          recordType: 'outbound_link',
          recordId: link.id,
          previousValue: { status: link.status, disabled_at: link.disabled_at ?? null },
          newValue: { status: updated.status, disabled_at: updated.disabled_at ?? null }
        };
      }),
      ...matchedInstances.map((instance) => {
        const updated = nextInstances.find((item) => item.id === instance.id);
        return {
          recordType: 'outbound_link_instance',
          recordId: instance.id,
          previousValue: { status: instance.status, is_enabled: instance.is_enabled },
          newValue: { status: updated.status, is_enabled: updated.is_enabled }
        };
      })
    ],
    before: {
      matchedLinkCount: matchedLinks.length,
      matchedInstanceCount: matchedInstances.length
    },
    after: {
      previewId: request.operationId,
      expectedLinkCount: matchedLinks.length,
      expectedInstanceCount: matchedInstances.length,
      executionMode: 'local-sandbox-simulation'
    }
  };
}
