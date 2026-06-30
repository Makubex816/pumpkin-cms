# Runtime No Regression Proof

GET-only checks after monitoring/storage mutations:

| URL | Status | Result |
| --- | ---: | --- |
| https://iceskatingrinkrentals.com/ | 200 | pass |
| https://iceskatingrinkrentals.com/contact | 200 | pass |
| https://iceskatingrinkrentals.com/service-areas | 200 | pass |
| https://iceskatingrinkrentals.com/api/static-contact-health | 500 | fail persistent across 3 bounded rechecks |
| https://www.iceskatingrinkrentals.com/ | 200 | pass |
| https://www.iceskatingrinkrentals.com/contact | 200 | pass |
| https://www.iceskatingrinkrentals.com/service-areas | 200 | pass |
| https://www.iceskatingrinkrentals.com/api/static-contact-health | 500 | fail persistent across 3 bounded rechecks |
| https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health | 200 | pass |
| https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health | 200 | pass |
| https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/ | 200 | pass |
| https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/login | 200 | pass |
| https://app-pumpkin-admin-isolated-centralus-001.azurewebsites.net/ | 200 | pass after cold-start retry |
| https://app-pumpkin-admin-isolated-centralus-001.azurewebsites.net/login | 200 | pass |

Classification: `runtime_no_regression_static_contact_health_failed_after_monitoring_storage_hardening`.

No contact POST was sent. No content write was performed. After static contact health returned persistent HTTP 500, no further Azure mutations were performed.
