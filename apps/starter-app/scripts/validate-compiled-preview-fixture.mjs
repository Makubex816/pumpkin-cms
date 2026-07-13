import path from 'node:path';
import { validateFixtureFile } from './lib/preview-fixture-compiler.mjs';

const args = parseArgs(process.argv.slice(2));
if (!args.fixture) throw new Error('Missing required --fixture argument.');
const fixturePath = path.resolve(args.fixture);
const result = await validateFixtureFile(
  fixturePath,
  path.resolve(args.schema || path.join(process.cwd(), 'schemas', 'preview-fixture.schema.json')),
);
if (args.tenant && result.tenantId !== args.tenant) throw new Error('Fixture tenant does not match --tenant.');
process.stdout.write(`${JSON.stringify(result)}\n`);

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
