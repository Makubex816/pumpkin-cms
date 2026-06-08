import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { buildImportPackage, OutputPathError } from "../src/index.mjs";
import { AnswerErrorCode } from "../src/answers-validator.mjs";
import { prepareOutputDirectory } from "../src/path-safety.mjs";
import { checkSupportPacketRedaction } from "../src/support-packet-hardening.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const validAnswers = path.join(packageRoot, "fixtures", "example-event-rentals.answers.json");
const validFullAnswers = path.join(packageRoot, "fixtures", "valid-full-package.answers.json");
const fakePilotAnswers = path.join(packageRoot, "fixtures", "fake-pilot-example-event-rentals.answers.json");
const rollerDryRunAnswers = path.join(packageRoot, "fixtures", "real-dry-run-roller-rink-rentals.answers.json");
const missingDomainAnswers = path.join(packageRoot, "fixtures", "invalid-missing-domain.answers.json");
const secretLikeAnswers = path.join(packageRoot, "fixtures", "invalid-secret-like-value.answers.json");
const invalidFixtureCases = [
  ["invalid-malformed-domain.answers.json", AnswerErrorCode.INVALID_DOMAIN],
  ["invalid-duplicate-route.answers.json", AnswerErrorCode.DUPLICATE_ROUTE],
  ["invalid-duplicate-slug.answers.json", AnswerErrorCode.DUPLICATE_PAGE_SLUG],
  ["invalid-unknown-deployment-profile.answers.json", AnswerErrorCode.UNKNOWN_DEPLOYMENT_PROFILE],
  ["invalid-trailing-slash-policy.answers.json", AnswerErrorCode.INVALID_TRAILING_SLASH_POLICY],
  ["invalid-media-unsafe-file-name.answers.json", AnswerErrorCode.UNSAFE_MEDIA_FILE_NAME],
  ["invalid-unknown-media-reference.answers.json", AnswerErrorCode.UNKNOWN_MEDIA_REFERENCE],
  ["invalid-form-missing-recipient.answers.json", AnswerErrorCode.REQUIRED_FIELD_MISSING],
  ["invalid-unknown-form-reference.answers.json", AnswerErrorCode.UNKNOWN_FORM_REFERENCE],
  ["invalid-unsafe-canonical-url.answers.json", AnswerErrorCode.INVALID_PRODUCTION_URL],
  ["invalid-paused-tenant-reference.answers.json", AnswerErrorCode.PAUSED_TENANT_REFERENCE],
  ["invalid-unrelated-tenant-reference.answers.json", AnswerErrorCode.UNRELATED_TENANT_REFERENCE],
  ["invalid-duplicate-form.answers.json", AnswerErrorCode.DUPLICATE_FORM_ID]
];
const invalidRecipientReferenceFixtureCases = [
  ["invalid-missing-lead-recipient-ref.answers.json", AnswerErrorCode.REQUIRED_FIELD_MISSING],
  ["invalid-secret-like-lead-recipient-ref.answers.json", AnswerErrorCode.SECRET_LIKE_VALUE],
  ["invalid-conflicting-recipient-reference.answers.json", AnswerErrorCode.FORM_RECIPIENT_REFERENCE_CONFLICT]
];

test("generates a valid import package and support packet", async () => {
  const outDir = await tempOutput("valid-package");
  const result = await buildImportPackage({
    answersPath: validAnswers,
    outDir,
    validate: true,
    supportPacket: true,
    overwrite: false
  });

  assert.equal(result.status, "passed");
  assert.equal(result.stage, "complete");
  assert.equal(result.validationReport.overallStatus, "passed");
  assert.equal(result.validationReport.summary.errors, 0);
  assert.equal(result.validationReport.summary.warnings, 0);
  assert.equal(result.supportPacketSafety.status, "passed");
  assert.equal(result.boundaryConfirmation.offlineOnly, true);
  assert.equal(result.boundaryConfirmation.tenantCreated, false);
  assert.equal(result.boundaryConfirmation.externalChecksImplemented, false);

  await assertExists(path.join(outDir, "manifest.json"));
  await assertExists(path.join(outDir, "tenant.json"));
  await assertExists(path.join(outDir, "pages", "home.json"));
  await assertExists(path.join(outDir, "validation-report.json"));
  await assertExists(path.join(outDir, "OPERATOR_HANDOFF.md"));
  await assertExists(path.join(outDir, "NON_TECHNICAL_SUMMARY.md"));
  await assertExists(path.join(outDir, "BUILDER_PACKAGE_SUMMARY.md"));
});

