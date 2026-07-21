# Resource protection carryforward

No deletion, decommission, or cleanup is authorized by A03.

V2.8.61K protection lineage is preserved for all required resources unless a later explicit authoritative decommission approval exists.

## Required protected resources

| Resource | V2.8.61K protection | A03 current readback |
| --- | --- | --- |
| `app-pumpkin-api-prod-centralus-001` | do not delete | still found, `Microsoft.Web/sites`, `centralus` |
| `app-pumpkin-admin-prod-centralus-001` | do not delete | still found, `Microsoft.Web/sites`, `centralus` |
| `app-pumpkin-admin-isolated-centralus-001` | do not delete | still found, `Microsoft.Web/sites`, `centralus` |
| `asp-pumpkin-api-prod-centralus-001` | do not delete | still found, `Microsoft.Web/serverFarms`, current SKU S2, capacity 2 |
| `swa-ice-static-staging` | do not delete | still found, `Microsoft.Web/staticSites`, `eastus2` |
| `swa-ice-static-isolated-staging` | do not delete | still found, `Microsoft.Web/staticSites`, `eastus2` |
| `cosmos-pumpkin-prod-eastus` | do not delete | still found, `Microsoft.DocumentDB/databaseAccounts`, `eastus` |
| `iceskatingmedia` | do not delete | still found, `Microsoft.Storage/storageAccounts`, `eastus` |
| `app-airstrip-prod-centralus-001` | do not delete; Airstrip frozen | still found, `Microsoft.Web/sites`, `centralus`; no route probe |
| `app-airstrip-preview-isolated-centralus-001` | do not delete; Airstrip frozen | still found, `Microsoft.Web/sites`, `centralus`; no route probe |
| `func-ice-static-contact-20260605` | do not delete until dependency proof | still found, `Microsoft.Web/sites`, `eastus` |
| `iceforms20260605` | do not delete until dependency proof | still found, `Microsoft.Storage/storageAccounts`, `eastus` |
| `EastUSPlan` | do not delete until dependency proof | still found, `Microsoft.Web/serverFarms`, `eastus`, Y1 |
| `rg-pumpkincms-stg-eastus-olm` resources | do not delete until dependency proof | resource group exists; 7 resources found |

## `rg-pumpkincms-stg-eastus-olm` current readback

Read-only resource group metadata found:

- `appi-pumpkincms-stg-olm01` — `Microsoft.Insights/components`
- `Application Insights Smart Detection` — `microsoft.insights/actiongroups`
- `cosmos-pumpkincms-stg-olm01` — `Microsoft.DocumentDB/databaseAccounts`
- `id-pumpkincms-olm-stg` — `Microsoft.ManagedIdentity/userAssignedIdentities`
- `kv-pumpkincms-stg-olm01` — `Microsoft.KeyVault/vaults`
- `log-pumpkincms-stg-olm01` — `Microsoft.OperationalInsights/workspaces`
- `pumpkincmsstgolm01` — `Microsoft.Storage/storageAccounts`

Secret values were not queried.

## Carryforward rule

All listed resources remain protected through A03. Any future cleanup requires a separate dependency-proof and decommission approval.
