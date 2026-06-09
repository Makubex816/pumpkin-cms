# Azure Subscription Resource Discovery Result

Azure CLI read-only discovery was run with the already logged-in identity. No Azure mutation, key listing, SAS generation, app-setting value read, database export, document export, or blob download occurred.

## Subscription Scope

| Field | Result |
| --- | --- |
| Accessible subscriptions | 1 |
| Default subscription | `Azure subscription 1` |
| Default subscription state | `Enabled` |

## Resource Groups

| Resource group | Location |
| --- | --- |
| `rg-ice-production-media` | `eastus` |
| `rg-ice-static-form-endpoint` | `eastus` |
| `DefaultResourceGroup-EUS` | `eastus` |
| `rg-ice-static-staging` | `eastus2` |

## Database Provider Resources

Read-only discovery for `Microsoft.DocumentDB/databaseAccounts`, `Microsoft.Sql/*`, and `Microsoft.DBfor*` resources returned no database-provider resources in the accessible subscription.

## Storage Context

| Storage account | Resource group | Location | Kind | SKU | Public blob access |
| --- | --- | --- | --- | --- | --- |
| `iceforms20260605` | `rg-ice-static-form-endpoint` | `eastus` | `StorageV2` | `Standard_LRS` | `False` |
| `iceskatingmedia` | `rg-ice-production-media` | `eastus` | `StorageV2` | `Standard_LRS` | `True` |

## Interpretation

The accessible Azure scope confirms Ice media/form infrastructure but does not expose the database provider source. The live database could be in another subscription/scope, provider-backed outside the accessible Azure subscription, local/provider storage not represented as an Azure database resource, or not yet provisioned in this scope.
