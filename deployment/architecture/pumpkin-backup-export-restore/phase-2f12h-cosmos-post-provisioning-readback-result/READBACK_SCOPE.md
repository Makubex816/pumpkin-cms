# Readback Scope

## Approved

- Read active Azure subscription context with non-secret fields only.
- Read resource group `rg-ice-production-cosmos`.
- Read Cosmos account `cosmos-pumpkin-prod-eastus`.
- Read backup policy metadata.
- Read database `pumpkin-prod-cms`.
- Read approved container names and partition key metadata.
- Refresh local Backup Center provider resolver fixture/status.
- Run local resolver/package regression checks.

## Not Approved

- CMS runtime switch.
- CMS writes.
- MediaAsset writes.
- Data migration.
- Seed/import execution.
- Database export/import.
- Cosmos document export.
- Keys/listKeys.
- Connection strings.
- SAS generation.
- Protected config reads.
- Deployment.
- Search Console/indexing.
- Live-page publication.

