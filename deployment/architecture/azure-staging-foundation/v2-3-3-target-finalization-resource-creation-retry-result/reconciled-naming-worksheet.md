# Reconciled Naming Worksheet

| Resource | Final name | Status |
| --- | --- | --- |
| Resource group | `rg-pumpkincms-stg-eastus-olm` | created/updated |
| Cosmos DB account | `cosmos-pumpkincms-stg-olm01` | created |
| Cosmos database | `pumpkincms-olm-staging` | created |
| Storage account | `pumpkincmsstgolm01` | created |
| Backup evidence container | `backup-center-staging` | created |
| Resource Registry evidence container | `resource-registry-staging` | created |
| Runtime QA evidence container | `runtime-qa-staging` | created |
| Key Vault | `kv-pumpkincms-stg-olm01` | created |
| Managed identity | `id-pumpkincms-olm-stg` | created |
| Log Analytics workspace | `log-pumpkincms-stg-olm01` | created |
| Application Insights component | `appi-pumpkincms-stg-olm01` | created |

Cosmos containers:

- `outbound-links`
- `outbound-link-instances`
- `outbound-link-policies`
- `outbound-link-scan-runs`
- `outbound-link-audit-logs`
- `outbound-link-render-decisions`
- `outbound-link-review-decisions`
- `outbound-link-bulk-actions`
- `outbound-link-rollback-plans`
- `outbound-link-trace-logs`

All Cosmos containers use partition key `/tenantKey`.

