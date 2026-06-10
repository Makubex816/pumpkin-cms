export const mediaConnectorContractVersion = '0.1.0';

export function buildMediaCopyManifest({
  scope,
  inventory,
  assets,
  planItems,
  copiedItems,
  createdAt,
  mode = 'fake-full-copy',
  fakeOnly = true,
  liveBlobListingPerformed = false,
  liveBlobDownloadPerformed = false,
  source = inventory.source,
  storage = null,
  boundaries = {},
  copyStatus = 'fake-copied'
}) {
  return {
    schemaVersion: '0.2.0',
    connectorContractVersion: mediaConnectorContractVersion,
    provider: 'azure-blob',
    mode,
    generatedAt: createdAt,
    fakeOnly,
    liveBlobListingPerformed,
    liveBlobDownloadPerformed,
    azureMutationPerformed: false,
    protectedConfigRead: false,
    storageCredentialUsed: false,
    keysListed: false,
    connectionStringsRead: false,
    sasGenerated: false,
    tokensPrinted: false,
    tokensPersisted: false,
    source,
    storage,
    boundaries: {
      azureMutationPerformed: false,
      protectedConfigRead: false,
      storageCredentialUsed: false,
      keysListed: false,
      connectionStringsRead: false,
      sasGenerated: false,
      tokensPrinted: false,
      tokensPersisted: false,
      cmsWritesPerformed: false,
      cmsRuntimeSwitchPerformed: false,
      cosmosWritesPerformed: false,
      deploymentPerformed: false,
      searchConsoleOrIndexingPerformed: false,
      livePagePublicationPerformed: false,
      ...boundaries
    },
    tenantScope: {
      scopeType: scope.scopeType,
      tenantKey: scope.tenantKey,
      siteKey: scope.siteKey
    },
    assetCount: assets.length,
    plannedCopyCount: planItems.length,
    copiedBlobCount: copiedItems.length,
    assets: assets.map((asset) => {
      const copied = copiedItems.find((item) => item.mediaAssetId === asset.mediaAssetId);
      return {
        ...asset,
        copyStatus: copied ? copyStatus : 'not-copied',
        bundlePath: copied?.bundlePath ?? null,
        checksum: copied?.sha256 ?? null,
        byteSize: copied?.byteSize ?? asset.byteSize ?? null
      };
    })
  };
}
