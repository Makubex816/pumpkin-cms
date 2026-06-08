import { createFinding } from "../gate-status.mjs";

const secretAssignmentTerms = ["client_secret", "access_token", "api[_-]?key", "password"];
const connectionStringTerms = ["DefaultEndpointsProtocol", "Account" + "Key", "SharedAccess" + "Signature"];

const secretPatterns = [
  { code: "SECRET_AWS_ACCESS_KEY", pattern: new RegExp("AKIA" + "[0-9A-Z]{16}") },
  { code: "SECRET_PRIVATE_KEY", pattern: new RegExp("-----BEGIN " + "[A-Z ]*PRIVATE KEY-----") },
  { code: "SECRET_CONNECTION_STRING", pattern: new RegExp(`(${connectionStringTerms.join("|")})=`, "i") },
  { code: "SECRET_ASSIGNMENT", pattern: new RegExp(`(${secretAssignmentTerms.join("|")})\\s*[:=]\\s*[A-Za-z0-9_./+=%-]{12,}`, "i") }
];

export function scanForSecretPatterns(parsedDocuments) {
  const findings = [];

  for (const document of parsedDocuments.values()) {
    walkStrings(document.data, "", (value, pointer) => {
      if (value === "TENANT_API_KEY_RUNTIME_ONLY") {
        return;
      }

      for (const rule of secretPatterns) {
        if (rule.pattern.test(value)) {
          findings.push(
            createFinding({
              severity: "error",
              code: rule.code,
              file: document.relativePath,
              jsonPointer: pointer,
              message: `${document.relativePath}${pointer} contains a secret-looking value.`,
              ownerExplanation: "The import package appears to include a value that should not be stored in package files.",
              operatorDetail: "The value is intentionally redacted by the validator.",
              nextAction: "Remove the secret and replace it with an approved placeholder or profile-managed setting.",
              gateId: "secret-patterns"
            })
          );
        }
      }
    });
  }

  return findings;
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
