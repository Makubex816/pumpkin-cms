# Local No-Email Test Result

Generated: 2026-06-05

## Commands

Run from:

```text
deployment/static-azure/forms/static-form-endpoint/
```

Results:

| Command | Exit | Result |
| --- | --- | --- |
| `npm run check` | 0 | pass |
| `npm test` | 0 | pass |

## Existing Handler Tests Confirm

- frontend `staticEndpointRef` and `leadRecipientRef` aliases are accepted
- legacy `domainRoutingKey` and `recipientGroup` payloads work
- missing routing and recipient fields default safely
- invalid email is rejected
- oversized message is rejected
- filled honeypot is rejected
- unknown routing and recipient refs are rejected without echoing submitted values
- script-like message values are sanitized before mocked backend forwarding

## New Wrapper Tests Confirm

- primary deployable route is `/api/static-contact`
- deployed `/api/contact` compatibility is not registered
- `OPTIONS` preflight returns expected CORS headers for an approved origin
- frontend alias payload succeeds in `dry-run` no-email mode
- legacy payload succeeds through the primary wrapper route
- invalid email is rejected
- unknown routing ref is rejected without echoing the submitted value
- unknown recipient ref is rejected without echoing the submitted value
- oversized message is rejected
- filled honeypot is rejected
- validation responses do not expose the test API key value

## Email Boundary

Tests use mocked or `STATIC_FORM_FORWARD_MODE=dry-run` behavior only.

No real email was sent. No Microsoft 365 settings were touched. No Pumpkin API request was made by the new wrapper tests.
