# Runtime No-Regression Proof

GET-only runtime proof after Pumpkin API deploy and alias proof:

| URL | Status |
| --- | --- |
| `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health` | 200 |
| `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health` | 200 |
| `https://iceskatingrinkrentals.com/` | 200 |
| `https://iceskatingrinkrentals.com/contact` | 200 |
| `https://iceskatingrinkrentals.com/service-areas` | 200 |
| `https://iceskatingrinkrentals.com/api/static-contact-health` | 200 |
| `https://www.iceskatingrinkrentals.com/` | 200 |
| `https://www.iceskatingrinkrentals.com/contact` | 200 |
| `https://www.iceskatingrinkrentals.com/service-areas` | 200 |
| `https://www.iceskatingrinkrentals.com/api/static-contact-health` | 200 |
| `https://kind-island-0a85a740f.7.azurestaticapps.net/api/static-contact-health` | 200 |
| `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/` | 200 |
| `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/login` | 200 |
| `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/dashboard` | 200 |

No contact POST or public form submission was run during no-regression checks.
