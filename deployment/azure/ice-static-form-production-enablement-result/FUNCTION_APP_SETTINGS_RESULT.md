# Function App Settings Result

Generated: 2026-06-06

## Target

| Field | Value |
| --- | --- |
| Function App | `func-ice-static-contact-20260605` |
| Resource group | `rg-ice-static-form-endpoint` |
| Endpoint | `https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact` |

## Approved Changes

Only the approved Function App settings were changed:

| Setting | Result |
| --- | --- |
| `FORM_DELIVERY_MODE` | `graph` |
| `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` | approved endpoint URL |
| `STATIC_FORM_ENDPOINT_VERIFIED` | `true` |

No endpoint redeploy occurred. No Azure resources were created.

## Readback

Readback confirmed the expected categories without printing secret values:

| Check | Result |
| --- | --- |
| delivery mode | `graph` |
| approved endpoint URL present | yes |
| approved endpoint URL matches | yes |
| endpoint verified flag | `true` |
| `MICROSOFT_GRAPH_TENANT_ID` present | yes |
| `MICROSOFT_GRAPH_CLIENT_ID` present | yes |
| `MICROSOFT_GRAPH_CLIENT_SECRET` present | yes |
| `MICROSOFT_GRAPH_SENDER_USER` present | yes |
| `ICE_RINK_RENTALS_LEAD_RECIPIENT` present | yes |

Secret values were not printed.

