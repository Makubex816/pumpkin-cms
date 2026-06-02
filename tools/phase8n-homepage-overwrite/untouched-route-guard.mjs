#!/usr/bin/env node
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const routeRules = new Map([
  [
    '/contact',
    {
      route: '/contact',
      label: 'Contact page',
      acceptedStatuses: [200],
      acceptedNotFound: false,
      requirement: 'must be reachable and hashable before and after homepage-only overwrite',
    },
  ],
  [
    '/service-areas',
    {
      route: '/service-areas',
      label: 'Service areas page',
      acceptedStatuses: [200, 404],
      acceptedNotFound: true,
      notFoundState: 'expected-not-found',
      requirement: 'may be 404 because the page has not been imported; after overwrite it must remain 404 if baseline was 404',
    },
  ],
]);

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  if (args['print-rules']) {
    console.log(JSON.stringify(getRules(), null, 2));
    return;
  }

  if (args['self-test']) {
    const result = runSelfTest();
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.passed ? 0 : 1;
    return;
  }

  const beforePath = args.before;
  const afterPath = args.after;
  if (!beforePath || !afterPath) {
    printHelp();
    process.exitCode = 2;
    return;
  }

  const before = readSnapshotFile(beforePath, 'before');
  const after = readSnapshotFile(afterPath, 'after');
  const report = validateUntouchedRoutes(before, after);
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.safeForHomepageOnlyOverwrite ? 0 : 1;
}

export function getRules() {
  return Array.from(routeRules.values()).map((rule) => ({ ...rule }));
}

export function classifyRouteSnapshot(route, snapshot) {
  const rule = routeRules.get(route);
  if (!rule) {
    return {
      route,
      accepted: false,
      state: 'unsupported-route',
      blocker: 'Only /contact and /service-areas are part of this homepage-only untouched-route guard.',
    };
  }

  if (!snapshot || typeof snapshot !== 'object') {
    return {
      route,
      accepted: false,
      state: 'missing-snapshot',
      blocker: `${route} snapshot is missing.`,
    };
  }

  if (snapshot.transportError || snapshot.networkError || snapshot.errorType === 'transport') {
    return {
      route,
      accepted: false,
      state: 'transport-failure',
      blocker: `${route} had a transport/API failure.`,
    };
  }

  const status = Number(snapshot.status ?? snapshot.httpStatus);
  if (!Number.isInteger(status)) {
    return {
      route,
      accepted: false,
      state: 'missing-status',
      blocker: `${route} snapshot does not include an HTTP status.`,
    };
  }

  if (status === 404 && rule.acceptedNotFound) {
    return {
      route,
      accepted: true,
      status,
      state: rule.notFoundState,
      hash: null,
      note: `${route} 404 is accepted as the unchanged baseline for this project state.`,
    };
  }

  if (!rule.acceptedStatuses.includes(status)) {
    return {
      route,
      accepted: false,
      status,
      state: 'unexpected-status',
      blocker: `${route} returned HTTP ${status}; expected ${rule.acceptedStatuses.join(' or ')}.`,
    };
  }

  const hash = stringOrEmpty(snapshot.hash || snapshot.bodyHash || snapshot.safeHash || snapshot.contentHash);
  return {
    route,
    accepted: true,
    status,
    state: 'reachable',
    hash,
    note: hash ? `${route} reachable baseline captured with hash.` : `${route} reachable baseline captured without hash.`,
  };
}

