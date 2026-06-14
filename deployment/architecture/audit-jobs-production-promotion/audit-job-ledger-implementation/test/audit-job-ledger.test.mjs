import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { validateLedger } from "../src/audit-job-ledger-validator.mjs";

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
});

async function readFixture(fixtureName) {
  const raw = await readFile(join(fixturesDir, fixtureName), "utf8");
  return JSON.parse(raw);
}
