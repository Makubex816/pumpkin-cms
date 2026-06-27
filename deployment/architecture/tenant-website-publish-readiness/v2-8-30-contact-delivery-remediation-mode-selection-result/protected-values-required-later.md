# Protected Values Required Later

This phase did not read, list, show, infer, or validate protected values.

The next gated implementation/binding phase requires these settings by name and purpose:

- `PUMPKIN_API_URL`: Pumpkin API base URL for the same backend/provider the Admin Lead Inbox reads.
- `ICE_RINK_RENTALS_API_KEY`: protected tenant API key used by the static compat function to call Pumpkin API for `ice-rink-rentals`.
- `FORM_DELIVERY_MODE`: app setting value that must resolve the compat function to `pumpkin-api`.
- `STATIC_FORM_ALLOWED_SITE_KEYS`: app setting that should allow `ice-rink-rentals` if site-key narrowing is used.
- `STATIC_FORM_ALLOWED_ORIGINS`: app setting that should allow approved Ice production and staging origins.

Future optional dual-delivery protected settings:

- Graph tenant/client/sender settings are not required for Admin persistence.
- Email provider credentials are future-gated and should not be used to close the Admin visibility gate.

Boundary:

No values for protected settings are included here. Only setting names and purposes are recorded.
