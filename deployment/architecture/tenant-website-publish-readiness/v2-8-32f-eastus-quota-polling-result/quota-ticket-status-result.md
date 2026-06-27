# Quota Ticket Status Result

Date: 2026-06-27

## Public-Safe Polling Env

| Env | Value |
| --- | --- |
| `PUMPKIN_API_QUOTA_TARGET_SUBSCRIPTION_ID` | `ff887def-fd83-4a19-9298-13d4b1687873` |
| `PUMPKIN_API_QUOTA_TARGET_SUBSCRIPTION_NAME` | Not provided |
| `PUMPKIN_API_QUOTA_TARGET_USER` | Not provided |
| `PUMPKIN_API_QUOTA_SUPPORT_TICKET_NAME` | `PumpkinApiEastUSAppServiceQuotaIncrease-20260627120242` |
| `PUMPKIN_API_QUOTA_REQUESTED_REGION` | `East US` |
| `PUMPKIN_API_QUOTA_CURRENT_LIMIT` | `0` |
| `PUMPKIN_API_QUOTA_REQUESTED_LIMIT` | `1` |
| `PUMPKIN_API_QUOTA_TARGET_RESOURCE_GROUP` | `rg-pumpkin-api-prod-eastus` |
| `PUMPKIN_API_QUOTA_TARGET_PLAN` | `asp-pumpkin-api-prod-eastus-001` |
| `PUMPKIN_API_QUOTA_TARGET_WEBAPP` | `app-pumpkin-api-prod-eastus-001` |
| `PUMPKIN_API_QUOTA_PATH_SELECTION` | Not provided |
| `PUMPKIN_API_DEPLOY_RETRY_APPROVED` | Not provided |
| `PUMPKIN_API_RESOURCE_MUTATION_APPROVED` | Not provided |
| `PUMPKIN_API_CONTACT_POST_APPROVED` | `false` |
| `PUMPKIN_API_APPSETTING_APPROVED` | Not provided |

## Ticket Show Result

Ticket name:

`PumpkinApiEastUSAppServiceQuotaIncrease-20260627120242`

Result:

```text
ResourceNotFound
```

## Ticket List Result

The read-only ticket list returned:

```json
[]
```

## Status

| Field | Value |
| --- | --- |
| Ticket visible through CLI | No |
| Ticket status | Not found through CLI |
| Approval confirmed | No |
| Readiness status | Blocked |

The ticket may still exist outside the CLI-visible result set, but V2.8.32F did not confirm approval.
