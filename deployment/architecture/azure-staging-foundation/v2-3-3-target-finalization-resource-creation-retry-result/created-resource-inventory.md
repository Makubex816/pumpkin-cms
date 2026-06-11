# Created Resource Inventory

## Top-Level Resources

| Name | Type | Location | Readback |
| --- | --- | --- | --- |
| `cosmos-pumpkincms-stg-olm01` | `Microsoft.DocumentDB/databaseAccounts` | `eastus` | succeeded |
| `pumpkincmsstgolm01` | `Microsoft.Storage/storageAccounts` | `eastus` | succeeded |
| `kv-pumpkincms-stg-olm01` | `Microsoft.KeyVault/vaults` | `eastus` | succeeded |
| `id-pumpkincms-olm-stg` | `Microsoft.ManagedIdentity/userAssignedIdentities` | `eastus` | succeeded |
| `log-pumpkincms-stg-olm01` | `Microsoft.OperationalInsights/workspaces` | `eastus` | succeeded |
| `appi-pumpkincms-stg-olm01` | `Microsoft.Insights/components` | `eastus` | succeeded |

## Cosmos

| Field | Value |
| --- | --- |
| Account | `cosmos-pumpkincms-stg-olm01` |
| Endpoint | `https://cosmos-pumpkincms-stg-olm01.documents.azure.com:443/` |
| Database | `pumpkincms-olm-staging` |
| Partition key | `/tenantKey` |
| Local auth | disabled |
| Public network access | enabled |

Containers:

- `outbound-link-audit-logs`
- `outbound-link-bulk-actions`
- `outbound-link-instances`
- `outbound-link-policies`
- `outbound-link-render-decisions`
- `outbound-link-review-decisions`
- `outbound-link-rollback-plans`
- `outbound-links`
- `outbound-link-scan-runs`
- `outbound-link-trace-logs`

## Storage

| Field | Value |
| --- | --- |
| Account | `pumpkincmsstgolm01` |
| Kind | `StorageV2` |
| SKU | `Standard_LRS` |
| Blob public access | `false` |
| Minimum TLS | `TLS1_2` |

Containers:

- `backup-center-staging`
- `resource-registry-staging`
- `runtime-qa-staging`

All listed containers have public access `None`.

## Identity And Diagnostics

| Field | Value |
| --- | --- |
| Managed identity | `id-pumpkincms-olm-stg` |
| Managed identity client ID | `c3220beb-79b9-403a-bf09-b6ce006380a1` |
| Managed identity principal ID | `f9e8a811-cd4f-4afb-9f39-9f2fece7e5e2` |
| Log Analytics workspace | `log-pumpkincms-stg-olm01` |
| Application Insights component | `appi-pumpkincms-stg-olm01` |

