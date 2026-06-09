export const mediaConnectorContractVersion = '0.1.0';

export function buildMediaCopyManifest({ scope, inventory, assets, planItems, copiedItems, createdAt }) {
  return {
    schemaVersion: '0.2.0',
    connectorContractVersion: mediaConnectorContractVersion,
    provider: 'azure-blob',
    mode: 'fake-full-copy',
    generatedAt: createdAt,
    fakeOnly: true,
    liveBlobListingPerformed: false,
    liveBlobDownloadPerformed: false,
    azureMutationPerformed: false,
    protectedConfigRead: false,
    storageCredentialUsed: false,
    source: inventory.source,
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
        copyStatus: copied ? 'fake-copied' : 'not-copied',
        bundlePath: copied?.bundlePath ?? null,
        checksum: copied?.sha256 ?? null
      };
    })
  };
}
