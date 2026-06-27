# App Service Plan Create/Confirm Result

Date: 2026-06-27

## Target

| Field | Value |
| --- | --- |
| Name | `asp-pumpkin-api-prod-eastus-001` |
| Resource group | `rg-pumpkin-api-prod-eastus` |
| Region | `eastus` |
| SKU | `B1` |
| Linux | `true` |

## Initial Confirm

Initial read-only show result:

```text
ResourceNotFound
```

## Creation Attempt

One approved App Service plan creation attempt was sent for the target above.

Result: failed.

Azure returned:

```text
Operation cannot be completed without additional quota.
Location: East US
Current Limit (Total VMs): 0
Current Usage: 0
Amount required for this deployment (Total VMs): 1
Minimum new limit: 1
```

## Follow-Up Confirm

Follow-up read-only show result:

```text
ResourceNotFound
```

## Classification

`quota_unresolved`

The plan was not created. No second attempt was made.
