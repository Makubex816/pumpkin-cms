import path from "node:path";
import { loadAnswers, BuilderInputError } from "./answers-loader.mjs";
import { validateAnswers } from "./answers-validator.mjs";
import { generatePackagePlan, writePackagePlan } from "./package-generator.mjs";
import { prepareOutputDirectory, OutputPathError } from "./path-safety.mjs";
import { runOfflineValidator } from "./validator-runner.mjs";

export async function buildImportPackage(options) {
  const answersRecord = await loadAnswers(options.answersPath);
  const answerValidation = validateAnswers(answersRecord.answers);
  if (!answerValidation.valid) {
    return {
      status: "failed",
      stage: "answers-validation",
      errors: answerValidation.errors,
      answersPath: answersRecord.answersPath,
      outputDirectory: options.outDir ? path.resolve(options.outDir) : null,
      filesPlanned: [],
      filesWritten: [],
      validationReport: null,
      boundaryConfirmation: boundaryConfirmation()
    };
  }

  const files = generatePackagePlan(answersRecord.answers);
  const outputDirectory = path.resolve(options.outDir);

  if (options.dryRun) {
    return {
      status: "passed",
      stage: "dry-run",
      errors: [],
      answersPath: answersRecord.answersPath,
      outputDirectory,
      filesPlanned: files.map((file) => file.relativePath),
      filesWritten: [],
      validationReport: null,
      boundaryConfirmation: boundaryConfirmation()
    };
  }

  const safeOutputDirectory = await prepareOutputDirectory(outputDirectory, { overwrite: options.overwrite });
  await writePackagePlan(files, safeOutputDirectory);

  let validationReport = null;
  if (options.validate || options.supportPacket) {
    validationReport = await runOfflineValidator({
      packagePath: safeOutputDirectory,
      supportPacket: options.supportPacket,
      json: options.json,
      markdown: options.markdown
    });
  }

  const validatorFailed = validationReport?.overallStatus === "failed";

  return {
    status: validatorFailed ? "failed" : "passed",
    stage: validatorFailed ? "validator" : "complete",
    errors: [],
    answersPath: answersRecord.answersPath,
    outputDirectory: safeOutputDirectory,
    filesPlanned: files.map((file) => file.relativePath),
    filesWritten: files.map((file) => file.relativePath),
    validationReport,
    boundaryConfirmation: boundaryConfirmation()
  };
}

export { BuilderInputError, OutputPathError };

function boundaryConfirmation() {
  return {
    offlineOnly: true,
    externalChecksImplemented: false,
    tenantCreated: false,
    cmsWrites: false,
    mediaAssetWrites: false,
    azureChanges: false,
    cloudflareChanges: false,
    dnsChanges: false,
    deployment: false,
    functionSettingChanges: false,
    emailMicrosoft365Work: false,
    searchConsoleIndexingActions: false,
    rollerWork: false,
    protectedConfigReads: false
  };
}
