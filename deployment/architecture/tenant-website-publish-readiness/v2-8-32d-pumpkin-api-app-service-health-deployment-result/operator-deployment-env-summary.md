# Operator Deployment Env Summary

All approved V2.8.32D operator deployment env values were present.

| Env var | Observed value |
| --- | --- |
| `PUMPKIN_API_LIVE_TARGET_RESOURCE_GROUP` | `rg-pumpkin-api-prod-eastus` |
| `PUMPKIN_API_LIVE_TARGET_PLAN` | `asp-pumpkin-api-prod-eastus-001` |
| `PUMPKIN_API_LIVE_TARGET_WEBAPP` | `app-pumpkin-api-prod-eastus-001` |
| `PUMPKIN_API_LIVE_TARGET_REGION` | `eastus` |
| `PUMPKIN_API_LIVE_TARGET_BASE_URL` | `https://app-pumpkin-api-prod-eastus-001.azurewebsites.net` |
| `PUMPKIN_API_HEALTH_ROUTE` | `/api/health` |
| `PUMPKIN_API_ROOT_HEALTH_ROUTE` | `/health` |
| `PUMPKIN_API_ARTIFACT_SOURCE` | `.tmp/v2-8-32c/pumpkin-api.zip` |
| `PUMPKIN_API_RG_CREATE_APPROVED` | `true` |
| `PUMPKIN_API_PLAN_CREATE_APPROVED` | `true` |
| `PUMPKIN_API_WEBAPP_CREATE_APPROVED` | `true` |
| `PUMPKIN_API_ZIP_DEPLOY_APPROVED` | `true` |
| `PUMPKIN_API_PROTECTED_CONFIG_APPROVED` | `false` |
| `PUMPKIN_API_APPSETTING_SECRET_BINDING_APPROVED` | `false` |
| `PUMPKIN_API_CONTACT_POST_APPROVED` | `false` |
| `PUMPKIN_API_DNS_APPROVED` | `false` |
| `PUMPKIN_API_INDEXING_APPROVED` | `false` |

The env values matched the planned V2.8.32D target and preserved the protected/contact/DNS/indexing hard stops.

