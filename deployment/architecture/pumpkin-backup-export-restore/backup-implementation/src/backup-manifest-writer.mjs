import path from 'node:path';
import { writeJson } from './utils/json-writer.mjs';

export async function writeBackupManifest({
  bundleRoot,
  request,
  fileEntries,
  createdAt,
  connectorOptions = {},
  connectorResults = {}
}) {
  const componentStatus = buildComponentStatus({ connectorOptions, connectorResults });
  const manifest = {
    manifestVersion: '0.2.0',
    bundleContractVersion: '0.2.0',
    validatorContractVersion: '0.2.0',
    connectorContractVersion: '0.1.0',
    backupMode: 'standard',
    scope: request.scope,
    tenantKey: request.scope.tenantKey,
    createdAt,
    createdBy: 'local-prototype',
    requestedBy: request.requestedBy,
    source: 'fake-fixture',
    bundleFormat: 'folder',
    includesEscrow: false,
    checksumAlgorithm: 'sha256',
    contentFileCount: fileEntries.length,
    connectorFoundation: {
      fakeOnly: true,
      fakeCosmosExport: connectorOptions.fakeCosmos === true,
      fakeMediaCopy: connectorOptions.fakeMediaCopy === true,
      tenantWebsiteBundle: connectorOptions.tenantWebsiteBundle === true,
      liveCosmosExportPerformed: false,
      liveBlobDownloadPerformed: false,
      externalSystemMutation: false,
      protectedConfigRead: false,
      storageCredentialUsed: false
    },
    componentStatus,
    schemaReferences: {
      backupManifest: '../schemas/backup-manifest.schema.json',
      note: 'Phase 2F-4 local validator hardening contract; production schema hardening remains gated.'
    },
    files: fileEntries.sort((a, b) => a.path.localeCompare(b.path)),
    warnings: [
      'local prototype only',
      'fake adapters only',
      connectorOptions.fakeCosmos === true ? 'fake Cosmos portable JSON export only' : 'no real database export',
      'no real CMS/API export',
      connectorOptions.fakeMediaCopy === true ? 'fake media text fixture copy only' : 'no media blob export',
      'no static generation',
      'no secret export',
      'no encrypted escrow payload',
      'no restore execution'
    ],
    exclusions: [
      'secret values',
      'protected config files',
      'real database exports',
      'real CMS/API exports',
      'media blob downloads',
      'generated static output',
      'encrypted escrow payloads',
      'backup zip archives',
      'external system mutations'
    ]
  };

  await writeJson(path.join(bundleRoot, 'manifest.json'), manifest);
  return manifest;
}

function buildComponentStatus({ connectorOptions, connectorResults }) {
  return {
    database: connectorResults.cosmos?.component ?? {
      provider: 'placeholder',
      mode: 'blocked',
      status: 'not_included',
      fakeOnly: true,
      reason: 'baseline fake standard backup includes a database export plan only'
    },
    media: connectorResults.media?.component ?? {
      provider: 'fixture',
      mode: connectorOptions.fakeMediaCopy === true ? 'full-copy' : 'metadata-only',
      status: connectorOptions.fakeMediaCopy === true ? 'blocked' : 'partial',
      fakeOnly: true,
      reason: connectorOptions.fakeMediaCopy === true
        ? 'fake media copy was requested but no media connector result was produced'
        : 'baseline fake standard backup includes media metadata only'
    },
    tenantWebsiteBundle: connectorResults.tenantWebsiteBundle?.component ?? {
      status: connectorOptions.tenantWebsiteBundle === true ? 'blocked' : 'not-run',
      fakeOnly: true
    }
  };
}
