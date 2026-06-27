# V2.8.32D Carryforward

V2.8.32D completed partial Azure provisioning and stopped at the App Service quota blocker.

## Completed In V2.8.32C

V2.8.32C provided:

- `GET /health`
- `GET /api/health`
- FormEntry write route shape verification
- Admin FormEntry read route shape verification
- Release build and scoped test pass
- Local publish artifact `.tmp/v2-8-32c/pumpkin-api.zip`
- ZIP SHA-256 `05e9567dd47f7b59288569ea66815dc5059df903481f097e3222f0036ee5b854`

## Completed In V2.8.32D

V2.8.32D verified Azure context and created the planned resource group:

| Field | Value |
| --- | --- |
| Resource group | `rg-pumpkin-api-prod-eastus` |
| Region | `eastus` |
| Provisioning state | `Succeeded` |
| Subscription id | `ff887def-fd83-4a19-9298-13d4b1687873` |

## Blocker

The planned Linux App Service plan was not created.

Azure reported:

| Field | Value |
| --- | --- |
| Location | `East US` |
| Current Limit (Total VMs) | `0` |
| Current Usage | `0` |
| Required for deployment | `1` |
| Minimum new limit | `1` |

## Deferred

The Web App, ZIP deployment, and live health checks were not attempted after the quota blocker.
