import path from "node:path";
import { discoverPackage } from "./package-discovery.mjs";
import { validateRequiredFiles } from "./required-files-validator.mjs";
import { parseJsonFiles } from "./json-parse-validator.mjs";
import { loadSchemas } from "./schema-loader.mjs";
import { validateParsedDocuments } from "./schema-validator.mjs";
import { validateSimpleCrossFile } from "./simple-cross-file-validator.mjs";
import { validateUrlSafety } from "./validators/url-safety-validator.mjs";
import { scanForSecretPatterns } from "./validators/secret-pattern-scanner.mjs";
import { buildGateStatuses, GateStatus, hasBlockingFindings } from "./gate-status.mjs";
import { writeReports } from "./report-writer.mjs";

export async function validatePackage(options) {
  const packagePath = path.resolve(options.packagePath);
  const discovery = await discoverPackage(packagePath);
  const schemaRegistry = await loadSchemas(options.schemaDirectory);
  const requiredFindings = validateRequiredFiles(discovery);
  const { parsed, findings: parseFindings } = await parseJsonFiles(discovery.files);

  const findings = [
    ...requiredFindings,
    ...parseFindings,
    ...validateParsedDocuments(parsed, schemaRegistry),
    ...validateSimpleCrossFile(parsed),
    ...validateUrlSafety(parsed),
    ...scanForSecretPatterns(parsed)
  ];

  const strictWarningFailure = Boolean(options.strict) && findings.some((finding) => finding.severity === "warning");
  const overallStatus = hasBlockingFindings(findings) || strictWarningFailure ? GateStatus.FAILED : GateStatus.PASSED;
  const gateStatuses = buildGateStatuses(findings);

  const manifest = parsed.get("manifest.json")?.data;
  const tenant = parsed.get("tenant.json")?.data;
  const site = parsed.get("site.json")?.data;

  const report = {
    schemaVersion: "1.0.0",
    validatorVersion: "0.1.0",
    phase: "2A-1",
    tenantId: manifest?.tenantId ?? tenant?.tenantId ?? null,
    siteKey: manifest?.siteKey ?? tenant?.siteKey ?? site?.siteKey ?? null,
    packagePath,
    profileId: site?.deploymentProfileId ?? null,
    overallStatus,
    gateStatuses,
    findings,
    nextActions: buildNextActions(findings),
    filesChecked: discovery.files.map((file) => file.relativePath),
    summary: {
      filesChecked: discovery.files.length,
      errors: findings.filter((finding) => finding.severity === "error" || finding.severity === "critical").length,
      warnings: findings.filter((finding) => finding.severity === "warning").length,
      infos: findings.filter((finding) => finding.severity === "info").length
    },
    outputs: {},
    boundaryConfirmation: {
      offlineOnly: true,
      externalChecksImplemented: false,
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
    }
  };

  if (options.outDir) {
    const outputs = await writeReports(report, path.resolve(options.outDir), {
      json: options.json,
      markdown: options.markdown
    });
    report.outputs = {
      directory: path.resolve(options.outDir),
      files: outputs
    };
  }

  return report;
}

function buildNextActions(findings) {
  const actions = findings
    .filter((finding) => finding.blocksGate || finding.severity === "error" || finding.severity === "critical")
    .map((finding) => finding.nextAction)
    .filter(Boolean);

  return [...new Set(actions)];
}
