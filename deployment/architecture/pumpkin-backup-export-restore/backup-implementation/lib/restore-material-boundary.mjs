const forbiddenExactKeys = new Set([
  'apikey',
  'authorization',
  'clientsecret',
  'credential',
  'jwt',
  'privatekey',
  'secret',
  'signingkey',
  'signingmaterial',
  'signingsecret',
  'submissionticket',
  'ticket',
  'ticketsignature',
  'token'
]);

export function findForbiddenRestoreMaterialPaths(value, rootPath = 'record') {
  const paths = [];
  const visited = new WeakSet();
  visit(value, rootPath, paths, visited);
  return paths;
}

export function assertNoForbiddenRestoreMaterial(value, rootPath = 'record') {
  const paths = findForbiddenRestoreMaterialPaths(value, rootPath);
  if (paths.length > 0) {
    throw new Error(`restore representation contains ticket, signing, or credential material: ${paths.join(', ')}`);
  }
}

function visit(value, currentPath, paths, visited) {
  if (!value || typeof value !== 'object') return;
  if (visited.has(value)) return;
  visited.add(value);

  if (Array.isArray(value)) {
    value.forEach((item, index) => visit(item, `${currentPath}[${index}]`, paths, visited));
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    const normalized = normalizeKey(key);
    if (isForbiddenKey(normalized)) {
      paths.push(`${currentPath}.${key}`);
      continue;
    }
    visit(child, `${currentPath}.${key}`, paths, visited);
  }
}

function isForbiddenKey(normalized) {
  return (
    forbiddenExactKeys.has(normalized) ||
    normalized.endsWith('submissionticket') ||
    normalized.startsWith('signing') ||
    normalized.endsWith('signingkey') ||
    normalized.endsWith('signingsecret') ||
    normalized.endsWith('privatekey') ||
    normalized.endsWith('accesstoken') ||
    normalized.endsWith('refreshtoken')
  );
}

function normalizeKey(value) {
  return String(value).replace(/[^a-z0-9]/gi, '').toLowerCase();
}
