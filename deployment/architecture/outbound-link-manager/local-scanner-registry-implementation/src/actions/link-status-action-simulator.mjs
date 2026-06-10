import { linkStatuses } from '../store/store-files.mjs';
import { selectLink } from './action-request-model.mjs';

export function simulateLinkStatusAction({ store, request }) {
  const status = request.target.status ?? request.payload.status;
  if (!linkStatuses.has(status)) {
    throw new Error(`unknown link status: ${status}`);
  }
  const link = selectLink(store, request.target);
  const updatedLink = {
    ...link,
    status,
    lifecycle_reason: request.reason,
    status_source: 'local-action-simulation',
    updated_at: request.now
  };
  if (status === 'disabled') {
    updatedLink.disabled_at = request.now;
    updatedLink.disabled_by = request.actor.actorId;
    updatedLink.disabled_reason = request.reason;
  }
  if (link.status === 'disabled' && status !== 'disabled') {
    updatedLink.disabled_at = null;
    updatedLink.disabled_by = null;
    updatedLink.disabled_reason = null;
  }
  const nextStore = {
    ...store,
    links: store.links.map((item) => item.id === link.id ? updatedLink : item)
  };
  return {
    nextStore,
    recordType: 'outbound_link',
    recordId: link.id,
    affectedLinkIds: [link.id],
    affectedInstanceIds: store.instances.filter((instance) => instance.outbound_link_id === link.id).map((instance) => instance.id),
    changes: [{
      recordType: 'outbound_link',
      recordId: link.id,
      previousValue: { status: link.status, disabled_at: link.disabled_at ?? null, disabled_reason: link.disabled_reason ?? null },
      newValue: { status: updatedLink.status, disabled_at: updatedLink.disabled_at ?? null, disabled_reason: updatedLink.disabled_reason ?? null }
    }],
    before: { status: link.status, disabled_at: link.disabled_at ?? null, disabled_reason: link.disabled_reason ?? null },
    after: { status: updatedLink.status, disabled_at: updatedLink.disabled_at ?? null, disabled_reason: updatedLink.disabled_reason ?? null }
  };
}
