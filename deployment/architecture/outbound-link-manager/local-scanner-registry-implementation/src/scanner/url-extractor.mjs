const markdownLinkPattern = /\[([^\]]*)\]\(([^)\s]+)\)/g;
const htmlAnchorPattern = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
const bareUrlPattern = /\bhttps?:\/\/[^\s<>"')\]]+/gi;
const linkBearingFields = new Set(['url', 'href', 'link', 'ctaurl', 'externalurl', 'linkurl', 'internalurl', 'contactemail', 'phone']);

export function extractUrlsFromString(value, { fieldName = null } = {}) {
  if (typeof value !== 'string' || value.length === 0) {
    return [];
  }

  const findings = [];
  const seen = new Set();

  for (const match of value.matchAll(markdownLinkPattern)) {
    addFinding(findings, seen, {
      rawUrl: trimTrailingPunctuation(match[2]),
      anchorText: match[1],
      extractionType: 'markdown'
    });
  }

  for (const match of value.matchAll(htmlAnchorPattern)) {
    addFinding(findings, seen, {
      rawUrl: trimTrailingPunctuation(match[1]),
      anchorText: stripTags(match[2]),
      extractionType: 'html-anchor'
    });
  }

  for (const match of value.matchAll(bareUrlPattern)) {
    addFinding(findings, seen, {
      rawUrl: trimTrailingPunctuation(match[0]),
      anchorText: null,
      extractionType: 'bare-url'
    });
  }

  if (findings.length === 0 && isLinkBearingField(fieldName) && looksLikeLinkValue(value)) {
    addFinding(findings, seen, {
      rawUrl: value.trim(),
      anchorText: null,
      extractionType: 'declared-field'
    });
  }

  return findings;
}

export function isLinkBearingField(fieldName) {
  if (!fieldName) {
    return false;
  }
  const normalized = fieldName.replace(/\[\d+\]$/, '').toLowerCase();
  return linkBearingFields.has(normalized) || /(url|href|link|email|phone)$/i.test(normalized);
}

function addFinding(findings, seen, finding) {
  const rawUrl = finding.rawUrl?.trim();
  if (!rawUrl) {
    return;
  }
  const key = rawUrl;
  if (seen.has(key)) {
    return;
  }
  seen.add(key);
  findings.push({ ...finding, rawUrl });
}

function looksLikeLinkValue(value) {
  const trimmed = value.trim();
  return /^(https?:\/\/|mailto:|tel:|\/)[^\s]+$/i.test(trimmed);
}

function trimTrailingPunctuation(value) {
  return value.trim().replace(/[.,;:!?]+$/g, '');
}

function stripTags(value) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
