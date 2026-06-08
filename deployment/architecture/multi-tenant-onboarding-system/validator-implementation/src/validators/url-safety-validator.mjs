import { createFinding } from "../gate-status.mjs";

const blockedUrlPatterns = [
  { code: "URL_LOCALHOST", pattern: /https?:\/\/(localhost|127\.0\.0\.1|\[::1\])/i, message: "localhost URLs are not allowed in import packages." },
  { code: "URL_FILE_PROTOCOL", pattern: /file:\/\//i, message: "file:// URLs are not allowed in import packages." },
  { code: "URL_CREDENTIALS", pattern: /^[a-z][a-z0-9+.-]*:\/\/[^/\s:@]+:[^/\s:@]+@/i, message: "URLs must not include credentials." },
  { code: "URL_SAS_QUERY", pattern: /[?&](sig|signature|sv|sp|se|token|access_token|client_secret)=/i, message: "URLs must not include SAS or secret-looking query values." }
];

export function validateUrlSafety(parsedDocuments) {
  const findings = [];

  for (const document of parsedDocuments.values()) {
    walkStrings(document.data, "", (value, pointer) => {
      if (value.startsWith("/media/")) {
        findings.push(urlFinding(document.relativePath, pointer, "URL_LOCAL_MEDIA_PATH", "Local /media production URLs are not allowed in Phase 2A-1 packages."));
      }

      for (const rule of blockedUrlPatterns) {
        if (rule.pattern.test(value)) {
          findings.push(urlFinding(document.relativePath, pointer, rule.code, rule.message));
        }
      }
    });
  }

  return findings;
}

function urlFinding(file, pointer, code, message) {
  return createFinding({
    severity: "error",
    code,
    file,
    jsonPointer: pointer,
    message: `${file}${pointer} contains a forbidden URL pattern.`,
    ownerExplanation: message,
    operatorDetail: "The validator reports the location only and does not print the full URL value.",
    nextAction: "Replace the value with an approved public URL or remove it until the package is ready.",
    gateId: "url-safety"
  });
}

function walkStrings(value, pointer, visitor) {
  if (typeof value === "string") {
    visitor(value, pointer || "/");
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, `${pointer}/${index}`, visitor));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      walkStrings(child, `${pointer}/${escapePointer(key)}`, visitor);
    }
  }
}

function escapePointer(value) {
  return String(value).replaceAll("~", "~0").replaceAll("/", "~1");
}