export function compareRouteSnapshots(route, beforeSnapshot, afterSnapshot) {
  const before = classifyRouteSnapshot(route, beforeSnapshot);
  const after = classifyRouteSnapshot(route, afterSnapshot);

  if (!before.accepted) {
    return {
      route,
      unchanged: false,
      before,
      after,
      blocker: before.blocker,
    };
  }

  if (!after.accepted) {
    return {
      route,
      unchanged: false,
      before,
      after,
      blocker: after.blocker,
    };
  }

  if (before.state === 'expected-not-found') {
    const unchanged = after.state === 'expected-not-found' && after.status === 404;
    return {
      route,
      unchanged,
      before,
      after,
      blocker: unchanged ? null : `${route} baseline was expected-not-found but after state changed.`,
    };
  }

  const statusUnchanged = before.status === after.status;
  const beforeHash = stringOrEmpty(before.hash);
  const afterHash = stringOrEmpty(after.hash);
  const hashComparable = Boolean(beforeHash && afterHash);
  const hashUnchanged = hashComparable ? beforeHash === afterHash : true;
  const unchanged = statusUnchanged && hashUnchanged;

  return {
    route,
    unchanged,
    before,
    after,
    hashComparable,
    blocker: unchanged ? null : `${route} status or hash changed after homepage-only overwrite.`,
  };
}

export function validateUntouchedRoutes(beforeInput, afterInput) {
  const routes = ['/contact', '/service-areas'];
  const before = normalizeSnapshots(beforeInput);
  const after = normalizeSnapshots(afterInput);
  const comparisons = routes.map((route) => compareRouteSnapshots(route, before.get(route), after.get(route)));
  const blockers = comparisons.filter((item) => !item.unchanged).map((item) => item.blocker);

  return {
    schemaVersion: 'pumpkin-phase8n-homepage-untouched-route-guard.v1',
    scope: 'ice-homepage-only-local-draft-overwrite',
    nonMutating: true,
    requiresAdminJwt: false,
    serviceAreas404Policy: 'accepted-as-expected-not-found-baseline',
    rules: getRules(),
    comparisons,
    blockers,
    safeForHomepageOnlyOverwrite: blockers.length === 0,
  };
}

function normalizeSnapshots(input) {
  const rows = Array.isArray(input) ? input : input.routes || input.snapshots || [];
  const map = new Map();
  for (const item of rows) {
    const route = item.route || item.path || item.slugRoute;
    if (route) map.set(route, item);
  }
  return map;
}

function readSnapshotFile(filePath, label) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Unable to read ${label} snapshot JSON: ${error.message}`);
  }
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (item === '--help' || item === '-h') {
      args.help = true;
      continue;
    }
    if (!item.startsWith('--')) {
      throw new Error(`Unexpected argument: ${item}`);
    }
    const key = item.slice(2);
    const next = argv[index + 1];
    if (key === 'self-test' || key === 'print-rules') {
      args[key] = true;
      continue;
    }
    if (!next || next.startsWith('--')) {
      throw new Error(`Missing value for ${item}`);
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

function printHelp() {
  console.log(`Usage:
node tools/phase8n-homepage-overwrite/untouched-route-guard.mjs --print-rules
node tools/phase8n-homepage-overwrite/untouched-route-guard.mjs --self-test
node tools/phase8n-homepage-overwrite/untouched-route-guard.mjs --before before-routes.json --after after-routes.json

Snapshot JSON may be an array or an object with a routes array. Each route row should include route and status/httpStatus.
/contact must be HTTP 200. /service-areas may be HTTP 200 or HTTP 404. A /service-areas 404 baseline must remain 404 after the homepage-only overwrite.`);
}

function runSelfTest() {
  const before = {
    routes: [
      { route: '/contact', status: 200, hash: 'contact-hash' },
      { route: '/service-areas', status: 404 },
    ],
  };
  const after = {
    routes: [
      { route: '/contact', status: 200, hash: 'contact-hash' },
      { route: '/service-areas', status: 404 },
    ],
  };
  const report = validateUntouchedRoutes(before, after);
  return {
    name: 'accept-service-areas-404-as-unchanged-baseline',
    passed: report.safeForHomepageOnlyOverwrite,
    report,
  };
}

function stringOrEmpty(value) {
  return typeof value === 'string' ? value.trim() : '';
}
