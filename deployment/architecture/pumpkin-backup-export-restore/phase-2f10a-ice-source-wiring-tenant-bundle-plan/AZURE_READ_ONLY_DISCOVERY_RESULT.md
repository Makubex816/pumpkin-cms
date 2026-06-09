# Azure Read-Only Discovery Result

Date: 2026-06-09

## Boundary

Azure CLI discovery was read-only. No keys, connection strings, SAS URLs, app setting values, deployment tokens, blob contents, database exports, or secret values were read or printed.

No Azure mutation command was run.

## Tool/Login

| Item | Result |
| --- | --- |
| `az` CLI | PRESENT |
| Azure account state | Enabled |
| Default subscription name | `Azure subscription 1` |

## Resource Groups

| Resource group | Location |
| --- | --- |
| `rg-ice-production-media` | `eastus` |
| `rg-ice-static-form-endpoint` | `eastus` |
| `DefaultResourceGroup-EUS` | `eastus` |
| `rg-ice-static-staging` | `eastus2` |

## SQL Discovery

| Command | Result |
| --- | --- |
| `az sql server list` | No SQL servers returned |

Interpretation: Azure SQL is not currently discoverable as the Ice database source in the current subscription context. The DB connector plan must treat Azure SQL as optional and first discover the actual provider.

## Storage Discovery

| Storage account | Resource group | Location |
| --- | --- | --- |
| `iceforms20260605` | `rg-ice-static-form-endpoint` | `eastus` |
| `iceskatingmedia` | `rg-ice-production-media` | `eastus` |

## Container Metadata Discovery

| Account | Container | Public access | Notes |
| --- | --- | --- | --- |
| `iceskatingmedia` | `ice-rink-rentals-media` | `blob` | media source candidate |
| `iceforms20260605` | `azure-webjobs-hosts` | none | function runtime container, contents not read |
| `iceforms20260605` | `azure-webjobs-secrets` | none | container name discovered only, contents not read |
| `iceforms20260605` | `function-releases` | none | contents not read |
| `iceforms20260605` | `scm-releases` | none | contents not read |

No blob list/download operation was performed.

