#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../../../../..');
const APPROVED_BACKUP_ROOT = path.resolve('C:/Users/User/Desktop/PumpkinCMS/secure-operator-handoff/tenant-backups');
const DEFAULT_BUNDLE = path.join(APPROVED_BACKUP_ROOT, 'v2-8-61a-airstrip-full-backup-proof');
const DEFAULT_OUTPUT = path.join(APPROVED_BACKUP_ROOT, 'v2-8-61b-airstrip-restore-dryrun-proof');
const DEFAULT_TENANT_ID = 'airstrip-club-las-vegas';

const REQUIRED_ROOT_FILES = [
  'manifest.json',
  'checksums.sha256',
  'tenant-summary.json',
  'MISSING_OR_NONRECOVERABLE_ITEMS.md',
  'restore/RESTORE_RUNBOOK.md',
  'validation/backup-validation-report.json'
];

const REQUIRED_DIRS = [
  'database',
  'media',
  'resources',
  'restore',
  'validation',
  'website'
];

const DATABASE_FILES = {
  tenant: 'database/tenant.json',
  pages: 'database/pages.json',
  mediaAssets: 'database/media-assets.json',
  themes: 'database/themes.json',
  formDefinitions: 'database/form-definitions.json',
  formEntries: 'database/form-entries.json',
  importRuns: 'database/import-runs.json',
  publishRuns: 'database/publish-runs.json',
  domainBindings: 'database/domain-bindings.json',
  users: 'database/users-sanitized.json',
  backupRuns: 'database/backup-runs.json'
};

const RESTORE_STEPS = [
  ['validate-manifest-checksums', 'Read manifest and validate checksums.', ['manifest.json', 'checksums.sha256']],
  ['target-tenant-identity-plan', 'Prepare target tenant identity plan.', ['tenant-summary.json']],
  ['restore-tenant', 'Restore tenant record.', [DATABASE_FILES.tenant]],
  ['restore-sanitized-users', 'Restore sanitized users or mark password reset required.', [DATABASE_FILES.users]],
  ['restore-themes', 'Restore theme records.', [DATABASE_FILES.themes]],
  ['restore-form-definitions', 'Restore FormDefinition records.', [DATABASE_FILES.formDefinitions]],
  ['restore-pages', 'Restore Page records.', [DATABASE_FILES.pages]],
  ['restore-mediaasset-records', 'Restore MediaAsset records after media blob plan.', [DATABASE_FILES.mediaAssets, 'media/media-manifest.json']],
  ['restore-form-entries', 'Restore FormEntry records if policy allows.', [DATABASE_FILES.formEntries]],
  ['restore-import-publish-history', 'Restore ImportRun/PublishRun history if policy allows.', [DATABASE_FILES.importRuns, DATABASE_FILES.publishRuns]],
  ['restore-domain-bindings-pending', 'Restore DomainBinding records as non-live pending state unless owner approves domain cutover.', [DATABASE_FILES.domainBindings]],
  ['restore-media-blobs', 'Restore/copy media blobs to target container.', ['media/media-manifest.json', 'media/blobs/']],
  ['restore-website-files', 'Restore website source, normalized package, and overlays.', ['website/']],
  ['future-runtime-rebuild-deploy', 'Rebuild or redeploy runtime only in a later approved phase.', ['website/runtime/']],
  ['future-responsive-check', 'Run responsive checker before any production use.', ['website/runtime/responsive-proof-summary.json']]
];

