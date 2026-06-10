# Cosmos Target Readback Result

Status: passed for management metadata

Verified with approved non-secret Azure CLI metadata commands:

- account: `cosmos-pumpkin-prod-eastus`
- resource group: `rg-ice-production-cosmos`
- database: `pumpkin-prod-cms`
- backup policy: `Continuous`
- public network access: `Enabled`

Approved containers and partition paths:

| Container | Partition path |
| --- | --- |
| forms | `/tenantKey` |
| importRuns | `/tenantKey` |
| routes | `/tenantKey` |
| mediaAssets | `/tenantKey` |
| users | `/tenantKey` |
| themes | `/tenantKey` |
| pages | `/tenantKey` |
| sites | `/tenantKey` |
| tenants | `/tenantKey` |
| publishRuns | `/tenantKey` |

No keys, connection strings, or SAS values were requested or printed.
