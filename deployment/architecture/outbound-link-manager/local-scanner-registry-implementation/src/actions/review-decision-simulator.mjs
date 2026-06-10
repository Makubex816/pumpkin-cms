import { actionTypes, selectLink } from './action-request-model.mjs';

export function simulateReviewDecision({ store, request }) {
  const link = selectLink(store, request.target);
  const nextStatus = request.action === actionTypes.APPROVE_REVIEW
    ? 'active'
    : request.action === actionTypes.BLOCK_REVIEW
      ? 'domain_blocked'
      : 'pending_review';
  const decision = request.action === actionTypes.APPROVE_REVIEW
    ? 'approved'
    : request.action === actionTypes.BLOCK_REVIEW
      ? 'blocked'
      : 'ignored';
  const updatedLink = {
    ...link,
    status: nextStatus,
    review_decision: decision,
    review_reason: request.reason,
    review_decided_by: request.actor.actorId,
    review_decided_at: request.now,
    status_source: 'local-action-simulation',
    updated_at: request.now
  };
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
      previousValue: { status: link.status, review_decision: link.review_decision ?? null },
      newValue: { status: updatedLink.status, review_decision: updatedLink.review_decision }
    }],
    before: { status: link.status, review_decision: link.review_decision ?? null },
    after: { status: updatedLink.status, review_decision: updatedLink.review_decision }
  };
}
