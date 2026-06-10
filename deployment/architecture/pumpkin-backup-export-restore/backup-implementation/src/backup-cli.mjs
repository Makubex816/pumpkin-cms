#!/usr/bin/env node
import { createFakeEscrow } from './escrow/escrow-create-runner.mjs';
import { validateEscrowOutput } from './escrow/escrow-validator.mjs';
import { writeEscrowValidationReports } from './escrow/escrow-report-writer.mjs';
import { createIceStandardBackup } from './ice/ice-standard-backup-runner.mjs';
import { createIceBackupFromLiveCosmosExport } from './ice/ice-live-cosmos-backup-runner.mjs';
import { createIceCosmosSeedDryRun } from './cosmos-seed/ice-seed-dry-runner.mjs';
import { runGuardedLiveCosmosSeed } from './cosmos-seed/guarded-live-seed-runner.mjs';
import { runLiveCosmosReadonlyExport, validateLiveCosmosExportPackage, writeLiveCosmosExportValidationReports } from './connectors/cosmos/live-cosmos-export-runner.mjs';
import { runLiveMediaBlobCopyProof, validateLiveMediaCopyProof, writeLiveMediaCopyValidationReports } from './connectors/media/live-media-copy-runner.mjs';
import { validateSeedDryRunPackage, writeSeedValidationReports } from './cosmos-seed/tenant-partition-validator.mjs';
import { createStandardBackup } from './standard-backup-runner.mjs';
import { createRestorePlan } from './restore/restore-plan-runner.mjs';
import { validateBackupBundle, writeValidationReports } from './validators/backup-validator.mjs';
import { resolveProviderSourceFromFixture } from './provider/provider-resolver.mjs';
import { buildRuntimeProfileBridge } from './provider/runtime-profile-bridge.mjs';
import {
  listRuntimeProfileDefinitions,
  resolveRuntimeProfileFromFixture,
  resolveRuntimeProfileWithProviderFixture
} from './provider/runtime-profile-model.mjs';
import { readJson } from './utils/json-writer.mjs';
import { resolveTmpBundlePath } from './utils/safe-paths.mjs';
import path from 'node:path';

const version = '0.12.0';

