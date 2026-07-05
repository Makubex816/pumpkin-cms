# Runtime No-Regression Proof

Status: passed.

GET-only checks:

| Target | URL | Status |
| --- | --- | --- |
| Ice apex | `https://iceskatingrinkrentals.com/` | 200 |
| Ice apex contact | `https://iceskatingrinkrentals.com/contact` | 200 |
| Ice apex service areas | `https://iceskatingrinkrentals.com/service-areas` | 200 |
| Ice www | `https://www.iceskatingrinkrentals.com/` | 200 |
| Ice www contact | `https://www.iceskatingrinkrentals.com/contact` | 200 |
| Ice www service areas | `https://www.iceskatingrinkrentals.com/service-areas` | 200 |
| Ice apex static contact health | `https://iceskatingrinkrentals.com/api/static-contact-health` | 200 |
| Ice www static contact health | `https://www.iceskatingrinkrentals.com/api/static-contact-health` | 200 |
| Pumpkin API health | `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health` | 200 |
| Pumpkin API health alias | `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health` | 200 |
| Admin UI production | `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/` | 200 |
| Admin UI production login | `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/login` | 200 |
| Admin UI production dashboard | `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/dashboard` | 200 |
| Airstrip default host | `https://app-airstrip-prod-centralus-001.azurewebsites.net/` | 200 |
| Airstrip request booking | `https://app-airstrip-prod-centralus-001.azurewebsites.net/request-booking` | 200 |
| Airstrip packages | `https://app-airstrip-prod-centralus-001.azurewebsites.net/packages` | 200 |
| Airstrip club page | `https://app-airstrip-prod-centralus-001.azurewebsites.net/airstrip-the-club` | 200 |

No contact POST or form submission occurred.
