import crypto from 'node:crypto';

export function stableValue(value) {
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }
  if (value && typeof value === 'object' && !Buffer.isBuffer(value) && !(value instanceof Uint8Array)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stableValue(value[key])]),
    );
  }
  return value;
}

export function stableStringify(value, space = 0) {
  return JSON.stringify(stableValue(value), null, space);
}

export function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(Buffer.isBuffer(value) || value instanceof Uint8Array ? value : String(value))
    .digest('hex');
}

export function deterministicId(prefix, value, length = 24) {
  const digest = sha256(stableStringify(value));
  return `${prefix}-${digest.slice(0, length)}`;
}

export function clone(value) {
  if (Buffer.isBuffer(value)) return Buffer.from(value);
  if (value instanceof Uint8Array) return new Uint8Array(value);
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, clone(child)]));
  }
  return value;
}

export function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Buffer.isBuffer(value) || value instanceof Uint8Array) {
    return value;
  }
  for (const child of Object.values(value)) {
    deepFreeze(child);
  }
  return Object.freeze(value);
}

export function immutable(value) {
  return deepFreeze(clone(value));
}

export function canonicalDigest(value) {
  return sha256(stableStringify(value));
}
