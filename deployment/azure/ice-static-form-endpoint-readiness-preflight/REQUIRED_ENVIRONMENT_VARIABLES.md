# Required Environment Variables

No values were read or printed in this preflight.

## Static Frontend Build

Preferred public endpoint URL:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://<approved-form-endpoint-host>/api/static-contact
```

Compatibility aliases read by frontend and validators:

```text
STATIC_FORM_ENDPOINT=https://<approved-form-endpoint-host>/api/static-contact
NEXT_PUBLIC_STATIC_FORM_ACTION=https://<approved-form-endpoint-host>/api/static-contact
STATIC_FORM_ACTION=https://<approved-form-endpoint-host>/api/static-contact
```

Use only one public endpoint URL. It must be HTTPS and must not contain secrets.

Verification flag:

```text
STATIC_FORM_ENDPOINT_VERIFIED=true
```

Set this only after backend verification passes.

## Ice Form References

Current CMS/page references:

```text
ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT
ICE_RINK_RENTALS_LEAD_RECIPIENT
```

These are routing/reference keys in the Ice form content. They are not currently validator endpoint URL aliases. If a future deployment pipeline uses `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT` as an endpoint URL variable, it must map that value to `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` for the static build.

## Endpoint Runtime Settings

Server-side endpoint settings, stored in Azure Function App settings or equivalent secret storage:

```text
PUMPKIN_API_URL=<approved Pumpkin API URL>
ICE_RINK_RENTALS_API_KEY=<server-side secret>
STATIC_FORM_ALLOWED_ORIGINS=https://iceskatingrinkrentals.com,https://www.iceskatingrinkrentals.com
STATIC_FORM_ALLOWED_SITE_KEYS=ice-rink-rentals
STATIC_FORM_FORWARD_MODE=pumpkin-api
STATIC_FORM_MAX_BODY_BYTES=20000
STATIC_FORM_RATE_LIMIT_MODE=<approved mode>
STATIC_FORM_SPAM_PROTECTION_MODE=<approved mode>
ICE_RINK_RENTALS_STATIC_FORM_ENDPOINT_KEY=ice-rink-rentals-default
```

Local validation-only mode may use:

```text
STATIC_FORM_FORWARD_MODE=dry-run
```

Dry-run mode must not be used to mark production readiness yes.

## Email/Microsoft 365 Placeholders

Email sending is separate and was not approved.

Potential future placeholders, if email notification work is approved:

```text
ICE_RINK_RENTALS_LEAD_RECIPIENT=<approved recipient/routing key>
EMAIL_PROVIDER_MODE=<approved provider>
EMAIL_FROM_ADDRESS=<approved sender>
EMAIL_TO_ADDRESS=<approved recipient>
```

Do not store SMTP credentials, Graph credentials, mailbox credentials, tokens, or connection strings in static frontend env vars or repo files.

