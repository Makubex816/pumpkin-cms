#!/usr/bin/env node
import path from 'node:path';
import { writeCredentialReferences } from './credentials/credential-reference-writer.mjs';
import { writeRedactedRegistry, validateRegistryOutput } from './registry/redacted-registry-writer.mjs';
import { createFakeVault, createSessionVault } from './vault/vault-create-runner.mjs';
import { validateVaultOutput } from './vault/vault-validator.mjs';
import { createHandoffPackage, inspectHandoffPackage } from './handoff/handoff-package-writer.mjs';
import { validateHandoffPackage } from './handoff/handoff-validator.mjs';
import { runOperationalBindingValidation } from './operational/operational-binding-validator.mjs';

const version = '0.2.0';

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
  if (command === 'create-redacted-registry') {
    const result = await writeRedactedRegistry({
      fixturesPath: requiredOption(options, 'fixtures'),
      outputPath: requiredOption(options, 'out'),
      overwrite: Boolean(options.overwrite)
    });
    console.log(`created: ${path.relative(process.cwd(), result.outputRoot)}`);
    console.log(`validation: ${result.validation.status}`);
    return;
  }
  if (command === 'validate-registry') {
    const validation = await validateRegistryOutput({ registryPath: requiredOption(options, 'registry') });
    console.log(`registry-validation: ${validation.status}`);
    if (validation.status !== 'passed') process.exitCode = 1;
    return;
  }
  if (command === 'create-credential-references') {
    const result = await writeCredentialReferences({
      fixturePath: requiredOption(options, 'fixture'),
      outputPath: requiredOption(options, 'out'),
      overwrite: Boolean(options.overwrite)
    });
    console.log(`created: ${path.relative(process.cwd(), result.outputRoot)}`);
    console.log(`validation: ${result.validation.status}`);
    return;
  }
  if (command === 'create-fake-vault') {
    const result = await createFakeVault({
      requestPath: requiredOption(options, 'request'),
      outputPath: requiredOption(options, 'out'),
      overwrite: Boolean(options.overwrite)
    });
    console.log(`fake-vault: ${result.validation.status}`);
    console.log(`output: ${path.relative(process.cwd(), result.outputRoot)}`);
    console.log(`items: ${result.manifest.itemCount}`);
    return;
  }
  if (command === 'create-session-vault') {
    const result = await createSessionVault({
      outputPath: requiredOption(options, 'out'),
      overwrite: Boolean(options.overwrite)
    });
    console.log(`session-vault: ${result.status ?? result.validation.status}`);
    console.log(`output: ${path.relative(process.cwd(), result.outputRoot)}`);
    if (result.manifest) {
      console.log(`items: ${result.manifest.itemCount}`);
    }
    return;
  }
  if (command === 'validate-vault') {
    const validation = await validateVaultOutput({ vaultPath: requiredOption(options, 'vault') });
    console.log(`vault-validation: ${validation.status}`);
    if (validation.status !== 'passed') process.exitCode = 1;
    return;
  }
  if (command === 'create-handoff') {
    const result = await createHandoffPackage({
      registryPath: requiredOption(options, 'registry'),
      credentialReferencesPath: requiredOption(options, 'credential-references'),
      outputPath: requiredOption(options, 'out'),
      vaultPath: options.vault ?? null,
      overwrite: Boolean(options.overwrite)
    });
    console.log(`handoff: ${result.validation.status}`);
    console.log(`output: ${path.relative(process.cwd(), result.outputRoot)}`);
    console.log(`includesVault: ${result.manifest.includesVault}`);
    return;
  }
  if (command === 'validate-handoff') {
    const validation = await validateHandoffPackage({ handoffPath: requiredOption(options, 'handoff') });
    console.log(`handoff-validation: ${validation.status}`);
    if (validation.status !== 'passed') process.exitCode = 1;
    return;
  }
  if (command === 'inspect-handoff') {
    const result = await inspectHandoffPackage({ handoffPath: requiredOption(options, 'handoff') });
    console.log(`manifestType: ${result.manifest.manifestType}`);
    console.log(`includesVault: ${result.includesVault}`);
    console.log(`files: ${result.fileCount}`);
    return;
  }
  if (command === 'validate-operational-bindings') {
    const result = await runOperationalBindingValidation({
      fixturePath: requiredOption(options, 'fixture'),
      outputPath: requiredOption(options, 'out'),
      overwrite: Boolean(options.overwrite)
    });
    console.log(`operational-bindings: ${result.validation.status}`);
    console.log(`output: ${path.relative(process.cwd(), result.outputRoot)}`);
    console.log(`environmentModes: ${result.validation.summary.environmentModeCount}`);
    console.log(`providerProfiles: ${result.validation.summary.providerProfileCount}`);
    console.log(`resourceBindings: ${result.validation.summary.resourceBindingCount}`);
    console.log(`failures: ${result.validation.summary.failureCount}`);
    console.log(`warnings: ${result.validation.summary.warningCount}`);
    if (result.validation.status !== 'passed') process.exitCode = 1;
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
  console.log(`Pumpkin Resource Registry local handoff tooling ${version}

Commands:
  help
  version
  create-redacted-registry --fixtures fixtures/resource-registry.fixture.json --out .tmp/redacted-registry [--overwrite]
  validate-registry --registry .tmp/redacted-registry
  create-credential-references --fixture fixtures/credential-references.fixture.json --out .tmp/credential-references [--overwrite]
  create-fake-vault --request fixtures/fake-vault-request.fixture.json --out .tmp/fake-vault [--overwrite]
  create-session-vault --out .tmp/session-handoff-vault [--overwrite]
  validate-vault --vault .tmp/session-handoff-vault
  create-handoff --registry fixtures/resource-registry.fixture.json --credential-references fixtures/credential-references.fixture.json --out .tmp/fake-handoff [--vault .tmp/session-handoff-vault] [--overwrite]
  validate-handoff --handoff .tmp/fake-handoff
  inspect-handoff --handoff .tmp/fake-handoff
  validate-operational-bindings --fixture fixtures/operational-bindings.v2-5-1.fixture.json --out .tmp/v2-5-1-operational-bindings [--overwrite]

Boundary:
  Local/offline only. No Azure commands, CMS/API calls, deployments, protected config reads, plaintext credential files, or generated vault artifacts outside ignored .tmp output.
`);
}

main(process.argv.slice(2)).catch((error) => {
  console.error(`error: ${error.message}`);
  process.exitCode = 1;
});
