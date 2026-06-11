# Read-Only Azure Inventory Result

## Boundary

Azure CLI was available and the terminal was already logged in. No login flow, device code flow, protected config read, secret query, key query, `listKeys`, connection string generation, SAS generation, Key Vault secret value read, Azure mutation, deployment, or RBAC assignment was performed.

Read-only inventory calls used JSON output so subscription and tenant identifiers could be redacted before documentation:

- `az account show --output json`
- `az group list --output json`
- `az resource list --output json`

## Account Summary

| Field | Value |
| --- | --- |
| Azure CLI available | yes |
| Already logged in | yes |
| Subscription display name | `Azure subscription 1` |
| Subscription state | `Enabled` |
| Default account | `true` |
| Subscription ID | redacted |
| Tenant ID | redacted |
| User type | `user` |

## Resource Group Inventory

Read-only inventory found five resource groups:

| Resource group | Location |
| --- | --- |
| `rg-ice-production-media` | `eastus` |
| `rg-ice-static-form-endpoint` | `eastus` |
| `DefaultResourceGroup-EUS` | `eastus` |
| `rg-ice-production-cosmos` | `eastus` |
| `rg-ice-static-staging` | `eastus2` |

## Resource Type Inventory

Read-only inventory found seven resources by type:

| Resource type | Count |
| --- | ---: |
| `Microsoft.Storage/storageAccounts` | 2 |
| `Microsoft.DocumentDB/databaseAccounts` | 1 |
| `Microsoft.Web/staticSites` | 1 |
| `Microsoft.Web/serverFarms` | 1 |
| `Microsoft.OperationalInsights/workspaces` | 1 |
| `Microsoft.Web/sites` | 1 |

## Interpretation

Existing Ice production and static staging resources are visible. V2.3.1 does not assume these resources are valid OLM staging targets and does not reuse them without a later explicit staging target approval.

The proposed OLM staging foundation should use a clearly non-production staging scope so the `OLM_STAGING_*` values do not point at production resource groups, production Cosmos accounts, production media storage, or production CMS/runtime assets.

