# Live Health Check Result

Live health verification was limited to the two approved GET routes on the selected host.

| Method | URL | Status | Body |
| --- | --- | --- | --- |
| GET | `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health` | `500 Internal Server Error` | empty |
| GET | `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health` | `500 Internal Server Error` | empty |

Result: health gate failed.

The deployment pipeline is no longer blocked by HTTP `400`, but the live process is not returning healthy responses.
