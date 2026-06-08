import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getErrorExplanation } from "./error-explanations.mjs";

export async function writeReports(report, outputDirectory, options = {}) {
  const ownOutputs = planReportFiles(outputDirectory, options);
  const outputs = [...ownOutputs, ...(options.additionalFiles ?? [])];
  const writeJson = options.json !== false;
  const writeMarkdown = options.markdown !== false;

  await mkdir(outputDirectory, { recursive: true });

  const reportWithOutputs = {
    ...report,
    outputs: {
      directory: outputDirectory,
      files: outputs
    }
  };

  if (writeJson) {
    await writeFile(path.join(outputDirectory, "validation-report.json"), `${JSON.stringify(reportWithOutputs, null, 2)}\n`, "utf8");
  }

  if (writeMarkdown) {
    await writeFile(path.join(outputDirectory, "VALIDATION_REPORT.md"), renderMarkdown(reportWithOutputs), "utf8");
  }

  return outputs;
}

export function planReportFiles(outputDirectory, options = {}) {
  const writeJson = options.json !== false;
  const writeMarkdown = options.markdown !== false;
  const outputs = [];

  if (writeJson) {
    outputs.push(path.join(outputDirectory, "validation-report.json"));
  }

  if (writeMarkdown) {
    outputs.push(path.join(outputDirectory, "VALIDATION_REPORT.md"));
  }

  return outputs;
}

export function renderMarkdown(report) {
  const errorFindings = report.findings.filter((finding) => finding.severity === "error" || finding.severity === "critical");
  const warningFindings = report.findings.filter((finding) => finding.severity === "warning");

  return `# Validation Report

Package: ${report.packagePath}

Overall status: ${report.overallStatus}

Phase: ${report.phase}

## Summary

| Metric | Count |
| --- | ---: |
| Files checked | ${report.summary.filesChecked} |
| Errors | ${report.summary.errors} |
| Warnings | ${report.summary.warnings} |
| Info | ${report.summary.infos} |

## How To Read This

- passed means the offline validator did not find a blocker for that gate.
- failed means the package needs fixes before import or launch review can continue.
- skipped means the gate is intentionally not implemented in this offline phase.
- deferred means a later offline phase must add that validation.

## Gate Statuses

| Gate | Status | Summary |
| --- | --- | --- |
${report.gateStatuses.map((gate) => `| ${gate.gateId} | ${gate.status} | ${gate.summary} |`).join("\n")}

## Errors

${renderFindings(errorFindings)}

## Warnings

${renderFindings(warningFindings)}

## Plain-Language Error Help

${renderExplanationCatalog([...errorFindings, ...warningFindings])}

## Files Checked

${report.filesChecked.map((file) => `- ${file}`).join("\n") || "- None"}

## Next Actions

${report.nextActions.map((action) => `- ${action}`).join("\n") || "- None"}

## Boundary Confirmation

${Object.entries(report.boundaryConfirmation).map(([key, value]) => `- ${key}: ${value}`).join("\n")}
`;
}

function renderFindings(findings) {
  if (findings.length === 0) {
    return "None\n";
  }

  return findings
    .map((finding) => {
      const location = [finding.file, finding.jsonPointer].filter(Boolean).join("");
      const explanation = finding.explanation ?? getErrorExplanation(finding.code);
      return `- ${finding.code}: ${finding.message}${location ? ` (${location})` : ""}\n  - Plain English: ${explanation.plainLanguage}\n  - Likely cause: ${explanation.likelyCause}\n  - Fix: ${explanation.howToFix}\n  - Ask for help: ${explanation.whenToAskForHelp}`;
    })
    .join("\n");
}

function renderExplanationCatalog(findings) {
  const uniqueCodes = [...new Set(findings.map((finding) => finding.code))].sort();
  if (uniqueCodes.length === 0) {
    return "No error explanations needed for this report.\n";
  }

  return uniqueCodes
    .map((code) => {
      const explanation = getErrorExplanation(code);
      return `- ${code}: ${explanation.title}\n  - Meaning: ${explanation.plainLanguage}\n  - Fix: ${explanation.howToFix}\n  - Review owner: ${explanation.reviewOwner}`;
    })
    .join("\n");
}
