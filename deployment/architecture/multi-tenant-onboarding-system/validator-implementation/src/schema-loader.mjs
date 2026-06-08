import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const implementationRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const architectureRoot = path.resolve(implementationRoot, "..");
export const defaultSchemaDirectory = path.join(architectureRoot, "import-package-spec", "schemas");

export const schemaFileByRole = Object.freeze({
  manifest: "manifest.schema.json",
  tenant: "tenant.schema.json",
  site: "site.schema.json",
  route: "route.schema.json",
  "media-asset": "media-asset.schema.json",
  form: "form.schema.json",
  seo: "seo.schema.json",
  theme: "theme.schema.json",
  redirect: "redirect.schema.json",
  page: "page.schema.json"
});

export async function loadSchemas(schemaDirectory = defaultSchemaDirectory) {
  const entries = await readdir(schemaDirectory);
  const registry = new Map();

  for (const [role, fileName] of Object.entries(schemaFileByRole)) {
    if (!entries.includes(fileName)) {
      throw new Error(`Schema file not found for role ${role}: ${fileName}`);
    }

    const absolutePath = path.join(schemaDirectory, fileName);
    const schema = JSON.parse(await readFile(absolutePath, "utf8"));
    registry.set(role, {
      role,
      fileName,
      absolutePath,
      id: schema.$id ?? null,
      schema
    });
  }

  return {
    schemaDirectory,
    roles: [...registry.keys()],
    get(role) {
      return registry.get(role) ?? null;
    }
  };
}
