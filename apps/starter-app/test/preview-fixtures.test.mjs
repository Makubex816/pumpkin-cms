import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  compilePreviewFixture,
  stableStringify,
  validateFixtureFile,
} from '../scripts/lib/preview-fixture-compiler.mjs';

const root = await mkdtemp(path.join(os.tmpdir(), 'pumpkin-preview-compiler-'));
const packageRoot = path.join(root, 'package');
const backupRoot = path.join(root, 'backup');
const referenceRoot = path.join(root, 'reference');
const outputRoot = path.join(root, 'output');
const themeOutputRoot = path.join(root, 'themes');
const registryPath = path.join(root, 'registry.json');
const schemaPath = path.resolve('schemas/preview-fixture.schema.json');
const tenantId = 'fixture-tenant';
const sourceHash = 'a'.repeat(64);
const mediaHash = sha256('fixture-media');
const css = 'body{background-image:url("../image.png")}';

try {
  await writeJson(path.join(packageRoot, 'tenant-package.json'), {
    tenantId,
    displayName: 'Fixture Tenant',
    sourcePackage: { originalArchiveSha256: sourceHash },
    target: { primaryDomain: 'fixture.example.test', wwwDomain: 'www.fixture.example.test' },
    counts: {
      sourcePageRecords: 1,
      clubDetailRecords: 0,
      guideArticleRecords: 0,
      deduplicatedMediaAssets: 1,
      sourceMediaFiles: 1,
      formDefinitionCandidates: 0,
      sourceFormInstances: 0,
    },
  });
  await writeJson(path.join(packageRoot, 'fidelity', 'route-map.json'), {
    tenantId,
    routes: [{ route: '/', sourceFile: 'index.html', title: 'Fixture Home', h1: 'Fixture Home', disposition: 'preserved' }],
  });
  await writeJson(path.join(packageRoot, 'fidelity', 'link-map.json'), {
    tenantId,
    physicalOccurrences: 1,
    unresolvedTargets: 0,
    missingAnchors: 0,
    links: [{ id: '/#link-1', route: '/', href: 'index.html', kind: 'internal-relative', context: 'content', download: false, isAirstrip: false, disposition: 'preserved' }],
  });
  await writeJson(path.join(packageRoot, 'fidelity', 'control-map.json'), {
    tenantId,
    physicalOccurrences: 1,
    unmappedControls: 0,
    controls: [{ id: '/#control-1', route: '/', tag: 'a', type: '', label: 'Home', intendedAction: 'navigate_to_link_target', disposition: 'preserved', browserProofPassed: true }],
  });
  await writeJson(path.join(packageRoot, 'fidelity', 'form-instance-map.json'), {
    tenantId,
    effectiveInstances: 0,
    definitions: 0,
    instances: [],
  });
  await writeJson(path.join(packageRoot, 'fidelity', 'source-behavior-map.json'), { tenantId, behaviors: [] });
  await writeJson(path.join(packageRoot, 'fidelity', 'owner-approved-changes.json'), { tenantId, changes: [] });
  await writeJson(path.join(packageRoot, 'fidelity', 'package-fidelity-status.json'), {
    tenantId,
    status: 'passed_full_parity',
    blockedItems: 0,
    unclassifiedSourceElements: 0,
    unresolvedInternalLinks: 0,
    missingRequiredMedia: 0,
    unmappedVisibleControls: 0,
    silentGenericFallbacks: 0,
    validatorErrors: 0,
    validatorWarnings: 0,
  });
  await writeJson(path.join(packageRoot, 'media', 'source-path-alias-map.json'), {
    tenantId,
    aliases: [{ sourcePath: 'assets/image.png', sourceSha256: mediaHash, canonicalSha256: mediaHash, disposition: 'preserved' }],
  });
  await writeJson(path.join(packageRoot, 'form-definitions', 'candidates.json'), {
    tenantId,
    physicalSourceFormCount: 0,
    candidateCount: 0,
    candidates: [],
  });

  await writeJson(path.join(backupRoot, 'backup-manifest.json'), {
    tenantId,
    credentialPolicy: {
      plaintextCredentialsIncluded: false,
      runtimeKeyPlaintextIncluded: false,
    },
    database: { counts: { 'pages.json': 1 } },
  });
  await writeText(path.join(backupRoot, 'checksums.sha256'), 'synthetic fixture\n');
  await writeJson(path.join(backupRoot, 'database', 'themes.json'), [{
    tenantId,
    designSystem: {
      sourceCssProof: {
        'styles.css': { contents: css, sha256: sha256(css) },
      },
    },
  }]);
  await writeJson(path.join(backupRoot, 'database', 'page-owned-redirects.json'), []);
  await writeJson(path.join(backupRoot, 'database', 'tenant-redirects.json'), []);
  await writeJson(path.join(backupRoot, 'database', 'catalog-records.json'), []);
  await writeJson(path.join(backupRoot, 'database', 'guide-article-records.json'), []);
  await writeJson(path.join(backupRoot, 'database', 'media-assets.json'), [{
    id: 'fixture-media',
    hash: mediaHash,
    publicUrl: `https://media.example.test/${mediaHash}.png`,
    sizeBytes: 13,
  }]);
  await writeJson(path.join(backupRoot, 'database', 'source-path-aliases.json'), [{
    mediaAssetId: 'fixture-media',
    fieldPath: 'source-alias:assets/image.png',
  }]);
  await writeJson(path.join(backupRoot, 'database', 'form-definitions.json'), []);

  await writeText(path.join(referenceRoot, 'index.html'), `<!doctype html>
<html><head><title>Fixture Home</title><meta name="description" content="Fixture description"><link rel="canonical" href="https://fixture.example.test/"><link rel="stylesheet" href="assets/css/styles.css"></head>
<body class="fixture-home"><main id="main"><h1>Fixture Home</h1><a href="index.html" data-source-control-id="/#control-1">Home</a><img alt="Fixture" src="assets/image.png"></main></body></html>`);

  const first = await compilePreviewFixture({
    tenantId,
    packageRoot,
    backupRoot,
    referenceRoot,
    outputRoot,
    registryPath,
    themeOutputRoot,
    schemaPath,
    sourceArchivePath: '',
  });
  const validation = await validateFixtureFile(path.join(outputRoot, 'preview.json'), schemaPath);
  assert.equal(first.fixtureSha256, validation.fixtureSha256);
  assert.equal(first.counts.routes, 1);
  assert.equal(first.counts.canonicalMedia, 1);
  const fixture = JSON.parse(await readFile(path.join(outputRoot, 'preview.json'), 'utf8'));
  assert.match(fixture.routes.home.html, /\/preview\/fixture-tenant/);
  assert.match(fixture.routes.home.html, /https:\/\/media\.example\.test/);
  assert.equal(fixture.routes.home.html.includes('<script'), false);
  assert.equal(fixture.forms.submissionMode, 'disabled-no-post');

  const compilerSource = await readFile(path.resolve('scripts/lib/preview-fixture-compiler.mjs'), 'utf8');
  assert.equal(/strip-club-near-me-vegas|party-pros-philadelphia/i.test(compilerSource), false);
  process.stdout.write(`${JSON.stringify({ genericTenant: tenantId, fixtureSha256: first.fixtureSha256, schemaValid: true, noTenantHardcoding: true })}\n`);
} finally {
  await rm(root, { recursive: true, force: true });
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, stableStringify(value), 'utf8');
}

async function writeText(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, value, 'utf8');
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}
