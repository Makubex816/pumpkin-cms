import test from "node:test";
import assert from "node:assert/strict";
import { access, cp, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ErrorCode } from "../src/error-codes.mjs";
import { validatePackage } from "../src/index.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixturesRoot = path.join(packageRoot, "fixtures");
const cliPath = path.join(packageRoot, "src", "cli.mjs");
const allowedOutputStatuses = new Set(["passed", "failed", "blocked", "skipped", "deferred", "needs_user_input"]);

test("valid minimal fixture passes offline validation and writes reports", async () => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), "pumpkin-validator-valid-"));
  const report = await validateFixture("valid-minimal", { outDir });

  assert.equal(report.overallStatus, "passed");
  assert.equal(report.summary.errors, 0);
  assert.equal(report.summary.warnings, 0);
  assert.equal(report.phase, "2A-3");
  assert.equal(report.validatorVersion, "0.3.0");
  assert.equal(report.boundaryConfirmation.offlineOnly, true);
  assert.equal(report.boundaryConfirmation.cmsWrites, false);
  assert.equal(report.boundaryConfirmation.azureChanges, false);
  assert.equal(report.boundaryConfirmation.searchConsoleIndexingActions, false);
  assert.equal(report.boundaryConfirmation.rollerWork, false);

  const jsonReport = JSON.parse(await readFile(path.join(outDir, "validation-report.json"), "utf8"));
  const markdownReport = await readFile(path.join(outDir, "VALIDATION_REPORT.md"), "utf8");
  assert.equal(jsonReport.overallStatus, "passed");
  assert.match(markdownReport, /Overall status: passed/);
  assert.match(markdownReport, /Files Checked/);
  assert.match(markdownReport, /How To Read This/);
});

test("explicit Roller local-only dry-run approval allows paused tenant package references", async () => {
  const packagePath = await makeRollerDryRunPackage();
  const report = await validatePackage({ packagePath });

  assert.equal(report.overallStatus, "passed");
  assert.equal(report.summary.errors, 0);
  assert.equal(report.summary.warnings, 0);
});

test("Roller dry-run approval with live pages approved still fails validation", async () => {
  const packagePath = await makeRollerDryRunPackage(async (packageRoot) => {
    const manifestPath = path.join(packageRoot, "manifest.json");
    const manifest = await readJson(manifestPath);
    manifest.pausedTenantDryRunApproval.livePagesApproved = true;
    await writeJson(manifestPath, manifest);
  });
  const report = await validatePackage({ packagePath });

  assert.equal(report.overallStatus, "failed");
  assert(report.findings.some((finding) => finding.code === ErrorCode.SCHEMA_VALIDATION_ERROR));
  assert(report.findings.some((finding) => finding.code === ErrorCode.PAUSED_TENANT_REFERENCE));
});

test("existing skeleton fixtures still fail for their intended reasons", async () => {
  await assertFixtureHasCode("invalid-missing-required-file", ErrorCode.REQUIRED_FILE_MISSING);
  await assertFixtureHasCode("invalid-json", ErrorCode.JSON_PARSE_ERROR);
  await assertFixtureHasCode("invalid-schema", ErrorCode.SCHEMA_VALIDATION_ERROR);
  await assertFixtureHasCode("invalid-cross-file", ErrorCode.TENANT_ID_MISMATCH);
});

test("tenant and site key mismatch fixtures use stable scope codes", async () => {
  await assertFixtureHasCode("invalid-tenant-id-mismatch", ErrorCode.TENANT_ID_MISMATCH);
  await assertFixtureHasCode("invalid-site-key-mismatch", ErrorCode.SITE_KEY_MISMATCH);
});

test("route allowlist and denylist fixtures fail with route codes", async () => {
  await assertFixtureHasCode("invalid-route-missing-page", ErrorCode.ROUTE_PAGE_MISSING);
  await assertFixtureHasCode("invalid-forbidden-route-present", ErrorCode.FORBIDDEN_ROUTE_PRESENT);
});

test("media and form reference fixtures fail with reference codes", async () => {
  await assertFixtureHasCode("invalid-unknown-media-reference", ErrorCode.UNKNOWN_MEDIA_REFERENCE);
  await assertFixtureHasCode("invalid-unknown-form-reference", ErrorCode.UNKNOWN_FORM_REFERENCE);
});

test("form recipient references accept leadRecipientRef and legacy recipientGroup", async () => {
  const modernReport = await validateFixture("valid-minimal");
  assert.equal(modernReport.overallStatus, "passed");

  const legacyPackage = await copyFixtureToTemp("valid-minimal");
  const formsPath = path.join(legacyPackage, "forms.json");
  const forms = await readJson(formsPath);
  delete forms.forms[0].leadRecipientRef;
  forms.forms[0].recipientGroup = "events-team";
  await writeJson(formsPath, forms);

  const legacyReport = await validatePackage({ packagePath: legacyPackage });
  assert.equal(legacyReport.overallStatus, "passed");
  assert.equal(legacyReport.summary.errors, 0);
});

