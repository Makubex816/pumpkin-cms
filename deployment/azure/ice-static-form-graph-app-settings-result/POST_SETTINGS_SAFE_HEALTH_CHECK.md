# Post-Settings Safe Health Check

Generated: 2026-06-06

Endpoint:

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

Safe checks after Graph settings were added and no-send mode was confirmed:

| Test | Expected | Actual | Passed |
| --- | --- | --- | --- |
| OPTIONS/CORS | 204 | 204 | yes |
| valid no-send payload | 200 | 200 | yes |
| invalid email | 400 | 400 | yes |
| unknown routing/recipient | 400 | 400 | yes |
| honeypot | 400 | 400 | yes |
| response secret-pattern scan | clean | clean | yes |

No real email was sent because `FORM_DELIVERY_MODE=no-email`.

