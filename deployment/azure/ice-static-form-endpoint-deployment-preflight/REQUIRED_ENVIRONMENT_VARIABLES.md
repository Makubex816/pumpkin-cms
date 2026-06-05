# Required Environment Variables

Generated: 2026-06-05

No secret values were read or printed.

## Static Frontend Build Variables

Preferred public endpoint variable:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://<approved-form-endpoint-host>/api/static-contact
```

Compatibility aliases read by the frontend and validators:

```text
STATIC_FORM_ENDPOINT=https://<approved-form-endpoint-host>/api/static-contact
NEXT_PUBLIC_STATIC_FORM_ACTION=https://<approved-form-endpoint-host>/api/static-contact
STATIC_FORM_ACTION=https://<approved-form-endpoint-host>/api/static-contact
```

Use one public endpoint URL. The value must be HTTPS and must not contain secrets.

Verification flag:

```text
STATIC_FORM_ENDPOINT_VERIFIED=true
```

Set this only after the deployed endpoint passes backend verification.

## Ice Routing And Recipient References

Current frontend/CMS references:

```text
staticEndpointRef=ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT
leadRecipientRef=ICE_RINK_RENTALS_LEAD_RECIPIENT
```

Current package mapping:

```text
staticEndpointRef -> domainRoutingKey
leadRecipientRef -> recipientGroup
```

Allowed Ice routing references:

```text
ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT
ice-rink-rentals-default
```

Allowed Ice recipient references:

```text
ICE_RINK_RENTALS_LEAD_RECIPIENT
local_admin
```

Important: `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT` is a routing reference in the payload. It is not one of the validator endpoint URL aliases. The static build still needs `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` or one of the documented aliases.

## Endpoint Runtime App Settings

Store these in Azure Function App settings or equivalent approved secret storage. Do not put them in frontend/static build variables.

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

Staging may add approved staging origins:

```text
STATIC_FORM_ALLOWED_ORIGINS=<approved staging origin>,https://iceskatingrinkrentals.com,https://www.iceskatingrinkrentals.com
```

If the first staging test must avoid Pumpkin API persistence:

```text
STATIC_FORM_FORWARD_MODE=dry-run
```

Dry-run mode can verify validation and CORS, but it must not be used to set `STATIC_FORM_ENDPOINT_VERIFIED=true` for production readiness.

## Email/Microsoft 365 Placeholders

Email sending is outside this approval.

Potential future notification placeholders, only after separate approval:

```text
ICE_RINK_RENTALS_LEAD_RECIPIENT=<approved routing key or recipient reference>
EMAIL_PROVIDER_MODE=<approved provider>
EMAIL_FROM_ADDRESS=<approved sender>
EMAIL_TO_ADDRESS=<approved recipient>
```

Do not store SMTP credentials, Microsoft Graph credentials, mailbox credentials, tokens, connection strings, or API keys in repo docs or frontend variables.
