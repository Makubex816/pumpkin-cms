import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
const validator = path.join(directory, "redirect-semantics-validator.mjs");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "pumpkin-redirect-semantics-"));
const sourceRoot = path.join(temp, "source");
fs.mkdirSync(sourceRoot, { recursive: true });

const routes = [
  route("/legacy", "legacy/index.html", "../new/index.html", "/new", true),
  route("/new", "new/index.html"),
  route("/same", "same/index.html", "./index.html", "/same", true),
  route("/anchor", "anchor/index.html", "#details", "/anchor#details", true),
  route("/external", "external/index.html", "https://other.example/path", "https://other.example/path", true),
  route("/blocked", "blocked/index.html", "../target/index.html", "/target", true),
  route("/target", "target/index.html"),
  route("/cycle-a", "cycle-a/index.html", "../cycle-b/index.html", "/cycle-b", true),
  route("/cycle-b", "cycle-b/index.html", "../cycle-a/index.html", "/cycle-a", true),
];

for (const item of routes) {
  const file = path.join(sourceRoot, item.sourceFile);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const redirect = item.redirect;
  const head = redirect
    ? `<meta http-equiv="refresh" content="0; url=${redirect.rawTarget}"><link rel="canonical" href="${redirect.targetRoute}">`
    : "";
  const body = redirect ? `<p>This page moved.</p><a href="${redirect.rawTarget}">Continue</a>` : "<p>Target</p>";
  fs.writeFileSync(file, `<html><head>${head}</head><body>${body}</body></html>\n`);
}

const routeMapPath = path.join(temp, "route-map.json");
const persistedPath = path.join(temp, "persisted.json");
fs.writeFileSync(routeMapPath, `${JSON.stringify({ tenantId: "fixture", routes }, null, 2)}\n`);
fs.writeFileSync(persistedPath, `${JSON.stringify(["/legacy"], null, 2)}\n`);

const run = spawnSync(process.execPath, [
  validator,
  "--route-map", routeMapPath,
  "--persisted-froms", persistedPath,
  "--source-root", sourceRoot,
], { encoding: "utf8", windowsHide: true });
assert.equal(run.status, 1);
const result = JSON.parse(run.stdout);
assert.equal(result.valid, false);
assert.equal(result.status, "blocked_meaningful_redirect_requires_separate_api_support");
assert.equal(disposition(result, "/legacy"), "persisted_redirect");
assert.equal(disposition(result, "/same"), "canonical_noop");
assert.equal(disposition(result, "/anchor"), "client_anchor");
assert.equal(disposition(result, "/external"), "external_redirect");
assert.equal(disposition(result, "/blocked"), "blocked_meaningful_redirect");
assert.equal(disposition(result, "/cycle-a"), "cycle_invalid_redirect");
assert.equal(disposition(result, "/cycle-b"), "cycle_invalid_redirect");
assert.equal(result.cycles.filter((cycle) => cycle.type === "direct_self_loop").length, 1);
assert.equal(result.cycles.filter((cycle) => cycle.type === "multi_node_cycle").length, 1);
assert.equal(result.counts.semanticDispositions, 7);

fs.rmSync(temp, { recursive: true, force: true });
process.stdout.write(`${JSON.stringify({
  persistedRedirect: true,
  canonicalNoOp: true,
  clientAnchor: true,
  externalRedirect: true,
  blockedMeaningfulRedirect: true,
  directSelfLoopDetected: true,
  multiNodeCycleRejected: true,
})}\n`);

function route(routePath, sourceFile, rawTarget = "", targetRoute = "", targetExists = false) {
  return {
    route: routePath,
    sourceFile,
    redirect: rawTarget ? { sourceRoute: routePath, sourceFile, rawTarget, targetRoute, targetExists } : null,
  };
}

function disposition(result, source) {
  return result.declarations.find((item) => item.normalizedSource.path === source).disposition;
}
