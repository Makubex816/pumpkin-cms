# Cosmos Target Readback Result

Status: passed

Read-only Azure metadata checks confirmed:

- Subscription state: `Enabled`
- Cosmos account: `cosmos-pumpkin-prod-eastus`
- Resource group: `rg-ice-production-cosmos`
- Kind: `GlobalDocumentDB`
- Region: `East US`
- Backup policy type: `Continuous`
- Public network access: `Enabled`
- Database: `pumpkin-prod-cms`

All approved containers were present with partition key path `/tenantKey`:

- `forms`
- `importRuns`
- `routes`
- `mediaAssets`
- `users`
- `themes`
- `pages`
- `sites`
- `tenants`
- `publishRuns`

No keys/listKeys, connection string, SAS, or protected configuration command was used.
