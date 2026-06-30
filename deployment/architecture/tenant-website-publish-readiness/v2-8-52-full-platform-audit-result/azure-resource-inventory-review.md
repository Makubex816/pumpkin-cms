# Azure Resource Inventory Review

Active subscription was already correct:

- Subscription name: `Azure subscription 1`
- Subscription ID: `ff887def-fd83-4a19-9298-13d4b1687873`
- Operator user: `Contact@iceskatingrinkrentals.com`
- Account set performed during V2.8.52: false

## Resource Groups

| Resource group | Present | Location | Resource count |
| --- | --- | --- | ---: |
| `rg-pumpkin-api-prod-centralus` | true | centralus | 4 |
| `rg-ice-static-staging` | true | eastus2 | 2 |
| `rg-ice-production-cosmos` | true | eastus | 1 |
| `rg-ice-production-media` | true | eastus | 1 |
| `rg-pumpkin-observability-prod-centralus` | true | centralus | 8 |
| `rg-ice-static-form-endpoint` | true | eastus | 3 |
| `rg-pumpkin-api-prod-eastus` | false | n/a | 0 |
| `rg-pumpkin-api-prod-eastus2` | false | n/a | 0 |

## Live Shared Resources

- `app-pumpkin-api-prod-centralus-001`
- `app-pumpkin-admin-prod-centralus-001`
- `app-pumpkin-admin-isolated-centralus-001`
- `asp-pumpkin-api-prod-centralus-001`
- `swa-ice-static-staging`
- `swa-ice-static-isolated-staging`
- `cosmos-pumpkin-prod-eastus`
- `iceskatingmedia`
- `law-pumpkin-prod-centralus-001`
- `ag-pumpkin-prod-ops-email-001`
- Six metric alerts in `rg-pumpkin-observability-prod-centralus`

No appsettings, keys, storage keys, SAS values, connection strings, or protected config values were read.
