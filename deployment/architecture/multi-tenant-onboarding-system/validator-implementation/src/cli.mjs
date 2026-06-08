#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getErrorExplanation, listErrorExplanations } from "./error-explanations.mjs";
import { validatePackage } from "./index.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

class UsageError extends Error {}

main();

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));

    if (args.help) {
      console.log(renderHelp());
      return;
    }

    if (args.version) {
      console.log(await readPackageVersion());
      return;
    }

    if (args.explainError) {
      printErrorExplanation(args.explainError);
      return;
    }

    if (args.listErrors) {
      printKnownErrors();
      return;
    }

    if (!args.packagePath) {
      throw new UsageError("Missing required --package <path> option.");
    }

    if (args.supportPacket && !args.outDir) {
      throw new UsageError("--support-packet requires --out <path> so the packet has a local output folder.");
    }

    const report = await validatePackage(args);
    printValidationSummary(report);
    process.exitCode = report.overallStatus === "failed" ? 1 : 0;
  } catch (error) {
    if (error instanceof UsageError) {
      console.error(error.message);
      console.error("");
      console.error("Run `node src/cli.mjs --help` for examples and supported options.");
      process.exitCode = 2;
      return;
    }

    console.error(`Validator runtime error: ${error.message}`);
    process.exitCode = 2;
  }
}

function parseArgs(argv) {
  const parsed = {
    packagePath: null,
    outDir: null,
    json: undefined,
    markdown: undefined,
    strict: false,
    supportPacket: false,
    help: false,
    version: false,
    explainError: null,
    listErrors: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const rawArg = argv[index];
    const { name, inlineValue } = splitInlineOption(rawArg);

    if (name === "--help" || name === "-h") {
      parsed.help = true;
    } else if (name === "--version" || name === "-v") {
      parsed.version = true;
    } else if (name === "--package") {
      const read = readOptionValue(argv, index, name, inlineValue);
      parsed.packagePath = read.value;
      index = read.index;
    } else if (name === "--out") {
      const read = readOptionValue(argv, index, name, inlineValue);
      parsed.outDir = read.value;
      index = read.index;
    } else if (name === "--json") {
      parsed.json = true;
      if (parsed.markdown === undefined) parsed.markdown = false;
    } else if (name === "--markdown") {
      parsed.markdown = true;
      if (parsed.json === undefined) parsed.json = false;
    } else if (name === "--format") {
      const read = readOptionValue(argv, index, name, inlineValue);
      applyFormat(parsed, read.value);
      index = read.index;
    } else if (name === "--strict" || name === "--fail-on-warning") {
      parsed.strict = true;
    } else if (name === "--support-packet") {
      parsed.supportPacket = true;
    } else if (name === "--explain-error" || name === "--explain-code") {
      const read = readOptionValue(argv, index, name, inlineValue);
      parsed.explainError = read.value;
      index = read.index;
    } else if (name === "--list-errors") {
      parsed.listErrors = true;
    } else if (name === "--no-external-checks") {
      // Accepted for CLI symmetry. External checks are never implemented in Phase 2A-3.
    } else {
      throw new UsageError(`Unknown option: ${rawArg}`);
    }
  }

  return parsed;
}

function splitInlineOption(arg) {
  const equalsIndex = arg.indexOf("=");
  if (!arg.startsWith("--") || equalsIndex === -1) {
    return { name: arg, inlineValue: undefined };
  }

  return {
    name: arg.slice(0, equalsIndex),
    inlineValue: arg.slice(equalsIndex + 1)
  };
}

function readOptionValue(argv, index, name, inlineValue) {
  if (inlineValue !== undefined && inlineValue !== "") {
    return { value: inlineValue, index };
  }

  const nextIndex = index + 1;
  const value = argv[nextIndex];
  if (!value || value.startsWith("--")) {
    throw new UsageError(`${name} requires a value.`);
  }

  return { value, index: nextIndex };
}

function applyFormat(parsed, format) {
  if (format === "all") {
    parsed.json = true;
    parsed.markdown = true;
    return;
  }

  if (format === "json") {
    parsed.json = true;
    parsed.markdown = false;
    return;
  }

  if (format === "markdown" || format === "md") {
    parsed.json = false;
    parsed.markdown = true;
    return;
  }

  throw new UsageError("--format must be one of: all, json, markdown.");
}

async function readPackageVersion() {
  const packageJson = JSON.parse(await readFile(path.join(packageRoot, "package.json"), "utf8"));
  return packageJson.version ?? "unknown";
}

