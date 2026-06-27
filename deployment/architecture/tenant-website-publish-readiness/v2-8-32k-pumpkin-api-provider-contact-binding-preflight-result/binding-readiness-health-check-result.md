# Binding Readiness Health Check Result

Only the approved GET readiness URLs were checked after Static Web App binding.

| URL | HTTP status | Body result |
| --- | ---: | --- |
| `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health` | 200 | `ok:true`, `service:pumpkin-api`, `providerStatus:not_checked` |
| `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health` | 200 | `ok:true`, `service:pumpkin-api`, `providerStatus:not_checked` |
| `https://iceskatingrinkrentals.com/api/static-contact-health` | 200 | `ok:true`, `service:static-contact`, `route:/api/static-contact-health`, `contactRoute:/api/static-contact` |

No other outbound URLs were checked.

The static health endpoint is not delivery-mode introspective. It proves the deployed static contact function health sentinel is reachable, not that a FormEntry write has succeeded.