test("valid full fixture generates and validates", async () => {
  const outDir = await tempOutput("valid-full-package");
  const result = await buildImportPackage({
    answersPath: validFullAnswers,
    outDir,
    validate: true,
    supportPacket: true
  });

  assert.equal(result.status, "passed");
  assert.equal(result.validationReport.overallStatus, "passed");
  assert.equal(result.validationReport.summary.errors, 0);
  assert.equal(result.validationReport.summary.warnings, 0);

  const manifest = await readJson(path.join(outDir, "manifest.json"));
  const forms = await readJson(path.join(outDir, "forms.json"));
  assert.equal(manifest.packageVersion, "0.2.0");
  assert.equal(forms.forms.length, 1);
  assert.equal(forms.forms[0].leadRecipientRef, "primary-leads");
  assert.equal(forms.forms[0].recipientGroup, "primary-leads");
  assert.equal(forms.forms[0].recipient, undefined);
  assert.ok(result.preview.routes.forbidden.includes("/draft/"));
  assert.ok(result.preview.routes.forbidden.includes("/preview/"));
  assert.ok(result.preview.routes.forbidden.includes("/old/"));
});

test("fake pilot fixture generates requested Example Event Rentals package", async () => {
  const outDir = await tempOutput("fake-pilot-example-event-rentals");
  const result = await buildImportPackage({
    answersPath: fakePilotAnswers,
    outDir,
    validate: true,
    supportPacket: true
  });

  assert.equal(result.status, "passed");
  assert.equal(result.validationReport.overallStatus, "passed");
  assert.deepEqual(result.preview.routes.approved, ["/", "/contact/", "/service-areas/"]);
  assert.ok(result.preview.routes.forbidden.includes("/old-event-rentals/"));
  assert.ok(result.preview.routes.forbidden.includes("/old/"));

  const site = await readJson(path.join(outDir, "site.json"));
  const routes = await readJson(path.join(outDir, "routes.json"));
  const forms = await readJson(path.join(outDir, "forms.json"));
  const seo = await readJson(path.join(outDir, "seo.json"));
  const packet = await readJson(path.join(outDir, "support-packet.json"));
  const builderSummary = await readFile(path.join(outDir, "BUILDER_PACKAGE_SUMMARY.md"), "utf8");

  assert.equal(site.primaryDomain, "exampleeventrentals.com");
  assert.equal(site.deploymentProfileId, "static-azure-cloudflare-worker-graph");
  assert.deepEqual(routes.approvedRoutes, ["/", "/contact/", "/service-areas/"]);
  assert.ok(routes.forbiddenRoutes.includes("/old-event-rentals/"));
  assert.equal(forms.forms[0].formId, "contact-form");
  assert.equal(forms.forms[0].deliveryMode, "no-email");
  assert.equal(forms.forms[0].leadRecipientRef, "example-event-leads");
  assert.equal(forms.forms[0].recipientGroup, "example-event-leads");
  assert.equal(forms.forms[0].recipient, undefined);
  assert.equal(packet.formRecipientRefs[0].leadRecipientRef, "example-event-leads");
  assert.match(builderSummary, /contact-form -> example-event-leads/);
  assert.equal(seo.defaultRobots, "noindex,nofollow");
  assert.equal(seo.sitemapPolicy, "disabled-until-final-gate");
  assert.equal(seo.indexingFinalGate, true);
});

