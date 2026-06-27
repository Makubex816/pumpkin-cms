# Partial Resource State

Date: 2026-06-27

## State From V2.8.32D

| Resource or action | State |
| --- | --- |
| Resource group `rg-pumpkin-api-prod-eastus` | Created in `eastus` |
| App Service plan `asp-pumpkin-api-prod-eastus-001` | Not created |
| Web App `app-pumpkin-api-prod-eastus-001` | Not created |
| ZIP deployment | Not attempted |
| Live health checks | Not attempted |

## V2.8.32E Changes

V2.8.32E did not change Azure resources.

The only state recorded in this phase is documentation state:

- Path A selected.
- Subscription lock verified.
- Operator quota request evidence recorded.
- Quota approval left pending.
- Deployment retry left blocked.
