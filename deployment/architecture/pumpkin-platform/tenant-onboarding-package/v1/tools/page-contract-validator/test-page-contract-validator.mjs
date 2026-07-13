import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const [pagesPath, definitionsPath, existingSlugsPath, originalContactPath] = process.argv.slice(2).map((value) => path.resolve(value));
if (![pagesPath, definitionsPath, existingSlugsPath, originalContactPath].every(Boolean)) {
  throw new Error("Usage: node test-page-contract-validator.mjs <pages> <definitions> <existing-slugs> <original-contact>");
}

const directory = path.dirname(fileURLToPath(import.meta.url));
const project = path.join(directory, "page-contract-validator.csproj");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "pumpkin-page-contract-validator-"));
const pages = JSON.parse(fs.readFileSync(pagesPath, "utf8"));
const originalContact = JSON.parse(fs.readFileSync(originalContactPath, "utf8"));

function run(name, value, extraArguments = []) {
  const fixture = path.join(temp, `${name}.json`);
  fs.writeFileSync(fixture, `${JSON.stringify(value, null, 2)}\n`);
  const result = spawnSync("dotnet", [
    "run", "--project", project, "--",
    "--pages", fixture,
    "--definitions", definitionsPath,
    "--existing-slugs", existingSlugsPath,
    "--expected-tenant", "strip-club-near-me-vegas",
    "--expected-pages", "43",
    "--expected-remaining", "26",
    ...extraArguments,
  ], { encoding: "utf8", windowsHide: true });
  return { status: result.status, json: JSON.parse(result.stdout) };
}

const valid = run("valid", pages);
assert.equal(valid.status, 0);
assert.equal(valid.json.valid, true);
assert.deepEqual(valid.json.counts, {
  pages: 43,
  existing: 17,
  remaining: 26,
  repairedContact: 1,
  pending: 25,
  redirects: 3,
  globalFormDefinitions: 32,
  errors: 0,
  warnings: 0,
});

const missingFormBlock = structuredClone(pages);
missingFormBlock[missingFormBlock.findIndex((page) => page.pageSlug === "contact")] = originalContact;
const missingResult = run("missing-form-block", missingFormBlock);
assert.equal(missingResult.status, 1);
assert.ok(missingResult.json.pages.find((page) => page.PageSlug === "contact").Issues.some((issue) => issue.Code === "contact.formBlock.missing"));

const duplicate = structuredClone(pages);
duplicate[1].id = duplicate[0].id;
duplicate[1].PageId = duplicate[0].PageId;
const duplicateResult = run("duplicate-id", duplicate);
assert.equal(duplicateResult.status, 1);
assert.ok(duplicateResult.json.globalIssues.some((issue) => issue.Code === "page.id.duplicate"));

const unsupported = structuredClone(pages);
unsupported[20].ContentData.ContentBlocks.push({ type: "unsupportedBlock", content: {} });
const unsupportedResult = run("unsupported-block", unsupported);
assert.equal(unsupportedResult.status, 1);
assert.ok(unsupportedResult.json.pages[20].Issues.some((issue) => issue.Code === "blocks.unknownType"));

const badReference = structuredClone(pages);
const contact = badReference.find((page) => page.pageSlug === "contact");
contact.ContentData.ContentBlocks.find((block) => block.type === "formBlock").content.canonicalFormDefinitionRef = "missing-contact-form";
const referenceResult = run("bad-reference", badReference);
assert.equal(referenceResult.status, 1);
assert.ok(referenceResult.json.pages.find((page) => page.PageSlug === "contact").Issues.some((issue) => issue.Code === "contact.formBlock.canonicalReference"));

const redirectUpdateResult = run("pending-redirect-update", pages, ["--redirect-application", "update-pending-pages"]);
assert.equal(redirectUpdateResult.status, 1);
assert.equal(redirectUpdateResult.json.pages.filter((page) => page.Issues.some((issue) => issue.Code === "redirect.update.currentPageSourceUnsupported")).length, 2);

fs.rmSync(temp, { recursive: true, force: true });
process.stdout.write(`${JSON.stringify({ validBundle: true, missingContactRejected: true, duplicateIdRejected: true, unsupportedBlockRejected: true, badCanonicalReferenceRejected: true, pendingMeaningfulRedirectUpdateRejected: true })}\n`);
