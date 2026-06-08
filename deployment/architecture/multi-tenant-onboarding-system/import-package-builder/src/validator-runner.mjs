import { validatePackage } from "../../validator-implementation/src/index.mjs";

export async function runOfflineValidator({ packagePath, supportPacket = false, json, markdown }) {
  return validatePackage({
    packagePath,
    outDir: packagePath,
    supportPacket,
    json,
    markdown
  });
}
