import { normalizeDomain } from './domain-normalizer.mjs';

const allowedProtocols = new Set(['http:', 'https:']);
const contactProtocols = new Set(['mailto:', 'tel:']);

export function normalizeOutboundUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { status: 'ignored', reason: 'empty_url', original_url: rawUrl ?? '' };
  }

  const original = rawUrl.trim();
  if (original.startsWith('/')) {
    return { status: 'ignored', reason: 'internal_relative_url', original_url: original };
  }

  let parsed;
  try {
    parsed = new URL(original);
  } catch {
    return { status: 'ignored', reason: 'not_absolute_url', original_url: original };
  }

  if (contactProtocols.has(parsed.protocol)) {
    return { status: 'ignored', reason: 'contact_link_not_web_outbound', original_url: original };
  }

  if (!allowedProtocols.has(parsed.protocol)) {
    return { status: 'ignored', reason: 'unsupported_protocol', original_url: original };
  }

  if (parsed.username || parsed.password) {
    return { status: 'ignored', reason: 'embedded_credentials_rejected', original_url: original };
  }

  parsed.protocol = parsed.protocol.toLowerCase();
  parsed.hostname = normalizeDomain(parsed.hostname);
  if ((parsed.protocol === 'http:' && parsed.port === '80') || (parsed.protocol === 'https:' && parsed.port === '443')) {
    parsed.port = '';
  }
  parsed.hash = '';

  return {
    status: 'normalized',
    original_url: original,
    normalized_url: parsed.toString(),
    domain: normalizeDomain(parsed.hostname)
  };
}
