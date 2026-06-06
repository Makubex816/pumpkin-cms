# Pre-Settings Health Check

Generated: 2026-06-06

Endpoint:

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

Safe checks before Graph settings were added:

| Test | Expected | Actual | Passed |
| --- | --- | --- | --- |
| OPTIONS/CORS | 204 | 204 | yes |
| invalid email | 400 | 400 | yes |
| unknown routing/recipient | 400 | 400 | yes |
| honeypot | 400 | 400 | yes |
| response secret-pattern scan | clean | clean | yes |

A valid payload was not run in this phase because the setup scope required avoiding any accidental live send boundary crossing.

