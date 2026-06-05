# Endpoint Verification Contract

Generated: 2026-06-05

`STATIC_FORM_ENDPOINT_VERIFIED=true` may be set only after this contract passes for the deployed endpoint.

## URL Contract

Required:

```text
https://<approved-form-endpoint-host>/api/static-contact
```

Compatibility if deployed intentionally:

```text
https://<approved-form-endpoint-host>/api/contact
```

The configured URL must:

- use HTTPS
- not be localhost, loopback, placeholder, or example domain
- contain no query-string secrets
- be the same URL configured in `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` or an approved alias

## CORS And Preflight

From an approved origin, `OPTIONS` must return:

- successful no-content or equivalent preflight response
- `Access-Control-Allow-Origin` matching the approved origin
- `Access-Control-Allow-Methods` including `OPTIONS, POST`
- `Access-Control-Allow-Headers` including `Content-Type`
- `Vary: Origin`
- `Cache-Control: no-store`

From an unapproved origin:

- no allow header for the submitted origin
- subsequent `POST` rejected with a safe error

## Valid Payload Tests

A current frontend-shape Ice payload must be accepted:

```text
siteKey=ice-rink-rentals
tenantId=ice-rink-rentals
formKey=default-quote-request
staticEndpointRef=ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT
leadRecipientRef=ICE_RINK_RENTALS_LEAD_RECIPIENT
```

Expected result:

- public response returns `ok: true`
- response includes a safe entry id or equivalent success marker
- no secrets appear in the response
- sanitized entry is persisted through the approved backend path when `pumpkin-api` mode is approved
- metadata preserves `staticEndpointRef` and `leadRecipientRef`

A legacy payload must also be accepted or explicitly documented:

```text
domainRoutingKey=ice-rink-rentals-default
recipientGroup=local_admin
```

## Negative Tests

The deployed endpoint must reject:

- invalid JSON
- non-POST submission methods
- invalid email
- missing consent
- filled honeypot field
- oversized request body
- oversized message
- unknown `staticEndpointRef` or `domainRoutingKey`
- unknown `leadRecipientRef` or `recipientGroup`
- unknown site key or tenant
- mismatched site/tenant values
- unapproved origin

Unknown routing or recipient values must not be echoed in the public response.

## Sanitization And Response Safety

Confirm:

- angle brackets are stripped from string values before forwarding
- control characters are stripped
- field keys are sanitized
- nested objects are not forwarded as raw nested objects
- public responses are generic and safe
- bearer tokens and credentials are not present in errors, responses, logs, or static output

## Backend Verification

For production/static readiness, validation-only dry run is insufficient.

Required backend proof after explicit approval:

- endpoint forwards to Pumpkin API through server-side `ICE_RINK_RENTALS_API_KEY`
- an approved test `FormEntry` is created for `ice-rink-rentals`
- saved entry contains correct tenant, site key, page slug, form key, consent, sanitized form data, and routing metadata
- Lead Inbox or approved admin view can locate the test entry
- no email is sent unless separately approved

## Validator Proof

After endpoint/backend verification:

1. Configure the real endpoint URL with `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` or an approved alias.
2. Set `STATIC_FORM_ENDPOINT_VERIFIED=true`.
3. Rerun Ice snapshot/static validation commands.
4. Confirm the strict static output and staging package validators no longer report form endpoint errors.

This step requires separate approval because it changes build environment readiness and may involve static rebuilds.