test("approved Roller local-only dry-run fixture previews without writing output", async () => {
  const outDir = path.join(await tempRoot(), "roller-dry-run-preview");
  const result = await buildImportPackage({
    answersPath: rollerDryRunAnswers,
    outDir,
    dryRun: true,
    validate: true,
    supportPacket: true
  });

  assert.equal(result.status, "passed");
  assert.equal(result.stage, "dry-run");
  assert.deepEqual(result.preview.routes.approved, ["/", "/contact/", "/service-areas/"]);
  assert.ok(result.preview.routes.forbidden.includes("/old-roller-rink-rentals/"));
  assert.equal(result.preview.formRefs[0].leadRecipientRef, "roller-rink-leads");
  assert.deepEqual(result.filesWritten, []);
  await assertMissing(outDir);
});

test("Roller paused tenant reference without explicit local-only approval still fails", async () => {
  const answersPath = await mutatedRollerAnswers("roller-no-approval", (answers) => {
    delete answers.pausedTenantDryRunApproval;
  });

  await assertRollerAnswersFail(answersPath, AnswerErrorCode.PAUSED_TENANT_REFERENCE);
});

test("generic paused tenant dry-run approval still fails", async () => {
  const answersPath = await mutatedRollerAnswers("roller-generic-approval", (answers) => {
    answers.pausedTenantDryRunApproval.tenant = "generic-paused-tenant";
  });

  await assertRollerAnswersFail(answersPath, AnswerErrorCode.PAUSED_TENANT_DRY_RUN_APPROVAL_INVALID);
});

test("mismatched paused tenant dry-run domain still fails", async () => {
  const answersPath = await mutatedRollerAnswers("roller-mismatched-domain", (answers) => {
    answers.pausedTenantDryRunApproval.primaryDomain = "exampleeventrentals.com";
  });

  await assertRollerAnswersFail(answersPath, AnswerErrorCode.PAUSED_TENANT_DRY_RUN_APPROVAL_INVALID);
});

test("paused tenant dry-run approval with external mutations still fails", async () => {
  const answersPath = await mutatedRollerAnswers("roller-external-mutations", (answers) => {
    answers.pausedTenantDryRunApproval.externalMutationsAllowed = true;
  });

  await assertRollerAnswersFail(answersPath, AnswerErrorCode.PAUSED_TENANT_DRY_RUN_APPROVAL_INVALID);
});

test("paused tenant dry-run approval with live pages approved still fails", async () => {
  const answersPath = await mutatedRollerAnswers("roller-live-pages", (answers) => {
    answers.pausedTenantDryRunApproval.livePagesApproved = true;
  });

  await assertRollerAnswersFail(answersPath, AnswerErrorCode.PAUSED_TENANT_DRY_RUN_APPROVAL_INVALID);
});

test("paused tenant dry-run approval with Search Console approved still fails", async () => {
  const answersPath = await mutatedRollerAnswers("roller-search-console", (answers) => {
    answers.pausedTenantDryRunApproval.searchConsoleApproved = true;
  });

  await assertRollerAnswersFail(answersPath, AnswerErrorCode.PAUSED_TENANT_DRY_RUN_APPROVAL_INVALID);
});

test("normalizes page and route paths in generated package", async () => {
  const outDir = await tempOutput("normalized-routes");
  await buildImportPackage({
    answersPath: validAnswers,
    outDir,
    validate: false,
    overwrite: false
  });

  const routes = await readJson(path.join(outDir, "routes.json"));
  const contact = await readJson(path.join(outDir, "pages", "contact.json"));
  const serviceAreas = await readJson(path.join(outDir, "pages", "service-areas.json"));

  assert.deepEqual(routes.approvedRoutes, ["/", "/contact/", "/service-areas/"]);
  assert.equal(contact.route, "/contact/");
  assert.equal(serviceAreas.route, "/service-areas/");
});

