# Azure Function Redeploy Result

Generated: 2026-06-05

## Target

```text
Resource group: rg-ice-static-form-endpoint
Function App: func-ice-static-contact-20260605
Route: /api/static-contact
```

## Azure CLI Context

Azure CLI was available and logged into an enabled default subscription.

Existing resource checks:

| Resource | Result |
| --- | --- |
| `rg-ice-static-form-endpoint` | found, succeeded |
| `func-ice-static-contact-20260605` | found, running |

## Redeploy

Method:

```text
az functionapp deployment source config-zip
```

Result:

| Field | Value |
| --- | --- |
| deployment id | `5989b4ef54af46c2b3d0a2e3de49c9b7` |
| status | `4` |
| active | `true` |
| complete | `true` |
| end time | `2026-06-05T23:52:36.9025832Z` |

No new Azure resources were created. No Azure resources were deleted. No app settings were changed to Graph mode.

## Indexed Function

Azure reported:

```text
func-ice-static-contact-20260605/static-contact
```

Invoke URL:

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

