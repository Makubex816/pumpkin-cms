# Static Form Endpoint Staging Plan

Phase 6T proved the local static form endpoint can forward Ice and Roller submissions into Lead Inbox. This document prepares the Azure Function staging path without deploying it.

## Goal

Staging static sites should submit forms through an external endpoint:

```text
Static staging site -> Azure Function staging endpoint -> Pumpkin API -> FormEntry -> Lead Inbox
```

No real email notifications are sent in staging.

## Azure Function Placeholder

Suggested function app names:

- `func-pumpkin-static-forms-staging`
- route: `/api/contact`

The function app should use the handler foundation in:

```text
deployment/static-azure/forms/static-form-endpoint/
```

## Required App Settings

Use Azure Function App settings. Do not commit values.

```text
PUMPKIN_API_URL=<pumpkin-api-url>
ICE_RINK_RENTALS_API_KEY=<server-side-secret>
ROLLER_RINK_RENTALS_API_KEY=<server-side-secret>
STATIC_FORM_ALLOWED_ORIGINS=https://<ice-azure-default-host>,https://<roller-azure-default-host>,https://staging.iceskatingrinkrentals.com,https://staging.rollerrinkrentals.com
STATIC_FORM_ALLOWED_SITE_KEYS=ice-rink-rentals,roller-rink-rentals
STATIC_FORM_DEFAULT_TENANT=
STATIC_FORM_RATE_LIMIT_MODE=log_only
STATIC_FORM_SPAM_PROTECTION_MODE=honeypot_only
STATIC_FORM_MAX_BODY_BYTES=20000
```

Optional endpoint keys:

```text
ICE_RINK_RENTALS_STATIC_FORM_ENDPOINT_KEY=ice-rink-rentals-default
ROLLER_RINK_RENTALS_STATIC_FORM_ENDPOINT_KEY=roller-rink-rentals-default
```

## Static Frontend Setting

Static builds should use a public endpoint URL only:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://<function-host>/api/contact
```

No Pumpkin API keys go into the static frontend.

## CORS

Allowed origins should start with Azure default hosts, then add staging custom domains later:

- `https://<ice-azure-default-host>`
- `https://<roller-azure-default-host>`
- `https://staging.iceskatingrinkrentals.com`
- `https://staging.rollerrinkrentals.com`

Do not include live production domains until staging has passed and Timothy approves.

## Test Payloads

Use local/test-only contact information. The endpoint should accept payloads shaped like:

```json
{
  "siteKey": "ice-rink-rentals",
  "formId": "contact",
  "pageSlug": "contact",
  "domainRoutingKey": "ice-rink-rentals-default",
  "recipientGroup": "local_admin",
  "formData": {
    "name": "Staging Smoke Test",
    "email": "staging-smoke-test@example.com",
    "phone": "555-0100",
    "event-location": "Staging test venue",
    "message": "Staging endpoint verification only."
  }
}
```

Do not use real customer data.

## Lead Inbox Verification

For each site:

1. submit a staging test form
2. open admin Lead Inbox
3. select matching tenant
4. confirm a new `FormEntry` exists
5. confirm form data and page slug are correct
6. confirm source/tag metadata identifies static form endpoint routing

## Future Production Work

- durable rate limiting
- CAPTCHA or Cloudflare Turnstile
- monitoring and alerting
- email/CRM notifications
- operational log redaction review
- production Function deployment

No real emails should be sent in staging until explicitly approved.