test("rejects answers with missing required domain before writing package", async () => {
  const outDir = await tempOutput("missing-domain");
  const result = await buildImportPackage({
    answersPath: missingDomainAnswers,
    outDir,
    validate: true,
    supportPacket: true
  });

  assert.equal(result.status, "failed");
  assert.equal(result.stage, "answers-validation");
  assert.match(result.errors.map((issue) => issue.path).join("\n"), /domains\.primaryDomain/);
  assert.match(result.errors.map((issue) => issue.suggestedFix).join("\n"), /root domain|field/i);
  assert.ok(result.errors.some((issue) => issue.code === AnswerErrorCode.REQUIRED_FIELD_MISSING));
  assert.ok(!result.errors.some((issue) => issue.code === AnswerErrorCode.INVALID_DOMAIN));
  await assertMissing(path.join(outDir, "manifest.json"));
});

test("rejects secret-like answers before writing package", async () => {
  const outDir = await tempOutput("secret-like");
  const result = await buildImportPackage({
    answersPath: secretLikeAnswers,
    outDir,
    validate: true,
    supportPacket: true
  });

  assert.equal(result.status, "failed");
  assert.equal(result.stage, "answers-validation");
  assert.ok(result.errors.some((issue) => issue.code === AnswerErrorCode.SECRET_LIKE_VALUE));
  assert.ok(result.errors.every((issue) => !String(issue.message).includes("notARealSecretForFixture")));
  await assertMissing(path.join(outDir, "manifest.json"));
});

for (const [fixtureName, expectedCode] of invalidFixtureCases) {
  test(`${fixtureName} fails safely with ${expectedCode}`, async () => {
    const outDir = await tempOutput(fixtureName.replace(".answers.json", ""));
    const result = await buildImportPackage({
      answersPath: path.join(packageRoot, "fixtures", fixtureName),
      outDir,
      validate: true,
      supportPacket: true
    });

    assert.equal(result.status, "failed");
    assert.equal(result.stage, "answers-validation");
    assert.ok(result.errors.some((issue) => issue.code === expectedCode), JSON.stringify(result.errors, null, 2));
    assert.ok(result.errors.every((issue) => issue.suggestedFix));
    assert.ok(result.errors.every((issue) => issue.askForHelp));
    await assertMissing(path.join(outDir, "manifest.json"));
  });
}

for (const [fixtureName, expectedCode] of invalidRecipientReferenceFixtureCases) {
  test(`${fixtureName} fails safely with ${expectedCode}`, async () => {
    const outDir = await tempOutput(fixtureName.replace(".answers.json", ""));
    const result = await buildImportPackage({
      answersPath: path.join(packageRoot, "fixtures", fixtureName),
      outDir,
      validate: true,
      supportPacket: true
    });

    assert.equal(result.status, "failed");
    assert.equal(result.stage, "answers-validation");
    assert.ok(result.errors.some((issue) => issue.code === expectedCode), JSON.stringify(result.errors, null, 2));
    assert.ok(result.errors.every((issue) => issue.suggestedFix));
    assert.ok(result.errors.every((issue) => issue.askForHelp));
    await assertMissing(path.join(outDir, "forms.json"));
  });
}

test("requires overwrite for a non-empty output directory", async () => {
  const outDir = await tempOutput("overwrite-required");
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "keep.txt"), "do not remove\n", "utf8");

  await assert.rejects(
    () => buildImportPackage({ answersPath: validAnswers, outDir, validate: false }),
    OutputPathError
  );
});

test("overwrite removes known generated files and preserves unrelated files", async () => {
  const outDir = await tempOutput("overwrite-preserve");
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "keep.txt"), "operator note\n", "utf8");
  await writeFile(path.join(outDir, "manifest.json"), "{\"old\":true}\n", "utf8");

  const result = await buildImportPackage({
    answersPath: validAnswers,
    outDir,
    validate: false,
    overwrite: true
  });

  assert.equal(result.status, "passed");
  assert.equal(await readFile(path.join(outDir, "keep.txt"), "utf8"), "operator note\n");
  const manifest = await readJson(path.join(outDir, "manifest.json"));
  assert.equal(manifest.tenantId, "example-event-rentals");
});

