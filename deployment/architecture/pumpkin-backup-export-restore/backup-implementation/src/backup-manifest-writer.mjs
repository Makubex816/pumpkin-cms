import path from 'node:path';
import { writeJson } from './utils/json-writer.mjs';

export async function writeBackupManifest({ bundleRoot, request, fileEntries, createdAt }) {
  const manifest = {
    manifestVersion: '0.1.0',
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
    schemaReferences: {
      backupManifest: '../schemas/backup-manifest.schema.json',
      note: 'Phase 2F-3 prototype manifest shape; production schema hardening continues in Phase 2F-4.'
    },
    files: fileEntries.sort((a, b) => a.path.localeCompare(b.path)),
    warnings: [
      'local prototype only',
      'fake adapters only',
      'no real database export',
      'no real CMS/API export',
      'no media blob export',
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
