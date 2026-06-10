export function normalizeDomain(hostname) {
  if (!hostname || typeof hostname !== 'string') {
    return null;
  }
  return hostname.trim().replace(/\.$/, '').toLowerCase();
}