test("form recipient references fail when missing, unsafe, or conflicting", async () => {
  const missingPackage = await copyFixtureToTemp("valid-minimal");
  await mutateFirstForm(missingPackage, (form) => {
    delete form.leadRecipientRef;
    delete form.recipientGroup;
  });
  const missingReport = await validatePackage({ packagePath: missingPackage });
  assert.equal(missingReport.overallStatus, "failed");
  assert(missingReport.findings.some((finding) => finding.code === ErrorCode.FORM_RECIPIENT_REFERENCE_REQUIRED));

  const secretPackage = await copyFixtureToTemp("valid-minimal");
  await mutateFirstForm(secretPackage, (form) => {
    form.leadRecipientRef = "client_secret=notARealSecretForFixture";
    delete form.recipientGroup;
  });
  const secretReport = await validatePackage({ packagePath: secretPackage });
  assert.equal(secretReport.overallStatus, "failed");
  assert(secretReport.findings.some((finding) => finding.code === ErrorCode.FORM_RECIPIENT_REFERENCE_INVALID));
  assert(secretReport.findings.some((finding) => finding.code === ErrorCode.FORBIDDEN_SECRET_LIKE_VALUE));

  const conflictPackage = await copyFixtureToTemp("valid-minimal");
  await mutateFirstForm(conflictPackage, (form) => {
    form.leadRecipientRef = "events-team";
    form.recipientGroup = "other-team";
  });
  const conflictReport = await validatePackage({ packagePath: conflictPackage });
  assert.equal(conflictReport.overallStatus, "failed");
  assert(conflictReport.findings.some((finding) => finding.code === ErrorCode.FORM_RECIPIENT_REFERENCE_CONFLICT));
});

test("URL safety fixtures fail with stable URL codes", async () => {
  await assertFixtureHasCode("invalid-forbidden-local-url", ErrorCode.FORBIDDEN_LOCAL_URL);
  await assertFixtureHasCode("invalid-forbidden-staging-url", ErrorCode.FORBIDDEN_STAGING_URL);
});

test("SEO and secret fixtures fail with stable hardening codes", async () => {
  await assertFixtureHasCode("invalid-noindex-production-page", ErrorCode.SEO_NOINDEX_NOT_ALLOWED);
  await assertFixtureHasCode("invalid-secret-looking-value", ErrorCode.FORBIDDEN_SECRET_LIKE_VALUE);
});

test("report gate statuses use the approved output subset", async () => {
  const report = await validateFixture("invalid-unknown-form-reference");
  assert.equal(report.overallStatus, "failed");
  for (const gate of report.gateStatuses) {
    assert(allowedOutputStatuses.has(gate.status), `unexpected gate status ${gate.status}`);
  }
});

test("external checks remain unimplemented and skipped", async () => {
  const report = await validateFixture("valid-minimal");
  const externalGate = report.gateStatuses.find((gate) => gate.gateId === "external-checks");
  assert.equal(externalGate.status, "skipped");
  assert.equal(report.boundaryConfirmation.externalChecksImplemented, false);
});

test("CLI help exits successfully and explains support packet usage", () => {
  const result = runCli(["--help"]);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage:/);
  assert.match(result.stdout, /--support-packet/);
  assert.match(result.stdout, /Exit codes:/);
  assert.match(result.stdout, /Local-only boundary:/);
});

test("CLI missing package fails clearly", () => {
  const result = runCli(["--out", ".tmp/missing-package"]);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /Missing required --package <path> option/);
  assert.match(result.stderr, /--help/);
});

test("valid fixture support packet writes expected handoff files without copying source files", async () => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), "pumpkin-validator-support-valid-"));
  const report = await validateFixture("valid-minimal", { outDir, supportPacket: true });

  assert.equal(report.overallStatus, "passed");
  await assertFileExists(path.join(outDir, "support-packet.json"));
  await assertFileExists(path.join(outDir, "OPERATOR_HANDOFF.md"));
  await assertFileExists(path.join(outDir, "NON_TECHNICAL_SUMMARY.md"));
  await assertFileExists(path.join(outDir, "NEXT_ACTIONS.md"));
  await assertFileExists(path.join(outDir, "PACKAGE_FILE_INVENTORY.md"));

  const summary = await readFile(path.join(outDir, "NON_TECHNICAL_SUMMARY.md"), "utf8");
  const handoff = await readFile(path.join(outDir, "OPERATOR_HANDOFF.md"), "utf8");
  const inventory = await readFile(path.join(outDir, "PACKAGE_FILE_INVENTORY.md"), "utf8");
  const packet = JSON.parse(await readFile(path.join(outDir, "support-packet.json"), "utf8"));
  const outputEntries = new Set(await readdir(outDir));

  assert.match(summary, /What Passed/);
  assert.match(summary, /What Needs Fixing/);
  assert.match(summary, /Do Not Paste Secrets/);
  assert.match(handoff, /lead-form -> events-team/);
  assert.match(inventory, /Source files copied: false/);
  assert.equal(packet.sourceFilesCopied, false);
  assert.equal(packet.formRecipientRefs[0].leadRecipientRef, "events-team");
  assert.equal(packet.supportRules.externalChecksPerformed, false);
  assert.equal(outputEntries.has("tenant.json"), false);
  assert.equal(outputEntries.has("site.json"), false);
  assert.equal(outputEntries.has("pages"), false);
});

