import { readJson } from '../../utils/json-writer.mjs';
import { resolveFixturePath } from '../../utils/safe-paths.mjs';

const fixturePaths = {
  account: 'fixtures/fake-cosmos-account.json',
  database: 'fixtures/fake-cosmos-database.json',
  containers: 'fixtures/fake-cosmos-containers.json',
  documents: 'fixtures/fake-cosmos-documents.ice.json',
  platformEvidence: 'fixtures/fake-cosmos-platform-backup-evidence.json'
};

export async function loadFakeCosmosExportFixtures() {
  return {
    account: await readJson(resolveFixturePath(fixturePaths.account)),
    database: await readJson(resolveFixturePath(fixturePaths.database)),
    containers: await readJson(resolveFixturePath(fixturePaths.containers)),
    documents: await readJson(resolveFixturePath(fixturePaths.documents)),
    platformEvidence: await readJson(resolveFixturePath(fixturePaths.platformEvidence))
  };
}

export function selectFakeCosmosCollections({ documents, scope }) {
  const collections = documents.logicalCollections ?? {};
  return Object.fromEntries(
    Object.entries(collections).map(([name, records]) => [
      name,
      Array.isArray(records) ? records.filter((record) => recordInScope({ record, scope })) : []
    ])
  );
}

function recordInScope({ record, scope }) {
  if (scope.scopeType !== 'tenant') return true;
  if (!record || typeof record !== 'object') return false;
  return record.tenantKey === scope.tenantKey || record.siteKey === scope.siteKey;
}
