import fs from 'node:fs/promises';
import path from 'node:path';
import { writeChecksums } from '../checksum-writer.mjs';
import { listApprovedCosmosContainerNames } from '../cosmos-seed/cosmos-container-router.mjs';
import { fileNameForLogicalCollection } from '../connectors/cosmos/cosmos-export-manifest.mjs';
import { validateLiveCosmosExportPackage } from '../connectors/cosmos/live-cosmos-export-runner.mjs';
import { validateBackupBundle, writeValidationReports } from '../validators/backup-validator.mjs';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { resolveTmpBundlePath, resolveTmpOutputPath } from '../utils/safe-paths.mjs';

const tenantKey = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';
const targetProfile = {
  tenant: 'Ice Skating Rink Rentals',
  primaryDomain: 'iceskatingrinkrentals.com',
  wwwDomain: 'www.iceskatingrinkrentals.com',
  mediaDomain: 'media.iceskatingrinkrentals.com'
};

export async function createIceBackupFromLiveCosmosExport({
  exportPath,
  outputPath,
  overwrite = false,
  now = new Date(),
  expectedTotalDocuments = 27
}) {
  const exportRoot = resolveTmpBundlePath(exportPath);
  const bundleRoot = resolveTmpOutputPath(outputPath);
  if (await pathExists(bundleRoot)) {
    if (!overwrite) throw new Error(`output already exists; pass --overwrite to replace: ${outputPath}`);
    await fs.rm(bundleRoot, { recursive: true, force: true });
  }
  await fs.mkdir(bundleRoot, { recursive: true });

  const createdAt = now.toISOString();
  const exportValidation = await validateLiveCosmosExportPackage({ exportPath: exportRoot, expectedTotalDocuments });
  if (exportValidation.status !== 'passed') {
    throw new Error(`live Cosmos export failed validation: ${exportValidation.failures.map((failure) => failure.code).join(', ')}`);
  }
  const exportData = await readLiveExport({ exportRoot });
  const bundleData = buildBundleData({ exportData, createdAt });
  const fileEntries = [];

  fileEntries.push(...(await writeTopLevelDocs({ bundleRoot, bundleData, createdAt })));
  fileEntries.push(...(await writeDatabaseComponent({ bundleRoot, exportRoot, exportData, createdAt })));
  fileEntries.push(...(await writeCmsContent({ bundleRoot, bundleData })));
  fileEntries.push(...(await writeMediaInventory({ bundleRoot, bundleData })));
  fileEntries.push(...(await writeStaticEvidence({ bundleRoot, bundleData })));
  fileEntries.push(...(await writeConfigInventory({ bundleRoot, bundleData })));
  fileEntries.push(...(await writeEscrowMarker({ bundleRoot })));

  const manifest = await writeManifest({ bundleRoot, bundleData, fileEntries, createdAt });
  const checksums = await writeChecksums(bundleRoot);
  const expectedCountsPath = await writeExpectedRestoreCounts({ bundleRoot, bundleData, createdAt });
  const validation = await validateBackupBundle({ bundlePath: bundleRoot, mode: 'database-backup-proof' });
  await writeValidationReports({ bundleRoot, validation });

  return {
    bundleRoot,
    manifest,
    checksums,
    expectedCountsPath,
    validation,
    exportValidation,
    exportManifest: exportData.manifest,
    componentStatus: bundleData.componentStatus
  };
}

async function readLiveExport({ exportRoot }) {
  const manifest = await readJson(path.join(exportRoot, 'export-manifest.json'));
  const recordsByContainer = {};
  for (const recordSet of manifest.recordSets ?? []) {
    const envelope = await readJson(path.join(exportRoot, recordSet.path));
    recordsByContainer[recordSet.logicalCollection] = envelope.records ?? [];
  }
  for (const containerName of listApprovedCosmosContainerNames()) {
    recordsByContainer[containerName] ??= [];
  }
  return { manifest, recordsByContainer };
}

