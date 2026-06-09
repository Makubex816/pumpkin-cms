import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson } from '../../utils/json-writer.mjs';
import { resolveFixturePath } from '../../utils/safe-paths.mjs';

const fixturePaths = {
  inventory: 'fixtures/fake-media-blob-inventory.ice.json',
  copyPlan: 'fixtures/fake-media-blob-copy-plan.ice.json'
};

export async function loadFakeMediaCopyFixtures() {
  return {
    inventory: await readJson(resolveFixturePath(fixturePaths.inventory)),
    copyPlan: await readJson(resolveFixturePath(fixturePaths.copyPlan))
  };
}

export async function readFakeMediaSourceText(sourceFixturePath) {
  const resolved = resolveFixturePath(sourceFixturePath);
  return fs.readFile(resolved, 'utf8');
}

export function selectFakeMediaAssets({ inventory, copyPlan, scope }) {
  const assets = (inventory.assets ?? []).filter((asset) => {
    if (scope.scopeType !== 'tenant') return true;
    return asset.tenantKey === scope.tenantKey || asset.siteKey === scope.siteKey;
  });
  const planItems = (copyPlan.copyItems ?? []).filter((item) => assets.some((asset) => asset.mediaAssetId === item.mediaAssetId));
  return { assets, planItems };
}

export function resolveSafeBlobDestination({ bundleRoot, blobName }) {
  if (!isSafeBlobName(blobName)) {
    throw new Error(`unsafe fake blob name: ${blobName}`);
  }
  return path.join(bundleRoot, 'media', 'blobs', ...blobName.split('/'));
}

function isSafeBlobName(value) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    !value.includes('\\') &&
    !value.startsWith('/') &&
    !value.includes(':') &&
    path.posix.normalize(value) === value &&
    !value.split('/').some((part) => part === '' || part === '.' || part === '..')
  );
}
