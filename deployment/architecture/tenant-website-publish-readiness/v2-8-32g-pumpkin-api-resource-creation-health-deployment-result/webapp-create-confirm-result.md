# Web App Create/Confirm Result

Date: 2026-06-27

## Target

| Field | Value |
| --- | --- |
| Name | `app-pumpkin-api-prod-eastus-001` |
| Resource group | `rg-pumpkin-api-prod-eastus` |
| Region | `eastus` |
| Runtime | `DOTNETCORE|10.0` |
| Base URL | `https://app-pumpkin-api-prod-eastus-001.azurewebsites.net` |

## Initial Confirm

Initial read-only show result:

```text
ResourceNotFound
```

## Result

Web App creation was not attempted.

Reason: the App Service plan creation attempt failed because East US Total VMs quota remains `0`.
