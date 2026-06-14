# API Runtime GET Verification Result

Local Pumpkin API runtime verification passed with dummy local JWT settings and `ASPNETCORE_ENVIRONMENT=Production`.

Endpoint results:

| Endpoint | HTTP | Provider | Count | Open flags |
| --- | ---: | --- | ---: | ---: |
| `/viewer-summary` | 200 | `api-local-fixture-readonly` | 11 audit events in summary | 0 |
| `/events` | 200 | `api-local-fixture-readonly` | 11 | 0 |
| `/job-runs` | 200 | `api-local-fixture-readonly` | 9 | 0 |
| `/promotion-gates` | 200 | `api-local-fixture-readonly` | 11 | 0 |
| `/evidence-bindings` | 200 | `api-local-fixture-readonly` | 13 | 0 |
| `/traces` | 200 | `api-local-fixture-readonly` | 107 | 0 |
| `/blockers` | 200 | `api-local-fixture-readonly` | 0 | 0 |
| `/next-gates` | 200 | `api-local-fixture-readonly` | 2 | 0 |

All responses had `ok: true`, `readOnly: true`, `localOnly: true`, and zero open flags.

No protected config or real connection material was read or supplied. Temporary runtime logs were removed after verification.
