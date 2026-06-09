import fs from 'node:fs/promises';
import path from 'node:path';
import { writeJson } from '../../utils/json-writer.mjs';

export async function writeFakeCosmosPlatformEvidence({ bundleRoot, evidence, scope, createdAt }) {
  const outputDir = path.join(bundleRoot, 'database', 'platform-evidence', 'cosmos');
  await fs.mkdir(outputDir, { recursive: true });

  const payload = {
    schemaVersion: '0.2.0',
    connectorContractVersion: '0.1.0',
    provider: 'cosmos',
    mode: 'fake-platform-evidence',
    generatedAt: createdAt,
    fakeOnly: true,
    liveCosmosDiscoveryPerformed: false,
    liveCosmosExportPerformed: false,
    azureMutationPerformed: false,
    protectedConfigRead: false,
    scope,
    evidence
  };

  await writeJson(path.join(outputDir, 'cosmos-platform-backup-evidence.json'), payload);
  await fs.writeFile(
    path.join(outputDir, 'COSMOS_PLATFORM_BACKUP_EVIDENCE.md'),
    [
      '# Cosmos Platform Backup Evidence',
      '',
      'This is fake platform backup evidence for the local connector foundation.',
      '',
      '- No live Cosmos account was queried.',
      '- No Azure command was run.',
      '- No Cosmos export was performed.',
      '- No protected config or credential source was read.',
      '',
      `Provider: ${payload.provider}`,
      `Mode: ${payload.mode}`,
      `Generated: ${createdAt}`,
      ''
    ].join('\n'),
    'utf8'
  );

  return [
    entry('database/platform-evidence/cosmos/cosmos-platform-backup-evidence.json'),
    entry('database/platform-evidence/cosmos/COSMOS_PLATFORM_BACKUP_EVIDENCE.md')
  ];
}

function entry(pathValue) {
  return {
    path: pathValue,
    kind: 'cosmos-platform-evidence',
    required: true,
    sensitivity: 'redacted',
    schemaRef: null
  };
}
