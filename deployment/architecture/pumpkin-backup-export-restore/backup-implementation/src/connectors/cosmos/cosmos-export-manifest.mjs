export const cosmosConnectorContractVersion = '0.1.0';

const logicalCollectionFileNames = {
  tenants: 'tenants.json',
  sites: 'sites.json',
  pages: 'pages.json',
  routes: 'routes.json',
  forms: 'forms.json',
  mediaAssets: 'media-assets.json',
  themes: 'themes.json',
  publishRuns: 'publish-runs.json',
  importRuns: 'import-runs.json'
};

export function fileNameForLogicalCollection(name) {
  return logicalCollectionFileNames[name] ?? `${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}.json`;
}

export function buildCosmosCollectionEnvelope({
  name,
  records,
  scope,
  createdAt,
  mode = 'fake-portable-json',
  fakeOnly = true,
  liveCosmosExportPerformed = false,
  source = 'fake-fixture'
}) {
  return {
    schemaVersion: '0.2.0',
    connectorContractVersion: cosmosConnectorContractVersion,
    provider: 'cosmos',
    mode,
    logicalCollection: name,
    fakeOnly,
    liveCosmosExportPerformed,
    source,
    tenantScope: {
      scopeType: scope.scopeType,
      tenantKey: scope.tenantKey,
      siteKey: scope.siteKey,
      tenantScopedExport: scope.scopeType === 'tenant'
    },
    generatedAt: createdAt,
    recordCount: records.length,
    records
  };
}

export function buildCosmosExportManifest({
  scope,
  account,
  database,
  containers,
  recordSets,
  createdAt,
  mode = 'fake-portable-json',
  fakeOnly = true,
  liveCosmosExportPerformed = false,
  source = 'fake-fixture',
  dataPlaneAccess = null,
  boundaries = {}
}) {
  return {
    schemaVersion: '0.2.0',
    connectorContractVersion: cosmosConnectorContractVersion,
    provider: 'cosmos',
    mode,
    generatedAt: createdAt,
    fakeOnly,
    liveCosmosExportPerformed,
    source,
    readOnlyDataPlaneAccess: liveCosmosExportPerformed === true,
    protectedConfigRead: false,
    storageCredentialUsed: false,
    keysListed: false,
    connectionStringsRead: false,
    sasGenerated: false,
    tokensPrinted: false,
    tokensPersisted: false,
    cosmosWritesPerformed: false,
    cmsRuntimeSwitchPerformed: false,
    cmsWritesPerformed: false,
    mediaBlobDownloadPerformed: false,
    deploymentPerformed: false,
    searchConsoleOrIndexingPerformed: false,
    livePagePublicationPerformed: false,
    dataPlaneAccess,
    boundaries: {
      protectedConfigRead: false,
      keysListed: false,
      connectionStringsRead: false,
      sasGenerated: false,
      tokensPrinted: false,
      tokensPersisted: false,
      cosmosWritesPerformed: false,
      cmsRuntimeSwitchPerformed: false,
      cmsWritesPerformed: false,
      mediaBlobDownloadPerformed: false,
      deploymentPerformed: false,
      searchConsoleOrIndexingPerformed: false,
      livePagePublicationPerformed: false,
      ...boundaries
    },
    account: {
      name: account.accountName,
      source: account.source
    },
    database: {
      name: database.databaseName,
      source: database.source
    },
    containers: containers.containers,
    tenantScope: {
      scopeType: scope.scopeType,
      tenantKey: scope.tenantKey,
      siteKey: scope.siteKey
    },
    recordSets,
    totalRecordCount: recordSets.reduce((sum, set) => sum + set.recordCount, 0)
  };
}
