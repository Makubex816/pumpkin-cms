# Starter Live Host Runtime Proof

Fresh OI readback used GET only.

Azure readback:

| Field | Value |
| --- | --- |
| App Service | `app-pumpkin-starter-preview-centralus-001` |
| Resource group | `rg-pumpkin-api-prod-centralus` |
| State | Running |
| Kind | `app,linux` |
| Default host | `app-pumpkin-starter-preview-centralus-001.azurewebsites.net` |
| Host names | `app-pumpkin-starter-preview-centralus-001.azurewebsites.net` |
| App Service plan | `asp-pumpkin-api-prod-centralus-001` |

Appsetting names read back without values:

- `NEXT_PUBLIC_PUMPKIN_API_URL`
- `PUMPKIN_API_URL`
- `PUMPKIN_SITE_NAME`
- `NEXT_TELEMETRY_DISABLED`
- `PORT`
- `WEBSITES_PORT`

`PUMPKIN_TENANT_ID` and `PUMPKIN_API_KEY` were not present in the name-only readback.

Route proof:

| Route | Method | Status | Location | Bytes | Result |
| --- | --- | ---: | --- | ---: | --- |
| `/` | GET | 200 | | 32616 | pass |
| `/admin/login` | GET | 200 | | 6367 | pass |
| `/admin` | GET | 307 | `/admin/login` | 12024 | pass |

The starter default host exists and is reachable. It remains the shared starter host, not a Party Pros-bound preview host.

