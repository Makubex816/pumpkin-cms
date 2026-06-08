import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const supportPacketFileNames = [
  "support-packet.json",
  "OPERATOR_HANDOFF.md",
  "NON_TECHNICAL_SUMMARY.md",
  "NEXT_ACTIONS.md",
  "PACKAGE_FILE_INVENTORY.md"
];

export function planSupportPacketFiles(outputDirectory) {
  return supportPacketFileNames.map((fileName) => path.join(outputDirectory, fileName));
}

export async function writeSupportPacket(report, outputDirectory) {
  await mkdir(outputDirectory, { recursive: true });

  const files = planSupportPacketFiles(outputDirectory);
  const packet = buildSupportPacket(report, files);

  await writeFile(path.join(outputDirectory, "support-packet.json"), `${JSON.stringify(packet, null, 2)}\n`, "utf8");
  await writeFile(path.join(outputDirectory, "OPERATOR_HANDOFF.md"), renderOperatorHandoff(report), "utf8");
  await writeFile(path.join(outputDirectory, "NON_TECHNICAL_SUMMARY.md"), renderNonTechnicalSummary(report), "utf8");
  await writeFile(path.join(outputDirectory, "NEXT_ACTIONS.md"), renderNextActions(report), "utf8");
  await writeFile(path.join(outputDirectory, "PACKAGE_FILE_INVENTORY.md"), renderPackageFileInventory(report), "utf8");

  return files;
}

export function buildSupportPacket(report, files) {
  return {
    schemaVersion: "1.0.0",
    packetType: "phase-2a-3-offline-validator-support-packet",
    validatorVersion: report.validatorVersion,
    phase: report.phase,
    tenantId: report.tenantId,
    siteKey: report.siteKey,
    packagePath: report.packagePath,
    profileId: report.profileId,
    overallStatus: report.overallStatus,
    summary: report.summary,
    topBlockers: topBlockingFindings(report).map(summarizeFinding),
    gateStatuses: report.gateStatuses,
    nextActions: report.nextActions,
    filesChecked: report.filesChecked,
    generatedFiles: files.map((file) => path.basename(file)),
    sourceFilesCopied: false,
    boundaryConfirmation: report.boundaryConfirmation,
    supportRules: {
      localOnly: true,
      externalChecksPerformed: false,
      copySourceFilesByDefault: false,
      doNotPasteSecrets: true
    }
  };
}

export function renderOperatorHandoff(report) {
  return `# Operator Handoff

Package: ${report.packagePath}

Tenant ID: ${report.tenantId ?? "unknown"}

Site key: ${report.siteKey ?? "unknown"}

Overall status: ${report.overallStatus}

## Top Blockers

${renderFindingBullets(topBlockingFindings(report), "No blockers. Keep the package in manual review until the approved owner checklist is complete.")}

## Route Summary

${renderGateSummary(report, "cross-file")}

## Media Summary

${renderGateSummary(report, "media-references")}

## Form Summary

${renderGateSummary(report, "form-references")}

## SEO Summary

${renderGateSummary(report, "seo-canonical")}

## Secret And URL Safety Summary

${renderGateSummary(report, "url-safety")}
${renderGateSummary(report, "secret-patterns")}

## Recommended Next Action

${renderPrimaryNextAction(report)}

## Stop Points

- Stop if any finding mentions a possible secret, credential, tenant mismatch, local URL, staging URL, or forbidden route.
- Do not create a tenant, import content, deploy, change DNS, change Azure, change Cloudflare, send email, or submit Search Console from this packet.
- Do not copy source package file contents into support tickets by default.
- Do not paste passwords, tokens, keys, connection strings, or private URLs into chat or email.

## Who Should Review Next

${renderReviewerList(report)}
`;
}

export function renderNonTechnicalSummary(report) {
  return `# Non-Technical Summary

Package: ${report.packagePath}

Overall status: ${report.overallStatus}

## What Passed

${renderPassedGates(report)}

## What Needs Fixing

${renderFindingBullets(topBlockingFindings(report), "Nothing is blocking the offline validator. Continue with manual owner/operator review before any import or launch action.")}

## What To Do Next

${renderActionBullets(report.nextActions, "Keep the package paused until manual review confirms content, legal/privacy, forms, analytics, monitoring, rollback, and indexing hard stops.")}

## When To Ask For Help

- Ask for help if you see another tenant name, a paused tenant reference, a secret-looking value, a local URL, or a staging URL.
- Ask for help if you do not know which mailbox should receive leads.
- Ask for help before changing SEO crawl instructions or production URLs.
- Ask for help if anyone asks for deployment, DNS, email, Search Console, indexing, or sitemap action from this offline packet.

## Do Not Paste Secrets

Do not paste passwords, tokens, API keys, private keys, connection strings, deployment tokens, or login codes into tickets, chat, email, or documentation. If a value may be a real secret, remove it from the package and ask an operator or security reviewer what to rotate.
`;
}

