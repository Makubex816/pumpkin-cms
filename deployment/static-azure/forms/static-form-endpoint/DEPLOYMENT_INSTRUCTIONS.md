# Static Form Endpoint Deployment Instructions

These are future instructions only. No endpoint was deployed by this package update.

## Future Deployment Shape

Recommended public endpoint:

```text
https://<approved-form-endpoint-host>/api/static-contact
```

Compatibility path if the current Azure Function wrapper route is used unchanged:

```text
https://<approved-form-endpoint-host>/api/contact
```

## Future Steps After Explicit Approval

1. Confirm the endpoint host and route.
2. Keep the first Ice execution scoped to `ice-rink-rentals`.
3. Configure allowed origins only for approved Ice hosts.
4. Configure server-side Pumpkin API settings in approved secret storage only.
5. Run `npm run check` and `npm test` locally.
6. Deploy or configure the endpoint only after approval.
7. Submit approved test-only payloads.
8. Verify `FormEntry` persistence through the approved backend path.
9. Confirm no secrets appear in responses, logs, or static output.
10. Keep email notifications disabled unless separately approved.
11. Set `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` for static build only after the public endpoint URL is real.
12. Set `STATIC_FORM_ENDPOINT_VERIFIED=true` only after endpoint/backend verification passes.
13. Rerun Ice static export and strict validators.

## Required Future Settings

Frontend/static build:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://<approved-form-endpoint-host>/api/static-contact
STATIC_FORM_ENDPOINT_VERIFIED=true
```

Endpoint runtime app settings:

```text
PUMPKIN_API_URL=<approved Pumpkin API URL>
ICE_RINK_RENTALS_API_KEY=<server-side secret>
STATIC_FORM_ALLOWED_ORIGINS=https://iceskatingrinkrentals.com,https://www.iceskatingrinkrentals.com
STATIC_FORM_ALLOWED_SITE_KEYS=ice-rink-rentals
STATIC_FORM_FORWARD_MODE=pumpkin-api
STATIC_FORM_MAX_BODY_BYTES=20000
STATIC_FORM_MAX_MESSAGE_LENGTH=4000
STATIC_FORM_RATE_LIMIT_MODE=<approved mode>
STATIC_FORM_SPAM_PROTECTION_MODE=<approved mode>
ICE_RINK_RENTALS_STATIC_FORM_ENDPOINT_KEY=ice-rink-rentals-default
```

Do not put Pumpkin API keys, email credentials, connection strings, tokens, or provider secrets in frontend/static build settings.

## Approval Boundaries

Separate explicit approval is required before:

- endpoint deployment
- Azure resource creation
- Azure Function deployment
- production environment variable changes
- setting `STATIC_FORM_ENDPOINT_VERIFIED=true`
- sending email
- Microsoft 365 changes
- Cloudflare or DNS changes
- CMS writes
- MediaAsset writes
- static site deployment
- Roller work

