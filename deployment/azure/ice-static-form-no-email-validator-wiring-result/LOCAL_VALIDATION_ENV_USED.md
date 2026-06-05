# Local Validation Environment Used

Generated: 2026-06-05

These values were set only in command-local shell context for static export and validator runs.

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
STATIC_FORM_ENDPOINT_VERIFIED=true
```

## Not Persisted

These values were not written to:

- repo env files
- protected config files
- Azure Function App settings
- Cloudflare settings
- static hosting settings
- production deployment settings

## Why Both Endpoint Aliases Were Set

`NEXT_PUBLIC_STATIC_FORM_ENDPOINT` is the preferred public static frontend URL alias.

`STATIC_FORM_ENDPOINT` was also set for validator compatibility.

## Verification Flag Scope

`STATIC_FORM_ENDPOINT_VERIFIED=true` was used only to prove the no-email endpoint passes the strict static/staging validators.

It does not mean real email or Microsoft 365 delivery is production-ready.