function parseArgs(argv) {
  const args = {
    bundle: DEFAULT_BUNDLE,
    output: DEFAULT_OUTPUT,
    tenantId: DEFAULT_TENANT_ID
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--bundle') args.bundle = argv[++index];
    else if (arg === '--output') args.output = argv[++index];
    else if (arg === '--tenant-id') args.tenantId = argv[++index];
    else if (arg === '--help') {
      console.log('Usage: node tenant-backup-restore-dryrun.mjs [--bundle <path>] [--output <path>] [--tenant-id <id>]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function toPosix(relativePath) {
  return relativePath.replace(/\\/g, '/');
}

async function readText(filePath) {
  return (await fs.readFile(filePath, 'utf8')).replace(/^\uFEFF/, '');
}

async function readJson(filePath) {
  return JSON.parse(await readText(filePath));
}

async function writeText(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, value.endsWith('\n') ? value : `${value}\n`, 'utf8');
}

async function writeJson(filePath, value) {
  await writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function assertInsideApprovedRoot(targetPath, expectedFolderName) {
  const resolved = path.resolve(targetPath);
  const relative = path.relative(APPROVED_BACKUP_ROOT, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative) || relative === '') {
    throw new Error(`Path must be a child of ${APPROVED_BACKUP_ROOT}`);
  }
  if (expectedFolderName && !resolved.toLowerCase().endsWith(expectedFolderName.toLowerCase())) {
    throw new Error(`Path must end with ${expectedFolderName}`);
  }
  return resolved;
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(rootDir) {
  const files = [];
  async function walk(current) {
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(fullPath);
      else if (entry.isFile()) files.push(fullPath);
    }
  }
  await walk(rootDir);
  return files.sort((a, b) => a.localeCompare(b));
}

async function sha256File(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);
    stream.on('error', reject);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

async function parseChecksums(bundlePath) {
  const checksumPath = path.join(bundlePath, 'checksums.sha256');
  const text = await readText(checksumPath);
  return text
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([a-fA-F0-9]{64})\s\s(.+)$/);
      if (!match) {
        throw new Error(`Invalid checksum line: ${line}`);
      }
      return {
        sha256: match[1].toLowerCase(),
        path: match[2]
      };
    });
}

async function validateBundleChecksums(bundlePath) {
  const entries = await parseChecksums(bundlePath);
  const failures = [];
  const missing = [];
  for (const entry of entries) {
    const fullPath = path.join(bundlePath, entry.path);
    if (!(await exists(fullPath))) {
      missing.push(entry.path);
      continue;
    }
    const actual = await sha256File(fullPath);
    if (actual !== entry.sha256) {
      failures.push({ path: entry.path, expected: entry.sha256, actual });
    }
  }

  const allFiles = (await listFiles(bundlePath))
    .map((filePath) => toPosix(path.relative(bundlePath, filePath)))
    .filter((relativePath) => relativePath !== 'checksums.sha256');
  const checksumPaths = new Set(entries.map((entry) => entry.path));
  const unlistedFiles = allFiles.filter((relativePath) => !checksumPaths.has(relativePath));

  return {
    ok: failures.length === 0 && missing.length === 0 && unlistedFiles.length === 0,
    entries: entries.length,
    failures,
    missing,
    unlistedFiles
  };
}

function arrayCount(value) {
  return Array.isArray(value) ? value.length : 0;
}

function findCaseInsensitive(records, expected) {
  const needle = expected.toLowerCase();
  return records.some((record) => Object.values(record).some((value) => typeof value === 'string' && value.toLowerCase() === needle));
}

function collectForbiddenKeys(value, currentPath = '') {
  const hits = [];
  if (value == null || typeof value !== 'object') return hits;
  if (Array.isArray(value)) {
    value.forEach((item, index) => hits.push(...collectForbiddenKeys(item, `${currentPath}[${index}]`)));
    return hits;
  }
  for (const [key, entryValue] of Object.entries(value)) {
    const nextPath = currentPath ? `${currentPath}.${key}` : key;
    if (/^secretMaterialIncluded$/i.test(key) && entryValue === false) {
      hits.push(...collectForbiddenKeys(entryValue, nextPath));
      continue;
    }
    if (/password(hash)?|token|secret|connectionstring|accountkey|sas/i.test(key)) {
      hits.push(nextPath);
    }
    hits.push(...collectForbiddenKeys(entryValue, nextPath));
  }
  return hits;
}

function addGap(gaps, severity, id, title, detail, classification = 'documented_gap') {
  gaps.push({ severity, id, title, detail, classification });
}

