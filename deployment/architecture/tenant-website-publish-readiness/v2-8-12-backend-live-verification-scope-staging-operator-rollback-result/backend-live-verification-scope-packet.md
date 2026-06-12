# Backend Live Verification Scope Packet

Status: ready for future approval; not executed.

Endpoint:

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

Future method:

```text
POST application/json
```

Approved-in-this-phase checks:

- `OPTIONS` only for candidate origins;
- no body;
- no payload;
- no POST.

Future single-POST dry-run verification proposal:

| Field | Value |
| --- | --- |
| Origin | `https://happy-mud-0b375e20f.7.azurestaticapps.net` |
| Alternate approved origin | `https://ice-dev.iceskatingrinkrentals.com` |
| Endpoint mode | current no-email `dry-run` unless a future approval changes it |
| Expected response | `200` JSON with `ok: true`, public success message, and non-secret `entryId` |
| Expected side effect | no email, no Pumpkin API write, no CMS write, no provider data write |
| Required evidence | status code, redacted response shape, CORS headers, timestamp, endpoint URL, origin used |
| Abort criteria | any non-2xx, exposed secret, unexpected delivery side effect, wrong tenant/site, CORS mismatch, or retry pressure |

Real email or Pumpkin API persistence verification is a separate stronger boundary and requires Microsoft 365, Azure Function setting, endpoint redeploy, and owner workflow approvals.

