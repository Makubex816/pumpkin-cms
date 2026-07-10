# Runtime No-Regression Proof

Method: GET only. Airstrip was not probed.

Summary: `23/23` checks returned HTTP `200`.

| Group | Checks | Result |
| --- | ---: | --- |
| Ice apex | 4 | all HTTP 200 |
| Ice www | 4 | all HTTP 200 |
| Pumpkin API health | 2 | all HTTP 200 |
| Admin UI production | 3 | all HTTP 200 |
| Starter default host | 1 | HTTP 200 |
| Party Pros HTTPS custom domains | 6 | all HTTP 200 |
| Party Pros preview routes | 3 | all HTTP 200 |

Party Pros preview contact no-post readback:

| Check | Result |
| --- | ---: |
| Form count | 1 |
| `method="post"` count | 0 |
| Form action count | 0 |
| `/api/forms/submit` references | 0 |

No form submission occurred.

