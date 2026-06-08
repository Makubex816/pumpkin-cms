import { readdir, stat } from "node:fs/promises";
import path from "node:path";

export const requiredPackageFiles = [
  "manifest.json",
  "tenant.json",
  "site.json",
  "routes.json",
  "media-assets.json",
  "forms.json",
  "seo.json",
  "theme.json",
  "redirects.json"
];

export const schemaRoleByFile = Object.freeze({
  "manifest.json": "manifest",
  "tenant.json": "tenant",
  "site.json": "site",
  "routes.json": "route",
  "media-assets.json": "media-asset",
  "forms.json": "form",
  "seo.json": "seo",
  "theme.json": "theme",
  "redirects.json": "redirect"
});

export async function discoverPackage(packagePath) {
  const absolutePackagePath = path.resolve(packagePath);
  const files = [];
  const missing = [];

  const packageStat = await stat(absolutePackagePath).catch(() => null);
  if (!packageStat?.isDirectory()) {
    return {
      packagePath: absolutePackagePath,
      files,
      missing: [{ file: ".", reason: "Package path does not exist or is not a directory." }]
    };
  }

  for (const file of requiredPackageFiles) {
    const absolutePath = path.join(absolutePackagePath, file);
    const fileStat = await stat(absolutePath).catch(() => null);
    if (!fileStat?.isFile()) {
      missing.push({ file, reason: "Required package file is missing." });
      continue;
    }

    files.push({
      role: schemaRoleByFile[file],
      relativePath: file,
      absolutePath,
      required: true
    });
  }

  const pagesPath = path.join(absolutePackagePath, "pages");
  const pagesStat = await stat(pagesPath).catch(() => null);
  if (!pagesStat?.isDirectory()) {
    missing.push({ file: "pages/*.json", reason: "Required pages folder is missing." });
  } else {
    const pageFiles = (await readdir(pagesPath))
      .filter((entry) => entry.toLowerCase().endsWith(".json"))
      .sort();

    if (pageFiles.length === 0) {
      missing.push({ file: "pages/*.json", reason: "At least one page JSON file is required." });
    }

    for (const pageFile of pageFiles) {
      files.push({
        role: "page",
        relativePath: path.posix.join("pages", pageFile),
        absolutePath: path.join(pagesPath, pageFile),
        required: true
      });
    }
  }

  return {
    packagePath: absolutePackagePath,
    files,
    missing
  };
}
