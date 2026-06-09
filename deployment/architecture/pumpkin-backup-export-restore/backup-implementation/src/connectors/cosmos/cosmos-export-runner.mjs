import fs from 'node:fs/promises';
import path from 'node:path';
import { sha256File } from '../../utils/file-hash.mjs';
import { writeJson } from '../../utils/json-writer.mjs';
import { loadFakeCosmosExportFixtures, selectFakeCosmosCollections } from './fake-cosmos-export-adapter.mjs';
import {
  buildCosmosCollectionEnvelope,
  buildCosmosExportManifest,
  fileNameForLogicalCollection
} from './cosmos-export-manifest.mjs';
import { writeFakeCosmosPlatformEvidence } from './cosmos-platform-evidence-writer.mjs';

export async function writeFakeCosmosExport({ bundleRoot, request, createdAt }) {
  const fixtures = await loadFakeCosmosExportFixtures();
  const outputDir = path.join(bundleRoot, 'database', 'cosmos-json');
  const containersDir = path.join(outputDir, 'containers');
  await fs.mkdir(containersDir, { recursive: true });

  const selectedCollections = selectFakeCosmosCollections({
    documents: fixtures.documents,
    scope: request.scope
  });
  const entries = [];
  const recordSets = [];

  for (const [name, records] of Object.entries(selectedCollections)) {
    const fileName = fileNameForLogicalCollection(name);
    const relativePath = `database/cosmos-json/containers/${fileName}`;
    await writeJson(
      path.join(containersDir, fileName),
      buildCosmosCollectionEnvelope({ name, records, scope: request.scope, createdAt })
    );
    entries.push(entry(relativePath, 'cosmos-export'));
    recordSets.push({
      logicalCollection: name,
      path: relativePath,
      recordCount: records.length
    });
  }

  const exportManifest = buildCosmosExportManifest({
    scope: request.scope,
    account: fixtures.account,
    database: fixtures.database,
    containers: fixtures.containers,
    recordSets,
    createdAt
  });
  await writeJson(path.join(outputDir, 'export-manifest.json'), exportManifest);
  entries.push(entry('database/cosmos-json/export-manifest.json', 'cosmos-export'));

  await writeConnectorChecksums({
    bundleRoot,
    outputFile: path.join(outputDir, 'checksums.sha256'),
    relativePaths: [
      'database/cosmos-json/export-manifest.json',
      ...recordSets.map((set) => set.path)
    ]
  });
  entries.push(entry('database/cosmos-json/checksums.sha256', 'cosmos-export'));

  const evidenceEntries = await writeFakeCosmosPlatformEvidence({
    bundleRoot,
    evidence: fixtures.platformEvidence,
    scope: request.scope,
    createdAt
  });
  entries.push(...evidenceEntries);

  return {
    entries,
    component: {
      provider: 'cosmos',
      mode: 'portable-json',
      status: 'complete',
      fakeOnly: true,
      liveCosmosExportPerformed: false,
      platformEvidencePath: 'database/platform-evidence/cosmos/cosmos-platform-backup-evidence.json',
      exportManifestPath: 'database/cosmos-json/export-manifest.json',
      recordSetCount: recordSets.length,
      recordCount: exportManifest.totalRecordCount
    },
    exportManifest
  };
}

async function writeConnectorChecksums({ bundleRoot, outputFile, relativePaths }) {
  const lines = [];
  for (const relativePath of relativePaths.sort((a, b) => a.localeCompare(b))) {
    lines.push(`${await sha256File(path.join(bundleRoot, relativePath))}  ${relativePath}`);
  }
  await fs.writeFile(outputFile, `${lines.join('\n')}\n`, 'utf8');
}

function entry(pathValue, kind) {
  return {
    path: pathValue,
    kind,
    required: true,
    sensitivity: 'redacted',
    schemaRef: null
  };
}
