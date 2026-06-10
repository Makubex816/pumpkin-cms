export const renderSchemaVersion = '0.3.0';

export const renderActions = new Set([
  'active_anchor',
  'plain_text',
  'hidden',
  'disabled_span',
  'fallback_anchor',
  'pending_review_plain_text',
  'domain_blocked_plain_text'
]);

export const renderReasonCodes = new Set([
  'active_link_enabled_instance',
  'global_link_disabled',
  'instance_disabled',
  'instance_hidden',
  'instance_plain_text',
  'instance_fallback',
  'invalid_fallback_url',
  'domain_blocked_by_policy',
  'pending_review_blocked',
  'archived_or_stale_link',
  'unknown_instance',
  'unknown_link'
]);

export function buildRenderDecision({
  tenantId,
  siteId,
  pageId,
  instance,
  link,
  policyStatus,
  renderAction,
  renderedOutput,
  reasonCode,
  safeRel = null,
  safeTarget = null,
  fallbackUrl = null
}) {
  return {
    schemaVersion: renderSchemaVersion,
    tenant_id: tenantId,
    site_id: siteId,
    page_id: pageId ?? instance?.page_id ?? null,
    instance_id: instance?.id ?? null,
    outbound_link_id: link?.id ?? instance?.outbound_link_id ?? null,
    original_url: link?.original_url ?? null,
    normalized_url: link?.normalized_url ?? null,
    domain: link?.domain ?? null,
    anchor_text: instance?.anchor_text ?? '',
    link_status: link?.status ?? 'unknown',
    instance_status: instance?.status ?? 'unknown',
    policy_status: policyStatus,
    render_action: renderAction,
    rendered_output: renderedOutput,
    reason_code: reasonCode,
    safe_rel: safeRel,
    safe_target: safeTarget,
    fallback_url: fallbackUrl
  };
}