export function renderNextActions(report) {
  return `# Next Actions

Overall status: ${report.overallStatus}

## First Fixes

${renderFindingBullets(topBlockingFindings(report), "No validator blockers are present. Continue with manual owner review before any external action.")}

## Action List

${renderActionBullets(report.nextActions, "No automated next actions were generated. Keep the package in manual review until all owner approvals are recorded.")}

## After Fixes

- Re-run the validator locally with node src/cli.mjs --package <package-folder> --out <report-folder> --support-packet.
- Share the generated reports, not the raw package files, unless an operator explicitly requests a safe subset.
- Keep Search Console, indexing, sitemap submission, DNS, deployment, CMS import, Azure, Cloudflare, email, and Roller work paused.
`;
}

export function renderPackageFileInventory(report) {
  return `# Package File Inventory

Package: ${report.packagePath}

Source files copied: false

This support packet lists file names only. It does not duplicate raw import package file contents.

## Files Checked

${report.filesChecked.map((file) => `- ${file}`).join("\n") || "- None"}

## Generated Support Files

${supportPacketFileNames.map((file) => `- ${file}`).join("\n")}
`;
}

function renderGateSummary(report, gateId) {
  const gate = report.gateStatuses.find((item) => item.gateId === gateId);
  const findings = report.findings.filter((finding) => finding.gateId === gateId);
  const blockers = findings.filter(isBlockingFinding);

  if (!gate) {
    return `- ${gateId}: not reported`;
  }

  return `- Status: ${gate.status}
- Summary: ${gate.summary}
- Blocking findings: ${blockers.length}`;
}

function renderPassedGates(report) {
  const passed = report.gateStatuses.filter((gate) => gate.status === "passed");
  if (passed.length === 0) {
    return "- No validation gate fully passed yet.";
  }

  return passed.map((gate) => `- ${gate.gateId}: ${gate.summary}`).join("\n");
}

function renderReviewerList(report) {
  const reviewers = new Set(topBlockingFindings(report).map((finding) => finding.explanation?.reviewOwner).filter(Boolean));

  if (reviewers.size === 0) {
    return "- Package owner and operator should complete manual owner review before any external action.";
  }

  return [...reviewers].sort().map((reviewer) => `- ${reviewer}`).join("\n");
}

function renderPrimaryNextAction(report) {
  if (report.nextActions.length > 0) {
    return `- ${report.nextActions[0]}`;
  }

  if (report.overallStatus === "passed") {
    return "- Continue to manual owner/operator review. Do not import, deploy, or request indexing from this packet.";
  }

  return "- Review the validation report and fix the blocking findings before proceeding.";
}

function renderFindingBullets(findings, emptyMessage) {
  if (findings.length === 0) {
    return `- ${emptyMessage}`;
  }

  return findings.map((finding) => {
    const location = [finding.file, finding.jsonPointer].filter(Boolean).join("");
    const route = finding.route ? ` Route: ${finding.route}.` : "";
    return `- ${finding.code}: ${finding.explanation?.plainLanguage ?? finding.ownerExplanation}${location ? ` Location: ${location}.` : ""}${route}\n  Fix: ${finding.explanation?.howToFix ?? finding.nextAction}`;
  }).join("\n");
}

function renderActionBullets(actions, emptyMessage) {
  if (!actions || actions.length === 0) {
    return `- ${emptyMessage}`;
  }

  return actions.map((action) => `- ${action}`).join("\n");
}

function topBlockingFindings(report) {
  return report.findings.filter(isBlockingFinding).slice(0, 8);
}

function isBlockingFinding(finding) {
  return finding.blocksGate || finding.severity === "error" || finding.severity === "critical";
}

function summarizeFinding(finding) {
  return {
    severity: finding.severity,
    code: finding.code,
    title: finding.explanation?.title ?? finding.code,
    file: finding.file,
    jsonPointer: finding.jsonPointer,
    route: finding.route,
    plainLanguage: finding.explanation?.plainLanguage ?? finding.ownerExplanation,
    howToFix: finding.explanation?.howToFix ?? finding.nextAction,
    reviewOwner: finding.explanation?.reviewOwner ?? "Operator"
  };
}
