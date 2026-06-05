# Mocked Test Result

Generated: 2026-06-05

## Commands

Run from:

```text
deployment/static-azure/forms/static-form-endpoint
```

Results:

| Command | Exit | Result |
| --- | --- | --- |
| `npm run check` | 0 | pass |
| `npm test` | 0 | pass |

## Graph Test Coverage

`test-graph-send-mail-delivery.mjs` covers:

- dry-run remains the default
- default dry-run performs no fetch call
- `FORM_DELIVERY_MODE=graph` fails safely when Graph placeholders are missing
- mocked token request uses client credentials shape
- mocked sendMail request posts to `/users/contact%40iceskatingrinkrentals.com/sendMail`
- mocked Graph `202` returns the normal safe success response
- token failure returns generic public failure
- invalid email rejects before delivery
- unknown routing ref rejects before delivery
- unknown recipient ref rejects before delivery
- honeypot rejects before delivery
- frontend aliases still work
- legacy `domainRoutingKey`/`recipientGroup` still work

No real token was requested. No real email was sent.

