import fs from 'node:fs/promises';
import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';

export async function writeTenantWebsiteBundleIndex({ bundleRoot, request, createdAt, connectorResults }) {
  if (request.scope.scopeType !== 'tenant') {
    return {
      entries: [],
      component: {
        status: 'excluded',
        reason: 'tenant website bundle index is only written for tenant-scoped backups'
      }
    };
  }

  const tenantKey = request.scope.tenantKey;
  const siteKey = request.scope.siteKey ?? request.scope.tenantKey;
  const outputDir = path.join(bundleRoot, 'tenants', tenantKey, 'sites', siteKey);
  await fs.mkdir(outputDir, { recursive: true });

  const manifest = {
    schemaVersion: '0.2.0',
    bundleContractVersion: '0.1.0',
    generatedAt: createdAt,
    fakeOnly: true,
    tenantKey,
    siteKey,
    layout: 'tenant-site-public-html-style-index',
    standardBackupRoot: '../../..',
    providerSource: connectorResults.providerSource?.component ?? null,
    database: connectorResults.cosmos?.component ?? null,
    media: connectorResults.media?.component ?? null,
    paths: {
      providerSource: 'database/provider-source/',
      cmsContent: 'cms-content/',
      cosmosJson: 'database/cosmos-json/',
      cosmosPlatformEvidence: 'database/platform-evidence/cosmos/',
      mediaMetadata: 'media/media-assets.json',
      mediaBlobMap: 'media/blob-map/',
      mediaBlobs: 'media/blobs/',
      restore: 'restore/'
    },
    boundaries: {
      liveRestorePerformed: false,
      externalSystemMutation: false,
      protectedConfigRead: false,
      secretExport: false
    }
  };

  await writeJson(path.join(outputDir, 'tenant-website-bundle-manifest.json'), manifest);
  await fs.writeFile(
    path.join(outputDir, 'README.md'),
    [
      '# Tenant Website Bundle Index',
      '',
      'This index maps the standard backup artifacts into a tenant/site website-bundle shape.',
      '',
      '- Cosmos JSON export artifacts remain under `database/cosmos-json/`.',
      '- Cosmos platform evidence remains under `database/platform-evidence/cosmos/`.',
      '- Media metadata and fake blob copies remain under `media/`.',
      '- This index does not copy or restore into any live system.',
      '',
      `Tenant: ${tenantKey}`,
      `Site: ${siteKey}`,
      ''
    ].join('\n'),
    'utf8'
  );

  return {
    entries: [
      entry(`tenants/${tenantKey}/sites/${siteKey}/tenant-website-bundle-manifest.json`),
      entry(`tenants/${tenantKey}/sites/${siteKey}/README.md`)
    ],
    component: {
      status: 'complete',
      fakeOnly: true,
      manifestPath: `tenants/${tenantKey}/sites/${siteKey}/tenant-website-bundle-manifest.json`
    }
  };
}

function entry(pathValue) {
  return {
    path: pathValue,
    kind: 'tenant-website-bundle',
    required: true,
    sensitivity: 'redacted',
    schemaRef: null
  };
}
