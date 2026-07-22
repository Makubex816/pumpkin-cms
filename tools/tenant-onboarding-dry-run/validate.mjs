import fs from "node:fs";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

const base = ".tmp/int10-onboarding";
fs.rmSync(base, { recursive: true, force: true });
fs.mkdirSync(base, { recursive: true });

const run1 = runPlan("tools/tenant-onboarding-dry-run/synthetic-onboarding-input.json", `${base}/plan-run1.json`);
const run2 = runPlan("tools/tenant-onboarding-dry-run/synthetic-onboarding-input.json", `${base}/plan-run2.json`);
const changed = runPlan("tools/tenant-onboarding-dry-run/synthetic-onboarding-input-domain-change.json", `${base}/plan-domain-change.json`);

const run1Bytes = fs.readFileSync(`${base}/plan-run1.json`);
const run2Bytes = fs.readFileSync(`${base}/plan-run2.json`);
const changedBytes = fs.readFileSync(`${base}/plan-domain-change.json`);
const duplicateOperationKeys = new Set(run1.operationKeys).size !== run1.operationKeys.length;
const changedOperationKeysSame = JSON.stringify(run1.operationKeys) === JSON.stringify(changed.operationKeys);
const domainDelta =
  run1.context.apexDomain !== changed.context.apexDomain &&
  run1.context.wwwDomain !== changed.context.wwwDomain &&
  run1.context.tenantUid === changed.context.tenantUid &&
  changedOperationKeysSame;

const checks = {
  deterministicBytes: run1Bytes.equals(run2Bytes),
  deterministicHash: sha256(run1Bytes) === sha256(run2Bytes),
  dryRunOnly: run1.dryRunOnly === true && run1.liveMutation === false,
  noProviderCredentialRequired: run1.providerCredentialsRequired === false,
  noDuplicateOperationKeys: !duplicateOperationKeys,
  allOperationsNoMutationAuthorized: run1.operations.every((operation) => operation.mutationAuthorized === false),
  boundedDomainDelta: domainDelta && !run1Bytes.equals(changedBytes),
  approvalGatesPresent: Object.values(run1.approvals).every((value) => value === "not-approved"),
};

const result = {
  status: Object.values(checks).every(Boolean) ? "passed" : "failed",
  planSha256: sha256(run1Bytes),
  domainDeltaPlanSha256: sha256(changedBytes),
  operationCount: run1.operationCount,
  checks,
};
console.log(JSON.stringify(result, null, 2));
if (result.status !== "passed") process.exitCode = 1;

function runPlan(input, out) {
  const result = spawnSync(process.execPath, [
    "tools/tenant-onboarding-dry-run/plan.mjs",
    "--input",
    input,
    "--out",
    out,
  ], { encoding: "utf8" });
  if (result.status !== 0) {
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
  return JSON.parse(fs.readFileSync(out, "utf8"));
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
