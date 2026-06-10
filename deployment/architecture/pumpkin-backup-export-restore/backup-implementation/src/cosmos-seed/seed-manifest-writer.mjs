import fs from 'node:fs/promises';
import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';
import { approvedCosmosContainers, cosmosSeedContractVersion, listApprovedCosmosContainerNames } from './cosmos-container-router.mjs';
import { writeSeedReadbackPlan } from './seed-readback-plan-writer.mjs';
import { writeSeedRollbackPlan } from './seed-rollback-plan-writer.mjs';

export async function writeSeedDryRunPackage({ outputRoot, seed, baselineValidation, runtimeProfileValidation }) {
  await fs.mkdir(path.join(outputRoot, 'seed-documents'), { recursive: true });
  const fileEntries = [];

  for (const containerName of listApprovedCosmosContainerNames()) {
    const documents = seed.grouped[containerName] ?? [];
    const relativePath = `seed-documents/${containerName}.json`;
    await writeJson(path.join(outputRoot, relativePath), documents);
    fileEntries.push(entry(relativePath, 'seed-documents'));
  }

  const manifest = buildSeedManifest({ seed, baselineValidation, runtimeProfileValidation, fileEntries });
  await writeJson(path.join(outputRoot, 'seed-manifest.json'), manifest);
  await writeSeedPlan({ outputRoot, seed, manifest });
  await writeSeedReadbackPlan({ outputRoot, seed });
  await writeSeedRollbackPlan({ outputRoot, seed });

  return manifest;
}

function buildSeedManifest({ seed, baselineValidation, runtimeProfileValidation, fileEntries }) {
  const totalDocuments = Object.values(seed.counts).reduce((sum, count) => sum + count, 0);
  return {
    schemaVersion: cosmosSeedContractVersion,
    manifestVersion: cosmosSeedContractVersion,
    phase: '2F-12O',
    generatedAt: seed.createdAt,
    createdBy: 'pumpkin-backup-center-cosmos-seed-dry-runner',
    requestedBy: 'phase-2f12o-approved-preflight-only',
    dryRunOnly: true,
    liveCosmosWritesPerformed: false,
    cmsWritesPerformed: false,
    runtimeSwitchPerformed: false,
    databaseExportPerformed: false,
    mediaDownloaded: false,
    azureCalled: false,
    protectedConfigRead: false,
    scope: {
      scopeType: 'tenant',
      tenantKey: seed.tenantKey,
      siteKey: seed.siteKey
    },
    migrationRunId: seed.migrationRunId,
    source: {
      type: 'phase-2f8-ice-standard-backup-baseline',
      bundle: seed.sourceDescriptor.relativePath,
      backupMode: seed.sourceDescriptor.backupMode,
      backupSource: seed.sourceDescriptor.source,
      manifestCreatedAt: seed.sourceDescriptor.manifestCreatedAt,
      inventoryCounts: seed.sourceDescriptor.inventoryCounts,
      baselineValidationStatus: baselineValidation.status
    },
    target: {
      provider: 'cosmos',
      providerStatus: seed.target.providerStatus,
      sourceResolutionStatus: seed.target.sourceResolutionStatus,
      accountName: seed.target.accountName,
      resourceGroup: seed.target.resourceGroup,
      subscriptionHint: seed.target.subscriptionHint,
      databaseName: seed.target.databaseName,
      partitionKeyPath: seed.target.partitionKeyPath,
      backupPolicyMode: seed.target.backupPolicyMode,
      containers: approvedCosmosContainers.map((container) => ({
        name: container.name,
        partitionKeyPath: container.partitionKeyPath,
        documentTypes: [...container.documentTypes]
      }))
    },
    documentCounts: seed.counts,
    totalDocuments,
    mappings: [
      { source: 'cms-content/tenants.json', documentType: 'tenant', container: 'tenants' },
      { source: 'cms-content/sites.json', documentType: 'site', container: 'sites' },
      { source: 'cms-content/pages.json plus cms-content/seo.json', documentType: 'page', container: 'pages' },
      { source: 'cms-content/routes.json', documentType: 'route', container: 'routes' },
      { source: 'cms-content/forms.json', documentType: 'form', container: 'forms' },
      { source: 'media/media-assets.json', documentType: 'mediaAsset', container: 'mediaAssets' },
      { source: 'cms-content/theme.json', documentType: 'theme', container: 'themes' },
      { source: 'dry-run provenance', documentType: 'importRun', container: 'importRuns' }
    ],
    runtimeProfileValidationStatus: runtimeProfileValidation.status,
    files: [
      ...fileEntries,
      entry('seed-manifest.json', 'manifest'),
      entry('SEED_PLAN.md', 'seed-plan'),
      entry('READBACK_PLAN.md', 'readback-plan'),
      entry('ROLLBACK_PLAN.md', 'rollback-plan')
    ].sort((a, b) => a.path.localeCompare(b.path)),
    boundaries: {
      localOnly: true,
      outputRootIgnoredTmpOnly: true,
      protectedConfigRead: false,
      secretsIncluded: false,
      sessionJwtDurableEscrowIncluded: false,
      liveCosmosWritesPerformed: false,
      cmsWritesPerformed: false,
      azureCalled: false,
      databaseExportPerformed: false,
      mediaDownloaded: false,
      deploymentPerformed: false,
      searchConsoleOrIndexingPerformed: false,
      livePagePublicationPerformed: false
    },
    exclusions: [
      'secret values',
      'session JWT durable escrow',
      'protected config files',
      'Cosmos writes',
      'CMS writes',
      'database export',
      'media blob downloads',
      'Azure mutations',
      'deployment',
      'Search Console/indexing',
      'live-page publication'
    ]
  };
}

async function writeSeedPlan({ outputRoot, seed, manifest }) {
  const lines = [
    '# Ice Cosmos Seed Dry-Run Plan',
    '',
    'This package maps the validated Ice standard backup baseline into Cosmos-ready JSON documents without writing to Cosmos.',
    '',
    '## Scope',
    '',
    `- Tenant key: ${seed.tenantKey}`,
    `- Site key: ${seed.siteKey}`,
    `- Migration run ID: ${seed.migrationRunId}`,
    `- Target account: ${seed.target.accountName}`,
    `- Target database: ${seed.target.databaseName}`,
    '- Partition key path: `/tenantKey`',
    '',
    '## Document Counts',
    '',
    '| Container | Documents |',
    '| --- | ---: |'
  ];
  for (const [container, count] of Object.entries(manifest.documentCounts).sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`| ${container} | ${count} |`);
  }
  lines.push(
    '',
    '## Mapping Notes',
    '',
    '- SEO metadata is embedded into page documents because the approved container list has no separate SEO container.',
    '- Media records are metadata-only; no blob content is present or downloaded.',
    '- Form entry data is not included; only form definitions and form block metadata are mapped.',
    '- Tenant credential-bearing fields are excluded from seed documents.',
    '',
    '## Execution Boundary',
    '',
    '- Dry-run only.',
    '- No live Cosmos write was attempted.',
    '- No CMS write, runtime switch, database export, media download, Azure mutation, deployment, Search Console/indexing, or live-page publication was performed.',
    ''
  );
  await fs.writeFile(path.join(outputRoot, 'SEED_PLAN.md'), `${lines.join('\n')}\n`, 'utf8');
}

function entry(pathValue, kind) {
  return {
    path: pathValue,
    kind,
    required: true,
    sensitivity: 'redacted',
    schemaRef: null
  };
}
