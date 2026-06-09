# Live Azure Wiring Model

## Discovered Read-Only Azure Context

Azure CLI was available and already logged in. Read-only discovery used non-secret fields only.

Discovered resource groups:

- `rg-ice-production-media` in `eastus`
- `rg-ice-static-form-endpoint` in `eastus`
- `DefaultResourceGroup-EUS` in `eastus`
- `rg-ice-static-staging` in `eastus2`

Discovered storage accounts:

- `iceskatingmedia` in `rg-ice-production-media` / `eastus`
- `iceforms20260605` in `rg-ice-static-form-endpoint` / `eastus`

Discovered storage containers via Azure identity, metadata only:

- `iceskatingmedia` / `ice-rink-rentals-media`, public access `blob`
- `iceforms20260605` / `azure-webjobs-hosts`
- `iceforms20260605` / `azure-webjobs-secrets`
- `iceforms20260605` / `function-releases`
- `iceforms20260605` / `scm-releases`

No container contents, keys, connection strings, SAS URLs, app settings, deployment tokens, or secret values were read.

Azure SQL discovery:

- `az sql server list` returned no SQL servers in the current subscription context.

## Live Website Profile

| Layer | Live Source | Status |
| --- | --- | --- |
| Public site | Azure Static Web App `swa-ice-static-staging` per production cutover docs | Documented live |
| Public domains | `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com` | Documented Ready |
| Media host | `media.iceskatingrinkrentals.com` CNAME to Azure Blob | Documented and read-only storage found |
| Contact endpoint | Azure Function `func-ice-static-contact-20260605` | Documented no-email/dry-run endpoint |
| CMS API | Pumpkin API/admin | Wired through env-gated read-only export |
| Database | Cosmos DB per production architecture docs; not discovered through allowed SQL commands | Needs DB source discovery connector |

## Profile Rule

The `azure-readonly-backup` profile may list resource names, metadata, and inventory only. It must not use list-keys, appsetting-value, SAS generation, deployment, export, upload, delete, or write commands.

