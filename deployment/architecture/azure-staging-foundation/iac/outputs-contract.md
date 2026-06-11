# IaC Outputs Contract

Future approved deployment or `what-if` phases may use this contract to map non-secret outputs into Resource Registry and provider profile candidates.

| Output | Secret | Consumer |
| --- | --- | --- |
| `stagingResourceGroupName` | no | `OLM_STAGING_RESOURCE_SCOPE`, Resource Registry |
| `stagingResourceGroupId` | no | Resource Registry, RBAC scope review |
| `cosmosAccountName` | no | `OLM_STAGING_ACCOUNT_OR_HOST`, provider profile |
| `cosmosEndpoint` | no | Provider profile account/host; endpoint only, no credentials |
| `cosmosDatabaseName` | no | `OLM_STAGING_DATABASE_OR_NAMESPACE` |
| `cosmosContainerNames` | no | Provider profile, Resource Registry |
| `cosmosPartitionKey` | no | Tenant isolation validator |
| `evidenceStorageAccountName` | no | Backup Center and runtime QA evidence plan |
| `evidenceContainerNames` | no | Backup Center, Resource Registry, Runtime QA evidence maps |
| `keyVaultName` | no | Secret reference registry |
| `managedIdentityName` | no | Identity/session plan |
| `logAnalyticsWorkspaceName` | no | Runtime QA diagnostics plan |
| `applicationInsightsName` | no | Runtime QA diagnostics plan |

Forbidden outputs:

- Keys.
- `listKeys` values.
- Connection strings.
- SAS values.
- Tokens.
- Passwords.
- Secret values.
- Auth headers.

