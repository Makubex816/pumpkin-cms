# Non-Secret Output Capture

| Output | Value |
| --- | --- |
| `subscriptionDisplayName` | `Azure subscription 1` |
| `subscriptionId` | redacted |
| `tenantId` | redacted |
| `resourceGroupName` | `rg-pumpkincms-stg-eastus-olm` |
| `resourceGroupId` | `/subscriptions/<redacted>/resourceGroups/rg-pumpkincms-stg-eastus-olm` |
| `location` | `eastus` |
| `cosmosAccountName` | `cosmos-pumpkincms-stg-olm01` |
| `cosmosAccountEndpoint` | `https://cosmos-pumpkincms-stg-olm01.documents.azure.com:443/` |
| `cosmosAccountEndpointHostnameOnly` | `cosmos-pumpkincms-stg-olm01.documents.azure.com` |
| `cosmosDatabaseName` | `pumpkincms-olm-staging` |
| `cosmosContainerNames` | see inventory |
| `cosmosPartitionKey` | `/tenantKey` |
| `storageAccountName` | `pumpkincmsstgolm01` |
| `storageContainerNames` | `backup-center-staging`, `resource-registry-staging`, `runtime-qa-staging` |
| `keyVaultName` | `kv-pumpkincms-stg-olm01` |
| `managedIdentityName` | `id-pumpkincms-olm-stg` |
| `managedIdentityClientId` | `c3220beb-79b9-403a-bf09-b6ce006380a1` |
| `managedIdentityPrincipalId` | `f9e8a811-cd4f-4afb-9f39-9f2fece7e5e2` |
| `roleAssignmentIdsIfCreated` | none |
| `logAnalyticsWorkspaceName` | `log-pumpkincms-stg-olm01` |
| `applicationInsightsName` | `appi-pumpkincms-stg-olm01` |

Never captured:

- keys
- connection strings
- SAS
- tokens
- cookies
- auth headers
- private keys
- secret values

