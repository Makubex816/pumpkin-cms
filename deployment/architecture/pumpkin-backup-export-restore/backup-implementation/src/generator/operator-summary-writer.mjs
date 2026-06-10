import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { packageRoot } from '../utils/safe-paths.mjs';

const architectureRoot = path.resolve(packageRoot, '..');
const registryResultPackage = path.join(architectureRoot, 'phase-2f12n-real-resource-registry-live-inventory-result');
const operationalReadinessPackage = path.join(architectureRoot, 'phase-2f12t-backup-center-operational-readiness-result');

export async function writeGeneratorProductFiles({
  bundleRoot,
  profile,
  generatedAt,
  validation = null,
  restorePlan = null,
  download = null,
  stage = 'in-progress'
}) {
  const registryReference = await buildResourceRegistryReference({ generatedAt });
  const generatorResult = buildGeneratorResult({
    profile,
    generatedAt,
    validation,
    restorePlan,
    download,
    registryReference,
    stage
  });

  await fs.mkdir(path.join(bundleRoot, 'resource-registry'), { recursive: true });
  await fs.mkdir(path.join(bundleRoot, 'operator'), { recursive: true });
  await writeJson(path.join(bundleRoot, 'resource-registry', 'resource-registry-reference.json'), registryReference);
  await fs.writeFile(
    path.join(bundleRoot, 'resource-registry', 'RESOURCE_REGISTRY_REFERENCE.md'),
    renderResourceRegistryReference(registryReference),
    'utf8'
  );
  await writeJson(path.join(bundleRoot, 'operator', 'generator-result.json'), generatorResult);
  await fs.writeFile(
    path.join(bundleRoot, 'operator', 'OPERATOR_SUMMARY.md'),
    renderOperatorSummary(generatorResult),
    'utf8'
  );
  await fs.writeFile(
    path.join(bundleRoot, 'operator', 'RETENTION_AND_CLEANUP.md'),
    renderRetentionCleanup(generatorResult),
    'utf8'
  );
  await fs.writeFile(
    path.join(bundleRoot, 'RESTORE_PLAN.md'),
    renderBundleRestorePlanSummary(generatorResult),
    'utf8'
  );

  return productFileEntries();
}

export function productFileEntries() {
  return [
    entry('RESTORE_PLAN.md', 'restore-plan'),
    entry('operator/OPERATOR_SUMMARY.md', 'operator-report'),
    entry('operator/RETENTION_AND_CLEANUP.md', 'operator-report'),
    entry('operator/generator-result.json', 'operator-report'),
    entry('resource-registry/RESOURCE_REGISTRY_REFERENCE.md', 'resource-registry'),
    entry('resource-registry/resource-registry-reference.json', 'resource-registry')
  ];
}

async function buildResourceRegistryReference({ generatedAt }) {
  const manifestPath = path.join(registryResultPackage, 'manifest.json');
  const readinessPath = path.join(operationalReadinessPackage, 'manifest.json');
  const registryManifest = await readOptionalJson(manifestPath);
  const readinessManifest = await readOptionalJson(readinessPath);
  return {
    schemaVersion: '0.2.0',
    mode: 'redacted-resource-registry-reference',
    generatedAt,
    includedAsReferenceOnly: true,
    registryPackage: path.relative(architectureRoot, registryResultPackage).replace(/\\/g, '/'),
    registryStatus: registryManifest?.status ?? 'not-found',
    registryGeneratedAt: registryManifest?.generatedAt ?? null,
    realRedactedRegistryGenerated: registryManifest?.readiness?.realRedactedRegistryGenerated === true,
    encryptedHandoffRegenerated: registryManifest?.readiness?.encryptedHandoffRegenerated === true,
    plaintextSecretExport: false,
    protectedConfigRead: false,
    includesEncryptedVaultPayload: false,
    standardBackupIncludesEscrow: false,
    secureHandoffPathIncluded: false,
    operationalReadinessPackage: path.relative(architectureRoot, operationalReadinessPackage).replace(/\\/g, '/'),
    operationalReadinessStatus: readinessManifest?.status ?? 'not-found',
    notes: [
      'Standard backup includes a redacted registry reference only.',
      'Encrypted handoff and vault payloads remain separate owner-controlled outputs.',
      'Session JWT durable escrow remains excluded by default.'
    ]
  };
}

