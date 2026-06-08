import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const supportPacketFiles = [
  "support-packet.json",
  "OPERATOR_HANDOFF.md",
  "NON_TECHNICAL_SUMMARY.md",
  "NEXT_ACTIONS.md",
  "PACKAGE_FILE_INVENTORY.md",
  "BUILDER_PACKAGE_SUMMARY.md"
];

const secretLikePatterns = [
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
  /(client_secret|access_token|api[_-]?key|password|secret)\s*[:=]\s*[^\s,;]{8,}/i,
  /[?&](sig|signature|sv|sp|se|token|access_token|api_key|client_secret)=/i
];

export async function writeBuilderPackageSummary({ outputDirectory, preview, validationReport }) {
  const content = `# Builder Package Summary

Output folder: ${outputDirectory}

## Generated Package

- files planned: ${preview.files.length}
- files created: ${preview.counts.create}
- files overwritten: ${preview.counts.overwrite}
- files unchanged: ${preview.counts.unchanged}
- approved routes: ${preview.routes.approved.join(", ")}
- forbidden routes: ${preview.routes.forbidden.join(", ")}
- pages: ${preview.pages.map((page) => `${page.slug} (${page.route})`).join(", ")}
- media refs: ${preview.mediaRefs.map((asset) => asset.mediaId).join(", ") || "none"}
- form refs: ${preview.formRefs.map((form) => form.formId).join(", ") || "none"}

## Validation

- validator status: ${validationReport?.overallStatus ?? "not-run"}
- validator errors: ${validationReport?.summary?.errors ?? 0}
- validator warnings: ${validationReport?.summary?.warnings ?? 0}

## Stop Points

- Stop if any report mentions a possible secret, credential, paused tenant, unrelated tenant, local URL, staging URL, or forbidden route.
- Do not create tenants, import CMS content, upload media, change Azure, change Cloudflare, change DNS, deploy, send email, use Search Console, submit sitemaps, request indexing, perform external checks, or touch Roller from this packet.
- Share generated reports, not raw answers, unless an operator explicitly requests a safe subset.
`;

  await writeFile(path.join(outputDirectory, "BUILDER_PACKAGE_SUMMARY.md"), content, "utf8");
}

export async function checkSupportPacketRedaction({ outputDirectory, answersPath }) {
  const absoluteOutputDirectory = path.resolve(outputDirectory);
  const answersBaseName = path.basename(answersPath);
  const findings = [];
  const filesChecked = [];

  for (const fileName of supportPacketFiles) {
    const absolutePath = path.join(absoluteOutputDirectory, fileName);
    const text = await readFile(absolutePath, "utf8").catch(() => null);
    if (text === null) {
      continue;
    }

    filesChecked.push(fileName);

    if (text.includes(answersBaseName)) {
      findings.push(finding(fileName, "SUPPORT_PACKET_RAW_ANSWERS_REFERENCE", "Support packet output must not copy or point reviewers to the raw answers file.", "Remove raw answers references and share generated validation reports instead."));
    }

    if (secretLikePatterns.some((pattern) => pattern.test(text))) {
      findings.push(finding(fileName, "SUPPORT_PACKET_SECRET_LIKE_VALUE", "Support packet output contains a secret-like value.", "Remove the value, rotate if it may be real, and regenerate the support packet."));
    }
  }

  return {
    status: findings.length === 0 ? "passed" : "failed",
    filesChecked,
    rawAnswersCopied: false,
    rawAnswersReferenceFound: findings.some((item) => item.code === "SUPPORT_PACKET_RAW_ANSWERS_REFERENCE"),
    secretLikeFindings: findings.filter((item) => item.code === "SUPPORT_PACKET_SECRET_LIKE_VALUE"),
    findings
  };
}

function finding(fileName, code, message, suggestedFix) {
  return {
    code,
    path: fileName,
    message,
    suggestedFix,
    askForHelp: "Ask an operator or security reviewer before sharing this support packet.",
    severity: "error"
  };
}
