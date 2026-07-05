# Runtime No-Regression Proof

Status: passed for GET route health.

All checks were GET-only. No contact POST or form submission occurred.

| Target | Status |
| --- | ---: |
| `https://iceskatingrinkrentals.com/` | 200 |
| `https://iceskatingrinkrentals.com/contact` | 200 |
| `https://iceskatingrinkrentals.com/service-areas` | 200 |
| `https://iceskatingrinkrentals.com/api/static-contact-health` | 200 |
| `https://www.iceskatingrinkrentals.com/` | 200 |
| `https://www.iceskatingrinkrentals.com/contact` | 200 |
| `https://www.iceskatingrinkrentals.com/service-areas` | 200 |
| `https://www.iceskatingrinkrentals.com/api/static-contact-health` | 200 |
| `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health` | 200 |
| `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health` | 200 |
| `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/` | 200 |
| `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/login` | 200 |
| `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/dashboard` | 200 |
| `https://app-airstrip-prod-centralus-001.azurewebsites.net/` | 200 |
| `https://app-airstrip-prod-centralus-001.azurewebsites.net/request-booking` | 200 |
| `https://app-airstrip-prod-centralus-001.azurewebsites.net/packages` | 200 |
| `https://app-airstrip-prod-centralus-001.azurewebsites.net/airstrip-the-club` | 200 |

Note: HTTP route health passed independently of the responsive overflow blocker on `/airstrip-the-club`.
