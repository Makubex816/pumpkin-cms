import { createFinding } from "../gate-status.mjs";
import { ErrorCode } from "../error-codes.mjs";
import { walkStringValues } from "./reference-utils.mjs";

const allowedPlaceholders = new Set(["TENANT_API_KEY_RUNTIME_ONLY", "PLACEHOLDER", "TODO_SECRET_AT_RUNTIME", "PROFILE_MANAGED_STATIC_ENDPOINT"]);
const assignmentTerms = ["client_secret", "access_token", "api[_-]?key", "password", "secret"];
const connectionTerms = ["DefaultEndpointsProtocol", "Account" + "Key", "SharedAccess" + "Signature"];
const cloudflarePrefixes = ["cfpat", "cf_", "cloudflare_"];

const secretPatterns = [
  { detector: "aws-access-key-shape", pattern: new RegExp("AKIA" + "[0-9A-Z]{16}") },
  { detector: "private-key-header", pattern: new RegExp("-----BEGIN " + "[A-Z ]*PRIVATE KEY-----") },
  { detector: "azure-connection-string", pattern: new RegExp(`(${connectionTerms.join("|")})=`, "i") },
  { detector: "assignment-with-secret-looking-value", pattern: new RegExp(`(${assignmentTerms.join("|")})\\s*[:=]\\s*[^\\s,;]{12,}`, "i") },
  { detector: "jwt-looking-value", pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  { detector: "cloudflare-token-looking-value", pattern: new RegExp(`(${cloudflarePrefixes.join("|")})[A-Za-z0-9_-]{20,}`, "i") },
  { detector: "sas-query-shape", pattern: /[?&](sig|signature|sv|sp|se)=/i }
];

export function scanForSecretPatterns(parsedDocuments) {
  const findings = [];

  for (const document of parsedDocuments.values()) {
    walkStringValues(document, (value, pointer, field) => {
      if (isAllowedPlaceholder(value)) {
        return;
      }

      for (const rule of secretPatterns) {
        if (rule.pattern.test(value)) {
          findings.push(
            createFinding({
              severity: "error",
              code: ErrorCode.FORBIDDEN_SECRET_LIKE_VALUE,
              file: document.relativePath,
              jsonPointer: pointer,
              field,
              message: `${document.relativePath}${pointer} contains a secret-looking value.`,
              ownerExplanation: "The import package appears to include a value that should not be stored in package files.",
              operatorDetail: `Detector ${rule.detector} matched. The value is intentionally redacted by the validator.`,
              nextAction: "Remove the secret-like value and replace it with an approved placeholder or profile-managed setting.",
              gateId: "secret-patterns"
            })
          );
        }
      }
    });
  }

  return findings;
}

function isAllowedPlaceholder(value) {
  return allowedPlaceholders.has(value);
}