async function validateDatabase(bundlePath, tenantId, gaps) {
  const database = {};
  for (const [key, relativePath] of Object.entries(DATABASE_FILES)) {
    const fullPath = path.join(bundlePath, relativePath);
    if (!(await exists(fullPath))) {
      throw new Error(`Missing database export: ${relativePath}`);
    }
    database[key] = await readJson(fullPath);
  }

  const pages = database.pages;
  const mediaAssets = database.mediaAssets;
  const themes = database.themes;
  const formDefinitions = database.formDefinitions;
  const formEntries = database.formEntries;
  const importRuns = database.importRuns;
  const publishRuns = database.publishRuns;
  const domainBindings = database.domainBindings;
  const users = database.users;
  const backupRuns = database.backupRuns?.backupRuns ?? database.backupRuns;

  if ((database.tenant.tenantId ?? database.tenant.TenantId) !== tenantId) {
    addGap(gaps, 'error', 'tenant-id-mismatch', 'Tenant ID mismatch', 'Tenant export does not match the requested tenant ID.', 'blocking_gap');
  }

  if (!Array.isArray(pages)) throw new Error('Page export must be an array.');
  if (!Array.isArray(mediaAssets)) throw new Error('MediaAsset export must be an array.');
  if (!Array.isArray(themes)) throw new Error('Theme export must be an array.');
  if (!Array.isArray(formDefinitions)) throw new Error('FormDefinition export must be an array.');
  if (!Array.isArray(formEntries)) throw new Error('FormEntry export must be an array.');
  if (!Array.isArray(importRuns)) throw new Error('ImportRun export must be an array.');
  if (!Array.isArray(publishRuns)) throw new Error('PublishRun export must be an array.');
  if (!Array.isArray(domainBindings)) throw new Error('DomainBinding export must be an array.');
  if (!Array.isArray(users)) throw new Error('Sanitized User export must be an array.');

  const forbiddenUserKeys = collectForbiddenKeys(users);
  if (forbiddenUserKeys.length > 0) {
    addGap(gaps, 'error', 'user-secret-like-fields', 'Sanitized user export includes forbidden fields.', forbiddenUserKeys.join(', '), 'blocking_gap');
  }

  if (pages.length !== 5) addGap(gaps, 'warning', 'page-count-drift', 'Page count differs from Airstrip expectation.', `Expected 5, found ${pages.length}.`);
  if (mediaAssets.length !== 13) addGap(gaps, 'warning', 'mediaasset-count-drift', 'MediaAsset count differs from Airstrip expectation.', `Expected 13, found ${mediaAssets.length}.`);
  if (themes.length !== 1) addGap(gaps, 'warning', 'theme-count-drift', 'Theme count differs from Airstrip expectation.', `Expected 1, found ${themes.length}.`);
  if (!findCaseInsensitive(formDefinitions, 'airstrip-reservation')) {
    addGap(gaps, 'error', 'formdefinition-missing', 'Expected Airstrip FormDefinition missing.', '`airstrip-reservation` was not found.', 'blocking_gap');
  }
  if (domainBindings.length < 1) {
    addGap(gaps, 'warning', 'domainbinding-missing', 'DomainBinding export is empty.', 'Expected one pending DomainBinding record.');
  }

  return {
    counts: {
      tenant: database.tenant ? 1 : 0,
      pages: pages.length,
      mediaAssets: mediaAssets.length,
      themes: themes.length,
      formDefinitions: formDefinitions.length,
      formEntries: formEntries.length,
      importRuns: importRuns.length,
      publishRuns: publishRuns.length,
      domainBindings: domainBindings.length,
      usersSanitized: users.length,
      backupRuns: Array.isArray(backupRuns) ? backupRuns.length : 0
    },
    expectedChecks: {
      pages: pages.length === 5,
      mediaAssets: mediaAssets.length === 13,
      themes: themes.length === 1,
      formDefinition: findCaseInsensitive(formDefinitions, 'airstrip-reservation'),
      sanitizedUsers: forbiddenUserKeys.length === 0
    },
    pageSlugs: pages.map((page) => page.pageSlug ?? page.PageSlug ?? page.slug ?? page.id).filter(Boolean),
    formDefinitionIds: formDefinitions.map((definition) => definition.id ?? definition.Id ?? definition.formKey ?? definition.FormKey).filter(Boolean)
  };
}

