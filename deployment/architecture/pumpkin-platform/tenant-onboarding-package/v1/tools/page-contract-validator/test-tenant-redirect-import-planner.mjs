import assert from "node:assert/strict";
import { buildTenantRedirectImportPlan } from "./tenant-redirect-import-planner.mjs";

const routes = [
  route("/legacy", "/target-a"),
  route("/meaningful-a", "/target-a"),
  route("/meaningful-b", "/target-b"),
  route("/target-a"),
  route("/target-b"),
];
const existing = [{ sourcePath: "/legacy", target: "/target-a", targetKind: "internal", statusCode: 301, active: true }];
const first = buildTenantRedirectImportPlan({ routeMap: { tenantId: "fixture", routes }, existingRedirects: existing, importCorrelationId: "fixture-import" });
assert.equal(first.valid, true);
assert.equal(first.counts.sourceDeclarations, 3);
assert.equal(first.counts.existingNoopActions, 1);
assert.equal(first.counts.createActions, 2);
assert.equal(first.actions.every((action) => action.payload.pageShadowMode === "redirect_precedes_page"), true);
assert.equal(new Set(first.actions.map((action) => action.idempotencyKey)).size, 2);

const resumedExisting = [...existing, ...first.actions.map((action) => action.payload)];
const resumed = buildTenantRedirectImportPlan({ routeMap: { tenantId: "fixture", routes }, existingRedirects: resumedExisting });
assert.equal(resumed.valid, true);
assert.equal(resumed.counts.createActions, 0);
assert.equal(resumed.counts.existingNoopActions, 3);

const self = buildTenantRedirectImportPlan({ routeMap: { tenantId: "fixture", routes: [route("/same", "/same")] } });
assert.equal(self.valid, false);
assert.equal(self.status, "blocked_before_write");
assert.equal(self.actions.length, 0);

const cycle = buildTenantRedirectImportPlan({ routeMap: { tenantId: "fixture", routes: [route("/a", "/b"), route("/b", "/c"), route("/c", "/a")] } });
assert.equal(cycle.valid, false);
assert.equal(cycle.cycles.length, 1);
assert.equal(cycle.actions.length, 0);

const unresolved = buildTenantRedirectImportPlan({ routeMap: { tenantId: "fixture", routes: [route("/old", "/missing")] } });
assert.equal(unresolved.valid, false);
assert.equal(unresolved.declarations[0].disposition, "blocked_unresolved_target");

const duplicate = buildTenantRedirectImportPlan({ routeMap: { tenantId: "fixture", routes: [route("/old", "/a"), route("/old", "/b"), route("/a"), route("/b")] } });
assert.equal(duplicate.valid, false);
assert.equal(duplicate.declarations.every((item) => item.disposition === "blocked_duplicate_source"), true);

const unsupportedStatusRoute = route("/old", "/target");
unsupportedStatusRoute.redirect.type = 200;
const unsupportedStatus = buildTenantRedirectImportPlan({ routeMap: { tenantId: "fixture", routes: [unsupportedStatusRoute, route("/target")] } });
assert.equal(unsupportedStatus.valid, false);
assert.equal(unsupportedStatus.declarations[0].disposition, "blocked_unsupported_status");

const unsupportedScheme = buildTenantRedirectImportPlan({ routeMap: { tenantId: "fixture", routes: [route("/old", "ftp://example.test/file")] } });
assert.equal(unsupportedScheme.valid, false);
assert.equal(unsupportedScheme.declarations[0].disposition, "blocked_unsupported_target_scheme");

const invalidTarget = buildTenantRedirectImportPlan({ routeMap: { tenantId: "fixture", routes: [route("/old", "/target%2Fchild")] } });
assert.equal(invalidTarget.valid, false);
assert.equal(invalidTarget.declarations[0].disposition, "blocked_invalid_target");

process.stdout.write(`${JSON.stringify({ sourceDeclarations: 3, createActions: 2, resumeCreateActions: 0, selfLoopBlocked: true, multiNodeCycleBlocked: true, unresolvedBlocked: true, duplicateBlocked: true, invalidStatusBlocked: true, invalidSchemeBlocked: true, invalidTargetBlocked: true })}\n`);

function route(routePath, target = "") {
  return {
    route: routePath,
    sourceFile: `${routePath.replace(/^\//, "") || "home"}/index.html`,
    redirect: target ? { sourceRoute: routePath, targetRoute: target, type: 301, sourceEvidence: "meta refresh + canonical + moved link" } : null,
  };
}
