const riskyQueryKeys = new Set([
  'token',
  'key',
  'api_key',
  'apikey',
  'signature',
  'sig',
  'auth',
  'password',
  'access_token',
  'code'
]);

export function redactUrlForLog(value) {
  if (!value) {
    return null;
  }
  try {
    const url = new URL(String(value));
    for (const key of [...url.searchParams.keys()]) {
      if (riskyQueryKeys.has(key.toLowerCase())) {
        url.searchParams.set(key, 'redacted');
      }
    }
    return url.toString();
  } catch {
    return String(value).replace(/([?&](?:token|key|api_key|apikey|signature|sig|auth|password|access_token|code)=)[^&\s]+/gi, '$1[redacted]');
  }
}

export function redactLinkForTrace(link = {}) {
  return {
    id: link.id ?? null,
    domain: link.domain ?? null,
    normalizedUrl: redactUrlForLog(link.normalized_url ?? link.normalizedUrl ?? null),
    status: link.status ?? null
  };
}