async function validateMedia(bundlePath, checksumResult, gaps) {
  const manifestPath = path.join(bundlePath, 'media/media-manifest.json');
  if (!(await exists(manifestPath))) throw new Error('Missing media manifest.');
  const manifest = await readJson(manifestPath);
  const entries = Array.isArray(manifest.entries) ? manifest.entries : [];
  const failures = [];
  const checksumPaths = new Set((await parseChecksums(bundlePath)).map((entry) => entry.path));

  for (const entry of entries) {
    const relativePath = entry.localPath;
    if (typeof relativePath !== 'string' || !relativePath.startsWith('media/')) {
      failures.push({ id: entry.id ?? '', issue: 'invalid localPath' });
      continue;
    }
    const fullPath = path.join(bundlePath, relativePath);
    if (!(await exists(fullPath))) {
      failures.push({ id: entry.id ?? '', issue: 'missing media file', path: relativePath });
      continue;
    }
    const stat = await fs.stat(fullPath);
    const actualHash = await sha256File(fullPath);
    if (Number(entry.bytes) !== stat.size) {
      failures.push({ id: entry.id ?? '', issue: 'byte count mismatch', path: relativePath });
    }
    if (String(entry.sha256).toLowerCase() !== actualHash) {
      failures.push({ id: entry.id ?? '', issue: 'manifest hash mismatch', path: relativePath });
    }
    if (!checksumPaths.has(toPosix(relativePath))) {
      failures.push({ id: entry.id ?? '', issue: 'missing checksums.sha256 entry', path: relativePath });
    }
  }

  if (entries.length !== 13) {
    addGap(gaps, 'warning', 'media-count-drift', 'Media blob count differs from Airstrip expectation.', `Expected 13, found ${entries.length}.`);
  }
  if (failures.length > 0) {
    addGap(gaps, 'error', 'media-validation-failed', 'Media manifest/file validation failed.', `${failures.length} media issue(s) found.`, 'blocking_gap');
  }

  return {
    ok: failures.length === 0,
    mediaCount: entries.length,
    totalBytes: entries.reduce((sum, entry) => sum + Number(entry.bytes ?? 0), 0),
    failures,
    checksumEntriesValidated: checksumResult.entries
  };
}

async function validateWebsite(bundlePath, gaps) {
  const checks = [
    ['originalZip', 'website/original-package/pumpkinairstrip.zip'],
    ['normalizedPackage', 'website/normalized-package/airstrip-pumpkin-package-v1/tenant-package.json'],
    ['v2_8_60rOverlay', 'website/overlays/v2-8-60r-mobile-responsive/README.md'],
    ['v2_8_60xOverlay', 'website/overlays/v2-8-60x-club-info-responsive/README.md'],
    ['routeMap', 'website/runtime/route-map.json'],
    ['deploymentMetadata', 'website/runtime/deployment-metadata.json'],
    ['responsiveProofSummary', 'website/runtime/responsive-proof-summary.json']
  ];

  const result = {};
  for (const [key, relativePath] of checks) {
    const present = await exists(path.join(bundlePath, relativePath));
    result[key] = { present, path: relativePath };
    if (!present) {
      addGap(gaps, 'warning', `website-${key}-missing`, 'Website restore input missing.', `${relativePath} is missing.`);
    }
  }

  const runtimeJson = {};
  for (const key of ['routeMap', 'deploymentMetadata', 'responsiveProofSummary']) {
    if (result[key].present) {
      runtimeJson[key] = await readJson(path.join(bundlePath, result[key].path));
    }
  }

  return {
    ok: Object.values(result).every((item) => item.present),
    checks: result,
    routeCount: Array.isArray(runtimeJson.routeMap?.routes) ? runtimeJson.routeMap.routes.length : 0,
    runtimePackageIncluded: Boolean(runtimeJson.deploymentMetadata?.runtimePackageIncluded)
  };
}

