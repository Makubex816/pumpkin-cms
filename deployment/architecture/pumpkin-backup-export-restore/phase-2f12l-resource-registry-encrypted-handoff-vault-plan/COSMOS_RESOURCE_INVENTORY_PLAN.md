# Cosmos Resource Inventory Plan

The registry should track Cosmos resources as provider targets and runtime sources.

## Fields

- Account name
- Resource group
- Subscription hint
- Region
- Provider kind
- Database name
- Container names
- Partition key path
- Backup policy mode
- Public network access status
- Runtime profile references
- Credential references
- Data seed status
- Export readiness
- Restore proof status

## Ice Current Cosmos Target

- Account: `cosmos-pumpkin-prod-eastus`
- Database: `pumpkin-prod-cms`
- Backup policy: `Continuous30Days`
- Partition key: `/tenantKey`
- Containers: `tenants`, `sites`, `pages`, `routes`, `forms`, `mediaAssets`, `themes`, `publishRuns`, `importRuns`, `users`
- Runtime state: future target only

## Registry Status

Ice Cosmos status should be `provisioned` and `verified`, but not `attached` as active runtime storage until later approved runtime switch gates pass.

