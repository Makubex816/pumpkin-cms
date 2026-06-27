# Static Contact Pumpkin API Mode Analysis

The static compat handler supports `pumpkin-api` mode.

Relevant source findings:

- `deliverStaticFormEntry` forwards to Pumpkin API only when `getDeliveryMode` resolves to `pumpkin-api`.
- `FORM_DELIVERY_MODE=pumpkin-api` is the direct source-supported mode selector.
- `PUMPKIN_API_URL` is required and must be an absolute HTTP(S) URL.
- The protected key env name is selected by `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME` or the site default.
- The Ice site default key name is `ICE_RINK_RENTALS_API_KEY`, but this phase's operator-provided protected value is `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`, so the env-name pointer is required.
- `PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE` can be set as an explicit route guard and must equal `/api/forms/ice-rink-rentals/entries`.

Local static compat tests passed, including:

- `pumpkin-api mode forwards valid FormEntry payload and returns Pumpkin entry id`
- missing base URL fails before persistence
- missing protected key fails before persistence
- mismatched Ice form ID is rejected before persistence

Production binding applied the exact source-confirmed settings for this mode.
