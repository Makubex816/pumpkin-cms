# Fallback Target Decision

Date: 2026-06-27

## Existing Plan Check

Only one existing plan was found:

| Field | Value |
| --- | --- |
| Name | `EastUSPlan` |
| Resource group | `rg-ice-static-form-endpoint` |
| SKU | `Y1` |
| Reserved/Linux | `false` |
| Kind | `functionapp` |

It was not selected because it is a Windows Consumption Function plan and is not a suitable Linux Pumpkin API App Service target.

## Fallback Attempts

| Region | SKU | Resource group | Result |
| --- | --- | --- | --- |
| `eastus2` | `B1` | `rg-pumpkin-api-prod-eastus2` | Quota blocked |
| `eastus2` | `S1` | `rg-pumpkin-api-prod-eastus2` | Quota blocked |
| `eastus2` | `P0V3` | `rg-pumpkin-api-prod-eastus2` | Quota blocked |
| `centralus` | `B1` | `rg-pumpkin-api-prod-centralus` | Plan created |

## Decision

Selected fallback:

`centralus` / `B1`

Selected Web App:

`app-pumpkin-api-prod-centralus-001`
