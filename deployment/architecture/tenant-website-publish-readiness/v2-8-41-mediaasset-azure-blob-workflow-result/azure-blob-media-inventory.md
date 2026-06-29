# Azure Blob Media Inventory

Inventory method: Azure CLI storage data-plane calls with login-based auth.

No storage account keys, delegated signed URLs, connection strings, or storage key-listing were used.

Observed target:

- Account: `iceskatingmedia`.
- Container: `ice-rink-rentals-media`.
- Container public access: `blob`.
- Tenant prefix: `ice-rink-rentals/assets/`.
- Proof prefix: `ice-rink-rentals/assets/__pumpkin-proof/v2-8-41/`.

Post-cleanup inventory:

- Tenant-prefix blob count after cleanup: `1`.
- V2.8.41 proof-prefix blob count after cleanup: `0`.

The remaining tenant-prefix blob was not modified by V2.8.41.
