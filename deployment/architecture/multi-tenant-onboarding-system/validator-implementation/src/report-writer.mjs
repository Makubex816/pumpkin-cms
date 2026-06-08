import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export async function writeReports(report, outputDirectory, options = {}) {
  const writeJson = options.json !== false;
  const writeMarkdown = options.markdown !== false;
  const outputs = [];

  await mkdir(outputDirectory, { recursive: true });

  if (writeJson) {
    outputs.push(path.join(outputDirectory, "validation-report.json"));
  }

  if (writeMarkdown) {
    outputs.push(path.join(outputDirectory, "VALIDATION_REPORT.md"));
  }

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

export function renderMarkdown(report) {
  const errorFindings = report.findings.filter((finding) => finding.severity === "error" || finding.severity === "critical");
  const warningFindings = report.findings.filter((finding) => finding.severity === "warning");

  return `# Validation Report

Package: ${report.packagePath}

Overall status: ${report.overallStatus}

## Summary

| Metric | Count |
| --- | ---: |
| Files checked | ${report.summary.filesChecked} |
| Errors | ${report.summary.errors} |
| Warnings | ${report.summary.warnings} |

## Gate Statuses

| Gate | Status | Summary |
| --- | --- | --- |
${report.gateStatuses.map((gate) => `| ${gate.gateId} | ${gate.status} | ${gate.summary} |`).join("\n")}

## Errors

${renderFindings(errorFindings)}

## Warnings

${renderFindings(warningFindings)}

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
      return `- ${finding.code}: ${finding.message}${location ? ` (${location})` : ""}\n  - Fix: ${finding.nextAction}`;
    })
    .join("\n");
}
