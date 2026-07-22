import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

const base = ".tmp/int10-static-tenant";
const runs = ["run1", "run2"];
fs.rmSync(base, { recursive: true, force: true });

const manifests = [];
for (const run of runs) {
  const result = spawnSync(process.execPath, [
    "tools/static-tenant-publication/build.mjs",
    "--input",
    "tools/static-tenant-publication/synthetic-tenant.json",
    "--out",
    `${base}/${run}/out`,
    "--package",
    `${base}/${run}/synthetic-tenant-static-artifact.tar`,
    "--manifest",
    `${base}/${run}/synthetic-tenant-static-artifact-manifest.json`,
  ], { encoding: "utf8" });
  if (result.status !== 0) {
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
  manifests.push(readJson(`${base}/${run}/synthetic-tenant-static-artifact-manifest.json`));
}

const [first, second] = manifests;
const firstManifestBytes = fs.readFileSync(`${base}/run1/synthetic-tenant-static-artifact-manifest.json`);
const secondManifestBytes = fs.readFileSync(`${base}/run2/synthetic-tenant-static-artifact-manifest.json`);

const checks = [
  ["package hash", first.packageSha256 === second.packageSha256],
  ["manifest bytes", firstManifestBytes.equals(secondManifestBytes)],
  ["file inventory", JSON.stringify(first.files) === JSON.stringify(second.files)],
  ["no live mutation", first.liveMutation === false && second.liveMutation === false],
  ["staticwebapp config present", first.files.some((file) => file.path === "staticwebapp.config.json")],
  ["tenant manifest present", first.files.some((file) => file.path === "tenant-manifest.json")],
  ["contact route present", first.files.some((file) => file.path === "contact/index.html")],
];

const outputRoot = `${base}/run1/out`;
const publicText = collectPublicText(outputRoot);
const forbiddenPatterns = [
  /BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY/i,
  new RegExp(`Account${"Key="}`, "i"),
  new RegExp(`Shared${"Access"}${"Signature"}`, "i"),
  new RegExp(`client${"_"}secret`, "i"),
  new RegExp(`connection${"String"}`, "i"),
  new RegExp(`sk${"_"}live${"_"}`, "i"),
  new RegExp(`C:${"\\\\"}Users${"\\\\"}`, "i"),
  /\/mnt\/data\//i,
];
checks.push(["public artifact hygiene", !forbiddenPatterns.some((pattern) => pattern.test(publicText))]);
checks.push(["no raw logs", !/stack trace|exception at|debug log/i.test(publicText)]);

const failed = checks.filter(([, ok]) => !ok);
const result = {
  status: failed.length === 0 ? "passed" : "failed",
  packageSha256: first.packageSha256,
  packageBytes: first.packageBytes,
  fileCount: first.fileCount,
  manifestSha256: sha256(firstManifestBytes),
  checks: Object.fromEntries(checks),
};
console.log(JSON.stringify(result, null, 2));
if (failed.length > 0) process.exitCode = 1;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function collectPublicText(root) {
  const files = [];
  walk(root, files);
  return files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
}

function walk(directory, files) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath, files);
    else if (entry.isFile()) files.push(fullPath);
  }
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
