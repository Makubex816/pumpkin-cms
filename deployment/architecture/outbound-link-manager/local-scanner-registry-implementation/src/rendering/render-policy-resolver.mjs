import { getActivePolicy } from '../policies/policy-applier.mjs';
import {
  renderActiveAnchor,
  renderDisabledSpan,
  renderFallbackAnchor,
  renderHidden,
  renderPlainText
} from './link-renderer.mjs';

export function resolveRenderPolicy({ store, link, instance, target = {} }) {
  const activePolicy = getActivePolicy(store);
  const renderPolicy = {
    open_external_in_new_tab: true,
    allow_pending_review_active: false,
    ...(activePolicy?.rendering ?? {}),
    ...(target.render_policy ?? {})
  };
  const policyStatus = classifyPolicyStatus({ link, activePolicy, renderPolicy });
  const anchorText = target.anchor_text ?? target.anchorText ?? instance?.anchor_text ?? link?.domain ?? 'Outbound link';
  const targetBlank = renderPolicy.open_external_in_new_tab !== false;

  if (!instance) {
    const rendered = renderPlainText(anchorText);
    return {
      policyStatus: 'unknown_instance',
      renderAction: 'plain_text',
      reasonCode: 'unknown_instance',
      fallbackUrl: null,
      ...rendered
    };
  }
  if (!link) {
    const rendered = renderPlainText(anchorText);
    return {
      policyStatus: 'unknown_link',
      renderAction: 'plain_text',
      reasonCode: 'unknown_link',
      fallbackUrl: null,
      ...rendered
    };
  }
  if (policyStatus === 'domain_blocked') {
    const rendered = renderPlainText(anchorText);
    return {
      policyStatus,
      renderAction: 'domain_blocked_plain_text',
      reasonCode: 'domain_blocked_by_policy',
      fallbackUrl: null,
      ...rendered
    };
  }
  if (policyStatus === 'pending_review' && renderPolicy.allow_pending_review_active !== true) {
    const rendered = renderPlainText(anchorText);
    return {
      policyStatus,
      renderAction: 'pending_review_plain_text',
      reasonCode: 'pending_review_blocked',
      fallbackUrl: null,
      ...rendered
    };
  }
  if (instance.status === 'hidden' || target.render_mode === 'hidden') {
    const rendered = renderHidden();
    return {
      policyStatus,
      renderAction: 'hidden',
      reasonCode: 'instance_hidden',
      fallbackUrl: null,
      ...rendered
    };
  }
  if (instance.status === 'plain_text' || target.render_mode === 'plain_text') {
    const rendered = renderPlainText(anchorText);
    return {
      policyStatus,
      renderAction: 'plain_text',
      reasonCode: 'instance_plain_text',
      fallbackUrl: null,
      ...rendered
    };
  }
  if (instance.status === 'fallback' || target.render_mode === 'fallback') {
    const fallback = renderFallbackAnchor({
      fallbackUrl: target.fallback_url,
      anchorText: target.fallback_anchor_text ?? anchorText,
      targetBlank
    });
    if (fallback.status !== 'fallback_anchor') {
      return {
        policyStatus,
        renderAction: 'plain_text',
        reasonCode: 'invalid_fallback_url',
        fallbackUrl: null,
        renderedOutput: fallback.renderedOutput,
        safeRel: fallback.safeRel,
        safeTarget: fallback.safeTarget
      };
    }
    return {
      policyStatus,
      renderAction: 'fallback_anchor',
      reasonCode: 'instance_fallback',
      fallbackUrl: fallback.normalizedFallbackUrl,
      renderedOutput: fallback.renderedOutput,
      safeRel: fallback.safeRel,
      safeTarget: fallback.safeTarget
    };
  }
  if (instance.status === 'disabled' || instance.status === 'stale') {
    const rendered = renderDisabledSpan(anchorText);
    return {
      policyStatus,
      renderAction: 'disabled_span',
      reasonCode: 'instance_disabled',
      fallbackUrl: null,
      ...rendered
    };
  }
  if (['disabled', 'archived', 'stale', 'broken_unverified'].includes(link.status)) {
    const rendered = renderDisabledSpan(anchorText);
    return {
      policyStatus,
      renderAction: 'disabled_span',
      reasonCode: link.status === 'disabled' ? 'global_link_disabled' : 'archived_or_stale_link',
      fallbackUrl: null,
      ...rendered
    };
  }

  const active = renderActiveAnchor({
    href: link.normalized_url,
    anchorText,
    targetBlank
  });
  return {
    policyStatus,
    renderAction: 'active_anchor',
    reasonCode: 'active_link_enabled_instance',
    fallbackUrl: null,
    ...active
  };
}

function classifyPolicyStatus({ link, activePolicy, renderPolicy }) {
  if (!link) {
    return 'unknown_link';
  }
  const domain = (link.domain ?? '').toLowerCase();
  if (link.status === 'domain_blocked' || (activePolicy?.blocked_domains ?? []).includes(domain)) {
    return 'domain_blocked';
  }
  if (link.status === 'pending_review' || (activePolicy?.pending_review_domains ?? []).includes(domain)) {
    return renderPolicy.allow_pending_review_active === true ? 'pending_review_allowed' : 'pending_review';
  }
  if (activePolicy?.review_required_for_new_domains === true && !(activePolicy.allowed_domains ?? []).includes(domain)) {
    return renderPolicy.allow_pending_review_active === true ? 'pending_review_allowed' : 'pending_review';
  }
  return 'allowed';
}