async function validateResources(bundlePath, gaps) {
  const resourcePath = path.join(bundlePath, 'resources/resource-bindings.json');
  if (!(await exists(resourcePath))) throw new Error('Missing resource bindings.');
  const resources = await readJson(resourcePath);
  const forbiddenKeys = collectForbiddenKeys(resources);
  if (forbiddenKeys.length > 0) {
    addGap(gaps, 'error', 'resource-secret-like-fields', 'Resource metadata includes forbidden secret-like fields.', forbiddenKeys.join(', '), 'blocking_gap');
  }

  const hasProductionHost = typeof resources.productionHost === 'string' && resources.productionHost.includes('app-airstrip-prod-centralus-001');
  const hasMedia = Boolean(resources.mediaStorage?.container && resources.mediaStorage?.publicBase);
  const hasPumpkinApi = Boolean(resources.pumpkinApi?.baseUrl && resources.pumpkinApi?.webApp);
  const hasAdminUi = Boolean(resources.adminUi?.baseUrl && resources.adminUi?.webApp);
  const hasDomainBinding = Array.isArray(resources.domainBindings) && resources.domainBindings.length > 0;
  const hasIsolatedPreview = Boolean(resources.airstripRuntime?.isolatedPreviewHost || resources.isolatedPreviewHost);

  if (!hasProductionHost) addGap(gaps, 'warning', 'production-host-missing', 'Airstrip production default host missing.', 'Resource binding metadata should include production default host.');
  if (!hasMedia) addGap(gaps, 'warning', 'media-storage-missing', 'Media storage metadata missing.', 'Resource binding metadata should include media account/container/public base.');
  if (!hasPumpkinApi) addGap(gaps, 'warning', 'pumpkin-api-missing', 'Pumpkin API metadata missing.', 'Resource binding metadata should include Pumpkin API host references.');
  if (!hasAdminUi) addGap(gaps, 'warning', 'admin-ui-missing', 'Admin UI metadata missing.', 'Resource binding metadata should include Admin UI host references.');
  if (!hasDomainBinding) addGap(gaps, 'warning', 'domainbinding-resource-missing', 'DomainBinding metadata missing.', 'Expected DomainBinding pending DNS metadata.');
  if (!hasIsolatedPreview) {
    addGap(
      gaps,
      'warning',
      'isolated-preview-host-missing',
      'Airstrip isolated preview host is not recorded in V2.8.61A resource metadata.',
      'Dry-run can continue for production default-host restore planning. A live restore/cutover adapter should gather isolated preview host metadata before release rehearsal.'
    );
  }

  return {
    ok: forbiddenKeys.length === 0 && hasProductionHost && hasMedia && hasPumpkinApi && hasAdminUi && hasDomainBinding,
    hasProductionHost,
    hasIsolatedPreview,
    hasMedia,
    hasPumpkinApi,
    hasAdminUi,
    hasDomainBinding,
    domainBindingCount: Array.isArray(resources.domainBindings) ? resources.domainBindings.length : 0,
    secretLikeFields: forbiddenKeys
  };
}

async function buildRestoreOrderPlan(bundlePath, validation) {
  return {
    schema: 'pumpkin-tenant-restore-order-plan',
    schemaVersion: 'v2-8-61b',
    generatedAt: new Date().toISOString(),
    tenantId: validation.tenantId,
    dryRunOnly: true,
    liveExecutionApproved: false,
    steps: await Promise.all(RESTORE_STEPS.map(async ([id, summary, inputs], index) => ({
      order: index + 1,
      id,
      summary,
      inputs: await Promise.all(inputs.map(async (input) => ({
        path: input,
        present: input.endsWith('/') ? await exists(path.join(bundlePath, input)) : await exists(path.join(bundlePath, input))
      }))),
      liveActionTaken: false,
      dryRunStatus: 'planned',
      restorePolicy: id.includes('future') ? 'future_approval_required' : 'dry_run_validated_only'
    })))
  };
}

