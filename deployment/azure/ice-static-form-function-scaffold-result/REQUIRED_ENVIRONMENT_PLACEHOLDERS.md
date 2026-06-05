# Required Environment Placeholders

Generated: 2026-06-05

No secret values were read or printed.

## Function Runtime Placeholders

Store these as Function App settings or approved secret-store values in a future deployment:

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

Local no-email validation may use:

```text
STATIC_FORM_FORWARD_MODE=dry-run
```

Dry-run mode does not prove backend persistence and must not be used to mark production readiness `yes`.

## Static Build Placeholders

Future static build after endpoint/backend verification:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://<approved-form-endpoint-host>/api/static-contact
STATIC_FORM_ENDPOINT_VERIFIED=true
```

Do not set these in production/static build environments until the deployed endpoint passes the verification contract under separate approval.

## Local Settings Sample

`local.settings.sample.json` contains placeholders only.

Do not commit:

- real `local.settings.json`
- real API keys
- tokens
- connection strings
- email credentials
- Microsoft 365 credentials
