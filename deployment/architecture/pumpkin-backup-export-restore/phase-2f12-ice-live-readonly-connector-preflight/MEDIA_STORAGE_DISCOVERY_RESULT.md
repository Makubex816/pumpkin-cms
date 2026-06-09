# Media Storage Discovery Result

## Storage Account

Read-only management-plane discovery confirmed:

| Field | Value |
| --- | --- |
| Storage account | `iceskatingmedia` |
| Resource group | `rg-ice-production-media` |
| Location | `eastus` |
| Kind | `StorageV2` |
| SKU | `Standard_LRS` |
| Public network access | Enabled |
| Blob public access allowed | true |
| Minimum TLS version | TLS1_2 |
| Primary location | `eastus` |

## Container

Data-plane container metadata discovery with `--auth-mode login` confirmed:

| Field | Value |
| --- | --- |
| Container | `ice-rink-rentals-media` |
| Public access | blob |
| Last modified | 2026-06-05T14:11:32+00:00 |
| Lease status | unlocked |
| Immutability policy | false |
| Legal hold | false |

## Boundary

No storage keys, connection strings, SAS values, blob downloads, uploads, deletes, or mutations were used.
