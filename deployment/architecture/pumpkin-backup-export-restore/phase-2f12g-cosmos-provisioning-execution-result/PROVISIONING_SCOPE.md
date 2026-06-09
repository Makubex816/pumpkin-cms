# Provisioning Scope

## Approved

- Create or verify resource group `rg-ice-production-cosmos`.
- Register `Microsoft.DocumentDB` provider namespace after explicit owner approval.
- Create or verify Cosmos account `cosmos-pumpkin-prod-eastus`.
- Create or verify Cosmos SQL/NoSQL database `pumpkin-prod-cms`.
- Create or verify containers:
  - `tenants`
  - `sites`
  - `pages`
  - `routes`
  - `forms`
  - `mediaAssets`
  - `themes`
  - `publishRuns`
  - `importRuns`
  - `users`
- Use partition key `/tenantKey`.
- Use continuous backup policy if supported by Azure CLI tooling.
- Capture non-secret metadata and readback verification.

## Not Approved

- Any Azure provider namespace registration other than `Microsoft.DocumentDB`.
- RBAC role assignment changes.
- Keys/listKeys commands.
- Connection strings.
- SAS generation.
- CMS runtime switch.
- CMS writes.
- Tenant data migration.
- Database export/import.
- Protected config reads.
- Deployment.
- Search Console/indexing.
- Live-page publication.

