import fs from 'node:fs/promises';
import path from 'node:path';
import { writeBackupManifest } from './backup-manifest-writer.mjs';
import { writeChecksums } from './checksum-writer.mjs';
import { writeFakeCmsContent } from './adapters/fake-cms-content-adapter.mjs';
import { writeFakeDatabasePlan } from './adapters/fake-database-adapter.mjs';
import { writeFakeMediaInventory } from './adapters/fake-media-inventory-adapter.mjs';
import { writeFakeStaticEvidence } from './adapters/fake-static-evidence-adapter.mjs';
import { writeFakeConfigInventory } from './adapters/fake-config-inventory-adapter.mjs';
import { writeTenantWebsiteBundleIndex } from './bundles/tenant-website-bundle-writer.mjs';
import { writeFakeCosmosExport } from './connectors/cosmos/cosmos-export-runner.mjs';
import { writeFakeMediaCopy } from './connectors/media/media-copy-runner.mjs';

export async function writeStandardBundle({ bundleRoot, request, createdAt, connectors = {} }) {
  await fs.mkdir(bundleRoot, { recursive: true });
  const fileEntries = [];
  const connectorOptions = normalizeConnectorOptions(connectors);
  const connectorResults = {};

  fileEntries.push(...(await writeTopLevelDocs({ bundleRoot, request, createdAt, connectorOptions })));
  fileEntries.push(...(await writeFakeDatabasePlan({ bundleRoot, request, createdAt })));
  fileEntries.push(...(await writeFakeCmsContent({ bundleRoot, request })));
  fileEntries.push(...(await writeFakeMediaInventory({ bundleRoot, request, fakeMediaCopy: connectorOptions.fakeMediaCopy })));
  fileEntries.push(...(await writeFakeStaticEvidence({ bundleRoot, request })));
  fileEntries.push(...(await writeFakeConfigInventory({ bundleRoot, request })));
  if (connectorOptions.fakeCosmos) {
    connectorResults.cosmos = await writeFakeCosmosExport({ bundleRoot, request, createdAt });
    fileEntries.push(...connectorResults.cosmos.entries);
  }
  if (connectorOptions.fakeMediaCopy) {
    connectorResults.media = await writeFakeMediaCopy({ bundleRoot, request, createdAt });
    fileEntries.push(...connectorResults.media.entries);
  }
  if (connectorOptions.tenantWebsiteBundle) {
    connectorResults.tenantWebsiteBundle = await writeTenantWebsiteBundleIndex({
      bundleRoot,
      request,
      createdAt,
      connectorResults
    });
    fileEntries.push(...connectorResults.tenantWebsiteBundle.entries);
  }
  fileEntries.push(...(await writeEscrowMarker({ bundleRoot })));

  const manifest = await writeBackupManifest({
    bundleRoot,
    request,
    fileEntries,
    createdAt,
    connectorOptions,
    connectorResults
  });
  const checksums = await writeChecksums(bundleRoot);
  return { manifest, checksums, fileEntries, connectorResults };
}

function normalizeConnectorOptions(connectors) {
  return {
    fakeCosmos: connectors.fakeCosmos === true,
    fakeMediaCopy: connectors.fakeMediaCopy === true,
    tenantWebsiteBundle: connectors.tenantWebsiteBundle === true
  };
}

async function writeTopLevelDocs({ bundleRoot, request, createdAt, connectorOptions }) {
  await fs.writeFile(
    path.join(bundleRoot, 'BACKUP_SUMMARY.md'),
    [
      '# Backup Summary',
      '',
      `Mode: standard`,
      `Scope: ${request.scope.scopeType}`,
      `Tenant: ${request.scope.tenantKey ?? 'platform'}`,
      `Created: ${createdAt}`,
      `Created by: local-prototype`,
      '',
      'This is a local-only fake-fixture prototype bundle.',
      '',
      '## Connector Foundation',
      '',
      `- Fake Cosmos portable JSON export: ${connectorOptions.fakeCosmos ? 'included' : 'not included'}`,
      `- Fake media blob copy: ${connectorOptions.fakeMediaCopy ? 'included' : 'not included'}`,
      `- Tenant website bundle index: ${connectorOptions.tenantWebsiteBundle ? 'included' : 'not included'}`,
      '',
      '- No production backup zip was created.',
      '- No real database export was run.',
      '- No real CMS/API export was run.',
      '- No real Cosmos export was run.',
      '- No real media blob download was run.',
      '- No real secret export occurred.',
      '- No encrypted escrow payload is included.',
      '- No restore was performed.',
      ''
    ].join('\n'),
    'utf8'
  );
  await fs.writeFile(
    path.join(bundleRoot, 'RESTORE_INSTRUCTIONS.md'),
    [
      '# Restore Instructions',
      '',
      'This prototype does not restore data.',
      '',
      'Future restore validation must:',
      '',
      '1. Validate `manifest.json`.',
      '2. Verify `checksums.sha256`.',
      '3. Confirm standard backups include `escrow/ESCROW_NOT_INCLUDED.md`.',
      '4. Generate a local/sandbox restore plan.',
      '5. Stop before production restore unless a later approval gate allows it.',
      '',
      'No escrow restore is available from this standard backup.',
      ''
    ].join('\n'),
    'utf8'
  );
  return [
    { path: 'BACKUP_SUMMARY.md', kind: 'summary', required: true, sensitivity: 'redacted', schemaRef: null },
    { path: 'RESTORE_INSTRUCTIONS.md', kind: 'restore-instructions', required: true, sensitivity: 'redacted', schemaRef: null }
  ];
}

async function writeEscrowMarker({ bundleRoot }) {
  const escrowDir = path.join(bundleRoot, 'escrow');
  await fs.mkdir(escrowDir, { recursive: true });
  await fs.writeFile(
    path.join(escrowDir, 'ESCROW_NOT_INCLUDED.md'),
    [
      '# Escrow Not Included',
      '',
      'This is a standard backup bundle.',
      '',
      '- No secret escrow payload was created.',
      '- No encrypted secrets file is included.',
      '- Secret escrow remains a separate future approval path.',
      ''
    ].join('\n'),
    'utf8'
  );
  return [
    { path: 'escrow/ESCROW_NOT_INCLUDED.md', kind: 'escrow-marker', required: true, sensitivity: 'redacted', schemaRef: null }
  ];
}