test("rejects protected content-review output paths", async () => {
  const outDir = path.join(await tempRoot(), "content-review", "generated");

  await assert.rejects(
    () => buildImportPackage({ answersPath: validAnswers, outDir, validate: false }),
    OutputPathError
  );
});

test("rejects overwrite on non-temp folders without generated package marker", async () => {
  const outDir = path.join(packageRoot, ".unsafe-overwrite-check");
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "README.md"), "ordinary folder\n", "utf8");

  try {
    await assert.rejects(
      () => prepareOutputDirectory(outDir, { overwrite: true }),
      OutputPathError
    );
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});

test("dry-run reports planned files without writing output", async () => {
  const outDir = path.join(await tempRoot(), "dry-run-output");
  const result = await buildImportPackage({
    answersPath: validAnswers,
    outDir,
    dryRun: true,
    validate: true,
    supportPacket: true
  });

  assert.equal(result.status, "passed");
  assert.equal(result.stage, "dry-run");
  assert.ok(result.filesPlanned.includes("manifest.json"));
  assert.equal(result.preview.counts.create, result.filesPlanned.length);
  assert.equal(result.preview.validator.willRun, true);
  assert.match(result.preview.validator.command, /support-packet/);
  assert.deepEqual(result.filesWritten, []);
  await assertMissing(outDir);
});

test("dry-run preview summarizes overwrites without writing output", async () => {
  const outDir = await tempOutput("preview-overwrite");
  await buildImportPackage({
    answersPath: validAnswers,
    outDir,
    validate: false
  });
  const before = await readFile(path.join(outDir, "manifest.json"), "utf8");

  const result = await buildImportPackage({
    answersPath: validFullAnswers,
    outDir,
    dryRun: true,
    validate: true,
    supportPacket: true
  });

  assert.equal(result.status, "passed");
  assert.ok(result.preview.counts.overwrite > 0);
  assert.equal(await readFile(path.join(outDir, "manifest.json"), "utf8"), before);
});

test("CLI help lists support packet option", () => {
  const cli = spawnSync(process.execPath, ["src/builder-cli.mjs", "--help"], {
    cwd: packageRoot,
    encoding: "utf8"
  });

  assert.equal(cli.status, 0);
  assert.match(cli.stdout, /--support-packet/);
  assert.match(cli.stdout, /Local-only boundary/);
});

