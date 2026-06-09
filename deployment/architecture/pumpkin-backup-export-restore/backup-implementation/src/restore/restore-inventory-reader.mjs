import fs from 'node:fs/promises';
import path from 'node:path';
import { listFilesRecursive } from '../utils/file-hash.mjs';
import { readJson } from '../utils/json-writer.mjs';
import { bundleRelativePath } from '../utils/safe-paths.mjs';

export async function readRestoreInventory({ bundleRoot }) {
  const manifest = await readJson(path.join(bundleRoot, 'manifest.json'));
  const cmsContent = await readCmsContent(bundleRoot);
  const mediaInventory = await readJson(path.join(bundleRoot, 'media', 'media-assets.json'));
  const staticEvidence = await readJson(path.join(bundleRoot, 'static', 'static-output-manifest.json'));
  const configInventory = await readJson(path.join(bundleRoot, 'config-inventory', 'env-inventory.redacted.json'));
  const escrow = await readEscrowState(bundleRoot);
  const counts = buildCounts({ cmsContent, mediaInventory, staticEvidence, configInventory });

  return {
    manifest,
    counts,
    scope: manifest.scope,
    sourceFiles: {
      manifest: 'manifest.json',
      cmsContent: 'cms-content/*.json',
      mediaInventory: 'media/media-assets.json',
      staticEvidence: 'static/static-output-manifest.json',
      configInventory: 'config-inventory/env-inventory.redacted.json',
      escrowMarker: 'escrow/ESCROW_NOT_INCLUDED.md'
    },
    configInventory: {
      valuesIncluded: configInventory.valuesIncluded,
      variableCount: countArray(configInventory.variables),
      redactedOnly: configInventory.valuesIncluded === false && (configInventory.variables ?? []).every(isRedactedVariable)
    },
    escrow
  };
}

async function readCmsContent(bundleRoot) {
  return {
    tenants: await readJson(path.join(bundleRoot, 'cms-content', 'tenants.json')),
    sites: await readJson(path.join(bundleRoot, 'cms-content', 'sites.json')),
    pages: await readJson(path.join(bundleRoot, 'cms-content', 'pages.json')),
    routes: await readJson(path.join(bundleRoot, 'cms-content', 'routes.json')),
    forms: await readJson(path.join(bundleRoot, 'cms-content', 'forms.json')),
    seo: await readJson(path.join(bundleRoot, 'cms-content', 'seo.json')),
    redirects: await readJson(path.join(bundleRoot, 'cms-content', 'redirects.json')),
    theme: await readJson(path.join(bundleRoot, 'cms-content', 'theme.json'))
  };
}

async function readEscrowState(bundleRoot) {
  const markerPath = path.join(bundleRoot, 'escrow', 'ESCROW_NOT_INCLUDED.md');
  const markerExists = await fileExists(markerPath);
  const escrowFiles = await listFilesRecursive(path.join(bundleRoot, 'escrow')).catch(() => []);
  const extraFiles = escrowFiles
    .map((filePath) => bundleRelativePath(bundleRoot, filePath))
    .filter((relativePath) => relativePath !== 'escrow/ESCROW_NOT_INCLUDED.md');
  return {
    markerExists,
    extraFileCount: extraFiles.length,
    extraFiles
  };
}

function buildCounts({ cmsContent, mediaInventory, staticEvidence, configInventory }) {
  return {
    tenants: countArray(cmsContent.tenants),
    sites: countArray(cmsContent.sites),
    pages: countArray(cmsContent.pages),
    routes: countArray(cmsContent.routes),
    forms: countArray(cmsContent.forms),
    seoEntries: countArray(cmsContent.seo),
    redirects: countArray(cmsContent.redirects),
    themeSettings: countArray(cmsContent.theme?.themes),
    mediaAssets: countArray(mediaInventory.mediaAssets),
    staticEvidenceRoutes: countArray(staticEvidence.routes),
    configVariables: countArray(configInventory.variables)
  };
}

function countArray(value) {
  return Array.isArray(value) ? value.length : 0;
}

function isRedactedVariable(variable) {
  const allowedValues = new Set(['REDACTED', 'NOT_COLLECTED', 'EXCLUDED', 'NOT_INCLUDED', 'PRESENT', 'MISSING', 'UNKNOWN', null]);
  return variable && typeof variable === 'object' && allowedValues.has(variable.value);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
