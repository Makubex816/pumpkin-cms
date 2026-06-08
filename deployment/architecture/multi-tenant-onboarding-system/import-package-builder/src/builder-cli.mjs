#!/usr/bin/env node
import { buildImportPackage, BuilderInputError, OutputPathError } from "./index.mjs";

class UsageError extends Error {}

main();

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));

    if (args.help) {
      console.log(renderHelp());
      return;
    }

    if (!args.answersPath) {
      throw new UsageError("Missing required --answers <path> option.");
    }
    if (!args.outDir) {
      throw new UsageError("Missing required --out <path> option.");
    }

    const result = await buildImportPackage(args);
    printSummary(result);
    process.exitCode = result.status === "failed" ? 1 : 0;
  } catch (error) {
    if (error instanceof UsageError || error instanceof BuilderInputError || error instanceof OutputPathError) {
      console.error(error.message);
      console.error("");
      console.error("Run `node src/builder-cli.mjs --help` for usage and examples.");
      process.exitCode = 2;
      return;
    }

    console.error(`Builder runtime error: ${error.message}`);
    process.exitCode = 2;
  }
}

function parseArgs(argv) {
  const parsed = {
    answersPath: null,
    outDir: null,
    validate: false,
    supportPacket: false,
    overwrite: false,
    dryRun: false,
    json: undefined,
    markdown: undefined,
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const rawArg = argv[index];
    const { name, inlineValue } = splitInlineOption(rawArg);

    if (name === "--help" || name === "-h") {
      parsed.help = true;
    } else if (name === "--answers") {
      const read = readOptionValue(argv, index, name, inlineValue);
      parsed.answersPath = read.value;
      index = read.index;
    } else if (name === "--out") {
      const read = readOptionValue(argv, index, name, inlineValue);
      parsed.outDir = read.value;
      index = read.index;
    } else if (name === "--validate") {
      parsed.validate = true;
    } else if (name === "--support-packet") {
      parsed.supportPacket = true;
      parsed.validate = true;
    } else if (name === "--overwrite") {
      parsed.overwrite = true;
    } else if (name === "--dry-run") {
      parsed.dryRun = true;
    } else if (name === "--json") {
      parsed.json = true;
      if (parsed.markdown === undefined) parsed.markdown = false;
    } else if (name === "--markdown") {
      parsed.markdown = true;
      if (parsed.json === undefined) parsed.json = false;
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

function printSummary(result) {
  console.log(`Builder ${result.status}: ${result.stage}`);
  console.log(`Answers: ${result.answersPath}`);
  console.log(`Output: ${result.outputDirectory}`);
  console.log(`Files planned: ${result.filesPlanned.length}`);
  console.log(`Files written: ${result.filesWritten.length}`);

  if (result.errors.length > 0) {
    console.log("");
    console.log("Answer issues:");
    for (const issue of result.errors.slice(0, 8)) {
      console.log(`- ${issue.path}: ${issue.message}`);
    }
  }

  if (result.validationReport) {
    console.log("");
    console.log(`Validation ${result.validationReport.overallStatus}: ${result.validationReport.summary.errors} error(s), ${result.validationReport.summary.warnings} warning(s).`);
    if (result.validationReport.outputs.directory) {
      console.log(`Validation/support reports: ${result.validationReport.outputs.directory}`);
    }
  } else if (result.stage === "dry-run") {
    console.log("Validation: skipped in dry-run mode.");
  } else {
    console.log("Validation: not requested.");
  }

  console.log("");
  console.log("Boundary: local/offline only. No tenant creation, CMS, MediaAsset, Azure, Cloudflare, DNS, deployment, email, Search Console, indexing, external HTTP, protected config, or Roller action was performed.");
}

function renderHelp() {
  return `Pumpkin import package builder skeleton

Usage:
  node src/builder-cli.mjs --answers <answers.json> --out <generated-package> [options]

Options:
  --answers <path>       Required local non-secret answers JSON file.
  --out <path>           Required local generated package output folder.
  --validate             Run the existing offline validator after generation.
  --support-packet       Write validator support packet files; implies --validate.
  --overwrite            Replace known generated files in the output folder.
  --dry-run              Print planned output without writing package files.
  --json                 Request JSON validator report only.
  --markdown             Request Markdown validator report only.
  --help, -h             Show this help.

Example:
  node src/builder-cli.mjs --answers fixtures/example-event-rentals.answers.json --out .tmp/generated-example --validate --support-packet

Local-only boundary:
  This builder reads local answers, writes local generated package files, and can run the local offline validator. It does not create a tenant, import content, write CMS data, modify MediaAsset storage, modify Azure, modify Cloudflare, change DNS, deploy, send email, use Search Console, request indexing, perform external HTTP checks, read protected config, or touch Roller.

Exit codes:
  0  Builder completed and validator passed if requested.
  1  Answers failed validation or generated package failed validator.
  2  Usage, path, parse, or runtime error.
`;
}
