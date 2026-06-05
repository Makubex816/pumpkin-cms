# Validator Wiring Analysis

Generated: 2026-06-05

## Endpoint Alias

Preferred future static build alias:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

Compatibility aliases still supported by validators:

```text
STATIC_FORM_ENDPOINT
NEXT_PUBLIC_STATIC_FORM_ACTION
STATIC_FORM_ACTION
```

## Verification Flag

Strict validators still require:

```text
STATIC_FORM_ENDPOINT_VERIFIED=true
```

This run did not set that flag.

## Can This Endpoint Satisfy The URL Gate?

Yes, the endpoint URL is real HTTPS and passes the no-email endpoint behavior checks.

## Remaining Verification Decision

The endpoint is deployed in `dry-run` mode. It does not persist to Pumpkin API and does not send email.

A separate decision is still required before using this endpoint to clear strict validator gates:

- approve using no-email/dry-run endpoint verification as sufficient for static endpoint readiness, or
- approve Pumpkin API `FormEntry` persistence settings and verification, still without email, or
- approve full email/Microsoft 365 delivery testing later

Do not set `STATIC_FORM_ENDPOINT_VERIFIED=true` until that decision is explicit.
