# Non-Secret Output Capture

Because deployment did not run, no live Azure output values were captured.

## Candidate Outputs From IaC Only

These are template-derived candidates, not verified live Azure resources:

| Output | Candidate value | Status |
| --- | --- | --- |
| `resourceGroupName` | `rg-pumpkincms-stg-eastus-olm` | candidate only; group does not exist |
| `cosmosAccountName` | `cosmos-pumpkincms-stg-olm01` | candidate only |
| `cosmosDatabaseName` | `pumpkincms-olm-staging` | candidate only |
| `cosmosContainerNames` | `outbound-links`, `outbound-link-instances`, `outbound-link-policies`, `outbound-link-scan-runs`, `outbound-link-audit-logs`, `outbound-link-render-decisions`, `outbound-link-review-decisions`, `outbound-link-bulk-actions`, `outbound-link-rollback-plans`, `outbound-link-trace-logs` | candidate only |
| `cosmosPartitionKey` | `/tenantKey` | candidate only |
| `storageAccountName` | `pumpkincmsstgolm01` | candidate only |
| `storageContainerNames` | `backup-center-staging`, `resource-registry-staging`, `runtime-qa-staging` | candidate only |
| `keyVaultName` | `kv-pumpkincms-stg-olm01` | candidate only |
| `managedIdentityName` | `id-pumpkincms-olm-stg` | candidate only |
| `logAnalyticsWorkspaceName` | `log-pumpkincms-stg-olm01` | candidate only |
| `applicationInsightsName` | `appi-pumpkincms-stg-olm01` | candidate only |

No keys, connection strings, SAS, tokens, cookies, auth headers, private keys, or secret values were captured.

