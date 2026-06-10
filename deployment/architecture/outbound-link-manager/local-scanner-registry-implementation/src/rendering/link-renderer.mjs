import { normalizeOutboundUrl } from '../registry/url-normalizer.mjs';

export function renderActiveAnchor({ href, anchorText, targetBlank = true }) {
  const safeRel = 'noopener noreferrer';
  const safeTarget = targetBlank ? '_blank' : null;
  const targetPart = safeTarget ? ` target="${safeTarget}"` : '';
  return {
    renderedOutput: `<a href="${escapeAttribute(href)}"${targetPart} rel="${safeRel}">${escapeHtml(anchorText)}</a>`,
    safeRel,
    safeTarget
  };
}

export function renderDisabledSpan(anchorText) {
  return {
    renderedOutput: `<span data-outbound-link-disabled="true">${escapeHtml(anchorText)}</span>`,
    safeRel: null,
    safeTarget: null
  };
}

export function renderPlainText(anchorText) {
  return {
    renderedOutput: escapeHtml(anchorText),
    safeRel: null,
    safeTarget: null
  };
}

export function renderHidden() {
  return {
    renderedOutput: '',
    safeRel: null,
    safeTarget: null
  };
}

export function renderFallbackAnchor({ fallbackUrl, anchorText, targetBlank = true }) {
  const normalized = normalizeOutboundUrl(fallbackUrl);
  if (normalized.status !== 'normalized') {
    return {
      status: 'invalid_fallback_url',
      normalizedFallbackUrl: null,
      ...renderPlainText(anchorText)
    };
  }
  const active = renderActiveAnchor({
    href: normalized.normalized_url,
    anchorText,
    targetBlank
  });
  return {
    status: 'fallback_anchor',
    normalizedFallbackUrl: normalized.normalized_url,
    ...active
  };
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#96;');
}
