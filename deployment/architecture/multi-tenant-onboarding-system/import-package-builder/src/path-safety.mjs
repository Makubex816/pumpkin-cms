import { mkdir, readFile, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

const forbiddenSegments = new Set(["content-review", "node_modules", ".git"]);
const protectedFilePatterns = [/\.env/i, /appsettings\.development\.json/i, /local\.settings\.json/i, /credential/i, /cache/i];
const temporaryOutputSegments = new Set([".tmp", "tmp", "temp"]);

export async function prepareOutputDirectory(outputDirectory, options = {}) {
  const absolutePath = path.resolve(outputDirectory);
  assertSafeOutputPath(absolutePath);
  const existing = await stat(absolutePath).catch(() => null);

  if (!existing) {
    await mkdir(absolutePath, { recursive: true });
    return absolutePath;
  }

  if (!existing.isDirectory()) {
    throw new OutputPathError(`Output path is not a directory: ${absolutePath}`);
  }

  const entries = await readdir(absolutePath);
  if (entries.length > 0 && !options.overwrite) {
    throw new OutputPathError(`Output directory is not empty. Use --overwrite to replace known generated files: ${absolutePath}`);
  }

  if (options.overwrite) {
    await assertOverwriteAllowed(absolutePath);
    await removeKnownGeneratedFiles(absolutePath);
  }

  return absolutePath;
}

export function assertSafeOutputPath(absolutePath) {
  const normalized = path.resolve(absolutePath);
  const parts = normalized.split(path.sep).filter(Boolean).map((part) => part.toLowerCase());

  if (parts.some((part) => forbiddenSegments.has(part))) {
    throw new OutputPathError(`Output path is not allowed for generated packages: ${normalized}`);
  }

  if (protectedFilePatterns.some((pattern) => pattern.test(normalized))) {
    throw new OutputPathError(`Output path looks like protected config or credential storage: ${normalized}`);
  }

  const root = path.parse(normalized).root;
  if (normalized === root) {
    throw new OutputPathError("Output path cannot be a filesystem root.");
  }
}

async function assertOverwriteAllowed(outputDirectory) {
  if (isTemporaryOutputPath(outputDirectory) || await hasGeneratedPackageMarker(outputDirectory)) {
    return;
  }

  throw new OutputPathError(`Output directory is not a temporary or recognized generated package folder: ${outputDirectory}`);
}

function isTemporaryOutputPath(outputDirectory) {
  const parts = path.resolve(outputDirectory).split(path.sep).filter(Boolean).map((part) => part.toLowerCase());
  return parts.some((part) => temporaryOutputSegments.has(part));
}

async function hasGeneratedPackageMarker(outputDirectory) {
  const manifestPath = path.join(outputDirectory, "manifest.json");
  const manifestText = await readFile(manifestPath, "utf8").catch(() => null);
  if (!manifestText) {
    return false;
  }

  try {
    const manifest = JSON.parse(manifestText);
    return manifest?.validation?.externalMutationAllowed === false
      && Array.isArray(manifest.files)
      && manifest.files.includes("manifest.json")
      && manifest.files.includes("tenant.json")
      && manifest.files.includes("site.json");
  } catch {
    return false;
  }
}

async function removeKnownGeneratedFiles(outputDirectory) {
  const knownPaths = [
    "README.md",
    "manifest.json",
    "tenant.json",
    "site.json",
    "routes.json",
    "media-assets.json",
    "forms.json",
    "seo.json",
    "theme.json",
    "redirects.json",
    "validation-report.json",
    "VALIDATION_REPORT.md",
    "support-packet.json",
    "BUILDER_PACKAGE_SUMMARY.md",
    "OPERATOR_HANDOFF.md",
    "NON_TECHNICAL_SUMMARY.md",
    "NEXT_ACTIONS.md",
    "PACKAGE_FILE_INVENTORY.md",
    "pages"
  ];

  for (const relativePath of knownPaths) {
    await rm(path.join(outputDirectory, relativePath), { recursive: true, force: true });
  }
}

export class OutputPathError extends Error {}