function buildBundleData({ exportData, createdAt }) {
  const records = exportData.recordsByContainer;
  const pages = records.pages;
  const routes = records.routes;
  const forms = records.forms;
  const mediaAssets = records.mediaAssets;
  const themes = records.themes;
  const configInventory = buildConfigInventory({ createdAt });
  const staticEvidence = buildStaticEvidence({ routes, createdAt });
  const counts = {
    tenants: records.tenants.length,
    sites: records.sites.length,
    pages: pages.length,
    routes: routes.length,
    forms: forms.length,
    seoEntries: pages.length,
    redirects: 0,
    themeSettings: themes.length,
    mediaAssets: mediaAssets.length,
    cosmosRecordSets: exportData.manifest.recordSets.length,
    cosmosRecords: exportData.manifest.totalRecordCount,
    mediaCopiedBlobs: 0,
    staticEvidenceRoutes: staticEvidence.routes.length,
    configVariables: configInventory.variables.length
  };

  return {
    createdAt,
    exportManifest: exportData.manifest,
    records,
    cmsContent: {
      tenants: records.tenants,
      sites: records.sites,
      pages,
      routes,
      forms,
      seo: buildSeoRecords(pages),
      redirects: [],
      theme: {
        schemaVersion: '0.2.0',
        source: 'live-cosmos-export',
        themes,
        activeThemeIncluded: themes.length > 0
      }
    },
    mediaInventory: {
      schemaVersion: '0.2.0',
      source: 'live-cosmos-export-metadata',
      scope: { scopeType: 'tenant', tenantKey, siteKey },
      mediaAssets,
      blobsCopied: false,
      blobCopyApproved: false,
      blobDownloadApproved: false,
      mediaDomain: targetProfile.mediaDomain
    },
    staticEvidence,
    configInventory,
    componentStatus: {
      database: {
        provider: 'cosmos',
        mode: 'portable-json',
        status: 'complete',
        fakeOnly: false,
        liveCosmosExportPerformed: true,
        readOnlyDataPlaneAccess: true,
        authMode: 'azure-ad-rbac',
        exportManifestPath: 'database/cosmos-json/export-manifest.json',
        recordSetCount: exportData.manifest.recordSets.length,
        recordCount: exportData.manifest.totalRecordCount,
        accountName: exportData.manifest.account.name,
        databaseName: exportData.manifest.database.name,
        tenantKey
      },
      media: {
        provider: 'azure-blob',
        mode: 'metadata-only',
        status: 'partial',
        fakeOnly: false,
        copiedBlobCount: 0,
        blobMapPath: null,
        reason: 'MediaAsset metadata is included from Cosmos, but media blob copy/download proof is outside Phase 2F-12R scope.'
      },
      tenantWebsiteBundle: {
        status: 'not-run',
        fakeOnly: false,
        reason: 'Tenant website bundle copy proof remains pending until media/static copy proof is approved.'
      },
      providerSource: {
        status: 'live-cosmos-export-proof',
        fakeOnly: false,
        liveDatabaseExportAllowed: true
      },
      runtimeProfile: {
        profileName: 'ice-cosmos-live-readonly-export-proof',
        status: 'not-switched',
        fakeOnly: false,
        liveDatabaseExportAllowed: true,
        runtimeSwitchAllowed: false,
        nextAction: 'complete-media-blob-copy-proof-before-full-production-restore-readiness'
      }
    },
    counts,
    warnings: [
      'Live Cosmos portable JSON export is included and validated.',
      'Media blob copies are not included; media restore proof remains pending.',
      'CMS runtime was not switched to Cosmos.',
      'No CMS/API read or write was performed by this backup candidate writer.',
      'No media/blob download, deployment, indexing, or live-page publication was performed.'
    ]
  };
}

async function writeTopLevelDocs({ bundleRoot, bundleData, createdAt }) {
  await fs.writeFile(
    path.join(bundleRoot, 'BACKUP_SUMMARY.md'),
    [
      '# Ice Standard Backup Candidate Summary',
      '',
      'Mode: standard',
      'Target: Ice Skating Rink Rentals',
      `Tenant key: ${tenantKey}`,
      `Created: ${createdAt}`,
      'Source: Phase 2F-12R live Cosmos AAD/RBAC read-only export proof',
      '',
      '## Included',
      '',
      `- Live Cosmos portable JSON export: ${bundleData.componentStatus.database.status}`,
      `- Cosmos records: ${bundleData.componentStatus.database.recordCount}`,
      `- CMS content projection from Cosmos export: included`,
      `- MediaAsset metadata from Cosmos export: ${bundleData.mediaInventory.mediaAssets.length}`,
      '- Static route evidence metadata: included from Cosmos route records',
      '- Config inventory: redacted metadata only',
      '',
      '## Not Included',
      '',
      '- Media blob copies/downloads: not included.',
      '- Encrypted escrow: not included; this is standard backup mode.',
      '- Secret values: not included.',
      '',
      'No Cosmos writes, CMS runtime switch, CMS writes, media/blob download, deployment, Search Console/indexing, or live-page publication were performed.',
      ''
    ].join('\n'),
    'utf8'
  );

  await fs.writeFile(
    path.join(bundleRoot, 'RESTORE_INSTRUCTIONS.md'),
    [
      '# Ice Restore Instructions',
      '',
      'This backup candidate supports restore planning only.',
      '',
      '1. Validate `manifest.json`, `checksums.sha256`, and `database/cosmos-json/export-manifest.json`.',
      '2. Confirm `escrow/ESCROW_NOT_INCLUDED.md` is the only escrow file.',
      '3. Use the Cosmos portable JSON export for database restore planning in an approved sandbox only.',
      '4. Treat media blob restore as blocked until a separately approved media copy proof exists.',
      '5. Do not restore into live systems without separate recovery approval.',
      '',
      'No secret restore is possible from this standard backup candidate.',
      ''
    ].join('\n'),
    'utf8'
  );

  return [entry('BACKUP_SUMMARY.md', 'summary'), entry('RESTORE_INSTRUCTIONS.md', 'restore-instructions')];
}

