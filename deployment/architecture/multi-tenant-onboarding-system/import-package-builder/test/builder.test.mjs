import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { buildImportPackage, OutputPathError } from "../src/index.mjs";
import { prepareOutputDirectory } from "../src/path-safety.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const validAnswers = path.join(packageRoot, "fixtures", "example-event-rentals.answers.json");
const missingDomainAnswers = path.join(packageRoot, "fixtures", "invalid-missing-domain.answers.json");
const secretLikeAnswers = path.join(packageRoot, "fixtures", "invalid-secret-like-value.answers.json");

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
  assert.equal(result.boundaryConfirmation.offlineOnly, true);
  assert.equal(result.boundaryConfirmation.tenantCreated, false);
  assert.equal(result.boundaryConfirmation.externalChecksImplemented, false);

  await assertExists(path.join(outDir, "manifest.json"));
  await assertExists(path.join(outDir, "tenant.json"));
  await assertExists(path.join(outDir, "pages", "home.json"));
  await assertExists(path.join(outDir, "validation-report.json"));
  await assertExists(path.join(outDir, "OPERATOR_HANDOFF.md"));
  await assertExists(path.join(outDir, "NON_TECHNICAL_SUMMARY.md"));
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
  assert.match(result.errors.map((issue) => issue.message).join("\n"), /Secret-like value detected/);
  await assertMissing(path.join(outDir, "manifest.json"));
});

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
  assert.deepEqual(result.filesWritten, []);
  await assertMissing(outDir);
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

async function tempOutput(name) {
  return path.join(await tempRoot(), name);
}

async function tempRoot() {
  return mkdtemp(path.join(os.tmpdir(), "pumpkin-builder-test-"));
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
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
