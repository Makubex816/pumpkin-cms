import fs from "node:fs";

const expected = [
  "apps/starter-app",
  "packages/pumpkin-ts-models",
  "packages/pumpkin-block-views",
];

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const packageJson = readJson("package.json");
const packageLock = readJson("package-lock.json");

const manifestWorkspaces = packageJson.workspaces ?? [];
const lockRoot = packageLock.packages?.[""] ?? {};
const lockWorkspaces = lockRoot.workspaces ?? [];
const lockPackages = packageLock.packages ?? {};

const missingFromManifest = expected.filter((entry) => !manifestWorkspaces.includes(entry));
const missingFromLockRoot = expected.filter((entry) => !lockWorkspaces.includes(entry));
const missingPackageEntries = expected.filter((entry) => !lockPackages[entry]);
const unexpectedManifest = manifestWorkspaces.filter((entry) => !expected.includes(entry));

const result = {
  expected,
  manifestWorkspaces,
  lockWorkspaces,
  missingFromManifest,
  missingFromLockRoot,
  missingPackageEntries,
  unexpectedManifest,
  lockfileVersion: packageLock.lockfileVersion,
  lockPackageCount: Object.keys(lockPackages).length,
};

console.log(JSON.stringify(result, null, 2));

if (
  missingFromManifest.length > 0 ||
  missingFromLockRoot.length > 0 ||
  missingPackageEntries.length > 0 ||
  unexpectedManifest.length > 0 ||
  packageLock.lockfileVersion !== 3
) {
  process.exitCode = 1;
}