function buildGeneratorResult({
  profile,
  generatedAt,
  validation,
  restorePlan,
  download,
  registryReference,
  stage
}) {
  return {
    schemaVersion: '0.2.0',
    phase: '2F-13',
    generator: 'pumpkin-backup-center-unified-standard-generator',
    generatedAt,
    profile,
    stage,
    standardBackupIncludesEscrow: false,
    validation: validation
      ? {
        status: validation.status,
        mode: validation.mode,
        checksumResult: validation.summary?.checksumResult ?? null,
        manifestFileListResult: validation.summary?.manifestFileListResult ?? null,
        connectorProofResult: validation.summary?.connectorProofResult ?? null,
        failureCount: validation.summary?.failureCount ?? null
      }
      : { status: 'pending' },
    restorePlan: restorePlan
      ? {
        status: restorePlan.status,
        mode: restorePlan.mode,
        dryRunOnly: restorePlan.dryRunOnly,
        restoreExecuted: restorePlan.restoreExecuted,
        cosmosRecords: restorePlan.inventoryCounts?.cosmosRecords ?? 0,
        mediaCopiedBlobs: restorePlan.inventoryCounts?.mediaCopiedBlobs ?? 0
      }
      : { status: 'pending' },
    resourceRegistry: {
      status: registryReference.registryStatus,
      referenceOnly: registryReference.includedAsReferenceOnly,
      encryptedVaultPayloadIncluded: registryReference.includesEncryptedVaultPayload
    },
    download: download
      ? {
        status: download.status,
        zipPath: download.zipRelativePath,
        zipSha256: download.zipSha256,
        fileCount: download.fileCount
      }
      : { status: 'not-run' },
    boundaries: {
      cmsRuntimeSwitch: false,
      cmsWrites: false,
      cosmosWrites: false,
      storageMutation: false,
      protectedConfigRead: false,
      keysListed: false,
      connectionStringsRead: false,
      sasGenerated: false,
      deployment: false,
      searchConsoleOrIndexing: false,
      livePagePublication: false
    }
  };
}

function renderResourceRegistryReference(reference) {
  return [
    '# Resource Registry Reference',
    '',
    `Status: ${reference.registryStatus}`,
    `Generated: ${reference.generatedAt}`,
    '',
    'This standard backup includes a redacted Resource Registry reference only.',
    '',
    `Registry package: \`${reference.registryPackage}\``,
    `Real redacted registry generated: ${reference.realRedactedRegistryGenerated}`,
    `Encrypted handoff regenerated: ${reference.encryptedHandoffRegenerated}`,
    '',
    '- No encrypted vault payload is included in this standard backup.',
    '- No handoff package folder is copied into this standard backup.',
    '- No plaintext secret values are included.',
    '- Session JWT durable escrow remains excluded.',
    ''
  ].join('\n');
}

function renderOperatorSummary(result) {
  return [
    '# Operator Summary',
    '',
    `Generator: ${result.generator}`,
    `Profile: ${result.profile}`,
    `Generated: ${result.generatedAt}`,
    '',
    '## Results',
    '',
    `- Validation: ${result.validation.status}`,
    `- Restore plan: ${result.restorePlan.status}`,
    `- Dry-run only: ${result.restorePlan.dryRunOnly ?? 'pending'}`,
    `- Restore executed: ${result.restorePlan.restoreExecuted ?? false}`,
    `- Resource Registry: ${result.resourceRegistry.status} reference only`,
    `- Download package: ${result.download.status}`,
    '',
    '## Boundaries',
    '',
    '- Standard backup includes escrow: false',
    '- CMS runtime switch: false',
    '- CMS writes: false',
    '- Cosmos writes: false',
    '- Storage mutation: false',
    '- Protected config read: false',
    '- Deployment, indexing, and live-page publication: false',
    ''
  ].join('\n');
}

function renderRetentionCleanup(result) {
  return [
    '# Retention And Cleanup',
    '',
    'Generated backup folders, restore-plan folders, and download packages are local `.tmp` artifacts.',
    '',
    'Retention guidance:',
    '',
    '- Keep the latest complete standard backup proof until owner signoff or approved archival.',
    '- Keep download packages only long enough for owner transfer or review.',
    '- Keep encrypted handoff outputs outside Git under owner control if retained.',
    '- Never stage generated backup, media, restore, handoff, vault, or zip artifacts.',
    '',
    'Cleanup guidance:',
    '',
    '- Use explicit path-specific cleanup only after owner approval.',
    '- Prefer PowerShell `Remove-Item -LiteralPath <approved .tmp path> -Recurse -Force` for the exact generated folder.',
    '- Do not use broad recursive cleanup patterns.',
    '',
    `Profile: ${result.profile}`,
    `Download package status: ${result.download.status}`,
    ''
  ].join('\n');
}

function renderBundleRestorePlanSummary(result) {
  return [
    '# Restore Plan Summary',
    '',
    `Status: ${result.restorePlan.status}`,
    `Mode: ${result.restorePlan.mode ?? 'pending'}`,
    `Dry-run only: ${result.restorePlan.dryRunOnly ?? true}`,
    `Restore executed: ${result.restorePlan.restoreExecuted ?? false}`,
    '',
    'This file is an operator-facing summary embedded in the backup bundle. Full restore-plan reports are written to the generator restore-plan output folder.',
    '',
    `Cosmos records: ${result.restorePlan.cosmosRecords ?? 0}`,
    `Media copied blobs: ${result.restorePlan.mediaCopiedBlobs ?? 0}`,
    '',
    'No restore was executed.',
    ''
  ].join('\n');
}

async function readOptionalJson(filePath) {
  try {
    return await readJson(filePath);
  } catch {
    return null;
  }
}

function entry(pathValue, kind) {
  return { path: pathValue, kind, required: true, sensitivity: 'redacted', schemaRef: null };
}
