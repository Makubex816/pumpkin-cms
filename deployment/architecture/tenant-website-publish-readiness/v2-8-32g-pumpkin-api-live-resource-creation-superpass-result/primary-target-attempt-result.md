# Primary Target Attempt Result

Date: 2026-06-27

## Primary Target

| Field | Value |
| --- | --- |
| Resource group | `rg-pumpkin-api-prod-eastus` |
| Plan | `asp-pumpkin-api-prod-eastus-001` |
| Web App | `app-pumpkin-api-prod-eastus-001` |
| Region | `eastus` |
| SKU | `B1` |

## Result

- Resource group existed and was `Succeeded`.
- Plan was absent.
- Web App was absent.
- One plan creation attempt was sent.
- Azure returned East US Total VMs quota blocker.

Quota details:

| Field | Value |
| --- | --- |
| Current Limit (Total VMs) | `0` |
| Current Usage | `0` |
| Required | `1` |
| Minimum new limit | `1` |

Primary target failed and fallback was invoked.
