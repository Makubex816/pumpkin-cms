# Form Endpoint Requirements

Generated: 2026-06-04

## Current Blocker

Static form endpoint remains missing and unverified.

Strict validator errors remain:

- `Static form endpoint is not configured for production/static deploy readiness.`
- `Static form endpoint/backend verification is missing; mailbox readiness is not app form readiness.`

## Required Endpoint Behavior

The future endpoint should:

- accept `POST` JSON form payloads
- respond to `OPTIONS` for CORS preflight
- allow only approved origins
- validate required fields
- validate payload size
- sanitize user input before forwarding or storing
- apply spam and rate-limit controls
- keep server-side credentials out of static frontend code
- return generic public error messages
- return `Cache-Control: no-store`
- return `Vary: Origin`

## Expected Static Flow

```text
Static browser form
  -> public static form endpoint
  -> Pumpkin API, queue, or approved CRM path
  -> FormEntry or approved lead destination
```

## Approved Form Sources

Existing docs identify approved Ice form references:

- form key: `default-quote-request`
- source page: `/contact`
- static endpoint reference: `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`
- lead recipient reference: `ICE_RINK_RENTALS_LEAD_RECIPIENT`
- selected mailbox metadata: `contact@iceskatingrinkrentals.com`

These references were not changed in this planning pass.

## Not Performed

- no endpoint deployed
- no endpoint URL configured
- no CMS write
- no email sent
- no Microsoft 365 action