function printValidationSummary(report) {
  console.log(`Validation ${report.overallStatus}: ${report.summary.errors} error(s), ${report.summary.warnings} warning(s), ${report.summary.infos} info.`);
  console.log(`Package: ${report.packagePath}`);

  if (report.outputs.directory) {
    console.log(`Reports written to: ${report.outputs.directory}`);
  } else {
    console.log("Reports written to: none. Add --out <path> to save JSON, Markdown, or support packet files.");
  }

  const blockers = report.findings
    .filter((finding) => finding.blocksGate || finding.severity === "error" || finding.severity === "critical")
    .slice(0, 3);

  if (blockers.length > 0) {
    console.log("");
    console.log("Top blockers:");
    for (const finding of blockers) {
      const location = [finding.file, finding.jsonPointer].filter(Boolean).join("");
      console.log(`- ${finding.code}: ${finding.explanation?.plainLanguage ?? finding.ownerExplanation}${location ? ` (${location})` : ""}`);
      console.log(`  Fix: ${finding.explanation?.howToFix ?? finding.nextAction}`);
    }
  } else {
    console.log("Top blockers: none.");
  }

  console.log("");
  console.log("Boundary: local/offline only. No CMS, MediaAsset, Azure, Cloudflare, DNS, deployment, email, Search Console, indexing, external HTTP, protected config, or Roller action was performed.");
}

function printErrorExplanation(code) {
  const explanation = getErrorExplanation(code);

  if (!explanation.known) {
    console.error(`Unknown error code: ${code}`);
    console.error("Run `node src/cli.mjs --list-errors` to see registered codes.");
    process.exitCode = 2;
    return;
  }

  console.log(`${explanation.code}: ${explanation.title}`);
  console.log("");
  console.log(`Meaning: ${explanation.plainLanguage}`);
  console.log(`Likely cause: ${explanation.likelyCause}`);
  console.log(`How to fix: ${explanation.howToFix}`);
  console.log(`When to ask for help: ${explanation.whenToAskForHelp}`);
  console.log(`Review owner: ${explanation.reviewOwner}`);
}

function printKnownErrors() {
  for (const explanation of listErrorExplanations()) {
    console.log(`${explanation.code}: ${explanation.title}`);
  }
}

function renderHelp() {
  return `Pumpkin multi-tenant offline validator

Usage:
  node src/cli.mjs --package <package-folder> [--out <report-folder>] [options]
  node src/cli.mjs --explain-error <ERROR_CODE>

Local-only boundary:
  Reads local package files and writes local report files only. It does not contact CMS, MediaAsset storage, Azure, Cloudflare, DNS, deployment systems, Function App settings, email, Microsoft 365, Search Console, indexing APIs, external HTTP endpoints, protected config, or Roller.

Options:
  --help, -h                         Show this help.
  --version, -v                      Print the package version.
  --package <path>                   Required local import package folder.
  --out <path>                       Local output folder for reports.
  --json                             Write only validation-report.json.
  --markdown                         Write only VALIDATION_REPORT.md.
  --format <all|json|markdown>       Choose report format. Default is all.
  --strict                           Treat warnings as a failed validation.
  --fail-on-warning                  Alias for --strict.
  --support-packet                   Add operator support packet files under --out.
  --explain-error <ERROR_CODE>       Explain a validator error in plain English.
  --explain-code <ERROR_CODE>        Alias for --explain-error.
  --list-errors                      List registered explainable error codes.
  --no-external-checks               Accepted for compatibility; external checks are skipped.

Examples:
  node src/cli.mjs --package fixtures/valid-minimal --out .tmp/valid-minimal-report
  node src/cli.mjs --package fixtures/valid-minimal --out .tmp/support --support-packet
  node src/cli.mjs --package fixtures/valid-minimal --out .tmp/json-only --format json
  node src/cli.mjs --package fixtures/valid-minimal --out .tmp/strict --fail-on-warning
  node src/cli.mjs --explain-error JSON_PARSE_ERROR

Support packet files:
  support-packet.json
  OPERATOR_HANDOFF.md
  NON_TECHNICAL_SUMMARY.md
  NEXT_ACTIONS.md
  PACKAGE_FILE_INVENTORY.md

Exit codes:
  0  Validation passed or help/explanation completed.
  1  Validation found blocking issues.
  2  Usage error or validator runtime error.
`;
}
