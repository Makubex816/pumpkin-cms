import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(toolRoot, "../..");
const manifestPath = path.join(
  repoRoot,
  "deployment",
  "licensing",
  "upstream-sdi-ai-pumpkin-cms",
  "attribution-package.json",
);
const manifest = readJson(manifestPath);
const args = parseArgs(process.argv.slice(2));

validateManifest(manifest);

const files = manifest.files.map((entry) => {
  const source = resolveRepositoryFile(entry.sourcePath);
  const bytes = frozenCrLfBytes(fs.readFileSync(source, "utf8"));
  const actualSha256 = sha256(bytes);
  if (actualSha256 !== entry.sha256) {
    throw new Error(`Attribution source hash mismatch: ${entry.sourcePath}`);
  }
  return {
    source,
    packagePath: validateRelativePosixPath(entry.packagePath, "packagePath"),
    bytes,
    sha256: actualSha256,
  };
});

if (args.out) {
  const outputRoot = path.resolve(args.out);
  for (const file of files) {
    const destination = resolveInside(outputRoot, file.packagePath);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, file.bytes);
  }
}

process.stdout.write(`${JSON.stringify({
  status: "passed",
  attributionId: manifest.attributionId,
  distributionDecision: manifest.observedLicenseEvidence.distributionDecision,
  declarationConflict: manifest.observedLicenseEvidence.declarationConflict,
  materialized: Boolean(args.out),
  files: files.map(({ packagePath, bytes, sha256: hash }) => ({
    packagePath,
    bytes: bytes.length,
    sha256: hash,
  })),
}, null, 2)}\n`);

function validateManifest(value) {
  if (value?.schemaVersion !== "1.0") throw new Error("Unsupported attribution schema.");
  if (!/^[a-z0-9][a-z0-9-]+$/.test(value.attributionId ?? "")) {
    throw new Error("Invalid attribution ID.");
  }
  if (value.observedLicenseEvidence?.declarationConflict !== true) {
    throw new Error("The upstream declaration conflict must remain explicit.");
  }
  if (value.observedLicenseEvidence?.distributionDecision !== "HELD_PENDING_OWNER_LEGAL_REVIEW") {
    throw new Error("The distribution decision must remain owner/legal held.");
  }
  if (!Array.isArray(value.files) || value.files.length !== 2) {
    throw new Error("The attribution package must contain exactly LICENSE and NOTICE.");
  }
  const packagePaths = value.files.map((entry) =>
    validateRelativePosixPath(entry.packagePath, "packagePath"));
  if (new Set(packagePaths).size !== packagePaths.length) {
    throw new Error("Duplicate attribution package path.");
  }
}

function resolveRepositoryFile(relativePath) {
  const safePath = validateRelativePosixPath(relativePath, "sourcePath");
  return resolveInside(repoRoot, safePath);
}

function resolveInside(root, relativePath) {
  const destination = path.resolve(root, ...relativePath.split("/"));
  const relative = path.relative(root, destination);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Unsafe materialization path: ${relativePath}`);
  }
  return destination;
}

function validateRelativePosixPath(value, label) {
  if (typeof value !== "string"
    || !value
    || value.startsWith("/")
    || value.includes("\\")
    || /^[A-Za-z]:/.test(value)
    || value.split("/").some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error(`Invalid ${label}.`);
  }
  return value;
}

function parseArgs(values) {
  const result = {};
  for (let index = 0; index < values.length; index += 1) {
    const token = values[index];
    if (token !== "--out") throw new Error(`Unknown argument: ${token}`);
    const value = values[index + 1];
    if (!value || value.startsWith("--")) throw new Error("Missing value for --out.");
    result.out = value;
    index += 1;
  }
  return result;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function frozenCrLfBytes(value) {
  return Buffer.from(value.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n"), "utf8");
}
