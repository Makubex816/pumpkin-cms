import path from 'node:path';
import { compilePreviewFixture } from './lib/preview-fixture-compiler.mjs';

const args = parseArgs(process.argv.slice(2));
const required = ['package', 'backup', 'reference', 'output'];
for (const name of required) {
  if (!args[name]) throw new Error(`Missing required --${name} argument.`);
}

const appRoot = process.cwd();
const tenantId = args.tenant || '';
const outputRoot = path.resolve(args.output);
const result = await compilePreviewFixture({
  tenantId,
  packageRoot: args.package,
  backupRoot: args.backup,
  referenceRoot: args.reference,
  sourceArchivePath: args['source-archive'] || '',
  outputRoot,
  registryPath: args.registry || path.join(appRoot, 'src', 'generated', 'preview-fixture-registry.json'),
  themeOutputRoot: args['theme-output'] || path.join(appRoot, 'public', 'themes', `${tenantId}-reference`),
  schemaPath: args.schema || path.join(appRoot, 'schemas', 'preview-fixture.schema.json'),
  expectedBackupManifestSha256: args['expected-backup-manifest-sha256'] || '',
  expectedBackupChecksumSha256: args['expected-backup-checksum-sha256'] || '',
});

process.stdout.write(`${JSON.stringify({
  status: 'passed',
  tenantId: result.tenantId,
  fixtureSha256: result.fixtureSha256,
  normalizedPackageSha256: result.normalizedPackageSha256,
  referencePreviewSha256: result.referencePreviewSha256,
  counts: result.counts,
})}\n`);

function parseArgs(values) {
  const output = {};
  for (let index = 0; index < values.length; index += 1) {
    const token = values[index];
    if (!token.startsWith('--')) throw new Error(`Unexpected argument: ${token}`);
    const name = token.slice(2);
    const value = values[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for --${name}.`);
    output[name] = value;
    index += 1;
  }
  return output;
}
