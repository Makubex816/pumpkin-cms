# Media Hosting Inventory

Live media host:

- Storage account: `iceskatingmedia`.
- Resource group: `rg-ice-production-media`.
- Region: East US.
- Account kind: StorageV2.
- SKU: Standard_LRS.
- Blob public access allowed at account level: true.
- Container: `ice-rink-rentals-media`.
- Container public access: blob.
- Public base URL: `https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media`.
- Live prefix: `ice-rink-rentals/assets/`.

Read-only blob inventory:

- Blob listing using Azure login/RBAC succeeded.
- 9 PNG blobs found under `ice-rink-rentals/assets/`.
- Blob type: BlockBlob.
- Source media map: `apps/ice-rink-web/src/data/ice-rink-media.ts`.

Retention/backup posture:

- Storage redundancy: Standard_LRS.
- Blob soft delete: disabled.
- Container soft delete: not configured.
- Versioning: not enabled.
- Change feed: not configured.
- Point-in-time restore: not configured.

Conclusion:

Media is live in Azure Blob Storage, but storage durability/restore posture should be hardened before treating it as complete operational backup coverage.
