#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { validateLedger } from "./audit-job-ledger-validator.mjs";
import { createLedgerViewerModel } from "./audit-job-ledger-view-model.mjs";

const [, , command, fixturePath] = process.argv;

if (!["validate", "inspect", "viewer-summary"].includes(command) || !fixturePath) {
  printUsage();
  process.exitCode = 2;
} else {
  run(command, fixturePath).catch((error) => {
    console.error(JSON.stringify({
      ok: false,
      failures: [
        {
          code: "CLI_UNHANDLED_ERROR",
          path: "$",
          message: error instanceof Error ? error.message : String(error)
        }
      ]
    }, null, 2));
    process.exitCode = 1;
  });
}

async function run(activeCommand, inputPath) {
  const fullPath = resolve(process.cwd(), inputPath);
  const raw = await readFile(fullPath, "utf8");
  let ledger;

  try {
    ledger = JSON.parse(raw);
  } catch (error) {
    console.error(JSON.stringify({
      ok: false,
      fixturePath: inputPath,
      failures: [
        {
          code: "JSON_PARSE_FAILED",
          path: "$",
          message: error instanceof Error ? error.message : String(error)
        }
      ]
    }, null, 2));
    process.exitCode = 1;
    return;
  }

  const validation = validateLedger(ledger);
  if (activeCommand === "viewer-summary") {
    const viewerModel = createLedgerViewerModel(ledger);
    console.log(JSON.stringify({
      ok: viewerModel.ok,
      fixturePath: inputPath,
      viewerModel
    }, null, 2));
  } else if (activeCommand === "inspect") {
    console.log(JSON.stringify({
      ok: validation.ok,
      fixturePath: inputPath,
      summary: validation.summary,
      safety: {
        localOnly: ledger.securityBoundary?.localOnly === true,
        writesPerformed: ledger.securityBoundary?.writesPerformed ?? null,
        externalNetworkUsed: ledger.securityBoundary?.externalNetworkUsed ?? null,
        protectedConfigRead: ledger.securityBoundary?.protectedConfigRead ?? null,
        noWriteBoundarySatisfied: ledger.securityBoundary?.writesPerformed === false
          && ledger.securityBoundary?.externalNetworkUsed === false
          && ledger.securityBoundary?.protectedConfigRead === false
      },
      failures: validation.failures
    }, null, 2));
  } else {
    console.log(JSON.stringify({
      ok: validation.ok,
      fixturePath: inputPath,
      summary: validation.summary,
      failures: validation.failures
    }, null, 2));
  }

  if (!validation.ok) {
    process.exitCode = 1;
  }
}

function printUsage() {
  console.error("Usage: node src/audit-job-ledger-cli.mjs <validate|inspect|viewer-summary> <fixture.json>");
}