async function main(argv) {
  const [command, ...rest] = argv;
  const options = parseArgs(rest);

  if (!command || command === 'help' || options.help) {
    printHelp();
    return;
  }
  if (command === 'version') {
    console.log(version);
    return;
  }
  if (command === 'create-standard') {
    const answersPath = requiredOption(options, 'answers');
    const outputPath = requiredOption(options, 'out');
    const result = await createStandardBackup({
      answersPath,
      outputPath,
      scopeOverride: options.scope,
      overwrite: Boolean(options.overwrite),
      connectors: connectorOptionsFromCli(options)
    });
    console.log(`created: ${path.relative(process.cwd(), result.bundleRoot)}`);
    console.log(`validation: ${result.validation.status}`);
    console.log(`validationMode: ${result.validation.mode}`);
    return;
  }
  if (command === 'create-ice-standard') {
    const outputPath = requiredOption(options, 'out');
    const result = await createIceStandardBackup({
      outputPath,
      overwrite: Boolean(options.overwrite)
    });
    console.log(`created: ${path.relative(process.cwd(), result.bundleRoot)}`);
    console.log(`validation: ${result.validation.status}`);
    console.log(`cmsContent: ${result.componentStatus.cmsContent}`);
    console.log(`database: ${result.componentStatus.database}`);
    console.log(`media: ${result.componentStatus.media}`);
    console.log(`expectedCounts: ${path.relative(process.cwd(), result.expectedCountsPath)}`);
    return;
  }
  if (command === 'validate') {
    const bundleRoot = resolveTmpBundlePath(requiredOption(options, 'bundle'));
    const validation = await validateBackupBundle({ bundlePath: bundleRoot, mode: options.mode });
    await writeValidationReports({ bundleRoot, validation });
    console.log(`validation: ${validation.status}`);
    console.log(`mode: ${validation.mode}`);
    if (validation.status !== 'passed') {
      process.exitCode = 1;
    }
    return;
  }
  if (command === 'restore-plan') {
    const bundlePath = requiredOption(options, 'bundle');
    const outputPath = requiredOption(options, 'out');
    const result = await createRestorePlan({
      bundlePath,
      outputPath,
      expectedCountsPath: options['expected-counts'],
      mode: options.mode,
      overwrite: Boolean(options.overwrite)
    });
    console.log(`restore-plan: ${result.plan.status}`);
    console.log(`output: ${path.relative(process.cwd(), result.outputRoot)}`);
    console.log(`scope: ${result.plan.scope.scopeType}`);
    console.log(`dryRunOnly: ${result.plan.dryRunOnly}`);
    if (result.plan.status !== 'passed') {
      process.exitCode = 1;
    }
    return;
  }
  if (command === 'cosmos-seed:ice-dry-run') {
    const sourcePath = requiredOption(options, 'source');
    const outputPath = requiredOption(options, 'out');
    const result = await createIceCosmosSeedDryRun({
      sourcePath,
      outputPath,
      overwrite: Boolean(options.overwrite),
      providerFixturePath: options['provider-fixture'] ?? undefined,
      runtimeFixturePath: options['runtime-fixture'] ?? undefined
    });
    console.log(`cosmos-seed-dry-run: ${result.validation.status}`);
    console.log(`output: ${path.relative(process.cwd(), result.outputRoot)}`);
    console.log(`sourceValidation: ${result.baselineValidation.status}`);
    console.log(`tenantKey: ${result.seed.tenantKey}`);
    console.log(`partitionKey: ${result.manifest.target.partitionKeyPath}`);
    console.log(`totalDocuments: ${result.manifest.totalDocuments}`);
    if (result.validation.status !== 'passed') {
      process.exitCode = 1;
    }
    return;
  }
  if (command === 'cosmos-seed:validate') {
    const seedRoot = resolveTmpBundlePath(requiredOption(options, 'seed'));
    const validation = await validateSeedDryRunPackage({ seedPath: seedRoot });
    await writeSeedValidationReports({ seedRoot, validation });
    console.log(`cosmos-seed-validation: ${validation.status}`);
    console.log(`totalDocuments: ${validation.summary.totalDocuments}`);
    if (validation.status !== 'passed') {
      process.exitCode = 1;
    }
    return;
  }
  if (command === 'cosmos-seed:live-execute') {
    const seedPath = requiredOption(options, 'seed');
    const outputPath = requiredOption(options, 'out');
    const result = await runGuardedLiveCosmosSeed({
      seedPath,
      outputPath,
      overwrite: Boolean(options.overwrite)
    });
    console.log(`cosmos-seed-live: ${result.status}`);
    console.log(`output: ${path.relative(process.cwd(), result.outputRoot)}`);
    console.log(`dataPlaneAccess: ${result.dataPlaneAccess?.status ?? 'not-run'}`);
    console.log(`created: ${result.execution.createdCount}`);
    console.log(`skippedExisting: ${result.execution.skippedExistingCount}`);
    console.log(`readback: ${result.readback?.status ?? 'not-run'}`);
    if (result.status === 'failed' || result.status === 'partial') {
      process.exitCode = 1;
    }
    return;
  }
  if (command === 'cosmos-export:live-readonly') {
    const outputPath = requiredOption(options, 'out');
    const result = await runLiveCosmosReadonlyExport({
      outputPath,
      overwrite: Boolean(options.overwrite)
    });
    console.log(`cosmos-export-live-readonly: ${result.status}`);
    console.log(`output: ${path.relative(process.cwd(), result.outputRoot)}`);
    console.log(`dataPlaneAccess: ${result.dataPlaneAccess?.status ?? 'not-run'}`);
    console.log(`recordSets: ${result.recordSetCount}`);
    console.log(`totalRecords: ${result.totalRecordCount}`);
    console.log(`validation: ${result.validation?.status ?? 'not-run'}`);
    if (result.status !== 'exported-and-validated') {
      process.exitCode = 1;
    }
    return;
  }
  if (command === 'cosmos-export:validate') {
    const exportRoot = resolveTmpBundlePath(requiredOption(options, 'export'));
    const validation = await validateLiveCosmosExportPackage({ exportPath: exportRoot });
    await writeLiveCosmosExportValidationReports({ exportRoot, validation });
    console.log(`cosmos-export-validation: ${validation.status}`);
    console.log(`totalRecords: ${validation.summary.totalRecordCount}`);
    if (validation.status !== 'passed') {
      process.exitCode = 1;
    }
    return;
  }
  if (command === 'create-ice-cosmos-export-backup') {
    const exportPath = requiredOption(options, 'export');
    const outputPath = requiredOption(options, 'out');
    const result = await createIceBackupFromLiveCosmosExport({
      exportPath,
      outputPath,
      overwrite: Boolean(options.overwrite)
    });
    console.log(`created: ${path.relative(process.cwd(), result.bundleRoot)}`);
    console.log(`validation: ${result.validation.status}`);
    console.log(`validationMode: ${result.validation.mode}`);
    console.log(`database: ${result.componentStatus.database.status}`);
    console.log(`cosmosRecords: ${result.componentStatus.database.recordCount}`);
    console.log(`media: ${result.componentStatus.media.status}`);
    console.log(`expectedCounts: ${path.relative(process.cwd(), result.expectedCountsPath)}`);
    if (result.validation.status !== 'passed') {
      process.exitCode = 1;
    }
    return;
  }
  if (command === 'media-copy:live-readonly') {
    const outputPath = requiredOption(options, 'out');
    const result = await runLiveMediaBlobCopyProof({
      outputPath,
      overwrite: Boolean(options.overwrite)
    });
    console.log(`media-copy-live-readonly: ${result.status}`);
    console.log(`output: ${path.relative(process.cwd(), result.outputRoot)}`);
    console.log(`dataPlaneAccess: ${result.dataPlaneAccess?.status ?? 'not-run'}`);
    console.log(`approvedBlobs: ${result.listing?.approvedBlobCount ?? 0}`);
    console.log(`copiedBlobs: ${result.copy?.copiedBlobCount ?? 0}`);
    console.log(`totalBytes: ${result.copy?.totalCopiedBytes ?? result.listing?.totalBytes ?? 0}`);
    console.log(`validation: ${result.validation?.status ?? 'not-run'}`);
    if (result.status !== 'copied-and-validated') {
      process.exitCode = 1;
    }
    return;
  }
  if (command === 'media-copy:validate') {
    const mediaRoot = resolveTmpBundlePath(requiredOption(options, 'media'));
    const validation = await validateLiveMediaCopyProof({ mediaPath: mediaRoot });
    await writeLiveMediaCopyValidationReports({ mediaRoot, validation });
    console.log(`media-copy-validation: ${validation.status}`);
    console.log(`copiedBlobs: ${validation.summary.copiedBlobCount}`);
    console.log(`totalBytes: ${validation.summary.totalCopiedBytes}`);
    if (validation.status !== 'passed') {
      process.exitCode = 1;
    }
    return;
  }
  if (command === 'create-ice-complete-standard-backup') {
    const exportPath = requiredOption(options, 'export');
    const mediaProofPath = requiredOption(options, 'media');
    const outputPath = requiredOption(options, 'out');
    const result = await createIceBackupFromLiveCosmosExport({
      exportPath,
      mediaProofPath,
      outputPath,
      overwrite: Boolean(options.overwrite)
    });
    console.log(`created: ${path.relative(process.cwd(), result.bundleRoot)}`);
    console.log(`validation: ${result.validation.status}`);
    console.log(`validationMode: ${result.validation.mode}`);
    console.log(`database: ${result.componentStatus.database.status}`);
    console.log(`cosmosRecords: ${result.componentStatus.database.recordCount}`);
    console.log(`media: ${result.componentStatus.media.status}`);
    console.log(`copiedBlobs: ${result.componentStatus.media.copiedBlobCount}`);
    console.log(`expectedCounts: ${path.relative(process.cwd(), result.expectedCountsPath)}`);
    if (result.validation.status !== 'passed') {
      process.exitCode = 1;
    }
    return;
  }
  if (command === 'escrow-create-fake') {
    const requestPath = requiredOption(options, 'request');
    const outputPath = requiredOption(options, 'out');
    const result = await createFakeEscrow({
      requestPath,
      outputPath,
      overwrite: Boolean(options.overwrite)
    });
    console.log(`escrow-create-fake: ${result.validation.status}`);
    console.log(`output: ${path.relative(process.cwd(), result.outputRoot)}`);
    console.log(`fakeOnly: ${result.manifest.fakeOnly}`);
    console.log(`items: ${result.manifest.itemCount}`);
    return;
  }
  if (command === 'resolve-provider') {
    const fixturePath = requiredOption(options, 'fixture');
    const result = await resolveProviderSourceFromFixture({
      fixturePath,
      tenantKey: options.tenant,
      siteKey: options.site,
      environment: options.environment,
      profile: options.profile
    });
    console.log(`providerType: ${result.metadata.providerType}`);
    console.log(`providerStatus: ${result.metadata.providerStatus}`);
    console.log(`sourceResolutionStatus: ${result.metadata.sourceResolutionStatus}`);
    console.log(`selectedTargetProvider: ${result.metadata.selectedTargetProvider ?? 'none'}`);
    console.log(`exportReadiness: ${result.readiness.exportReadiness}`);
    console.log(`liveDatabaseExportAllowed: ${result.readiness.liveDatabaseExportAllowed}`);
    console.log(`nextAction: ${result.readiness.nextAction}`);
    if (result.validation.status !== 'passed') {
      process.exitCode = 1;
    }
    return;
  }
  if (command === 'resolve-runtime-profile') {
    const fixturePath = requiredOption(options, 'fixture');
    const result = await resolveProviderSourceFromFixture({
      fixturePath,
      tenantKey: options.tenant,
      siteKey: options.site,
      environment: options.environment,
      profile: options.profile
    });
    const bridge = buildRuntimeProfileBridge(result, { runtimeProfileName: options['runtime-profile'] ?? null });
    printRuntimeProfileSummary(bridge.runtimeProfile);
    console.log(`providerType: ${bridge.response.providerType}`);
    console.log(`providerStatus: ${bridge.response.providerStatus}`);
    console.log(`provisioningStatus: ${bridge.response.provisioningStatus}`);
    console.log(`runtimeStatus: ${bridge.response.runtimeStatus}`);
    console.log(`liveDatabaseExportAllowed: ${bridge.readiness.liveDatabaseExportAllowed}`);
    console.log(`nextAction: ${bridge.readiness.nextAction}`);
    if (result.validation.status !== 'passed') {
      process.exitCode = 1;
    }
    return;
  }
  if (command === 'runtime-profile:list') {
    for (const definition of listRuntimeProfileDefinitions()) {
      console.log(`${definition.profileName}: ${definition.category}; liveDatabaseExportAllowed=${definition.liveDatabaseExportAllowed}; fakeCompleteExportAllowed=${definition.fakeCompleteExportAllowed}`);
    }
    return;
  }
  if (command === 'runtime-profile:inspect') {
    const resolved = options['runtime-fixture']
      ? await resolveRuntimeProfileFromFixture({ fixturePath: options['runtime-fixture'] })
      : await resolveRuntimeProfileWithProviderFixture({
        providerFixturePath: options.fixture,
        runtimeProfileName: options['runtime-profile'] ?? null,
        tenantKey: options.tenant,
        siteKey: options.site,
        environment: options.environment,
        providerProfile: options.profile
      });
    printRuntimeProfileSummary(resolved.profile);
    return;
  }
  if (command === 'runtime-profile:validate') {
    const resolved = options['runtime-fixture']
      ? await resolveRuntimeProfileFromFixture({ fixturePath: options['runtime-fixture'] })
      : await resolveRuntimeProfileWithProviderFixture({
        providerFixturePath: options.fixture,
        runtimeProfileName: options['runtime-profile'] ?? null,
        tenantKey: options.tenant,
        siteKey: options.site,
        environment: options.environment,
        providerProfile: options.profile
      });
    printRuntimeProfileSummary(resolved.profile);
    console.log(`validation: ${resolved.validation.status}`);
    if (resolved.validation.status !== 'passed') {
      process.exitCode = 1;
    }
    return;
  }
  if (command === 'escrow-validate') {
    const escrowPath = requiredOption(options, 'escrow');
    const validation = await validateEscrowOutput({ escrowPath });
    const escrowRoot = resolveTmpBundlePath(escrowPath);
    await writeEscrowValidationReports({ outputRoot: escrowRoot, validation });
    console.log(`escrow-validation: ${validation.status}`);
    if (validation.status !== 'passed') {
      process.exitCode = 1;
    }
    return;
  }
  if (command === 'escrow-inspect') {
    const escrowRoot = resolveTmpBundlePath(requiredOption(options, 'escrow'));
    const manifest = await readJson(path.join(escrowRoot, 'escrow-manifest.json'));
    console.log(`mode: ${manifest.mode}`);
    console.log(`fakeOnly: ${manifest.fakeOnly}`);
    console.log(`items: ${manifest.itemCount}`);
    console.log(`algorithm: ${manifest.encryption?.contentEncryption?.algorithm}`);
    console.log(`privateKeyWritten: ${manifest.boundaries?.privateKeyWritten}`);
    return;
  }
  if (command === 'inspect') {
    const bundleRoot = resolveTmpBundlePath(requiredOption(options, 'bundle'));
    const manifest = await readJson(path.join(bundleRoot, 'manifest.json'));
    console.log(`mode: ${manifest.backupMode}`);
    console.log(`scope: ${manifest.scope?.scopeType}`);
    console.log(`tenant: ${manifest.scope?.tenantKey ?? 'platform'}`);
    console.log(`includesEscrow: ${manifest.includesEscrow}`);
    console.log(`files: ${manifest.files?.length ?? 0}`);
    return;
  }

  throw new Error(`unknown command: ${command}`);
}

