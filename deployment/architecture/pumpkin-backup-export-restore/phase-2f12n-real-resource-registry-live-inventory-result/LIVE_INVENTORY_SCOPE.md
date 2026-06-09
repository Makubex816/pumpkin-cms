# Live Inventory Scope

Approved inventory scope:

- Azure subscription metadata
- Ice resource groups
- Ice media storage account and container names
- Ice Cosmos account, database, and container names
- Ice Static Web App staging resource metadata
- Ice contact form Function App metadata
- function storage account and Azure-managed container names
- Ice Cloudflare zone/domain/media worker mappings from committed safe docs only
- Ice and Roller tenant/domain mappings
- runtime profile mappings
- Backup Center status and handoff-vault status
- credential references without values

Not included:

- Azure keys
- connection strings
- SAS URLs
- app setting values
- protected config
- CMS content export
- Cosmos document export
- media/blob download
- Cloudflare API call in this phase
- deployment or publication
