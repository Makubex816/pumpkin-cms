# Validation And Sanitization Plan

## Local Validation

Future approved local tests should:

- run `npm run check` in `deployment/static-azure/forms/static-form-endpoint`
- start the local server only in `STATIC_FORM_FORWARD_MODE=dry-run`
- submit test-only Ice payloads
- confirm valid payloads return success
- confirm no email is sent
- confirm no Microsoft 365 setting is touched

## Negative Tests

Reject:

- non-POST methods
- invalid JSON
- missing or unapproved origin
- unknown site key
- mismatched tenant/site
- missing name
- missing email
- invalid email
- missing consent
- filled honeypot field
- oversized payload
- quote request without phone or event location/message

## Sanitization Tests

Confirm:

- control characters are stripped
- `<` and `>` are stripped
- field keys are normalized
- arrays are flattened safely
- nested objects are not accepted as raw objects
- values are length-limited
- public responses do not echo raw submitted values

## CORS Tests

Confirm:

- `OPTIONS` returns an allowed preflight response for approved origins
- `POST` is allowed only for approved origins
- unapproved origins do not receive an allow header and are rejected
- responses include `Vary: Origin`
- responses include `Cache-Control: no-store`

## Backend Verification

After explicit endpoint and secret approval:

- forward to Pumpkin API using server-side `ICE_RINK_RENTALS_API_KEY`
- create a test `FormEntry` with staging-safe data
- verify tenant, site key, page slug, form key, consent, metadata, and routing refs
- confirm no secrets appear in static output or public response

## Static Validation

After endpoint/backend verification:

1. Set the real public endpoint URL for static build.
2. Set `STATIC_FORM_ENDPOINT_VERIFIED=true`.
3. Rerun `npm run export:static:ice:cms`.
4. Rerun `npm run validate:snapshot:ice`.
5. Rerun strict static output validator.
6. Rerun strict staging package validator.

Static output quality gates should pass only if no other strict errors appear.

