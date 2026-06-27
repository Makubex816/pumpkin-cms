# Rollback Plan

Date: 2026-06-27

## V2.8.32G Resource Changes

No new Azure resource was successfully created in V2.8.32G.

## Current Azure State

| Resource | State |
| --- | --- |
| Resource group `rg-pumpkin-api-prod-eastus` | Exists from V2.8.32D |
| App Service plan `asp-pumpkin-api-prod-eastus-001` | Not created |
| Web App `app-pumpkin-api-prod-eastus-001` | Not created |

## Rollback Guidance

No rollback is required for V2.8.32G.

If the operator later abandons Path A, deleting the existing resource group requires separate explicit rollback approval.
