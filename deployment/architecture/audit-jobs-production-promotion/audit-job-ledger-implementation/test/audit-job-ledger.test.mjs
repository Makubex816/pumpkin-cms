import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { validateLedger } from "../src/audit-job-ledger-validator.mjs";
import { createLedgerViewerModel, searchTraceIds } from "../src/audit-job-ledger-view-model.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = dirname(here);
const fixturesDir = join(packageRoot, "fixtures");

const validFixtures = [
  "valid-v2-8-production-static-release-ledger.fixture.json",
  "valid-v2-8-contact-form-verification-ledger.fixture.json",
  "valid-v2-8-indexing-deferred-ledger.fixture.json",
  "valid-v2-8-combined-promotion-ledger.fixture.json"
];

const invalidFixtures = [
  ["invalid-missing-trace-id.fixture.json", "MISSING_TRACE_ID"],
  ["invalid-missing-artifact-hash.fixture.json", "MISSING_ARTIFACT_HASH"],
  ["invalid-unsupported-event-type.fixture.json", "UNSUPPORTED_EVENT_TYPE"],
  ["invalid-promotion-gate-open-with-complete-result.fixture.json", "PROMOTION_GATE_COMPLETE_WHILE_OPEN"]
];

describe("audit/job ledger validator", () => {
  for (const fixtureName of validFixtures) {
    it(`accepts ${fixtureName}`, async () => {
      const ledger = await readFixture(fixtureName);
      const result = validateLedger(ledger);

      assert.equal(result.ok, true, JSON.stringify(result.failures, null, 2));
      assert.equal(result.failures.length, 0);
    });
  }

  for (const [fixtureName, expectedCode] of invalidFixtures) {
    it(`rejects ${fixtureName} with ${expectedCode}`, async () => {
      const ledger = await readFixture(fixtureName);
      const result = validateLedger(ledger);

      assert.equal(result.ok, false);
      assert.ok(
        result.failures.some((failure) => failure.code === expectedCode),
        JSON.stringify(result.failures, null, 2)
      );
    });
  }

  it("CLI validate exits zero for the combined valid fixture", () => {
    const result = spawnSync(
      process.execPath,
      ["src/audit-job-ledger-cli.mjs", "validate", "fixtures/valid-v2-8-combined-promotion-ledger.fixture.json"],
      {
        cwd: packageRoot,
        encoding: "utf8"
      }
    );

    assert.equal(result.status, 0, result.stderr || result.stdout);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.ok, true);
    assert.equal(parsed.summary.counts.failures, 0);
  });

  it("CLI validate exits nonzero for an invalid fixture", () => {
    const result = spawnSync(
      process.execPath,
      ["src/audit-job-ledger-cli.mjs", "validate", "fixtures/invalid-unsupported-event-type.fixture.json"],
      {
        cwd: packageRoot,
        encoding: "utf8"
      }
    );

    assert.notEqual(result.status, 0);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.ok, false);
    assert.ok(parsed.failures.some((failure) => failure.code === "UNSUPPORTED_EVENT_TYPE"));
  });

  it("creates a read-only viewer model summary for the combined valid fixture", async () => {
    const ledger = await readFixture("valid-v2-8-combined-promotion-ledger.fixture.json");
    const viewerModel = createLedgerViewerModel(ledger);

    assert.equal(viewerModel.ok, true, JSON.stringify(viewerModel.validation.failures, null, 2));
    assert.equal(viewerModel.viewerModelVersion, "audit-job-ledger-viewer.v1");
    assert.equal(viewerModel.summary.status, "read_only");
    assert.equal(viewerModel.summary.releaseState, "complete");
    assert.equal(viewerModel.summary.indexingState, "deferred");
    assert.equal(viewerModel.summary.boundaryState, "read_only");
    assert.equal(viewerModel.summary.counts.auditEvents, 11);
    assert.equal(viewerModel.summary.counts.jobRuns, 9);
    assert.equal(viewerModel.summary.counts.promotionGates, 11);
    assert.equal(viewerModel.summary.counts.evidenceBindings, 13);
    assert.equal(viewerModel.panels.length, 12);
  });

  it("creates required viewer panels, detail arrays, and future gates", async () => {
    const ledger = await readFixture("valid-v2-8-combined-promotion-ledger.fixture.json");
    const viewerModel = createLedgerViewerModel(ledger);
    const panelIds = viewerModel.panels.map((panel) => panel.id);

    assert.deepEqual(panelIds, [
      "release-summary",
      "promotion-gates",
      "job-runs",
      "audit-events",
      "evidence-bindings",
      "trace-explorer",
      "runtime-qa",
      "resource-registry-provider-profile",
      "outbound-link-manager",
      "backup-center",
      "indexing-deferred",
      "blockers-next-gates"
    ]);
    assert.ok(viewerModel.auditEvents.length > 0);
    assert.ok(viewerModel.jobRuns.length > 0);
    assert.ok(viewerModel.promotionGates.length > 0);
    assert.ok(viewerModel.evidenceBindings.length > 0);
    assert.equal(panelById(viewerModel, "indexing-deferred").state, "deferred");
    assert.equal(panelById(viewerModel, "blockers-next-gates").state, "future_boundary_required");
    assert.ok(viewerModel.nextGates.some((gate) => gate.id === "future-boundary-required"));
    assert.ok(viewerModel.nextGates.some((gate) => gate.id === "google-indexing-deferred"));
  });

  it("searches trace IDs across event trace fields", async () => {
    const ledger = await readFixture("valid-v2-8-combined-promotion-ledger.fixture.json");
    const viewerModel = createLedgerViewerModel(ledger);

    const hashResults = searchTraceIds(viewerModel, "506c6b4c99bcabed162466c79b299f900c6070855b90cd6f38ffae37fceff899");
    assert.ok(hashResults.some((entry) => entry.field === "artifactHash"));

    const routeCheckResults = searchTraceIds(viewerModel, "routecheck-v2-8-19-six-production-routes");
    assert.ok(routeCheckResults.some((entry) => entry.field === "routeCheckId"));
  });

  it("keeps an invalid ledger visible as blocked read-only viewer data", async () => {
    const ledger = await readFixture("invalid-unsupported-event-type.fixture.json");
    const viewerModel = createLedgerViewerModel(ledger);

    assert.equal(viewerModel.ok, false);
    assert.equal(viewerModel.summary.status, "invalid_ledger");
    assert.ok(viewerModel.warnings.some((warning) => warning.code === "UNSUPPORTED_EVENT_TYPE"));
    assert.ok(viewerModel.blockers.some((blocker) => blocker.code === "INVALID_LEDGER"));
  });

  it("CLI viewer-summary exits zero for the combined valid fixture", () => {
    const result = spawnSync(
      process.execPath,
      ["src/audit-job-ledger-cli.mjs", "viewer-summary", "fixtures/valid-v2-8-combined-promotion-ledger.fixture.json"],
      {
        cwd: packageRoot,
        encoding: "utf8"
      }
    );

    assert.equal(result.status, 0, result.stderr || result.stdout);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.ok, true);
    assert.equal(parsed.viewerModel.summary.status, "read_only");
    assert.equal(parsed.viewerModel.summary.indexingState, "deferred");
  });
});

async function readFixture(fixtureName) {
  const raw = await readFile(join(fixturesDir, fixtureName), "utf8");
  return JSON.parse(raw);
}

function panelById(viewerModel, id) {
  return viewerModel.panels.find((panel) => panel.id === id);
}
