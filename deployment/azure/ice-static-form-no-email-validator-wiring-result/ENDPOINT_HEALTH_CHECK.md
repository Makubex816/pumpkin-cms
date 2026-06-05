# Endpoint Health Check

Generated: 2026-06-05

Endpoint:

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

## Results

| Test | Status | Result |
| --- | --- | --- |
| `OPTIONS` approved origin | 204 | pass |
| valid frontend-style payload | 200 | pass |
| invalid email | 400 | pass |
| unknown routing ref | 400 | pass |
| honeypot | 400 | pass |

The valid frontend-style payload used:

```text
staticEndpointRef=ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT
leadRecipientRef=ICE_RINK_RENTALS_LEAD_RECIPIENT
```

## Response Safety

The success response returned only:

```text
ok, message, entryId
```

Validation responses did not echo the unknown routing value.

No real email was sent because the endpoint is deployed in `dry-run` no-email mode.
