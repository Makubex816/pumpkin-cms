import { readFile } from "node:fs/promises";
import path from "node:path";

export async function loadAnswers(answersPath) {
  const absolutePath = path.resolve(answersPath);
  let raw;

  try {
    raw = await readFile(absolutePath, "utf8");
  } catch (error) {
    throw new BuilderInputError(`Could not read answers file: ${absolutePath}`, { cause: error });
  }

  try {
    return {
      answersPath: absolutePath,
      answers: JSON.parse(raw)
    };
  } catch (error) {
    throw new BuilderInputError(`Answers file is not valid JSON: ${absolutePath}`, { cause: error });
  }
}

export class BuilderInputError extends Error {}
