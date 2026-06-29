# Cosmos Container Source/Live Alignment

Live target:

- Account: `cosmos-pumpkin-prod-eastus`
- Resource group: `rg-ice-production-cosmos`
- Database: `pumpkin-prod-cms`

Source-required active containers:

| Container | Source use | Live after V2.8.36 | Partition key |
| --- | --- | --- | --- |
| `Tenant` | tenant records and API key validation | present before phase | `/tenantId` |
| `User` | Admin identity | present before phase | `/tenantId` |
| `Page` | public/admin pages, sitemap, content hierarchy | created in V2.8.36 | `/tenantId` |
| `MediaAsset` | Admin media metadata | created in V2.8.36 | `/tenantId` |
| `PublishRun` | tenant publish/build history | created in V2.8.36 | `/tenantId` |
| `ImportRun` | tenant import history | created in V2.8.36 | `/tenantId` |
| `FormEntry` | contact/FormEntry no-regression | present before phase | `/tenantId` |

Legacy/lower/plural containers remain untouched:

- `pages`, `mediaAssets`, `publishRuns`, `importRuns`, `tenants`, `users`, `forms`, `routes`, `sites`, `themes`.

No lower/plural container was deleted or migrated.