async function writeDatabaseComponent({ bundleRoot, exportRoot, exportData, createdAt }) {
  const outputDir = path.join(bundleRoot, 'database');
  const cosmosDir = path.join(outputDir, 'cosmos-json');
  await fs.mkdir(cosmosDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, 'DATABASE_EXPORT_NOT_INCLUDED.md'),
    [
      '# Key-Based Database Export Not Included',
      '',
      'A live Cosmos portable JSON export is included under `database/cosmos-json/`.',
      '',
      '- No Cosmos keys/listKeys command was run.',
      '- No connection string was read.',
      '- No SAS was generated.',
      '- No platform export, import, or restore command was run.',
      '- No Cosmos write occurred in this backup proof.',
      ''
    ].join('\n'),
    'utf8'
  );
  await writeJson(path.join(outputDir, 'database-export-plan.json'), {
    schemaVersion: '0.2.0',
    status: 'included_live_cosmos_portable_json',
    provider: 'cosmos',
    mode: 'live-readonly-portable-json',
    scope: { scopeType: 'tenant', tenantKey, siteKey },
    createdAt,
    productionDatabaseTouched: false,
    productionDatabaseRead: true,
    readOnlyDataPlaneAccessOnly: true,
    connectionStringRead: false,
    keysListed: false,
    sasGenerated: false,
    exportArtifactCreated: true,
    databaseImportPerformed: false,
    cosmosWritesPerformed: false,
    exportManifestPath: 'database/cosmos-json/export-manifest.json',
    totalRecordCount: exportData.manifest.totalRecordCount,
    recoveryImpact: 'database backup proof achieved for tenant-scoped Cosmos portable JSON; media restore proof remains pending'
  });

  const entries = [
    entry('database/DATABASE_EXPORT_NOT_INCLUDED.md', 'database-plan'),
    entry('database/database-export-plan.json', 'database-plan')
  ];
  for (const relativePath of liveExportFiles(exportData.manifest)) {
    const source = path.join(exportRoot, relativePath);
    const destinationRelative = `database/cosmos-json/${relativePath}`;
    await fs.mkdir(path.dirname(path.join(bundleRoot, destinationRelative)), { recursive: true });
    await fs.copyFile(source, path.join(bundleRoot, destinationRelative));
    entries.push(entry(destinationRelative, 'cosmos-export'));
  }
  return entries;
}

function liveExportFiles(exportManifest) {
  return [
    'export-manifest.json',
    'LIVE_COSMOS_EXPORT_RESULT.json',
    'EXPORT_SUMMARY.md',
    'VALIDATION_RESULT.json',
    'VALIDATION_RESULT.md',
    'checksums.sha256',
    ...exportManifest.recordSets.map((recordSet) => recordSet.path)
  ];
}

async function writeCmsContent({ bundleRoot, bundleData }) {
  const outputDir = path.join(bundleRoot, 'cms-content');
  await fs.mkdir(outputDir, { recursive: true });
  const files = {
    'tenants.json': bundleData.cmsContent.tenants,
    'sites.json': bundleData.cmsContent.sites,
    'pages.json': bundleData.cmsContent.pages,
    'routes.json': bundleData.cmsContent.routes,
    'forms.json': bundleData.cmsContent.forms,
    'seo.json': bundleData.cmsContent.seo,
    'redirects.json': bundleData.cmsContent.redirects,
    'theme.json': bundleData.cmsContent.theme
  };
  const entries = [];
  for (const [name, value] of Object.entries(files)) {
    await writeJson(path.join(outputDir, name), value);
    entries.push(entry(`cms-content/${name}`, 'cms-content'));
  }
  return entries;
}

