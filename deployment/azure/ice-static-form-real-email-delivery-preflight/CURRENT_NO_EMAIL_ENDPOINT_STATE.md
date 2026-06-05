# Current No-Email Endpoint State

Generated: 2026-06-05

## Endpoint

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

## Deployment Baseline

From prior deployment docs:

```text
Function App: func-ice-static-contact-20260605
Resource group: rg-ice-static-form-endpoint
Runtime: Azure Functions v4, Node 24, Windows Consumption
Route: /api/static-contact
Deployed /api/contact compatibility route: no
Forward mode: dry-run
```

## Current Behavior

The deployed endpoint:

- accepts approved-origin `OPTIONS`
- accepts valid Ice frontend payloads in dry-run mode
- validates and sanitizes payloads
- rejects malformed or disallowed payloads
- does not send email
- does not persist to Pumpkin API in current mode

Safe preflight spot-check:

| Check | Result |
| --- | --- |
| `OPTIONS` approved Ice origin | `204` |
| valid frontend payload | `200` |

Prior no-email verification covered invalid email, unknown routing, unknown recipient, oversized message, honeypot, and unapproved origin rejection.

## Local Package Baseline

Run from `deployment/static-azure/forms/static-form-endpoint`:

| Command | Exit | Result |
| --- | --- | --- |
| `npm run check` | 0 | pass |
| `npm test` | 0 | pass |

## Current App Setting Names From Prior Result Docs

Relevant configured setting names:

- `FUNCTIONS_WORKER_RUNTIME`
- `FUNCTIONS_EXTENSION_VERSION`
- `AzureWebJobsFeatureFlags`
- `WEBSITE_RUN_FROM_PACKAGE`
- `STATIC_FORM_ALLOWED_SITE_KEYS`
- `STATIC_FORM_FORWARD_MODE`
- `STATIC_FORM_ALLOWED_ORIGINS`
- `STATIC_FORM_MAX_BODY_BYTES`
- `STATIC_FORM_MAX_MESSAGE_LENGTH`
- `STATIC_FORM_RATE_LIMIT_MODE`
- `STATIC_FORM_SPAM_PROTECTION_MODE`
- `ICE_RINK_RENTALS_STATIC_FORM_ENDPOINT_KEY`

Confirmed absent by name in prior result docs:

- `ICE_RINK_RENTALS_API_KEY`
- `PUMPKIN_API_URL`
- `EMAIL_PROVIDER_MODE`
- `EMAIL_FROM_ADDRESS`
- `EMAIL_TO_ADDRESS`

No Azure app setting read or write was performed in this preflight.

