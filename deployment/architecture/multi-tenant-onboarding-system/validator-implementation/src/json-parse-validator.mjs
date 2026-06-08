import { readFile } from "node:fs/promises";
import { createFinding } from "./gate-status.mjs";
import { ErrorCode } from "./error-codes.mjs";

export async function parseJsonFiles(files) {
  const parsed = new Map();
  const findings = [];

  for (const file of files) {
    const content = await readFile(file.absolutePath, "utf8");

    if (content.trim().length === 0) {
      findings.push(
        createFinding({
          severity: "error",
          code: ErrorCode.JSON_EMPTY_FILE,
          file: file.relativePath,
          message: `${file.relativePath} is empty.`,
          ownerExplanation: "The validator found a required JSON file with no content.",
          operatorDetail: "Empty JSON files cannot be parsed or validated.",
          nextAction: "Add valid JSON content or replace the file from the template package.",
          gateId: "json-parse"
        })
      );
      continue;
    }

    try {
      parsed.set(file.relativePath, {
        ...file,
        data: JSON.parse(content)
      });
    } catch (error) {
      findings.push(
        createFinding({
          severity: "error",
          code: ErrorCode.JSON_PARSE_ERROR,
          file: file.relativePath,
          message: `${file.relativePath} is not valid JSON.`,
          ownerExplanation: "One of the package files cannot be read because the JSON syntax is broken.",
          operatorDetail: error.message,
          nextAction: "Fix the JSON syntax and run the validator again.",
          gateId: "json-parse"
        })
      );
    }
  }

  return { parsed, findings };
}
