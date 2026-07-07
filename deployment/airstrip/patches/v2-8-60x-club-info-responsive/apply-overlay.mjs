#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const markerStart = '/* V2.8.60X club info responsive repair start */';
const markerEnd = '/* V2.8.60X club info responsive repair end */';

function parseArgs(argv) {
  const args = new Map();
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      args.set(arg.slice(2), argv[i + 1]);
      i += 1;
    }
  }
  return args;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const args = parseArgs(process.argv.slice(2));
const workspaceArg = args.get('workspace');
if (!workspaceArg) {
  fail('Missing required --workspace argument.');
}

const workspace = path.resolve(workspaceArg);
const target = path.join(workspace, 'apps', 'airstrip-frontend', 'src', 'app', 'globals.css');
const here = path.dirname(fileURLToPath(import.meta.url));
const overlay = path.join(here, 'overlays', 'apps', 'airstrip-frontend', 'src', 'app', 'v2-8-60x-club-info-responsive.css');

if (!fs.existsSync(target)) {
  fail(`Target globals.css not found: ${target}`);
}
if (!fs.existsSync(overlay)) {
  fail(`Overlay CSS not found: ${overlay}`);
}

const current = fs.readFileSync(target, 'utf8');
const css = fs.readFileSync(overlay, 'utf8').trim();
const block = `${markerStart}\n${css}\n${markerEnd}`;
const markerPattern = new RegExp(`${escapeRegExp(markerStart)}[\\s\\S]*?${escapeRegExp(markerEnd)}`, 'm');

const next = markerPattern.test(current)
  ? current.replace(markerPattern, block)
  : `${current.replace(/\s*$/, '')}\n\n${block}\n`;

fs.writeFileSync(target, next, 'utf8');
console.log(JSON.stringify({ applied: true, target, overlay }));
