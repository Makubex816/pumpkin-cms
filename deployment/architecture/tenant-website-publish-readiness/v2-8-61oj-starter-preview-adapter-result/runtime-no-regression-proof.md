# Runtime No-Regression Proof

Status: passed.

Method: GET-only.

Airstrip included: no.

| Check | URL | Status | Bytes |
| --- | --- | ---: | ---: |
| ice-apex-home | `https://iceskatingrinkrentals.com/` | 200 | 55026 |
| ice-apex-contact | `https://iceskatingrinkrentals.com/contact` | 200 | 70690 |
| ice-apex-service-areas | `https://iceskatingrinkrentals.com/service-areas` | 200 | 54916 |
| ice-apex-static-contact-health | `https://iceskatingrinkrentals.com/api/static-contact-health` | 200 | 187 |
| ice-www-home | `https://www.iceskatingrinkrentals.com/` | 200 | 55026 |
| ice-www-contact | `https://www.iceskatingrinkrentals.com/contact` | 200 | 70690 |
| ice-www-service-areas | `https://www.iceskatingrinkrentals.com/service-areas` | 200 | 54916 |
| ice-www-static-contact-health | `https://www.iceskatingrinkrentals.com/api/static-contact-health` | 200 | 187 |
| pumpkin-api-health | `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health` | 200 | 191 |
| pumpkin-api-api-health | `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health` | 200 | 191 |
| admin-ui-home | `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/` | 200 | 4970 |
| admin-ui-login | `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/login` | 200 | 6756 |
| admin-ui-dashboard | `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/dashboard` | 200 | 5884 |
| starter-preview-home | `https://app-pumpkin-starter-preview-centralus-001.azurewebsites.net/` | 200 | 32616 |

Result: 14/14 passed.

No Airstrip probe, deploy, content/media mutation, DomainBinding mutation, DNS action, or package-output mutation occurred.
