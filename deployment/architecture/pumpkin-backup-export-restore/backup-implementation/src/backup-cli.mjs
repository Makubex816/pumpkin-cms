#!/usr/bin/env node
import { createStandardBackup } from './standard-backup-runner.mjs';
import { createRestorePlan } from './restore/restore-plan-runner.mjs';
import { validateBackupBundle, writeValidationReports } from './validators/backup-validator.mjs';
import { readJson } from './utils/json-writer.mjs';
import { resolveTmpBundlePath } from './utils/safe-paths.mjs';
import path from 'node:path';

const version = '0.3.0';

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
      overwrite: Boolean(options.overwrite)
    });
    console.log(`created: ${path.relative(process.cwd(), result.bundleRoot)}`);
    console.log(`validation: ${result.validation.status}`);
    return;
  }
  if (command === 'validate') {
    const bundleRoot = resolveTmpBundlePath(requiredOption(options, 'bundle'));
    const validation = await validateBackupBundle({ bundlePath: bundleRoot });
    await writeValidationReports({ bundleRoot, validation });
    console.log(`validation: ${validation.status}`);
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
    const value = args[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`missing value for --${key}`);
    }
    options[key] = value;
    index += 1;
  }
  return options;
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
  create-standard --scope tenant|platform --answers <fixture.json> --out .tmp/<bundle> [--overwrite]
  validate --bundle .tmp/<bundle>
  restore-plan --bundle .tmp/<bundle> --out .tmp/<restore-plan> [--expected-counts fixtures/restore-expected-counts.json] [--overwrite]
  inspect --bundle .tmp/<bundle>

Boundary:
  Local-only. Folder bundles and restore-plan dry-runs under .tmp only. No zips, no secrets, no escrow payloads, no real restore, no CMS/API calls.
`);
}

main(process.argv.slice(2)).catch((error) => {
  console.error(`error: ${error.message}`);
  process.exitCode = 1;
});
