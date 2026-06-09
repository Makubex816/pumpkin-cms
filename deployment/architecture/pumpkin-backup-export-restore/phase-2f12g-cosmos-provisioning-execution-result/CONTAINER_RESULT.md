# Container Result

## Target Containers

All target containers use partition key `/tenantKey`.

| Container | Status | Partition key | Indexing mode |
| --- | --- | --- | --- |
| `tenants` | created | `/tenantKey` | consistent |
| `sites` | created | `/tenantKey` | consistent |
| `pages` | created | `/tenantKey` | consistent |
| `routes` | created | `/tenantKey` | consistent |
| `forms` | created | `/tenantKey` | consistent |
| `mediaAssets` | created | `/tenantKey` | consistent |
| `themes` | created | `/tenantKey` | consistent |
| `publishRuns` | created | `/tenantKey` | consistent |
| `importRuns` | created | `/tenantKey` | consistent |
| `users` | created | `/tenantKey` | consistent |

## Result

All ten approved model-aligned containers were created and read back. No unapproved container names were created.

Containers were created under database `pumpkin-prod-cms` in account `cosmos-pumpkin-prod-eastus`.

