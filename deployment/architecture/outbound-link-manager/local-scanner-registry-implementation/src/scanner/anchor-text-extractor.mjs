export function deriveAnchorText({ extractedAnchorText, value, fieldName }) {
  if (extractedAnchorText && extractedAnchorText.trim()) {
    return cleanText(extractedAnchorText);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length > 0 && !looksLikeOnlyUrl(trimmed)) {
      return cleanText(trimmed).slice(0, 120);
    }
  }
  return fieldName || null;
}

function cleanText(value) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function looksLikeOnlyUrl(value) {
  return /^(https?:\/\/|mailto:|tel:|\/)[^\s]+$/i.test(value);
}
