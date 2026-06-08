#!/usr/bin/env node
import { validatePackage } from "./index.mjs";

const args = parseArgs(process.argv.slice(2));

if (!args.packagePath) {
  console.error("Missing required --package <path> option.");
  process.exit(2);
}

try {
  const report = await validatePackage(args);
  console.log(`Validation ${report.overallStatus}: ${report.summary.errors} error(s), ${report.summary.warnings} warning(s).`);
  if (report.outputs.directory) {
    console.log(`Reports written to ${report.outputs.directory}`);
  }
  process.exit(report.overallStatus === "failed" ? 1 : 0);
} catch (error) {
  console.error(`Validator runtime error: ${error.message}`);
  process.exit(2);
}

function parseArgs(argv) {
  const parsed = {
    packagePath: null,
    outDir: null,
    json: undefined,
    markdown: undefined,
    strict: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--package") {
      parsed.packagePath = argv[++index];
    } else if (arg === "--out") {
      parsed.outDir = argv[++index];
    } else if (arg === "--json") {
      parsed.json = true;
      if (parsed.markdown === undefined) parsed.markdown = false;
    } else if (arg === "--markdown") {
      parsed.markdown = true;
      if (parsed.json === undefined) parsed.json = false;
    } else if (arg === "--strict") {
      parsed.strict = true;
    } else if (arg === "--no-external-checks") {
      // Accepted for CLI symmetry. External checks are never implemented in Phase 2A-1.
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return parsed;
}
