import { createFinding } from "../gate-status.mjs";
import { ErrorCode } from "../error-codes.mjs";
import { parseHttpUrl, walkStringValues } from "./reference-utils.mjs";

const stagingHostPatterns = [/azurestaticapps\.net/i, /azurewebsites\.net/i, /pages\.dev/i, /web\.core\.windows\.net/i, /staging/i, /preview/i, /default-host/i];
const protectedPathPatterns = [/\.env(\.|$|[\\/])/i, /appsettings\.development\.json/i, /local\.settings\.json/i, /credential/i, /secret/i];
const secretQueryNames = new Set(["sig", "signature", "token", "access_token", "api_key", "apikey", "client_secret", "code", "se", "sp", "sv"]);

export function validateUrlSafety(parsedDocuments) {
  const findings = [];

  for (const document of parsedDocuments.values()) {
    walkStringValues(document, (value, pointer, field) => {
      if (isAllowedPlaceholder(value)) {
        return;
      }

      const context = getUrlContext(pointer, field);
      if (isLocalUrl(value) || isWindowsPath(value) || isLocalMediaPath(value, context)) {
        findings.push(urlFinding({
          code: ErrorCode.FORBIDDEN_LOCAL_URL,
          file: document.relativePath,
          pointer,
          field,
          message: `${document.relativePath}${pointer} contains a local development URL or path.`,
          ownerExplanation: "This URL looks like a local development URL or path.",
          nextAction: "Replace it with an approved public URL or a profile-managed placeholder."
        }));
      }

      if (value.toLowerCase().startsWith("file://")) {
        findings.push(urlFinding({
          code: ErrorCode.FORBIDDEN_LOCAL_URL,
          file: document.relativePath,
          pointer,
          field,
          message: `${document.relativePath}${pointer} contains a file:// URL.`,
          ownerExplanation: "file:// URLs cannot be used in tenant import packages.",
          nextAction: "Replace the value with an approved public URL or remove it from the package."
        }));
      }

      if (protectedPathPatterns.some((pattern) => pattern.test(value))) {
        findings.push(urlFinding({
          code: ErrorCode.FORBIDDEN_PROTECTED_PATH,
          file: document.relativePath,
          pointer,
          field,
          message: `${document.relativePath}${pointer} contains a protected path name.`,
          ownerExplanation: "Protected config paths must not appear in import packages.",
          nextAction: "Remove the protected path reference and use approved runtime configuration instead."
        }));
      }

      const parsedUrl = parseHttpUrl(value);
      if (parsedUrl) {
        if (parsedUrl.username || parsedUrl.password) {
          findings.push(urlFinding({
            code: ErrorCode.FORBIDDEN_SECRET_LIKE_VALUE,
            file: document.relativePath,
            pointer,
            field,
            message: `${document.relativePath}${pointer} contains URL credentials.`,
            ownerExplanation: "URLs must not contain username or password credentials.",
            nextAction: "Remove credentials from the URL and use runtime secret configuration if needed."
          }));
        }

        if (hasSecretQuery(parsedUrl) || hasJwtLookingValue(value)) {
          findings.push(urlFinding({
            code: ErrorCode.FORBIDDEN_SECRET_LIKE_VALUE,
            file: document.relativePath,
            pointer,
            field,
            message: `${document.relativePath}${pointer} contains a secret-like URL value.`,
            ownerExplanation: "The URL appears to contain a token, SAS query, API key, or JWT-looking value.",
            nextAction: "Remove the secret-like URL value and use a runtime-only setting."
          }));
        }

        if (isProductionUrlContext(context) && stagingHostPatterns.some((pattern) => pattern.test(parsedUrl.hostname))) {
          findings.push(urlFinding({
            code: ErrorCode.FORBIDDEN_STAGING_URL,
            file: document.relativePath,
            pointer,
            field,
            message: `${document.relativePath}${pointer} contains a staging/default-host URL in a production field.`,
            ownerExplanation: "Production canonical, sitemap, and public media fields must not use staging or default-host URLs.",
            nextAction: "Replace the URL with the approved production domain."
          }));
        }
      }
    });
  }

  return findings;
}

function urlFinding({ code, file, pointer, field, message, ownerExplanation, nextAction }) {
  return createFinding({
    severity: "error",
    code,
    file,
    jsonPointer: pointer,
    field,
    message,
    ownerExplanation,
    operatorDetail: "The validator reports location only and intentionally does not print the full URL value.",
    nextAction,
    gateId: "url-safety"
  });
}

function getUrlContext(pointer, field) {
  const text = `${pointer}/${field ?? ""}`.toLowerCase();
  return {
    isCanonical: text.includes("canonical"),
    isSitemap: text.includes("sitemap"),
    isPublicMedia: text.includes("publicurl") || text.includes("media"),
    isEndpoint: text.includes("endpoint") || text.includes("url")
  };
}

function isProductionUrlContext(context) {
  return context.isCanonical || context.isSitemap || context.isPublicMedia;
}

function isLocalUrl(value) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])/i.test(value);
}

function isWindowsPath(value) {
  return /^[A-Za-z]:[\\/]/.test(value) || /^\\\\/.test(value);
}

function isLocalMediaPath(value, context) {
  return context.isPublicMedia && value.startsWith("/media/");
}

function hasSecretQuery(parsedUrl) {
  for (const name of parsedUrl.searchParams.keys()) {
    if (secretQueryNames.has(name.toLowerCase())) {
      return true;
    }
  }
  return false;
}

function hasJwtLookingValue(value) {
  return /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/.test(value);
}

function isAllowedPlaceholder(value) {
  return ["TENANT_API_KEY_RUNTIME_ONLY", "PLACEHOLDER", "TODO_SECRET_AT_RUNTIME", "PROFILE_MANAGED_STATIC_ENDPOINT"].includes(value);
}
