import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson } from './json-writer.mjs';
import {
  packageRelative,
  repoRelative,
  resolveFixturePath,
  resolveRepoPath,
  resolveTmpOutputPath
} from './safe-paths.mjs';
import {
  defaultRequiredCheckIds,
  validateRuntimeQaEvidence,
  validateRuntimeQaRegistry
} from './runtime-qa-validator.mjs';

const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cs', '.json', '.md']);

const sourceScanPatterns = [
  {
    id: 'fetch-write-method',
    pattern: /\bfetch\s*\([\s\S]{0,800}\bmethod\s*:\s*['"`](POST|PUT|PATCH|DELETE)['"`]/i
  },
  {
    id: 'axios-write-method',
    pattern: /\baxios\.(post|put|patch|delete)\s*\(/i
  },
  {
    id: 'xml-http-write-method',
    pattern: /\.open\s*\(\s*['"`](POST|PUT|PATCH|DELETE)['"`]/i
  },
  {
    id: 'azure-mutation-command',
    pattern: /\baz\s+(deployment|role\s+assignment\s+create|storage\s+account\s+keys\s+list|cosmosdb\s+keys\s+list|storage\s+account\s+generate-sas|storage\s+account\s+show-connection-string)\b/i
  },
  {
    id: 'protected-config-path-reference',
    pattern: /(^|[\\/])(\.env\.local|appsettings\.Development\.json|local\.settings\.json)([\\/]|$)/i
  }
];

export async function runRuntimeQa({ registryPath, outputPath, overwrite = false }) {
  const startedAt = new Date().toISOString();
  const registryFile = resolveFixturePath(registryPath);
  const outputRoot = resolveTmpOutputPath(outputPath);
  const registry = await readJson(registryFile);
  const registryValidation = validateRuntimeQaRegistry(registry);

  if (registryValidation.status !== 'passed') {
    throw new Error(`Runtime QA registry validation failed: ${registryValidation.failures.map((item) => item.code).join(', ')}`);
  }

  await prepareOutputRoot(outputRoot, overwrite);

  const checkResults = [];
  for (const check of registry.checks) {
    checkResults.push(await runCheck(check, registry));
  }

  const generatedArtifactPaths = [
    packageRelative(path.join(outputRoot, 'RUNTIME_QA_EVIDENCE_MANIFEST.json')),
    packageRelative(path.join(outputRoot, 'RUNTIME_QA_EVIDENCE_SUMMARY.md')),
    packageRelative(path.join(outputRoot, 'RUNTIME_QA_VALIDATION_RESULT.json')),
    packageRelative(path.join(outputRoot, 'RUNTIME_QA_VALIDATION_RESULT.md'))
  ];

  const completedAt = new Date().toISOString();
  const manifest = {
    schemaVersion: '0.1.0',
    resultType: 'pumpkin-platform-runtime-qa-v2-6-1-evidence-manifest',
    phase: registry.phase,
    registryId: registry.registryId,
    runId: buildRunId(registry.registryId, startedAt),
    startedAt,
    completedAt,
    status: checkResults.every((check) => check.status === 'passed' || check.status === 'skipped') ? 'passed' : 'failed',
    environmentMode: registry.environmentMode,
    providerProfileId: registry.providerProfileId ?? null,
    providerModes: registry.providerModes,
    requiredCheckIds: registry.requiredCheckIds ?? defaultRequiredCheckIds,
    layerRefs: registry.layerRefs,
    checkedRoutes: registry.checkedRoutes,
    checkedApis: registry.checkedApis,
    checkResults,
    blockedReasons: checkResults.filter((check) => ['blocked', 'failed'].includes(check.status)).map((check) => ({
      checkId: check.id,
      reason: check.message
    })),
    warnings: registry.warnings ?? [],
    artifactPaths: generatedArtifactPaths,
    sourceEvidenceRefs: registry.sourceEvidenceRefs,
    securityBoundarySummary: buildSecurityBoundarySummary(registry),
    uploadBinding: {
      storageAccount: 'pumpkincmsstgolm01',
      container: 'runtime-qa-staging',
      status: 'not_attempted_by_local_run',
      requiresExplicitUploadFlag: true
    }
  };

  const evidenceValidation = validateRuntimeQaEvidence(manifest);
  const validationStatus = evidenceValidation.status === 'passed' && manifest.status === 'passed' ? 'passed' : 'failed';
  manifest.status = validationStatus;

  await writeJson(path.join(outputRoot, 'RUNTIME_QA_EVIDENCE_MANIFEST.json'), manifest);
  await writeJson(path.join(outputRoot, 'RUNTIME_QA_VALIDATION_RESULT.json'), evidenceValidation);
  await fs.writeFile(path.join(outputRoot, 'RUNTIME_QA_EVIDENCE_SUMMARY.md'), renderEvidenceSummary(manifest), 'utf8');
  await fs.writeFile(path.join(outputRoot, 'RUNTIME_QA_VALIDATION_RESULT.md'), renderValidationSummary(evidenceValidation), 'utf8');

  return {
    outputRoot,
    manifest,
    validation: evidenceValidation
  };
}

export async function inspectRuntimeQaEvidence({ evidencePath }) {
  const evidenceRoot = resolveTmpOutputPath(evidencePath);
  const manifest = await readJson(path.join(evidenceRoot, 'RUNTIME_QA_EVIDENCE_MANIFEST.json'));
  const validation = validateRuntimeQaEvidence(manifest);
  return {
    runId: manifest.runId,
    status: manifest.status,
    phase: manifest.phase,
    environmentMode: manifest.environmentMode,
    providerProfileId: manifest.providerProfileId,
    checkCount: manifest.checkResults.length,
    blockedCount: manifest.blockedReasons.length,
    validationStatus: validation.status
  };
}

async function runCheck(check, registry) {
  const evidenceHits = [];
  const markerHits = [];
  const jsonHits = [];
  const modeHits = [];
  const scanHits = [];
  const failures = [];

  for (const ref of check.sourceEvidenceRefs ?? []) {
    const result = await checkEvidenceRef(ref);
    evidenceHits.push(result);
    if (!result.exists) {
      failures.push(`missing evidence ref: ${ref.path}`);
    }
  }

  for (const markerCheck of check.fileMarkers ?? []) {
    const result = await checkFileMarkers(markerCheck);
    markerHits.push(result);
    if (result.missingMarkers.length > 0) {
      failures.push(`missing markers in ${markerCheck.path}: ${result.missingMarkers.join(', ')}`);
    }
  }

  for (const jsonCheck of check.jsonAssertions ?? []) {
    const result = await checkJsonAssertions(jsonCheck);
    jsonHits.push(result);
    if (result.failures.length > 0) {
      failures.push(...result.failures);
    }
  }

  if (check.modeAssertions) {
    const result = await checkModeAssertions(check.modeAssertions);
    modeHits.push(result);
    if (result.failures.length > 0) {
      failures.push(...result.failures);
    }
  }

  for (const scan of check.sourceScans ?? []) {
    const result = await runSourceScan(scan);
    scanHits.push(result);
    if (result.matches.length > 0) {
      failures.push(`source scan ${scan.name ?? 'unnamed'} found ${result.matches.length} disallowed matches`);
    }
  }

  if (check.selfGeneratedEvidenceManifest === true) {
    markerHits.push({
      path: 'self',
      checkedMarkers: ['runId', 'checkResults', 'securityBoundarySummary'],
      missingMarkers: []
    });
  }

  if (check.localOfflinePreservation === true) {
    const modes = new Set((registry.providerModes ?? []).map((mode) => mode.mode));
    const missing = ['local-dev', 'fake-provider', 'offline-bundle', 'local-file-backed', 'local-api-fake-provider', 'staging-simulated'].filter((mode) => !modes.has(mode));
    if (missing.length > 0) {
      failures.push(`local/offline modes missing: ${missing.join(', ')}`);
    }
    modeHits.push({ localOfflineModesPresent: missing.length === 0, missing });
  }

  return {
    id: check.id,
    name: check.name,
    category: check.category,
    status: failures.length === 0 ? 'passed' : check.blocking === false ? 'blocked' : 'failed',
    message: failures.length === 0 ? check.successMessage ?? 'check passed' : failures.join('; '),
    evidenceHits,
    markerHits,
    jsonHits,
    modeHits,
    scanHits
  };
}

async function checkEvidenceRef(ref) {
  const filePath = resolveRepoPath(ref.path);
  return {
    label: ref.label,
    path: repoRelative(filePath),
    exists: await exists(filePath)
  };
}

async function checkFileMarkers(markerCheck) {
  const filePath = resolveRepoPath(markerCheck.path);
  const source = await fs.readFile(filePath, 'utf8');
  return {
    path: repoRelative(filePath),
    checkedMarkers: markerCheck.markers,
    missingMarkers: markerCheck.markers.filter((marker) => !source.includes(marker))
  };
}

async function checkJsonAssertions(jsonCheck) {
  const filePath = resolveRepoPath(jsonCheck.path);
  const document = await readJson(filePath);
  const failures = [];

  for (const assertion of jsonCheck.equals ?? []) {
    const actual = getPath(document, assertion.path);
    if (actual !== assertion.value) {
      failures.push(`JSON assertion failed at ${jsonCheck.path}:${assertion.path}; expected ${String(assertion.value)}, received ${String(actual)}`);
    }
  }

  for (const assertion of jsonCheck.includes ?? []) {
    const actual = getPath(document, assertion.path);
    if (!Array.isArray(actual) || !actual.includes(assertion.value)) {
      failures.push(`JSON include assertion failed at ${jsonCheck.path}:${assertion.path}; missing ${assertion.value}`);
    }
  }

  return {
    path: repoRelative(filePath),
    failures,
    assertionCount: (jsonCheck.equals ?? []).length + (jsonCheck.includes ?? []).length
  };
}

async function checkModeAssertions(assertions) {
  const filePath = resolveRepoPath(assertions.operationalBindingsPath);
  const operationalBindings = await readJson(filePath);
  const failures = [];
  const modes = new Map((operationalBindings.environmentModeMatrix ?? []).map((entry) => [entry.mode, entry]));
  const profiles = new Map((operationalBindings.providerProfiles ?? []).map((entry) => [entry.providerProfileId, entry]));

  for (const mode of assertions.requiredModes ?? []) {
    if (!modes.has(mode)) {
      failures.push(`operational binding mode missing: ${mode}`);
    }
  }

  const productionMode = modes.get('production-runtime');
  if (productionMode?.state !== 'blocked') {
    failures.push('production-runtime mode is not blocked');
  }

  const productionProfile = profiles.get('provider-profile-production-runtime-blocked');
  if (productionProfile?.state !== 'blocked') {
    failures.push('production-runtime profile is not blocked');
  }

  const scopedProfile = profiles.get(assertions.scopedLiveWriteProfileId);
  if (!scopedProfile) {
    failures.push(`scoped live-write profile missing: ${assertions.scopedLiveWriteProfileId}`);
  } else {
    if (scopedProfile.providerMode !== 'live-write-approved') {
      failures.push('scoped live-write profile mode mismatch');
    }
    if (scopedProfile.state !== 'scoped-only') {
      failures.push('scoped live-write profile is not scoped-only');
    }
    if (scopedProfile.globalActivation !== false) {
      failures.push('scoped live-write profile is globally active');
    }
    if (scopedProfile.capabilities?.liveProviderWritesAllowed !== false) {
      failures.push('scoped live-write profile enables live provider writes in operational binding');
    }
  }

  return {
    path: repoRelative(filePath),
    modeCount: modes.size,
    providerProfileCount: profiles.size,
    failures
  };
}

async function runSourceScan(scan) {
  const matches = [];
  const scannedFiles = [];

  for (const root of scan.roots ?? []) {
    const rootPath = resolveRepoPath(root);
    const files = await walkFiles(rootPath);
    for (const filePath of files) {
      const ext = path.extname(filePath);
      if (!sourceExtensions.has(ext)) {
        continue;
      }
      const relative = repoRelative(filePath);
      if ((scan.exclude ?? []).some((entry) => relative.includes(entry))) {
        continue;
      }
      scannedFiles.push(relative);
      const source = await fs.readFile(filePath, 'utf8');
      for (const rule of sourceScanPatterns) {
        if (rule.pattern.test(source)) {
          matches.push({ file: relative, rule: rule.id });
        }
      }
    }
  }

  return {
    name: scan.name,
    scannedFileCount: scannedFiles.length,
    matches
  };
}

async function walkFiles(root) {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function prepareOutputRoot(outputRoot, overwrite) {
  if (await exists(outputRoot)) {
    if (!overwrite) {
      throw new Error(`output path already exists; pass --overwrite to replace: ${packageRelative(outputRoot)}`);
    }
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(outputRoot, { recursive: true });
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function getPath(value, pathName) {
  return pathName.split('.').reduce((current, part) => current?.[part], value);
}

function buildRunId(registryId, startedAt) {
  return `runtimeqa_${crypto.createHash('sha256').update(`${registryId}:${startedAt}`).digest('hex').slice(0, 16)}`;
}

function buildSecurityBoundarySummary(registry) {
  return {
    providerDataWrites: false,
    additionalOlmStagingWrites: false,
    destructiveRollbackDeletion: false,
    azureInfrastructureMutation: false,
    rbacAssignment: false,
    protectedConfigReads: false,
    secretExport: false,
    keysListKeys: false,
    connectionStrings: false,
    sasGeneration: false,
    productionDatabaseMigration: false,
    productionProviderWrites: false,
    cmsWrites: false,
    externalCrawling: false,
    deployment: false,
    searchConsoleIndexing: false,
    livePagePublication: false,
    localEvidenceIgnoredTmpOnly: true,
    optionalUploadRequiresExplicitFlag: true,
    registryBoundary: registry.securityBoundarySummary ?? 'local/read-only runtime QA harness'
  };
}

function renderEvidenceSummary(manifest) {
  return `# Runtime QA Evidence Summary

Status: ${manifest.status}

Run ID: ${manifest.runId}

Phase: ${manifest.phase}

Environment mode: ${manifest.environmentMode}

Provider profile: ${manifest.providerProfileId ?? 'not applicable'}

Checked routes:
${manifest.checkedRoutes.map((route) => `- ${route}`).join('\n')}

Checked APIs:
${manifest.checkedApis.map((api) => `- ${api}`).join('\n')}

Checks:
${manifest.checkResults.map((check) => `- ${check.id}: ${check.status}`).join('\n')}

Blocked reasons:
${manifest.blockedReasons.length === 0 ? '- none' : manifest.blockedReasons.map((item) => `- ${item.checkId}: ${item.reason}`).join('\n')}

Boundary: local/offline Runtime QA evidence only; no provider data writes, OLM staging writes, Azure infrastructure mutation, RBAC assignment, protected config reads, keys/listKeys, connection strings, SAS, CMS writes, deployment, indexing, or live publication.
`;
}

function renderValidationSummary(validation) {
  return `# Runtime QA Evidence Validation

Status: ${validation.status}

Failures: ${validation.summary.failureCount}

Warnings: ${validation.summary.warningCount}

Failure details:
${validation.failures.length === 0 ? '- none' : validation.failures.map((item) => `- ${item.code}: ${item.message}`).join('\n')}
`;
}
