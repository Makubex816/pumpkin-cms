# Next Phase Prompt

Approve V2.8.32 Isolated Staging Protected Binding And Admin Persistence Validation only.

Approved scope for V2.8.32:

- Use the V2.8.31 protected binding contract.
- Bind the isolated staging target with the exact non-secret and protected app-setting names.
- Do not print, list, show, or expose protected values.
- Deploy only to an isolated staging target after app-setting binding approval.
- Send exactly one isolated no-PII contact POST only after isolated deployment approval.
- Confirm the returned `entryId` is visible in Admin through the same backend/store.
- Keep production deployment and production POST blocked.

Required binding names:

- `FORM_DELIVERY_MODE=pumpkin-api`
- `PUMPKIN_API_URL=<same Pumpkin API backend Admin reads>`
- `PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE=/api/forms/ice-rink-rentals/entries`
- `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME=PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`
- `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY=<protected Ice tenant API key value>`
- `STATIC_FORM_ALLOWED_SITE_KEYS=ice-rink-rentals`
- `STATIC_FORM_ALLOWED_ORIGINS=<approved isolated staging origin>`

Not approved without separate explicit approval:

- Production deployment.
- Production contact POST.
- Azure app settings list/show.
- Printing protected values.
- Inbox/provider login.
- DNS/custom-domain/indexing changes.

