# Media Storage Readback Result

Status: passed

Read-only Azure metadata checks confirmed:

- Storage account: `iceskatingmedia`
- Resource group: `rg-ice-production-media`
- Location: `eastus`
- Kind: `StorageV2`
- SKU: `Standard_LRS`
- Minimum TLS version: `TLS1_2`
- Blob endpoint: `https://iceskatingmedia.blob.core.windows.net/`
- Container: `ice-rink-rentals-media`
- Container lease status: `unlocked`
- Container last modified: `2026-06-05T14:11:32+00:00`

The data-plane container/blob metadata checks used `--auth-mode login` or AAD/RBAC token access only.

No storage keys/listKeys, connection strings, SAS, protected config reads, or storage mutations were used.
