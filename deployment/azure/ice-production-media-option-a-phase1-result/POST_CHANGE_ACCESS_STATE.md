# Post-Change Access State

## Azure Readback

```text
storage account: iceskatingmedia
resource group: rg-ice-production-media
allowBlobPublicAccess: true
publicNetworkAccess: Enabled
customDomain: null
enableHttpsTrafficOnly: true
minimumTlsVersion: TLS1_2
container: ice-rink-rentals-media
container publicAccess: blob
ARM container publicAccess: Blob
blob count: 9
```

## Interpretation

Account-level anonymous Blob public access is enabled and the existing container is set to blob-level anonymous read.

Direct public Azure Blob URLs are readable for all 9 approved uploaded media files.

## Blob Inventory

Authenticated read-only list checks still show:

```text
blob count: 9
```

No unexpected blob creation or deletion was observed.
