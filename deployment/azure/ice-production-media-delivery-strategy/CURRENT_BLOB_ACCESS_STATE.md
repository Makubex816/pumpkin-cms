# Current Blob Access State

Date: 2026-06-05

## Start-State Repo Checks

Latest expected upload commit exists:

```text
58ebbd0 Upload approved Ice media to Azure Blob
```

Current branch:

```text
feature/admin-page-editor-import-export
```

Start-state status classification before creating this package:

- unrelated modified static-azure backlog files under `deployment/static-azure/`
- unrelated raw content-review input folders under `content-review/ice-final-contact-input/`
- unrelated raw content-review input folders under `content-review/ice-service-areas-input/`
- no generated static artifacts identified in the start-state status
- no protected config paths identified in the start-state status
- no expected media delivery strategy docs existed before this package was created

No files were staged.

## Uploaded Media State

Source documents reviewed:

- `PUMPKIN_ICE_PRODUCTION_MEDIA_UPLOAD_RESULT_REPORT.md`
- `deployment/azure/ice-production-media-upload-result/`
- `deployment/azure/ice-production-media-setup-preflight/TARGET_CDN_URL_MAP.md`
- `deployment/azure/ice-production-readiness-master-plan/MEDIA_GATE.md`
- `deployment/azure/ice-production-readiness-master-plan/CLOUDFLARE_DNS_GATE.md`
- `deployment/azure/ice-production-readiness-master-plan/CMS_AND_MEDIAASSET_UPDATE_GATE.md`

Current uploaded media state:

```text
expected blobs: 9
present blobs: 9
unexpected blobs: 0
missing blobs: 0
```

## Azure Read-Only Checks

Active subscription:

```text
subscriptionName: Azure subscription 1
subscriptionId: ff887def-fd83-4a19-9298-13d4b1687873
tenantId: 38b16667-a82c-4ff8-98d8-aeebbec4536a
state: Enabled
isDefault: true
```

Storage account:

```text
name: iceskatingmedia
resourceGroup: rg-ice-production-media
location: eastus
provisioningState: Succeeded
kind: StorageV2
sku: Standard_LRS
allowBlobPublicAccess: false
enableHttpsTrafficOnly: true
minimumTlsVersion: TLS1_2
publicNetworkAccess: Enabled
customDomain: null
blob endpoint: https://iceskatingmedia.blob.core.windows.net/
web endpoint: https://iceskatingmedia.z13.web.core.windows.net/
```

Container:

```text
name: ice-rink-rentals-media
publicAccess: null
```

Blob count:

```text
9
```

DNS read-only check:

```text
Resolve-DnsName media.iceskatingrinkrentals.com returned no records in this local check.
```

## Interpretation

The uploaded Blob objects exist, but anonymous public delivery is currently disabled at both required layers:

- the storage account disallows anonymous Blob access
- the container has no public access level

The current Azure Blob origin is private to anonymous web clients. This is consistent with the public URL smoke check returning `409`.

## No-Action Confirmation

This diagnostic run did not:

- change Azure public access settings
- change Azure networking
- change Azure custom domain settings
- change Cloudflare or DNS
- write CMS records
- write MediaAsset records
- deploy
- read protected config
- print secrets, tokens, keys, connection strings, or SAS URLs
- send email
- touch Microsoft 365
- touch Roller

