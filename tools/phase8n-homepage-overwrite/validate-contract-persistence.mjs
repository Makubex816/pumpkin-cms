#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');

const persistenceFieldNames = new Set([
  'sectionVariant',
  'variant',
  'mediaAssetId',
  'assetId',
  'publicUrl',
  'requiredMediaSlotId',
  'mediaRequirementRef',
  'usageType',
  'status',
  'alt',
  'title',
  'caption',
  'description',
  'meta',
  'businessDisplayName',
  'publicEmailDisplayPolicy',
  'selectedMailbox',
  'selectedMailboxMetadata',
  'selectedEmailProvider',
  'pumpkinAppSendStatus',
  'leadRecipientRef',
  'staticEndpointRef',
]);

const requiredPhase8nPaths = [
  '$.domainRouting.selectedMailbox',
  '$.domainRouting.publicEmailDisplayPolicy',
  '$.media.logo.mediaAssetId',
  '$.media.setupImage.mediaAssetId',
  '$.media.openGraphImage.mediaAssetId',
  '$.media.featuredImage.mediaAssetId',
  '$.media.heroImage.mediaAssetId',
  '$.media.localImage.mediaAssetId',
  '$.media.closingImage.mediaAssetId',
];

const persistencePathPrefixes = [
  '$.ContentData.ContentBlocks[',
  '$.media.',
  '$.domainRouting.',
  '$.formConfig.',
];

main();

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const candidatePath = resolveRequiredPath(args.candidate, 'candidate');
  const readbackPath = args.readback ? resolveRequiredPath(args.readback, 'readback') : '';
  const outputPath = args.output ? resolveOutputPath(args.output) : '';
  const candidate = readJson(candidatePath);
  const readback = readbackPath ? readJson(readbackPath) : null;

  const candidateFields = collectPersistenceFields(candidate);
  const missingRequired = requiredPhase8nPaths.filter((fieldPath) => !hasMeaningfulValue(getPath(candidate, fieldPath)));
  const nonTenantMediaIds = candidateFields
    .filter((item) => item.fieldName === 'mediaAssetId' && typeof item.value === 'string')
    .map((item) => item.value)
    .filter((value) => value && !value.startsWith('ice-rink-rentals-'));

  const readbackComparison = readback
    ? comparePersistenceFields(candidateFields, readback)
    : {
        status: 'skipped',
        reason: 'No --readback file was provided.',
        driftCount: 0,
        drift: [],
      };

  const ok = missingRequired.length === 0 &&
    nonTenantMediaIds.length === 0 &&
    (readbackComparison.driftCount === 0 || args['allow-readback-drift'] === 'true');

  const report = {
    schemaVersion: 'pumpkin.phase8n.contract-persistence.v1',
    generatedAt: new Date().toISOString(),
    tool: {
      path: normalizeRel(fileURLToPath(import.meta.url)),
      nonMutating: true,
      readsProtectedConfig: false,
      writesCmsData: false,
      sendsEmail: false,
      deploys: false,
    },
    candidate: {
      path: normalizeRel(candidatePath),
      persistenceFieldCount: candidateFields.length,
      requiredPhase8nMissing: missingRequired,
      nonTenantMediaAssetIds: nonTenantMediaIds,
    },
    readback: readbackPath
      ? {
          path: normalizeRel(readbackPath),
          ...readbackComparison,
        }
      : readbackComparison,
    decision: ok ? 'contract-persistence-check-passed' : 'contract-persistence-check-blocked',
  };

  if (outputPath) {
    mkdirSync(path.dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }

  console.log(JSON.stringify(report, null, 2));
  if (!ok) {
    process.exitCode = 1;
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
    if (!next || next.startsWith('--')) {
      args[key] = 'true';
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

function printHelp() {
  console.log('Usage: node tools/phase8n-homepage-overwrite/validate-contract-persistence.mjs --candidate <page.json> [--readback <page.json>] [--allow-readback-drift] [--output <report.json>]');
}

function resolveRequiredPath(value, label) {
  if (!value) throw new Error(`Missing --${label}`);
  const resolved = path.resolve(repoRoot, value);
  assertInsideRepo(resolved, label);
  if (!existsSync(resolved)) throw new Error(`${label} file not found: ${value}`);
  return resolved;
}

function resolveOutputPath(value) {
  const resolved = path.resolve(repoRoot, value);
  assertInsideRepo(resolved, 'output');
  return resolved;
}

function assertInsideRepo(resolved, label) {
  const rel = path.relative(repoRoot, resolved);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`${label} path must stay inside the repo.`);
  }
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function normalizeRel(value) {
  return path.relative(repoRoot, value).replace(/\\/g, '/');
}

function collectPersistenceFields(value, basePath = '$') {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectPersistenceFields(item, `${basePath}[${index}]`));
  }

  if (!isRecord(value)) return [];

  return Object.entries(value).flatMap(([key, child]) => {
    const childPath = `${basePath}.${key}`;
    const nested = collectPersistenceFields(child, childPath);
    if (shouldCheckPersistencePath(childPath) && persistenceFieldNames.has(key) && hasMeaningfulValue(child)) {
      return [{ path: childPath, fieldName: key, value: child }, ...nested];
    }
    return nested;
  });
}

function shouldCheckPersistencePath(fieldPath) {
  return persistencePathPrefixes.some((prefix) => fieldPath.startsWith(prefix));
}

function comparePersistenceFields(candidateFields, readback) {
  const drift = candidateFields
    .map((field) => {
      const readbackValue = getPath(readback, field.path);
      return deepEqual(field.value, readbackValue)
        ? null
        : {
            path: field.path,
            fieldName: field.fieldName,
            expected: field.value,
            actual: readbackValue === undefined ? null : readbackValue,
          };
    })
    .filter(Boolean);

  return {
    status: drift.length === 0 ? 'matched' : 'drift-detected',
    driftCount: drift.length,
    drift: drift.slice(0, 100),
  };
}

function getPath(root, fieldPath) {
  const tokens = [];
  fieldPath.replace(/^\$\./, '').split('.').forEach((part) => {
    const matches = part.match(/^([^\[]+)(?:\[(\d+)\])?$/);
    if (!matches) return;
    tokens.push(matches[1]);
    if (matches[2] !== undefined) tokens.push(Number(matches[2]));
  });

  return tokens.reduce((current, token) => {
    if (current === undefined || current === null) return undefined;
    return current[token];
  }, root);
}

function hasMeaningfulValue(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (isRecord(value)) return Object.keys(value).length > 0;
  return true;
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
