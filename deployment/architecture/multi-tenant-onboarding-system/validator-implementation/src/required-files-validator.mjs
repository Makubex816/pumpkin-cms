import { createFinding } from "./gate-status.mjs";

export function validateRequiredFiles(discovery) {
  return discovery.missing.map((missing) =>
    createFinding({
      severity: "error",
      code: "REQUIRED_FILE_MISSING",
      file: missing.file,
      message: `${missing.file} is required but was not found.`,
      ownerExplanation: "The import package is missing a file the offline validator needs before it can safely continue.",
      operatorDetail: missing.reason,
      nextAction: `Add ${missing.file} to the package and run the validator again.`,
      gateId: "required-files"
    })
  );
}
