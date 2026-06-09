const forbiddenNormalizedKeys = new Set([
  'apikey',
  'apikeyvalue',
  'accountkey',
  'storagekey',
  'primarykey',
  'secondarykey',
  'privatekey',
  'connectionstring',
  'token',
  'tokenvalue',
  'accesstoken',
  'refreshtoken',
  'jwt',
  'jwtvalue',
  'password',
  'passwordvalue',
  'secret',
  'secretvalue',
  'clientsecret',
  'sas',
  'sasurl',
  'authheader',
  'authorization',
  'cookie',
  'cookievalue',
  'rawconfig',
  'configvalue'
]);

const allowedNormalizedKeys = new Set([
  'credentialrefid',
  'credentialrefs',
  'credentialreferences',
  'requiredcredentialreferences',
  'secretrefs',
  'secretreferences',
  'valuestatus',
  'valueincluded',
  'valuesincluded',
  'nonsecretidentifiers'
]);

const valueMarkers = Object.freeze([
  ['Account', 'Key='].join(''),
  ['Shared', 'Access', 'Signature'].join(''),
  ['s', 'ig='].join(''),
  ['Bea', 'rer '].join(''),
  ['-----', 'BEGIN'].join(''),
  ['mongodb', '://'].join(''),
  ['Default', 'Endpoints', 'Protocol='].join(''),
  ['Account', 'Endpoint='].join('')
]);

export function findSecretLikeData(value, path = '$') {
  const hits = [];
  if (Array.isArray(value)) {
    value.forEach((item, index) => hits.push(...findSecretLikeData(item, `${path}[${index}]`)));
    return hits;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (isForbiddenKey(key)) {
        hits.push({ kind: 'field', path: `${path}.${key}`, marker: key });
      }
      hits.push(...findSecretLikeData(child, `${path}.${key}`));
    }
    return hits;
  }
  if (typeof value === 'string' && hasSecretLikeText(value)) {
    hits.push({ kind: 'value', path, marker: 'secret-like-text' });
  }
  return hits;
}

export function hasSecretLikeText(text) {
  if (valueMarkers.some((marker) => text.includes(marker))) {
    return true;
  }
  const namedFieldPattern = [
    'pass' + 'word',
    'client_' + 'secret',
    'access_' + 'token',
    'refresh_' + 'token',
    'connection' + 'string',
    'connection_' + 'string',
    'storage' + 'key',
    'storage_' + 'key',
    'api[_-]?' + 'key',
    'j' + 'wt',
    'to' + 'ken',
    'se' + 'cret'
  ].join('|');
  const patterns = [
    new RegExp(`${'ey' + 'J'}[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}`),
    new RegExp(`${'AK' + 'IA'}[0-9A-Z]{16}`),
    new RegExp(`["']?(${namedFieldPattern})["']?\\s*[:=]\\s*["'](?!PLACEHOLDER|REDACTED|NOT_COLLECTED|EXCLUDED|NOT_INCLUDED|false|none|null)[^"'\\s]{8,}`, 'i')
  ];
  return patterns.some((pattern) => pattern.test(text));
}

function isForbiddenKey(key) {
  const normalized = key.replace(/[^a-z0-9]/gi, '').toLowerCase();
  return forbiddenNormalizedKeys.has(normalized) && !allowedNormalizedKeys.has(normalized);
}

