#!/usr/bin/env node
import path from 'node:path';
import { runScan } from './scan-runs/scan-run-writer.mjs';
import { validateScanOutput } from './validators/outbound-link-validator.mjs';
import { readJson } from './utils/json-writer.mjs';
import { resolveTmpScanPath, toPackageRelative } from './utils/safe-paths.mjs';

const version = '0.1.0';

async function main() {
  const [command, ...args] = process.argv.slice(2);
  try {
    switch (command ?? 'help') {
      case 'help':
        printHelp();
        break;
      case 'version':
        console.log(version);
        break;
      case 'scan':
        await scanCommand(args);
        break;
      case 'validate':
        await validateCommand(args);
        break;
      case 'inspect':
        await inspectCommand(args);
        break;
      default:
        throw new Error(`unknown command: ${command}`);
    }
  } catch (error) {
    console.error(`error: ${error.message}`);
    process.exitCode = 1;
  }
}

function parseArgs(args) {
  const parsed = { _: [] };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('--')) {
      parsed._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (key === 'overwrite') {
      parsed[key] = true;
      continue;
    }
    parsed[key] = args[index + 1];
    index += 1;
  }
  return parsed;
}

async function scanCommand(args) {
  const options = parseArgs(args);
  const result = await runScan({
    fixturePath: required(options.fixture, '--fixture is required'),
    outputPath: required(options.out, '--out is required'),
    overwrite: options.overwrite === true
  });
  const validation = await validateScanOutput({ scanPath: options.out });
  console.log(`scan: ${validation.status}`);
  console.log(`output: ${toPackageRelative(result.outputRoot)}`);
  console.log(`links: ${result.scanResult.summary.outboundLinkCount}`);
  console.log(`instances: ${result.scanResult.summary.instanceCount}`);
  console.log(`ignored: ${result.scanResult.summary.ignoredLinkCount}`);
}

async function validateCommand(args) {
  const options = parseArgs(args);
  const validation = await validateScanOutput({ scanPath: required(options.scan, '--scan is required') });
  console.log(`validation: ${validation.status}`);
  console.log(`links: ${validation.summary.linkCount}`);
  console.log(`instances: ${validation.summary.instanceCount}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function inspectCommand(args) {
  const options = parseArgs(args);
  const scanRoot = resolveTmpScanPath(required(options.scan, '--scan is required'));
  const links = await readJson(path.join(scanRoot, 'outbound-links.json'));
  const instances = await readJson(path.join(scanRoot, 'outbound-link-instances.json'));
  const scanRun = await readJson(path.join(scanRoot, 'outbound-link-scan-run.json'));
  console.log(`scan: ${toPackageRelative(scanRoot)}`);
  console.log(`tenant: ${scanRun.tenant_id}`);
  console.log(`site: ${scanRun.site_id}`);
  console.log(`status: ${scanRun.status}`);
  console.log(`links: ${(links.outbound_links ?? []).length}`);
  console.log(`instances: ${(instances.outbound_link_instances ?? []).length}`);
  console.log(`staleInstances: ${scanRun.stale_instances_found}`);
}

function required(value, message) {
  if (!value) {
    throw new Error(message);
  }
  return value;
}

function printHelp() {
  console.log(`Pumpkin Outbound Link Manager local scanner ${version}

Commands:
  help
  version
  scan --fixture fixtures/single-link.fixture.json --out .tmp/single-link-scan [--overwrite]
  validate --scan .tmp/single-link-scan
  inspect --scan .tmp/single-link-scan

Boundary:
  Local fixture JSON only. No external HTTP crawling, CMS/API calls, CMS writes, protected config reads, deployment, indexing, or live-page publication.
`);
}

await main();
