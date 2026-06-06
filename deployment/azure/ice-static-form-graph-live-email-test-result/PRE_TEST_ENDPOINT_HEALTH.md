# Pre-Test Endpoint Health

Generated: 2026-06-06

Mode before live test:

```text
FORM_DELIVERY_MODE=no-email
```

Safe checks before switching to graph:

| Test | Expected | Actual | Passed |
| --- | --- | --- | --- |
| OPTIONS/CORS | 204 | 204 | yes |
| invalid email | 400 | 400 | yes |
| unknown routing/recipient | 400 | 400 | yes |
| honeypot | 400 | 400 | yes |
| response secret-pattern scan | clean | clean | yes |

Valid payloads attempted in this phase:

```text
0
```

