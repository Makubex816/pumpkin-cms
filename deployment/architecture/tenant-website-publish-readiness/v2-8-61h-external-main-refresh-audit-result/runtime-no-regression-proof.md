# Runtime No-Regression Proof

Status: pass.

Method: bounded GET-only checks. No POST or form submission occurred.

| URL | Status | Content type |
| --- | --- | --- |
| `https://iceskatingrinkrentals.com/` | 200 | `text/html` |
| `https://iceskatingrinkrentals.com/contact` | 200 | `text/html` |
| `https://iceskatingrinkrentals.com/service-areas` | 200 | `text/html` |
| `https://iceskatingrinkrentals.com/api/static-contact-health` | 200 | `application/json` |
| `https://www.iceskatingrinkrentals.com/` | 200 | `text/html` |
| `https://www.iceskatingrinkrentals.com/contact` | 200 | `text/html` |
| `https://www.iceskatingrinkrentals.com/service-areas` | 200 | `text/html` |
| `https://www.iceskatingrinkrentals.com/api/static-contact-health` | 200 | `application/json` |
| `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health` | 200 | `application/json` |
| `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health` | 200 | `application/json` |
| `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/` | 200 | `text/html` |
| `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/login` | 200 | `text/html` |
| `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/dashboard` | 200 | `text/html` |
| `https://app-airstrip-prod-centralus-001.azurewebsites.net/` | 200 | `text/html` |
| `https://app-airstrip-prod-centralus-001.azurewebsites.net/request-booking` | 200 | `text/html` |
| `https://app-airstrip-prod-centralus-001.azurewebsites.net/packages` | 200 | `text/html` |
| `https://app-airstrip-prod-centralus-001.azurewebsites.net/airstrip-the-club` | 200 | `text/html` |

Conclusion: the read-only audit caused no runtime regression. Airstrip remains healthy on the production default host.
