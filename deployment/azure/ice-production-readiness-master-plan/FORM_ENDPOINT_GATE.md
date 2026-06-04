# Form Endpoint Gate

Generated: 2026-06-04

## Why Form Endpoint Is Blocked

Strict validators still report 2 endpoint errors:

- static form endpoint is not configured for production/static deploy readiness
- static form endpoint/backend verification is missing

Contact form production readiness remains `no`.

## Required Endpoint Behavior

The endpoint should:

- accept JSON `POST` payloads
- respond to `OPTIONS`
- allow only approved origins
- validate required fields
- validate payload size
- sanitize user input
- apply spam controls
- apply rate limiting
- forward or store sanitized submissions through an approved server-side path
- keep credentials out of browser code
- return safe generic public responses

## Validation And Sanitization Needs

Required checks include:

- site key, form ID, page slug, and domain routing shape
- email and phone shape
- message length
- unexpected fields
- unsafe HTML/script-like content
- CORS origin allowlist
- no customer data in staging tests

## Environment Variable Placeholders

Frontend/static build placeholder:

- `NEXT_PUBLIC_STATIC_FORM_ENDPOINT`

Compatibility placeholders:

- `STATIC_FORM_ENDPOINT`
- `NEXT_PUBLIC_STATIC_FORM_ACTION`
- `STATIC_FORM_ACTION`

Verification placeholder:

- `STATIC_FORM_ENDPOINT_VERIFIED`

Runtime endpoint placeholders:

- Pumpkin API URL placeholder
- Ice tenant API key placeholder
- allowed origins placeholder
- allowed site keys placeholder
- rate-limit mode placeholder
- spam-protection mode placeholder

No values are included in this package.

## Local/Staging Test Criteria

- local validation rejects malformed payloads
- local dry-run mode does not send real email
- staging endpoint accepts only staging-safe origins
- static frontend posts to the configured endpoint
- Lead Inbox or approved destination receives a staging test entry
- no real email is sent unless explicitly approved
- strict validators clear endpoint errors only after backend verification

## Email Delivery Considerations

Mailbox metadata identifies `contact@iceskatingrinkrentals.com`, but mailbox readiness is not app form readiness.

Email sending requires separate Microsoft 365/email approval and test authorization.

## Explicit No-Action Statement

No endpoint was deployed, no env vars were set, no email was sent, no Microsoft 365 settings were touched, and no contact form readiness change occurred in this run.

