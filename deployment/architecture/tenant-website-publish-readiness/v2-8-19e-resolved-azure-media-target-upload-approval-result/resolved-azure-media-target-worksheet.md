# Resolved Azure Media Target Worksheet

This worksheet records the final no-write target metadata for a later explicitly approved upload/readback phase.

## Target

| Field | Value | Verification |
| --- | --- | --- |
| Target provider | `Azure Blob Storage` | operator env and task input |
| Storage account | `iceskatingmedia` | `az storage account show` read-only |
| Resource group | `rg-ice-production-media` | `az storage account show` read-only |
| Account kind | `StorageV2` | `az storage account show` read-only |
| Location | `eastus` | `az storage account show` read-only |
| Container | `ice-rink-rentals-media` | `az storage container show --auth-mode login` |
| Container public access | `blob` | `az storage container show --auth-mode login` |
| Account allows blob public access | `true` | `az storage account show` read-only |
| Target prefix | `ice-rink-rentals/` | operator env and task input |
| Public base URL | `https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media` | task input and blob endpoint |
| Blob endpoint | `https://iceskatingmedia.blob.core.windows.net/` | `az storage account show` read-only |
| Static website endpoint | `https://iceskatingmedia.z13.web.core.windows.net/` | `az storage account show` read-only |
| Static website enabled | `false` | `az storage blob service-properties show --auth-mode login` |
| Static website endpoint usage | not usable for this packet | static website disabled |
| Auth mode | `AzureIdentityRBAC` | operator env and command boundary |
| Identity/session type | Azure CLI signed-in operator with scoped RBAC | operator env and command boundary |
| Readback method | RBAC blob properties readback plus public blob URL HEAD check after approved upload | operator env and task input |
| Content type rules | `image/png` for all current rows | staged asset verification |
| Cache-control policy | `public, max-age=31536000, immutable` | operator env and task input |
| Overwrite policy | fail-if-exists unless explicit overwrite approval is granted | operator env and task input |
| Final target confirmation | `phase-v2-8-19e-operator-confirmed-iceskatingmedia-ice-rink-rentals-media-container` | operator env and task input |

## Read-Only Azure Commands Used

```text
az storage account show --name iceskatingmedia --resource-group rg-ice-production-media
az storage container show --account-name iceskatingmedia --name ice-rink-rentals-media --auth-mode login
az storage blob service-properties show --account-name iceskatingmedia --auth-mode login
az storage blob list --account-name iceskatingmedia --container-name ice-rink-rentals-media --prefix ice-rink-rentals/ --auth-mode login
```

No key auth fallback, `keys/listKeys`, connection string generation, SAS generation, upload, container creation, static website mutation, or public access mutation was performed.
