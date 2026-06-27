# Live Health Check Result

Live health verification after the single I deployment was limited to the two approved GET routes.

| Method | URL | Status | Body |
| --- | --- | --- | --- |
| GET | `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health` | `500 Internal Server Error` | empty |
| GET | `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health` | `500 Internal Server Error` | empty |

Result: live health gate failed.

Local no-secret health passed only after the later null-safe JWT source fix, which was not deployed in I.
