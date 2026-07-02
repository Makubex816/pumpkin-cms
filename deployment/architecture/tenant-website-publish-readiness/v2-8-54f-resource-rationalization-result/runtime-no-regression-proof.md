# Runtime No Regression Proof

GET-only checks: 14/14 passed after bounded GET-only recheck.

Initial pass: 12/14 passed. The apex `/contact` and apex `/api/static-contact-health` requests timed out on the first pass while the www and isolated equivalents returned HTTP 200.

Bounded recheck:

| attempt | url | ok | finalStatus | elapsedMs | error |
| --- | --- | --- | --- | --- | --- |
| 1 | https://iceskatingrinkrentals.com/contact | true | 200 | 676 |  |
| 1 | https://iceskatingrinkrentals.com/api/static-contact-health | false |  | 30008 | timeout |
| 2 | https://iceskatingrinkrentals.com/contact | true | 200 | 797 |  |
| 2 | https://iceskatingrinkrentals.com/api/static-contact-health | true | 200 | 386 |  |

| url | ok | finalStatus | redirects | finalUrl | error |
| --- | --- | --- | --- | --- | --- |
| https://iceskatingrinkrentals.com/ | true | 200 | 0 | https://iceskatingrinkrentals.com/ |  |
| https://iceskatingrinkrentals.com/contact | false |  | 0 |  | timeout |
| https://iceskatingrinkrentals.com/service-areas | true | 200 | 0 | https://iceskatingrinkrentals.com/service-areas |  |
| https://iceskatingrinkrentals.com/api/static-contact-health | false |  | 0 |  | timeout |
| https://www.iceskatingrinkrentals.com/ | true | 200 | 0 | https://www.iceskatingrinkrentals.com/ |  |
| https://www.iceskatingrinkrentals.com/contact | true | 200 | 0 | https://www.iceskatingrinkrentals.com/contact |  |
| https://www.iceskatingrinkrentals.com/service-areas | true | 200 | 0 | https://www.iceskatingrinkrentals.com/service-areas |  |
| https://www.iceskatingrinkrentals.com/api/static-contact-health | true | 200 | 0 | https://www.iceskatingrinkrentals.com/api/static-contact-health |  |
| https://kind-island-0a85a740f.7.azurestaticapps.net/api/static-contact-health | true | 200 | 0 | https://kind-island-0a85a740f.7.azurestaticapps.net/api/static-contact-health |  |
| https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health | true | 200 | 0 | https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health |  |
| https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health | true | 200 | 0 | https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health |  |
| https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/ | true | 200 | 0 | https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/ |  |
| https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/login | true | 200 | 0 | https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/login |  |
| https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/dashboard | true | 200 | 0 | https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/dashboard |  |

No contact POST or form submission was sent.
