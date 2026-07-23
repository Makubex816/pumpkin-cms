import { ContractError } from './contracts.mjs';

const SAFE_IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const SAFE_BACKEND_IDENTIFIER = /^[a-z0-9](?:[a-z0-9-]{0,126}[a-z0-9])?$/;
const SHA256 = /^[a-f0-9]{64}$/;

const FORBIDDEN_KEY_NAMES = new Set([
  'password',
  'passwd',
  'apikey',
  'clientsecret',
  'privatekey',
  'connectionstring',
  'accountkey',
  'sharedaccesssignature',
  'deploymenttoken',
  'bearertoken',
  'accesstoken',
  'refreshtoken',
  'secretvalue',
  'credentialvalue',
  'plaintextvalue',
  'tokenvalue',
  'rawlogs',
  'rawlog',
  'customerpayload',
]);

const FORBIDDEN_VALUE_PATTERNS = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
  /\bAccountKey=[A-Za-z0-9+/=]{12,}/i,
  /\bSharedAccessSignature=sv=/i,
  /\b(?:client_secret|clientSecret)\s*[:=]\s*["'][^"']+["']/i,
  /\b(?:password|passwd)\s*[:=]\s*["'][^"']+["']/i,
  /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{16,}\b/,
];

const ABSOLUTE_PATH_PATTERNS = [
  /(?:^|[\s"'(])(?:[A-Za-z]:[\\/])/,
  /file:\/\//i,
  /(?:^|[\s"'(])\/(?:Users|home|mnt|tmp|var\/folders)\//,
  /\\\\[A-Za-z0-9._-]+\\[A-Za-z0-9$._-]+\\/,
];

export function assertSafeIdentifier(value, label, { backend = false } = {}) {
  const pattern = backend ? SAFE_BACKEND_IDENTIFIER : SAFE_IDENTIFIER;
  if (typeof value !== 'string' || !pattern.test(value)) {
    throw new ContractError('identifier_invalid', `${label} must be a bounded public identifier.`, { label });
  }
  return value;
}

export function assertSha256(value, label) {
  if (typeof value !== 'string' || !SHA256.test(value)) {
    throw new ContractError('sha256_invalid', `${label} must be a lowercase SHA-256 digest.`, { label });
  }
  return value;
}

export function normalizeRoute(value, label = 'route') {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\') || /[?#]/.test(value)) {
    throw new ContractError('route_invalid', `${label} must be a root-relative URL path.`, { label, value });
  }
  const parts = value.split('/').filter(Boolean);
  if (parts.some((part) => part === '.' || part === '..')) {
    throw new ContractError('route_traversal', `${label} contains traversal.`, { label, value });
  }
  return parts.length === 0 ? '/' : `/${parts.join('/')}`;
}

export function routeToArtifactPath(route) {
  const normalized = normalizeRoute(route);
  return normalized === '/' ? 'index.html' : `${normalized.slice(1)}/index.html`;
}

export function assertSafeArtifactPath(value, label = 'artifact path') {
  if (typeof value !== 'string' || value.length === 0 || value.startsWith('/') || value.includes('\\') || /^[A-Za-z]:/.test(value)) {
    throw new ContractError('artifact_path_invalid', `${label} must be a relative POSIX path.`, { value });
  }
  const parts = value.split('/');
  if (parts.some((part) => !part || part === '.' || part === '..')) {
    throw new ContractError('artifact_path_traversal', `${label} contains an unsafe segment.`, { value });
  }
  if (Buffer.byteLength(value) > 100) {
    throw new ContractError('artifact_path_too_long', `${label} exceeds the deterministic TAR path limit.`, { value });
  }
  return value;
}

export function assertSafeRelativeReference(value, label) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new ContractError('relative_reference_invalid', `${label} is required.`);
  }
  const normalized = value.replaceAll('\\', '/');
  if (normalized.startsWith('/') || normalized.startsWith('~') || /^[A-Za-z]:/.test(normalized) || normalized.split('/').some((part) => part === '..')) {
    throw new ContractError('absolute_path_forbidden', `${label} must be repository-relative.`, { value });
  }
  return normalized;
}

export function assertHttpsUrl(value, label) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new ContractError('https_url_invalid', `${label} must be a valid HTTPS URL.`);
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new ContractError('https_url_invalid', `${label} must be credential-free HTTPS without query or fragment data.`);
  }
  return parsed.toString().replace(/\/$/, '');
}

export function findForbiddenData(value, currentPath = '$', hits = []) {
  if (Array.isArray(value)) {
    value.forEach((child, index) => findForbiddenData(child, `${currentPath}[${index}]`, hits));
    return hits;
  }
  if (value && typeof value === 'object' && !Buffer.isBuffer(value) && !(value instanceof Uint8Array)) {
    for (const [key, child] of Object.entries(value)) {
      const normalizedKey = key.replace(/[^a-z0-9]/gi, '').toLowerCase();
      if (FORBIDDEN_KEY_NAMES.has(normalizedKey)) {
        hits.push({ code: 'forbidden_key', path: `${currentPath}.${key}` });
      }
      findForbiddenData(child, `${currentPath}.${key}`, hits);
    }
    return hits;
  }
  if (typeof value === 'string') {
    for (const pattern of FORBIDDEN_VALUE_PATTERNS) {
      if (pattern.test(value)) {
        hits.push({ code: 'secret_like_value', path: currentPath });
        break;
      }
    }
  }
  return hits;
}

export function assertNoForbiddenData(value, label = 'document') {
  const hits = findForbiddenData(value);
  if (hits.length > 0) {
    throw new ContractError('forbidden_data', `${label} contains forbidden secret or payload data.`, { hits });
  }
}

export function assertDistributableHygiene(files) {
  const seen = new Set();
  for (const file of files) {
    assertSafeArtifactPath(file.path);
    if (seen.has(file.path)) {
      throw new ContractError('artifact_path_collision', `Duplicate artifact path: ${file.path}`);
    }
    seen.add(file.path);
    const text = Buffer.isBuffer(file.content) ? file.content.toString('utf8') : String(file.content);
    for (const pattern of ABSOLUTE_PATH_PATTERNS) {
      if (pattern.test(text)) {
        throw new ContractError('absolute_path_in_artifact', `Artifact contains an absolute local path: ${file.path}`);
      }
    }
    for (const pattern of FORBIDDEN_VALUE_PATTERNS) {
      if (pattern.test(text)) {
        throw new ContractError('secret_like_value_in_artifact', `Artifact contains secret-like data: ${file.path}`);
      }
    }
  }
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function escapeJsonForHtml(value) {
  return String(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
}