async function writeMediaInventory({ bundleRoot, bundleData }) {
  const outputDir = path.join(bundleRoot, 'media');
  await fs.mkdir(outputDir, { recursive: true });
  await writeJson(path.join(outputDir, 'media-assets.json'), bundleData.mediaInventory);
  await fs.writeFile(
    path.join(outputDir, 'MEDIA_BLOBS_NOT_INCLUDED.md'),
    [
      '# Media Blobs Not Included',
      '',
      'MediaAsset metadata is included from the live Cosmos export, but blob copies/downloads are not included.',
      '',
      '- No Azure blob listing command was run.',
      '- No blob copy was attempted.',
      '- No media download or upload occurred.',
      '- No storage key, SAS URL, or temporary credential was generated.',
      ''
    ].join('\n'),
    'utf8'
  );
  return [entry('media/media-assets.json', 'media-inventory'), entry('media/MEDIA_BLOBS_NOT_INCLUDED.md', 'media-inventory')];
}

async function writeStaticEvidence({ bundleRoot, bundleData }) {
  const outputDir = path.join(bundleRoot, 'static');
  await fs.mkdir(outputDir, { recursive: true });
  await writeJson(path.join(outputDir, 'static-output-manifest.json'), bundleData.staticEvidence);
  await fs.writeFile(
    path.join(outputDir, 'STATIC_OUTPUT_NOT_INCLUDED.md'),
    [
      '# Static Output Not Included',
      '',
      'This backup candidate includes static route evidence metadata only.',
      '',
      '- No static generation was run in Phase 2F-12R.',
      '- No static output files were copied into the backup.',
      '- No deployment artifact was created.',
      '- No live page publication occurred.',
      ''
    ].join('\n'),
    'utf8'
  );
  return [entry('static/static-output-manifest.json', 'static-evidence'), entry('static/STATIC_OUTPUT_NOT_INCLUDED.md', 'static-evidence')];
}

async function writeConfigInventory({ bundleRoot, bundleData }) {
  const outputDir = path.join(bundleRoot, 'config-inventory');
  await fs.mkdir(outputDir, { recursive: true });
  await writeJson(path.join(outputDir, 'env-inventory.redacted.json'), bundleData.configInventory);
  await fs.writeFile(
    path.join(outputDir, 'CONFIG_VALUES_REDACTED.md'),
    [
      '# Config Values Redacted',
      '',
      'Configuration inventory contains component names and exclusion markers only.',
      '',
      '- No environment variable values were written.',
      '- No protected config file was read.',
      '- No token, key, credential, or connection string value is included.',
      ''
    ].join('\n'),
    'utf8'
  );
  return [entry('config-inventory/env-inventory.redacted.json', 'config-inventory'), entry('config-inventory/CONFIG_VALUES_REDACTED.md', 'config-inventory')];
}

async function writeEscrowMarker({ bundleRoot }) {
  const outputDir = path.join(bundleRoot, 'escrow');
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, 'ESCROW_NOT_INCLUDED.md'),
    [
      '# Escrow Not Included',
      '',
      'This is a standard backup candidate.',
      '',
      '- No encrypted escrow payload was created.',
      '- No secret values were exported.',
      '- Real escrow remains a separate owner-approved flow.',
      ''
    ].join('\n'),
    'utf8'
  );
  return [entry('escrow/ESCROW_NOT_INCLUDED.md', 'escrow-marker')];
}

async function writeManifest({ bundleRoot, bundleData, fileEntries, createdAt }) {
  const manifest = {
    manifestVersion: '0.2.0',
    bundleContractVersion: '0.2.0',
    validatorContractVersion: '0.2.0',
    connectorContractVersion: '0.1.0',
    backupMode: 'standard',
    scope: { scopeType: 'tenant', tenantKey, siteKey },
    tenantKey,
    target: {
      tenant: targetProfile.tenant,
      primaryDomain: targetProfile.primaryDomain,
      wwwDomain: targetProfile.wwwDomain,
      mediaDomain: targetProfile.mediaDomain
    },
    createdAt,
    createdBy: 'backup-center-phase-2f12r-runner',
    requestedBy: 'phase-2f12r-approved-live-cosmos-export-proof',
    source: 'real-ice-readonly-standard',
    bundleFormat: 'folder',
    includesEscrow: false,
    checksumAlgorithm: 'sha256',
    contentFileCount: fileEntries.length,
    connectorFoundation: {
      fakeOnly: false,
      fakeCosmosExport: false,
      fakeMediaCopy: false,
      tenantWebsiteBundle: false,
      providerResolver: true,
      runtimeProfileGuard: true,
      runtimeProfile: 'ice-cosmos-live-readonly-export-proof',
      liveCosmosExportPerformed: true,
      liveBlobDownloadPerformed: false,
      cosmosWritesPerformed: false,
      externalSystemMutation: false,
      protectedConfigRead: false,
      storageCredentialUsed: false,
      keysListed: false,
      connectionStringsRead: false,
      sasGenerated: false,
      cmsRuntimeSwitchPerformed: false,
      cmsWritesPerformed: false
    },
    componentStatus: bundleData.componentStatus,
    inventoryCounts: bundleData.counts,
    schemaReferences: {
      backupManifest: '../schemas/backup-manifest.schema.json',
      note: 'Phase 2F-12R live Cosmos read-only export proof standard backup candidate.'
    },
    files: fileEntries.sort((a, b) => a.path.localeCompare(b.path)),
    warnings: bundleData.warnings,
    exclusions: [
      'secret values',
      'protected config files',
      'media blob copies',
      'encrypted escrow payloads',
      'backup zip archives',
      'Cosmos writes',
      'CMS runtime switch',
      'CMS writes',
      'MediaAsset writes',
      'deployment',
      'Search Console/indexing',
      'live-page publication'
    ]
  };
  await writeJson(path.join(bundleRoot, 'manifest.json'), manifest);
  return manifest;
}

