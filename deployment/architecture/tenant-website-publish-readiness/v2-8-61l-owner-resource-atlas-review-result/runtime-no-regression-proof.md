# Runtime No-Regression Proof

Status: passed.

Rules:

- GET-only.
- Non-Airstrip only.
- No contact POST.
- No form submission.

| URL | method | status | result |
| --- | --- | ---: | --- |
| https://iceskatingrinkrentals.com/ | GET | 200 | pass |
| https://iceskatingrinkrentals.com/contact | GET | 200 | pass |
| https://iceskatingrinkrentals.com/service-areas | GET | 200 | pass |
| https://iceskatingrinkrentals.com/api/static-contact-health | GET | 200 | pass |
| https://www.iceskatingrinkrentals.com/ | GET | 200 | pass |
| https://www.iceskatingrinkrentals.com/contact | GET | 200 | pass |
| https://www.iceskatingrinkrentals.com/service-areas | GET | 200 | pass |
| https://www.iceskatingrinkrentals.com/api/static-contact-health | GET | 200 | pass |
| https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health | GET | 200 | pass |
| https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health | GET | 200 | pass |
| https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/ | GET | 200 | pass |
| https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/login | GET | 200 | pass |
| https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/dashboard | GET | 200 | pass |

Summary: 13/13 passed.

No Airstrip route probe occurred.
