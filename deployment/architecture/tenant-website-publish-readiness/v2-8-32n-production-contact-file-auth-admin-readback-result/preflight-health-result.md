# Preflight Health Result

Run timestamp: `2026-06-27T21:58:35.7809657-04:00`.

| Check | Status | OK | Public-safe body summary |
| --- | ---: | --- | --- |
| Pumpkin API `/health` | `200` | yes | `ok:True; service:pumpkin-api; version:1.0.0.0; environment:Production; providerConfigured:False; providerStatus:not_checked` |
| Pumpkin API `/api/health` | `200` | yes | `ok:True; service:pumpkin-api; version:1.0.0.0; environment:Production; providerConfigured:False; providerStatus:not_checked` |
| Static contact health | `200` | yes | `ok:True; service:static-contact; route:/api/static-contact-health; contactRoute:/api/static-contact; programmingModel:azure-functions-v3-function-json` |
| Contact page | `200` | yes | HTML body length `70685` |

Health preflight result: passed.

