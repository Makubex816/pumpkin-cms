# Quota Ticket Submission Result

Date: 2026-06-27

## Source

Approved public-safe quota-ticket env values and the public-safe ticket summary file were read.

## Env Evidence

| Env | Value |
| --- | --- |
| `PUMPKIN_API_QUOTA_REQUEST_SUBMITTED` | `true` |
| `PUMPKIN_API_QUOTA_SUPPORT_TICKET_NAME` | `PumpkinApiEastUSAppServiceQuotaIncrease-20260627120242` |
| `PUMPKIN_API_QUOTA_SUPPORT_TICKET_ID` | Not provided |
| `PUMPKIN_API_QUOTA_REQUESTED_REGION` | `East US` |
| `PUMPKIN_API_QUOTA_REQUESTED_LIMIT` | `1` |
| `PUMPKIN_API_QUOTA_CURRENT_LIMIT` | `0` |
| `PUMPKIN_API_QUOTA_TARGET_SUBSCRIPTION_ID` | `ff887def-fd83-4a19-9298-13d4b1687873` |
| `PUMPKIN_API_QUOTA_TARGET_RESOURCE_GROUP` | `rg-pumpkin-api-prod-eastus` |
| `PUMPKIN_API_QUOTA_TARGET_PLAN` | `asp-pumpkin-api-prod-eastus-001` |
| `PUMPKIN_API_QUOTA_TARGET_WEBAPP` | `app-pumpkin-api-prod-eastus-001` |
| `PUMPKIN_API_QUOTA_EVIDENCE_PATH` | `C:\Users\User\Desktop\PumpkinCMS\quota-requests\v2-8-32e` |

## Summary File Evidence

File read:

`C:\Users\User\Desktop\PumpkinCMS\quota-requests\v2-8-32e\quota-ticket-summary.json`

Summary values:

| Field | Value |
| --- | --- |
| Created at | `2026-06-27T12:07:44.3055841-04:00` |
| Ticket name | `PumpkinApiEastUSAppServiceQuotaIncrease-20260627120242` |
| Ticket id | Not provided |
| Ticket status | Not provided |
| Title | `Request East US App Service worker quota increase from 0 to 1 for Pumpkin API` |
| Subscription id | `ff887def-fd83-4a19-9298-13d4b1687873` |
| Quota service | `Service and subscription limits (quotas)` |
| Requested region | `East US` |
| Current limit | `0` |
| Requested limit | `1` |
| Target resource group | `rg-pumpkin-api-prod-eastus` |
| Target plan | `asp-pumpkin-api-prod-eastus-001` |
| Target web app | `app-pumpkin-api-prod-eastus-001` |

## Optional Azure Support Status Check

The optional read-only ticket lookup by ticket name was attempted.

Result:

```text
ResourceNotFound
```

The ticket was therefore not confirmed through the Azure Support API in this phase. The quota request remains recorded from operator evidence, and approval remains pending.