test("CLI invalid answers print plain fixes without malformed URL suggestions", () => {
  const cli = spawnSync(process.execPath, [
    "src/builder-cli.mjs",
    "--answers",
    "fixtures/invalid-malformed-domain.answers.json",
    "--out",
    ".tmp/cli-invalid-malformed-domain",
    "--validate",
    "--support-packet"
  ], {
    cwd: packageRoot,
    encoding: "utf8"
  });

  assert.equal(cli.status, 1);
  assert.match(cli.stdout, /ANSWERS_INVALID_DOMAIN/);
  assert.match(cli.stdout, /Fix:/);
  assert.match(cli.stdout, /Ask for help:/);
  assert.doesNotMatch(cli.stdout, /https:\/\/https:\/\//);
});

test("generated core files contain no secret-like values", async () => {
  const outDir = await tempOutput("secret-scan");
  await buildImportPackage({
    answersPath: validAnswers,
    outDir,
    validate: false
  });

  const coreFiles = await listFiles(outDir);
  const generatedText = (await Promise.all(coreFiles.map((file) => readFile(file, "utf8")))).join("\n");
  assert.doesNotMatch(generatedText, /client_secret|access_token|api[_-]?key\s*[:=]|password\s*[:=]|-----BEGIN/i);
  assert.doesNotMatch(generatedText, /AKIA[0-9A-Z]{16}/);
});

test("support packet omits raw answers and passes redaction scan", async () => {
  const outDir = await tempOutput("support-redaction");
  const result = await buildImportPackage({
    answersPath: validAnswers,
    outDir,
    validate: true,
    supportPacket: true
  });

  assert.equal(result.supportPacketSafety.status, "passed");
  assert.deepEqual(result.supportPacketSafety.filesChecked.sort(), [
    "BUILDER_PACKAGE_SUMMARY.md",
    "NEXT_ACTIONS.md",
    "NON_TECHNICAL_SUMMARY.md",
    "OPERATOR_HANDOFF.md",
    "PACKAGE_FILE_INVENTORY.md",
    "support-packet.json"
  ]);
  const supportText = await readFile(path.join(outDir, "support-packet.json"), "utf8");
  const handoffText = await readFile(path.join(outDir, "OPERATOR_HANDOFF.md"), "utf8");
  const nextActionsText = await readFile(path.join(outDir, "NEXT_ACTIONS.md"), "utf8");
  const builderSummary = await readFile(path.join(outDir, "BUILDER_PACKAGE_SUMMARY.md"), "utf8");

  assert.doesNotMatch(supportText, /example-event-rentals\.answers\.json/);
  assert.match(supportText, /"sourceFilesCopied": false/);
  assert.match(handoffText, /Stop Points/);
  assert.match(nextActionsText, /Next Actions/);
  assert.match(builderSummary, /Generated Package/);
  assert.match(builderSummary, /Validation/);
});

test("redaction checker fails closed on secret-like support packet values", async () => {
  const outDir = await tempOutput("support-redaction-fails");
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "support-packet.json"), `${"client"}_secret=notARealSecretForFixture\n`, "utf8");

  const result = await checkSupportPacketRedaction({
    outputDirectory: outDir,
    answersPath: validAnswers
  });

  assert.equal(result.status, "failed");
  assert.ok(result.secretLikeFindings.length > 0);
});

test("builder source contains no external call hooks", async () => {
  const sourceFiles = (await listFiles(path.join(packageRoot, "src"))).filter((file) => file.endsWith(".mjs"));
  const sourceText = (await Promise.all(sourceFiles.map((file) => readFile(file, "utf8")))).join("\n");

  assert.doesNotMatch(sourceText, /fetch\s*\(/);
  assert.doesNotMatch(sourceText, /axios|http\.request|https\.request|node:http|node:https|node:dns|sendMail|nodemailer|URLInspection|submitSitemap/i);
  assert.doesNotMatch(sourceText, /searchConsole\.(submit|inspect|index|request)/i);
});

async function tempOutput(name) {
  return path.join(await tempRoot(), name);
}

async function tempRoot() {
  return mkdtemp(path.join(os.tmpdir(), "pumpkin-builder-test-"));
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function mutatedRollerAnswers(name, mutate) {
  const answers = await readJson(rollerDryRunAnswers);
  mutate(answers);
  const filePath = path.join(await tempRoot(), `${name}.answers.json`);
  await writeFile(filePath, `${JSON.stringify(answers, null, 2)}\n`, "utf8");
  return filePath;
}

async function assertRollerAnswersFail(answersPath, expectedCode) {
  const outDir = await tempOutput(path.basename(answersPath, ".answers.json"));
  const result = await buildImportPackage({
    answersPath,
    outDir,
    dryRun: true,
    validate: true,
    supportPacket: true
  });

  assert.equal(result.status, "failed");
  assert.equal(result.stage, "answers-validation");
  assert.ok(result.errors.some((issue) => issue.code === expectedCode), JSON.stringify(result.errors, null, 2));
  await assertMissing(outDir);
}

async function assertExists(filePath) {
  await access(filePath);
}

async function assertMissing(filePath) {
  await assert.rejects(() => access(filePath));
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(absolute));
    } else {
      files.push(absolute);
    }
  }
  return files;
}
