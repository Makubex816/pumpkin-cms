# Partial Resource State

Date: 2026-06-27

## Read-Only Resource Checks

| Resource | Result |
| --- | --- |
| Resource group `rg-pumpkin-api-prod-eastus` | Exists |
| App Service plan `asp-pumpkin-api-prod-eastus-001` | Not found |
| Web App `app-pumpkin-api-prod-eastus-001` | Not found |

## Resource Group

| Field | Value |
| --- | --- |
| ID | `/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/resourceGroups/rg-pumpkin-api-prod-eastus` |
| Name | `rg-pumpkin-api-prod-eastus` |
| Location | `eastus` |
| Type | `Microsoft.Resources/resourceGroups` |
| Provisioning state | `Succeeded` |

## App Service Plan

Read-only show result:

```text
ResourceNotFound
```

The planned App Service plan does not exist.

## Web App

Read-only show result:

```text
ResourceNotFound
```

The planned Web App does not exist.

## Result

The Azure state is unchanged from the V2.8.32D blocker: resource group exists, plan and Web App are absent.
