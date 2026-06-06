# Pre-Redeploy Endpoint Health

Generated: 2026-06-05

Endpoint:

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

| Check | Status | Result |
| --- | --- | --- |
| `OPTIONS` approved origin | 204 | pass |
| valid frontend dry-run payload | 200 | pass |
| valid legacy dry-run payload | 200 | pass |
| invalid email | 400 | pass |
| unknown routing | 400 | pass |
| unknown recipient | 400 | pass |
| oversized message | 400 | pass |
| honeypot | 400 | pass |
| unapproved origin | 400 | pass |
| secret-pattern response scan | none | pass |

No real email was sent.

