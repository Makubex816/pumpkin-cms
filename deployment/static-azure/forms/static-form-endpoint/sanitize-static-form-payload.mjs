const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const HTML_TAG_CHARS = /[<>]/g;

export function sanitizeString(value, maxLength = 2000) {
  if (value === null || value === undefined) return '';

  return String(value)
    .replace(CONTROL_CHARS, '')
    .replace(HTML_TAG_CHARS, '')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeKey(value) {
  return sanitizeString(value, 80)
    .replace(/[^a-zA-Z0-9_.:-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function sanitizeFormData(value, options = {}) {
  const maxFields = Number.isFinite(options.maxFields) ? options.maxFields : 80;
  const maxValueLength = Number.isFinite(options.maxValueLength) ? options.maxValueLength : 4000;

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value)
    .slice(0, maxFields)
    .reduce((accumulator, [rawKey, rawValue]) => {
      const key = sanitizeKey(rawKey);
      if (!key) return accumulator;

      if (Array.isArray(rawValue)) {
        accumulator[key] = rawValue.map((item) => sanitizeString(item, maxValueLength)).join(', ');
        return accumulator;
      }

      accumulator[key] = sanitizeString(rawValue, maxValueLength);
      return accumulator;
    }, {});
}

export function redactHeaders(headers = {}) {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => {
      if (/authorization|api[-_]?key|token|secret|cookie/i.test(key)) {
        return [key, '[redacted]'];
      }

      return [key, value];
    }),
  );
}
