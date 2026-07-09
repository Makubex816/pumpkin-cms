# Pumpkin Starter Live Host Runtime Proof V2.8.61OI

Status: passed.

The existing starter live host was read back without deploy, redeploy, appsetting mutation, or resource creation.

| Field | Value |
| --- | --- |
| Host | `https://app-pumpkin-starter-preview-centralus-001.azurewebsites.net` |
| App Service | `app-pumpkin-starter-preview-centralus-001` |
| Resource group | `rg-pumpkin-api-prod-centralus` |
| State | Running |
| Kind | `app,linux` |
| App Service plan | `asp-pumpkin-api-prod-centralus-001` |

Route proof:

| Route | Method | Status | Result |
| --- | --- | ---: | --- |
| `/` | GET | 200 | pass |
| `/admin/login` | GET | 200 | pass |
| `/admin` | GET | 307 to `/admin/login` | pass |

Appsetting name-only readback showed no `PUMPKIN_TENANT_ID` and no `PUMPKIN_API_KEY`, so the host remains unbound to Party Pros.

Non-Airstrip runtime no-regression passed 14/14.

