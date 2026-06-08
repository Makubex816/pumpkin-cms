import path from "node:path";
import { loadAnswers, BuilderInputError } from "./answers-loader.mjs";
import { validateAnswers } from "./answers-validator.mjs";
import { generatePackagePlan, writePackagePlan } from "./package-generator.mjs";
import { buildPackagePreview } from "./package-preview.mjs";
import { prepareOutputDirectory, OutputPathError } from "./path-safety.mjs";
import { checkSupportPacketRedaction, writeBuilderPackageSummary } from "./support-packet-hardening.mjs";
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
      preview: null,
      validationReport: null,
      supportPacketSafety: null,
      boundaryConfirmation: boundaryConfirmation()
    };
  }

  const files = generatePackagePlan(answersRecord.answers);
  const outputDirectory = path.resolve(options.outDir);
  const preview = await buildPackagePreview({
    answers: answersRecord.answers,
    files,
    outputDirectory,
    validate: options.validate,
    supportPacket: options.supportPacket
  });

  if (options.dryRun) {
    return {
      status: "passed",
      stage: "dry-run",
      errors: [],
      answersPath: answersRecord.answersPath,
      outputDirectory,
      filesPlanned: files.map((file) => file.relativePath),
      filesWritten: [],
      preview,
      validationReport: null,
      supportPacketSafety: null,
      boundaryConfirmation: boundaryConfirmation()
    };
  }

  const safeOutputDirectory = await prepareOutputDirectory(outputDirectory, { overwrite: options.overwrite });
  await writePackagePlan(files, safeOutputDirectory);

  let validationReport = null;
  let supportPacketSafety = null;
  if (options.validate || options.supportPacket) {
    validationReport = await runOfflineValidator({
      packagePath: safeOutputDirectory,
      supportPacket: options.supportPacket,
      json: options.json,
      markdown: options.markdown
    });
  }

  if (options.supportPacket) {
    await writeBuilderPackageSummary({
      outputDirectory: safeOutputDirectory,
      preview,
      validationReport
    });
    supportPacketSafety = await checkSupportPacketRedaction({
      outputDirectory: safeOutputDirectory,
      answersPath: answersRecord.answersPath
    });
  }

  const validatorFailed = validationReport?.overallStatus === "failed";
  const supportPacketFailed = supportPacketSafety?.status === "failed";

  return {
    status: validatorFailed || supportPacketFailed ? "failed" : "passed",
    stage: validatorFailed ? "validator" : supportPacketFailed ? "support-packet-redaction" : "complete",
    errors: supportPacketFailed ? supportPacketSafety.findings : [],
    answersPath: answersRecord.answersPath,
    outputDirectory: safeOutputDirectory,
    filesPlanned: files.map((file) => file.relativePath),
    filesWritten: files.map((file) => file.relativePath),
    preview,
    validationReport,
    supportPacketSafety,
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