async function writeOutputChecksums(outputPath) {
  const files = (await listFiles(outputPath))
    .filter((filePath) => path.basename(filePath) !== 'RESTORE_VALIDATION_CHECKSUMS.sha256');
  const entries = [];
  for (const filePath of files) {
    const relativePath = toPosix(path.relative(outputPath, filePath));
    entries.push({
      path: relativePath,
      sha256: await sha256File(filePath)
    });
  }
  await writeText(
    path.join(outputPath, 'RESTORE_VALIDATION_CHECKSUMS.sha256'),
    entries.map((entry) => `${entry.sha256}  ${entry.path}`).join('\n')
  );
  return entries;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const bundlePath = assertInsideApprovedRoot(args.bundle, 'v2-8-61a-airstrip-full-backup-proof');
  const outputPath = assertInsideApprovedRoot(args.output, 'v2-8-61b-airstrip-restore-dryrun-proof');
  const tenantId = args.tenantId ?? DEFAULT_TENANT_ID;

  if (!(await exists(bundlePath))) {
    throw new Error(`Backup bundle path is missing: ${bundlePath}`);
  }

  await fs.rm(outputPath, { recursive: true, force: true });
  await fs.mkdir(outputPath, { recursive: true });

  const gaps = [];
  for (const dir of REQUIRED_DIRS) {
    if (!(await exists(path.join(bundlePath, dir)))) {
      throw new Error(`Missing required bundle directory: ${dir}`);
    }
  }
  for (const file of REQUIRED_ROOT_FILES) {
    if (!(await exists(path.join(bundlePath, file)))) {
      throw new Error(`Missing required bundle file: ${file}`);
    }
  }

  const manifest = await readJson(path.join(bundlePath, 'manifest.json'));
  const tenantSummary = await readJson(path.join(bundlePath, 'tenant-summary.json'));
  const backupValidation = await readJson(path.join(bundlePath, 'validation/backup-validation-report.json'));
  const missingReport = await readText(path.join(bundlePath, 'MISSING_OR_NONRECOVERABLE_ITEMS.md'));
  const restoreRunbook = await readText(path.join(bundlePath, 'restore/RESTORE_RUNBOOK.md'));
  const checksumValidation = await validateBundleChecksums(bundlePath);

  if (!checksumValidation.ok) {
    throw new Error('Checksum validation failed for the backup bundle.');
  }

  const database = await validateDatabase(bundlePath, tenantId, gaps);
  const media = await validateMedia(bundlePath, checksumValidation, gaps);
  const website = await validateWebsite(bundlePath, gaps);
  const resources = await validateResources(bundlePath, gaps);

  if (!missingReport.includes('SuperAdmin password') || !missingReport.includes('BackupRun')) {
    addGap(gaps, 'warning', 'missing-report-actionability', 'Missing/nonrecoverable report may not cover expected restore gaps.', 'Expected secret exclusion and BackupRun coverage notes.');
  }
  if (!restoreRunbook.includes('Verify `checksums.sha256`')) {
    addGap(gaps, 'warning', 'restore-runbook-checksum-step-missing', 'Restore runbook should lead with checksum validation.', 'Checksum validation instruction was not found.');
  }

  const blockingGaps = gaps.filter((gap) => gap.classification === 'blocking_gap');
  const expectedLiveAdapterGaps = [
    {
      id: 'live-restore-adapter-not-implemented',
      severity: 'expected_gap',
      detail: 'No approved live adapter exists for Cosmos, Storage, App Service, identity, or DomainBinding restore execution.'
    },
    {
      id: 'secret-reset-workflow-required',
      severity: 'expected_gap',
      detail: 'Secrets, passwords, appsettings, keys, connection strings, deployment tokens, and SAS values are excluded and require reset or separate secure handoff.'
    },
    {
      id: 'domainbinding-non-live-restore-policy',
      severity: 'expected_gap',
      detail: 'DomainBinding records must restore as pending/non-live until DNS and Azure hostname binding are separately approved.'
    },
    {
      id: 'google-workspace-email-dns-out-of-scope',
      severity: 'expected_gap',
      detail: 'Google Workspace email DNS activation remains outside the backup restore dry-run.'
    },
    {
      id: 'cdn-front-door-out-of-scope',
      severity: 'expected_gap',
      detail: 'CDN/Front Door is not part of the current Airstrip runtime or dry-run restore scope.'
    }
  ];

  const validation = {
    schema: 'pumpkin-tenant-restore-dryrun-report',
    schemaVersion: 'v2-8-61b',
    generatedAt: new Date().toISOString(),
    status: blockingGaps.length === 0 ? (gaps.length > 0 ? 'passed_with_documented_gaps' : 'passed') : 'blocked',
    tenantId,
    bundlePath,
    outputPath,
    dryRunOnly: true,
    liveRestoreApproved: false,
    liveActionsTaken: false,
    manifest: {
      schema: manifest.schema,
      schemaVersion: manifest.schemaVersion,
      tenantId: manifest.tenantId,
      classification: manifest.classification
    },
    tenantSummary: {
      tenantId: tenantSummary.tenantId,
      counts: tenantSummary.counts,
      expectedCounts: tenantSummary.expectedCounts
    },
    checksumValidation,
    backupValidation: {
      status: backupValidation.status,
      checksumEntries: backupValidation.checksumEntries
    },
    database,
    media,
    website,
    resources,
    gaps,
    expectedLiveAdapterGaps,
    prohibitedActions: {
      liveRestore: false,
      azureCosmosStorageWrite: false,
      tenantCreation: false,
      deploy: false,
      dnsOrCustomDomain: false,
      contactPost: false,
      formSubmission: false,
      customerFacingPost: false,
      mediaUploadDelete: false,
      contentUserRoleTenantDomainBindingMutation: false,
      appsettingMutation: false,
      storageKeysListKeysSasConnectionString: false,
      keyVaultSecretQuery: false
    }
  };

  const restoreOrderPlan = await buildRestoreOrderPlan(bundlePath, { tenantId });
  await writeJson(path.join(outputPath, 'RESTORE_DRY_RUN_REPORT.json'), validation);
  await writeJson(path.join(outputPath, 'RESTORE_ORDER_PLAN.json'), restoreOrderPlan);
  await writeText(path.join(outputPath, 'RESTORE_DRY_RUN_SUMMARY.md'), [
    '# Restore Dry-Run Summary',
    '',
    `Status: ${validation.status}.`,
    '',
    `Tenant: \`${tenantId}\`.`,
    '',
    `Bundle: \`${bundlePath}\`.`,
    '',
    `Checksum entries validated: ${checksumValidation.entries}.`,
    '',
    `Database counts: pages ${database.counts.pages}, media assets ${database.counts.mediaAssets}, themes ${database.counts.themes}, form definitions ${database.counts.formDefinitions}, domain bindings ${database.counts.domainBindings}.`,
    '',
    `Media files validated: ${media.mediaCount}.`,
    '',
    `Documented gaps: ${gaps.length + expectedLiveAdapterGaps.length}.`,
    '',
    'No live restore, deploy, DNS mutation, form/contact POST, media upload/delete, or storage key/SAS action was performed.'
  ].join('\n'));
  await writeText(path.join(outputPath, 'RESTORE_GAP_REPORT.md'), [
    '# Restore Gap Report',
    '',
    '## Bundle Gaps',
    '',
    ...(gaps.length === 0
      ? ['- None.']
      : gaps.map((gap) => `- ${gap.severity}: ${gap.id} - ${gap.title} ${gap.detail}`)),
    '',
    '## Expected Live Adapter Gaps',
    '',
    ...expectedLiveAdapterGaps.map((gap) => `- ${gap.id}: ${gap.detail}`)
  ].join('\n'));

  const outputChecksums = await writeOutputChecksums(outputPath);
  const finalReport = await readJson(path.join(outputPath, 'RESTORE_DRY_RUN_REPORT.json'));
  finalReport.outputChecksums = {
    entries: outputChecksums.length,
    file: 'RESTORE_VALIDATION_CHECKSUMS.sha256'
  };
  await writeJson(path.join(outputPath, 'RESTORE_DRY_RUN_REPORT.json'), finalReport);
  await writeOutputChecksums(outputPath);

  const summary = {
    status: finalReport.status,
    tenantId,
    outputPath,
    checksumEntriesValidated: checksumValidation.entries,
    databaseCounts: database.counts,
    mediaFilesValidated: media.mediaCount,
    bundleGaps: gaps.length,
    expectedLiveAdapterGaps: expectedLiveAdapterGaps.length,
    liveActionsTaken: false
  };
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(`V2.8.61B restore dry-run failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
