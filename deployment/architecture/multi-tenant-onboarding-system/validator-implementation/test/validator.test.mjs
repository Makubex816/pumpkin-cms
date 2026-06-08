import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validatePackage } from "../src/index.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixturesRoot = path.join(packageRoot, "fixtures");

test("valid minimal fixture passes offline validation and writes reports", async () => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), "pumpkin-validator-valid-"));
  const report = await validatePackage({
    packagePath: path.join(fixturesRoot, "valid-minimal"),
    outDir
  });

  assert.equal(report.overallStatus, "passed");
  assert.equal(report.summary.errors, 0);
  assert.equal(report.boundaryConfirmation.offlineOnly, true);
  assert.equal(report.boundaryConfirmation.cmsWrites, false);
  assert.equal(report.boundaryConfirmation.azureChanges, false);
  assert.equal(report.boundaryConfirmation.searchConsoleIndexingActions, false);
  assert.equal(report.boundaryConfirmation.rollerWork, false);

  const jsonReport = JSON.parse(await readFile(path.join(outDir, "validation-report.json"), "utf8"));
  const markdownReport = await readFile(path.join(outDir, "VALIDATION_REPORT.md"), "utf8");
  assert.equal(jsonReport.overallStatus, "passed");
  assert.match(markdownReport, /Overall status: passed/);
});

test("missing required file fixture fails with REQUIRED_FILE_MISSING", async () => {
  const report = await validatePackage({
    packagePath: path.join(fixturesRoot, "invalid-missing-required-file")
  });

  assert.equal(report.overallStatus, "failed");
  assert(report.findings.some((finding) => finding.code === "REQUIRED_FILE_MISSING" && finding.file === "seo.json"));
});

test("invalid JSON fixture fails with JSON_PARSE_ERROR", async () => {
  const report = await validatePackage({
    packagePath: path.join(fixturesRoot, "invalid-json")
  });

  assert.equal(report.overallStatus, "failed");
  assert(report.findings.some((finding) => finding.code === "JSON_PARSE_ERROR" && finding.file === "site.json"));
});

test("schema fixture fails with SCHEMA_VALIDATION_ERROR", async () => {
  const report = await validatePackage({
    packagePath: path.join(fixturesRoot, "invalid-schema")
  });

  assert.equal(report.overallStatus, "failed");
  assert(report.findings.some((finding) => finding.code === "SCHEMA_VALIDATION_ERROR" && finding.file === "tenant.json"));
});

test("cross-file fixture fails with CROSS_FILE_FIELD_MISMATCH", async () => {
  const report = await validatePackage({
    packagePath: path.join(fixturesRoot, "invalid-cross-file")
  });

  assert.equal(report.overallStatus, "failed");
  assert(report.findings.some((finding) => finding.code === "CROSS_FILE_FIELD_MISMATCH" && finding.file === "site.json"));
});

test("external checks remain unimplemented and skipped", async () => {
  const report = await validatePackage({
    packagePath: path.join(fixturesRoot, "valid-minimal")
  });

  const externalGate = report.gateStatuses.find((gate) => gate.gateId === "external-checks");
  assert.equal(externalGate.status, "skipped");
  assert.equal(report.boundaryConfirmation.externalChecksImplemented, false);
});
