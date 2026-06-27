# Live Health Check Result

Live health verification was limited to the two approved GET routes.

| Method | URL | Status | Content type | Provider status |
| --- | --- | --- | --- | --- |
| GET | `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health` | `200 OK` | `application/json; charset=utf-8` | `not_checked` |
| GET | `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health` | `200 OK` | `application/json; charset=utf-8` | `not_checked` |

Result: health gate passed.

No other outbound URLs were checked.
