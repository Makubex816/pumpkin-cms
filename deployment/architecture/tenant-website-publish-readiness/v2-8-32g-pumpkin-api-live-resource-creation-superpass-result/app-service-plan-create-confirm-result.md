# App Service Plan Create/Confirm Result

Date: 2026-06-27

## Primary And Fallback Attempts

| Plan | Region | SKU | Result |
| --- | --- | --- | --- |
| `asp-pumpkin-api-prod-eastus-001` | `eastus` | `B1` | Quota blocked |
| `asp-pumpkin-api-prod-eastus2-001` | `eastus2` | `B1` | Quota blocked |
| `asp-pumpkin-api-prod-eastus2-001` | `eastus2` | `S1` | Quota blocked |
| `asp-pumpkin-api-prod-eastus2-001` | `eastus2` | `P0V3` | Quota blocked |
| `asp-pumpkin-api-prod-centralus-001` | `centralus` | `B1` | Created |

## Selected Plan

| Field | Value |
| --- | --- |
| Name | `asp-pumpkin-api-prod-centralus-001` |
| Resource group | `rg-pumpkin-api-prod-centralus` |
| Location | `centralus` |
| SKU | `B1` |
| Kind | `linux` |
| Reserved/Linux | `true` |
| Provisioning state | `Succeeded` |
| Status | `Ready` |
