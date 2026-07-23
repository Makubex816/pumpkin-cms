import path from 'node:path';
import process from 'node:process';
import { stableStringify } from './src/canonical.mjs';
import {
  prepareDeterministicAdminDeploymentTree,
} from './src/admin-deployment-tree.mjs';

const args = parseArgs(process.argv.slice(2));
const result = await prepareDeterministicAdminDeploymentTree({
  appRoot: path.resolve(args.app),
  outputRoot: path.resolve(args.out),
});
const { inventory, ...summary } = result;
void inventory;
process.stdout.write(`${stableStringify(summary)}\n`);

function parseArgs(values) {
  const output = {};
  for (let index = 0; index < values.length; index += 2) {
    const key = values[index];
    const value = values[index + 1];
    if (
      !['--app', '--out'].includes(key) ||
      value === undefined
    ) {
      throw new Error(
        'usage: --app <Admin root> --out <outside deployment tree>',
      );
    }
    output[key.slice(2)] = value;
  }
  if (!output.app || !output.out) {
    throw new Error(
      'usage: --app <Admin root> --out <outside deployment tree>',
    );
  }
  return output;
}