test("invalid fixture support packet includes top blockers and operator handoff guidance", async () => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), "pumpkin-validator-support-invalid-"));
  const report = await validateFixture("invalid-route-missing-page", { outDir, supportPacket: true });

  assert.equal(report.overallStatus, "failed");

  const handoff = await readFile(path.join(outDir, "OPERATOR_HANDOFF.md"), "utf8");
  const packet = JSON.parse(await readFile(path.join(outDir, "support-packet.json"), "utf8"));

  assert.match(handoff, /Top Blockers/);
  assert.match(handoff, /ROUTE_PAGE_MISSING/);
  assert.match(handoff, /Who Should Review Next/);
  assert(packet.topBlockers.some((finding) => finding.code === ErrorCode.ROUTE_PAGE_MISSING));
});

test("CLI explain-error returns plain-language explanation", () => {
  const result = runCli(["--explain-error", "JSON_PARSE_ERROR"]);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /JSON_PARSE_ERROR: JSON formatting is broken/);
  assert.match(result.stdout, /How to fix:/);
  assert.match(result.stdout, /Review owner:/);
});

async function assertFixtureHasCode(fixtureName, expectedCode) {
  const report = await validateFixture(fixtureName);
  assert.equal(report.overallStatus, "failed");
  assert(
    report.findings.some((finding) => finding.code === expectedCode),
    `${fixtureName} did not include ${expectedCode}; got ${report.findings.map((finding) => finding.code).join(", ")}`
  );
}

async function validateFixture(fixtureName, extraOptions = {}) {
  return validatePackage({
    packagePath: path.join(fixturesRoot, fixtureName),
    ...extraOptions
  });
}

async function assertFileExists(filePath) {
  await access(filePath);
}

async function copyFixtureToTemp(fixtureName) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "pumpkin-validator-fixture-"));
  const packagePath = path.join(tempDir, fixtureName);
  await cp(path.join(fixturesRoot, fixtureName), packagePath, { recursive: true });
  return packagePath;
}

async function mutateFirstForm(packagePath, mutate) {
  const formsPath = path.join(packagePath, "forms.json");
  const forms = await readJson(formsPath);
  mutate(forms.forms[0]);
  await writeJson(formsPath, forms);
}

async function makeRollerDryRunPackage(extraMutate = null) {
  const packagePath = await copyFixtureToTemp("valid-minimal");
  const files = [
    "manifest.json",
    "tenant.json",
    "site.json",
    "routes.json",
    "media-assets.json",
    "forms.json",
    "seo.json",
    "theme.json",
    "redirects.json",
    path.join("pages", "home.json")
  ];

  for (const relativePath of files) {
    const filePath = path.join(packagePath, relativePath);
    const data = deepReplace(await readJson(filePath), {
      "example-rink-rentals": "roller-rink-rentals",
      "Example Rink Rentals": "Roller Rink Rentals",
      "exampleeventrentals.com": "rollerrinkrentals.com",
      "www.exampleeventrentals.com": "www.rollerrinkrentals.com",
      "media.exampleeventrentals.com": "media.rollerrinkrentals.com",
      "event rentals": "roller rink rental services"
    });
    await writeJson(filePath, data);
  }

  const manifestPath = path.join(packagePath, "manifest.json");
  const manifest = await readJson(manifestPath);
  manifest.pausedTenantDryRunApproval = {
    tenant: "roller-rink-rentals",
    primaryDomain: "rollerrinkrentals.com",
    approvedScope: "local-offline-dry-run-only",
    externalMutationsAllowed: false,
    livePagesApproved: false,
    livePagesHardStopped: true,
    searchConsoleApproved: false,
    searchConsoleIndexingHardStopped: true,
    approvedByOwner: true
  };
  await writeJson(manifestPath, manifest);

  const tenantPath = path.join(packagePath, "tenant.json");
  const tenant = await readJson(tenantPath);
  tenant.pausedRelatedTenants = ["roller-rink-rentals"];
  await writeJson(tenantPath, tenant);

  const seoPath = path.join(packagePath, "seo.json");
  const seo = await readJson(seoPath);
  seo.defaultRobots = "noindex,nofollow";
  seo.sitemapPolicy = "disabled-until-final-gate";
  seo.canonicalBaseUrl = "https://rollerrinkrentals.com";
  seo.indexingFinalGate = true;
  await writeJson(seoPath, seo);

  if (extraMutate) {
    await extraMutate(packagePath);
  }

  return packagePath;
}

function deepReplace(value, replacements) {
  if (typeof value === "string") {
    return Object.entries(replacements).reduce((current, [from, to]) => current.replaceAll(from, to), value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepReplace(item, replacements));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, deepReplace(item, replacements)]));
  }

  return value;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeJson(filePath, data) {
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function runCli(args) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: packageRoot,
    encoding: "utf8"
  });
}