function parseArgs(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('--')) {
      throw new Error(`unexpected positional argument: ${arg}`);
    }
    const key = arg.slice(2);
    if (key === 'overwrite' || key === 'help') {
      options[key] = true;
      continue;
    }
    if (key === 'with-fake-cosmos' || key === 'with-fake-media-copy' || key === 'tenant-website-bundle') {
      options[key] = true;
      continue;
    }
    const value = args[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`missing value for --${key}`);
    }
    options[key] = value;
    index += 1;
  }
  return options;
}

function connectorOptionsFromCli(options) {
  return {
    fakeCosmos: Boolean(options['with-fake-cosmos']),
    fakeMediaCopy: Boolean(options['with-fake-media-copy']),
    tenantWebsiteBundle: Boolean(options['tenant-website-bundle']),
    providerSourceFixture: options['provider-source-fixture'] ?? null,
    runtimeProfile: options['runtime-profile'] ?? null
  };
}

function requiredOption(options, key) {
  if (!options[key]) {
    throw new Error(`missing required option --${key}`);
  }
  return options[key];
}

function printHelp() {
  console.log(`Pumpkin Backup Center local prototype ${version}

Commands:
  help
  version
  create-standard --scope tenant|platform --answers <fixture.json> --out .tmp/<bundle> [--runtime-profile local-dev] [--with-fake-cosmos] [--with-fake-media-copy] [--tenant-website-bundle] [--overwrite]
  create-ice-standard --out .tmp/ice-full-standard-backup [--overwrite]
  validate --bundle .tmp/<bundle> [--mode baseline|production-restore-proof]
  restore-plan --bundle .tmp/<bundle> --out .tmp/<restore-plan> [--mode baseline|production-restore-proof] [--expected-counts fixtures/restore-expected-counts.json] [--overwrite]
  cosmos-seed:ice-dry-run --source .tmp/ice-full-standard-backup --out .tmp/phase-2f12o-ice-cosmos-seed-dry-run [--overwrite]
  cosmos-seed:validate --seed .tmp/phase-2f12o-ice-cosmos-seed-dry-run
  cosmos-seed:live-execute --seed .tmp/phase-2f12o-ice-cosmos-seed-dry-run --out .tmp/phase-2f12p-live-cosmos-seed [--overwrite]
  cosmos-export:live-readonly --out .tmp/phase-2f12r-live-cosmos-export [--overwrite]
  cosmos-export:validate --export .tmp/phase-2f12r-live-cosmos-export
  create-ice-cosmos-export-backup --export .tmp/phase-2f12r-live-cosmos-export --out .tmp/phase-2f12r-ice-standard-backup-with-cosmos-export [--overwrite]
  media-copy:live-readonly --out .tmp/phase-2f12s-media-blob-copy [--overwrite]
  media-copy:validate --media .tmp/phase-2f12s-media-blob-copy
  create-ice-complete-standard-backup --export .tmp/phase-2f12r-live-cosmos-export --media .tmp/phase-2f12s-media-blob-copy --out .tmp/phase-2f12s-complete-ice-standard-backup [--overwrite]
  resolve-provider --fixture fixtures/provider-source.ice.missing.json [--tenant ice-rink-rentals] [--site ice-rink-rentals] [--profile fixture]
  resolve-runtime-profile --fixture fixtures/provider-source.ice.future-target-cosmos.json [--tenant ice-rink-rentals] [--site ice-rink-rentals] [--runtime-profile local-dev]
  runtime-profile:list
  runtime-profile:inspect --runtime-fixture fixtures/runtime-profile.ice.future-target-cosmos.json
  runtime-profile:validate --runtime-fixture fixtures/runtime-profile.production-write-approved.blocked.json
  escrow-create-fake --request fixtures/fake-escrow-request.json --out .tmp/<fake-escrow> [--overwrite]
  escrow-validate --escrow .tmp/<fake-escrow>
  escrow-inspect --escrow .tmp/<fake-escrow>
  inspect --bundle .tmp/<bundle>

Example fake complete connector bundle:
  create-standard --scope tenant --answers fixtures/ice-cosmos-media-standard-backup.answers.json --with-fake-cosmos --with-fake-media-copy --tenant-website-bundle --out .tmp/ice-cosmos-media-fake-complete --overwrite

Boundary:
  Folder bundles, restore-plan dry-runs, Cosmos seed dry-run documents, explicitly approved live read-only Cosmos export output, fake connector output, and fake escrow test output under .tmp only. No zips, no real secrets, no production escrow payloads, no real restore, no CMS/API writes, no unapproved Cosmos write, no real blob download.
`);
}

function printRuntimeProfileSummary(profile) {
  console.log(`runtimeProfile: ${profile.profileName}`);
  console.log(`providerClassifiedProfile: ${profile.providerClassifiedProfileName}`);
  console.log(`profileReadiness: ${profile.readiness.status}`);
  console.log(`providerType: ${profile.provider.providerType}`);
  console.log(`providerStatus: ${profile.provider.providerStatus}`);
  console.log(`runtimeStatus: ${profile.provider.runtimeStatus}`);
  console.log(`fakeCompleteExportAllowed: ${profile.guards.fakeCompleteExport.allowed}`);
  console.log(`liveDatabaseExportAllowed: ${profile.guards.liveDatabaseExport.allowed}`);
  console.log(`runtimeSwitchAllowed: ${profile.guards.runtimeSwitch.allowed}`);
  console.log(`productionWritesAllowed: ${profile.guards.productionWrites.allowed}`);
  console.log(`blockedReasonCodes: ${profile.readiness.blockedReasonCodes.join(',')}`);
  console.log(`nextAction: ${profile.readiness.nextAction}`);
}

main(process.argv.slice(2)).catch((error) => {
  console.error(`error: ${error.message}`);
  process.exitCode = 1;
});
