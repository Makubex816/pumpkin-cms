# Protected Binding Contract

This phase records names only. It does not provide, read, list, show, infer, or validate protected values.

Required non-secret/public-safe app settings for the later isolated binding phase:

- `FORM_DELIVERY_MODE=pumpkin-api`
- `PUMPKIN_API_URL=<Pumpkin API base URL for the same backend Admin reads>`
- `PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE=/api/forms/ice-rink-rentals/entries`
- `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME=PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`
- `STATIC_FORM_ALLOWED_SITE_KEYS=ice-rink-rentals`
- `STATIC_FORM_ALLOWED_ORIGINS=<approved isolated staging origin only for the staging phase>`

Required protected app setting for the later isolated binding phase:

- `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY=<Ice tenant API key value, not recorded here>`

Source fallback note:

- The compat source still has the legacy site-specific `ICE_RINK_RENTALS_API_KEY` fallback through site config, but the V2.8.31 contract selects `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY` by setting `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME`.

Approval boundary:

- `PUMPKIN_CONTACT_PROTECTED_BINDING_APPROVED=false` for V2.8.31.
- A later phase must explicitly approve app-setting injection.
- A later phase must still avoid printing protected values.

