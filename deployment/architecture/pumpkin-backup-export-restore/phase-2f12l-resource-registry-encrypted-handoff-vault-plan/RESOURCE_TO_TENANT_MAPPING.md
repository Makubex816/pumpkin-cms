# Resource to Tenant Mapping

The registry must make resource ownership and tenant attachment explicit.

## Mapping Fields

- `tenantKey`
- `siteKey`
- `domainNames`
- `resourceIds`
- `runtimeProfileIds`
- `backupArtifactRefs`
- `credentialRefs`
- `bundleRefs`
- `status`

## Ice Current Mapping

IceSkatingRinkRentals.com should map to:

- Tenant key: `ice-rink-rentals`
- Site key: `ice-rink-rentals`
- Runtime profile: `runtime-cosmos-future`
- Cosmos resource group: `rg-ice-production-cosmos`
- Cosmos account: `cosmos-pumpkin-prod-eastus`
- Cosmos database: `pumpkin-prod-cms`
- Cosmos containers: `tenants`, `sites`, `pages`, `routes`, `forms`, `mediaAssets`, `themes`, `publishRuns`, `importRuns`, `users`
- Partition key path: `/tenantKey`
- Current status: provisioned future target, not runtime-switched

## Hard Stop

Mapping a resource to a tenant does not approve runtime switch, data migration, live export, deployment, indexing, or publication.

