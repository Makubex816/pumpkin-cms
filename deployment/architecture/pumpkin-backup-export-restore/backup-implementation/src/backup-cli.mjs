#!/usr/bin/env node
import { createFakeEscrow } from './escrow/escrow-create-runner.mjs';
import { validateEscrowOutput } from './escrow/escrow-validator.mjs';
import { writeEscrowValidationReports } from './escrow/escrow-report-writer.mjs';
import { createIceStandardBackup } from './ice/ice-standard-backup-runner.mjs';
import { createStandardBackup } from './standard-backup-runner.mjs';
import { createRestorePlan } from './restore/restore-plan-runner.mjs';
import { validateBackupBundle, writeValidationReports } from './validators/backup-validator.mjs';
import { resolveProviderSourceFromFixture } from './provider/provider-resolver.mjs';
import { readJson } from './utils/json-writer.mjs';
import { resolveTmpBundlePath } from './utils/safe-paths.mjs';
import path from 'node:path';

const version = '0.7.0';

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
    console.log(`selectedTargetProvider: ${result.metadata.selectedTargetProvider ?? 'none'}`);
    console.log(`exportReadiness: ${result.readiness.exportReadiness}`);
    console.log(`liveDatabaseExportAllowed: ${result.readiness.liveDatabaseExportAllowed}`);
    if (result.validation.status !== 'passed') {
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
    providerSourceFixture: options['provider-source-fixture'] ?? null
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
  create-standard --scope tenant|platform --answers <fixture.json> --out .tmp/<bundle> [--with-fake-cosmos] [--with-fake-media-copy] [--tenant-website-bundle] [--overwrite]
  create-ice-standard --out .tmp/ice-full-standard-backup [--overwrite]
  validate --bundle .tmp/<bundle> [--mode baseline|production-restore-proof]
  restore-plan --bundle .tmp/<bundle> --out .tmp/<restore-plan> [--mode baseline|production-restore-proof] [--expected-counts fixtures/restore-expected-counts.json] [--overwrite]
  resolve-provider --fixture fixtures/provider-source.ice.missing.json [--tenant ice-rink-rentals] [--site ice-rink-rentals] [--profile fixture]
  escrow-create-fake --request fixtures/fake-escrow-request.json --out .tmp/<fake-escrow> [--overwrite]
  escrow-validate --escrow .tmp/<fake-escrow>
  escrow-inspect --escrow .tmp/<fake-escrow>
  inspect --bundle .tmp/<bundle>

Example fake complete connector bundle:
  create-standard --scope tenant --answers fixtures/ice-cosmos-media-standard-backup.answers.json --with-fake-cosmos --with-fake-media-copy --tenant-website-bundle --out .tmp/ice-cosmos-media-fake-complete --overwrite

Boundary:
  Local-only. Folder bundles, restore-plan dry-runs, fake connector output, and fake escrow test output under .tmp only. No zips, no real secrets, no production escrow payloads, no real restore, no CMS/API calls, no real Cosmos export, no real blob download.
`);
}

main(process.argv.slice(2)).catch((error) => {
  console.error(`error: ${error.message}`);
  process.exitCode = 1;
});
