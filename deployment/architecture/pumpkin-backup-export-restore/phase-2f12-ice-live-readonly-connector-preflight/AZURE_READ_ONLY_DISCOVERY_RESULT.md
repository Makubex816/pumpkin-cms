# Azure Read-Only Discovery Result

## Account Context

Azure CLI was available and already logged in.

| Field | Result |
| --- | --- |
| Account state | Enabled |
| Subscription name | Azure subscription 1 |

No subscription ID, tenant ID, user identity, token, credential cache, key, or secret value was recorded.

## Resource Groups

Read-only resource group listing returned:

| Resource Group | Location |
| --- | --- |
| `rg-ice-production-media` | `eastus` |
| `rg-ice-static-form-endpoint` | `eastus` |
| `DefaultResourceGroup-EUS` | `eastus` |
| `rg-ice-static-staging` | `eastus2` |

## Storage Accounts

Read-only storage account listing returned:

| Account | Resource Group | Location | Kind | SKU | Public Network Access | Blob Public Access Allowed |
| --- | --- | --- | --- | --- | --- | --- |
| `iceforms20260605` | `rg-ice-static-form-endpoint` | `eastus` | `StorageV2` | `Standard_LRS` | not returned | false |
| `iceskatingmedia` | `rg-ice-production-media` | `eastus` | `StorageV2` | `Standard_LRS` | Enabled | true |

## Cosmos Accounts

`az cosmosdb list` returned no Cosmos DB accounts in the active subscription.

## Boundary Confirmation

Only read/list/show commands were used. No key/listKeys, connection-string, SAS, write, deployment, or mutation commands were used.
