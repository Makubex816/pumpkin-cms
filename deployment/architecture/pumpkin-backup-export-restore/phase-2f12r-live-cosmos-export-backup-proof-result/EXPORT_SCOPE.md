# Export Scope

Approved scope:

- Target account: `cosmos-pumpkin-prod-eastus`
- Resource group: `rg-ice-production-cosmos`
- Database: `pumpkin-prod-cms`
- Tenant key: `ice-rink-rentals`
- Site key: `ice-rink-rentals`
- Partition key path: `/tenantKey`
- Access path: Azure AD/RBAC Cosmos data-plane read/query only

Exported containers:

| Container | Records |
| --- | ---: |
| tenants | 1 |
| sites | 1 |
| pages | 3 |
| routes | 5 |
| forms | 3 |
| mediaAssets | 12 |
| themes | 1 |
| publishRuns | 0 |
| importRuns | 1 |
| users | 0 |
| Total | 27 |

Out of scope:

- Cosmos writes.
- CMS runtime switch.
- CMS writes.
- MediaAsset writes.
- Media/blob download or copy.
- Keys/listKeys, connection strings, or SAS generation.
- Protected config reads.
- Deployment, Search Console/indexing, or live-page publication.
