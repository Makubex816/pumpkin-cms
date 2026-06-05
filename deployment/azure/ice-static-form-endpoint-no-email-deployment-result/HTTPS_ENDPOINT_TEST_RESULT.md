# HTTPS Endpoint Test Result

Generated: 2026-06-05

Endpoint:

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

## Results

| Test | Status | Result |
| --- | --- | --- |
| `OPTIONS` approved origin | 204 | pass, `Access-Control-Allow-Origin` matched `https://iceskatingrinkrentals.com` |
| valid frontend-style payload | 200 | pass, dry-run accepted |
| valid legacy payload | 200 | pass, dry-run accepted |
| invalid email | 400 | pass, safe validation error |
| unknown routing ref | 400 | pass, rejected without echoing submitted value |
| unknown recipient ref | 400 | pass, rejected without echoing submitted value |
| oversized message | 400 | pass, safe validation error |
| filled honeypot | 400 | pass, safe validation error |
| unapproved origin | 400 | pass, no allow-origin header |

## Response Safety

Success responses returned:

```json
{
  "ok": true,
  "message": "Your request was submitted.",
  "entryId": "<generated test entry id>"
}
```

Validation responses returned safe validation messages and did not echo the unknown routing or recipient submitted values.

No real email was sent.

No Pumpkin API persistence occurred because the endpoint is in `dry-run` mode.