async function writeExpectedRestoreCounts({ bundleRoot, bundleData, createdAt }) {
  const expectedPath = path.join(path.dirname(bundleRoot), `${path.basename(bundleRoot)}-expected-counts.json`);
  await writeJson(expectedPath, {
    schemaVersion: '0.2.0',
    generatedAt: createdAt,
    source: 'phase-2f12r-live-cosmos-export-backup-candidate',
    realBackupDataIncluded: true,
    expectedByScope: {
      [`tenant:${tenantKey}`]: {
        scope: { scopeType: 'tenant', tenantKey, siteKey },
        counts: bundleData.counts
      }
    }
  });
  return expectedPath;
}

function buildSeoRecords(pages) {
  return pages.map((page) => ({
    tenantKey,
    pageId: page.id ?? null,
    pageSlug: getSlug(page),
    route: getRoute(page),
    seo: page.seo ?? page.Seo ?? {},
    includeInSitemap: page.includeInSitemap === true || page.sitemapIncluded === true
  }));
}

function buildStaticEvidence({ routes, createdAt }) {
  return {
    schemaVersion: '0.2.0',
    source: 'live-cosmos-route-metadata',
    generatedAt: createdAt,
    staticGenerationRun: false,
    deploymentAttempted: false,
    liveChecksPerformed: false,
    routeCount: routes.length,
    routes: routes.map((route) => ({
      tenantKey,
      route: route.route ?? route.path ?? route.urlPath ?? '/',
      expectedStatus: route.expectedStatus ?? 200,
      source: 'live-cosmos-export',
      present: null,
      sha256: null
    })),
    supportFiles: {
      sitemap: null,
      robots: null,
      redirects: null,
      staticPublishManifest: null
    },
    warnings: ['Static file copies and live checks were not approved in Phase 2F-12R.']
  };
}

function buildConfigInventory({ createdAt }) {
  const variables = [
    'PUMPKIN_COSMOS_ACCOUNT_NAME',
    'PUMPKIN_COSMOS_DATABASE_NAME',
    'PUMPKIN_COSMOS_TENANT_KEY',
    'PUMPKIN_CMS_RUNTIME_PROFILE',
    'ICE_MEDIA_STORAGE_ACCOUNT',
    'ICE_MEDIA_CONTAINER'
  ].map((name) => ({
    name,
    subsystem: name.startsWith('ICE_MEDIA') ? 'media-export' : 'cosmos-export',
    sourceType: 'not-read-phase-2f12r',
    presence: 'EXCLUDED',
    value: 'EXCLUDED',
    escrowEligible: false,
    restoreImpact: 'Operator must provide approved runtime configuration outside the standard backup candidate.'
  }));
  return {
    schemaVersion: '0.2.0',
    source: 'phase-2f12r-no-protected-config-read',
    generatedAt: createdAt,
    scope: { scopeType: 'tenant', tenantKey, siteKey },
    valuesIncluded: false,
    variables
  };
}

function getSlug(page) {
  const raw = String(page.pageSlug ?? page.slug ?? page.Slug ?? page.id ?? 'home').trim().replace(/^\/+|\/+$/g, '');
  return raw || 'home';
}

function getRoute(page) {
  const route = String(page.route ?? page.path ?? '').trim();
  if (route) return route;
  const slug = getSlug(page);
  return slug === 'home' ? '/' : `/${slug}`;
}

function entry(pathValue, kind) {
  return { path: pathValue, kind, required: true, sensitivity: 'redacted', schemaRef: null };
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
