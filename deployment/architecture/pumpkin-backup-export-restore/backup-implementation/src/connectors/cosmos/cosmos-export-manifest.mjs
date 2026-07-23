export const cosmosConnectorContractVersion = '0.1.0';

const logicalCollectionFileNames = {
  tenants: 'tenants.json',
  sites: 'sites.json',
  pages: 'pages.json',
  routes: 'routes.json',
  forms: 'forms.json',
  formEntries: 'form-entries.json',
  publicPublications: 'public-publications.json',
  mediaAssets: 'media-assets.json',
  themes: 'themes.json',
  publishRuns: 'publish-runs.json',
  importRuns: 'import-runs.json'
};

const restoreContracts = {
  formEntries: Object.freeze({
    kind: 'pumpkin.form-entries',
    version: '2.0.0',
    validator: 'lib/form-entry-restore-contract.mjs',
    sourceContainer: 'FormEntry',
    sourcePartitionPath: '/tenantId',
    publicContextFields: Object.freeze([
      'tenantUid',
      'publicationId',
      'releaseId',
      'formMappingId',
      'fieldContractVersion',
      'publicIdempotencyIdentity',
      'publicPayloadDigest'
    ]),
    publicIdentitySha256Required: true,
    publicPayloadDigestSha256Required: true,
    idempotencyKeyMatchesSubmissionId: true,
    storageIdDerivation: "sha256(tenantUid+'\\n'+submissionId)",
    legacyRecordsSupported: true,
    publicIdempotencyIdentityUnique: true,
    conflictingPublicPayloadDigestRejected: true,
    ticketMaterialIncluded: false,
    signingMaterialIncluded: false
  }),
  publicPublications: Object.freeze({
    kind: 'pumpkin.public-publications',
    version: '1.0.0',
    validator: 'lib/public-publication-restore-contract.mjs',
    sourceContainer: 'PublicPublication',
    sourcePartitionPath: '/id',
    idMatchesPublicationId: true,
    globalPublicationIdUnique: true,
    tenantIdentityFields: Object.freeze(['tenantId', 'tenantUid']),
    httpsOriginsOnly: true,
    allowedHostnamesDerivedFromOrigins: true,
    activePublicTicketMappingsRequired: true,
    activeOnRestore: false,
    restoreState: 'held_pending_revalidation',
    revalidationRequired: true,
    ticketKeyRebindingRequired: true,
    ticketMaterialIncluded: false,
    signingMaterialIncluded: false
  })
};

export function fileNameForLogicalCollection(name) {
  return logicalCollectionFileNames[name] ?? `${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}.json`;
}

export function restoreContractForLogicalCollection(name) {
  const contract = restoreContracts[name];
  return contract ? { ...contract } : null;
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
  const restoreContract = restoreContractForLogicalCollection(name);
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
    records,
    ...(restoreContract ? { restoreContract } : {})
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
  const applicableRestoreContracts = recordSets
    .map((recordSet) => ({
      logicalCollection: recordSet.logicalCollection,
      contract: restoreContractForLogicalCollection(recordSet.logicalCollection)
    }))
    .filter((entry) => entry.contract !== null);
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
    totalRecordCount: recordSets.reduce((sum, set) => sum + set.recordCount, 0),
    ...(applicableRestoreContracts.length > 0 ? { restoreContracts: applicableRestoreContracts } : {})
  };
}
