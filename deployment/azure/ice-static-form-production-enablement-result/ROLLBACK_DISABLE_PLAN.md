# Rollback Disable Plan

Generated: 2026-06-06

## Immediate Mail Disable

Set the Function App delivery mode back to:

```text
FORM_DELIVERY_MODE=no-email
```

This disables real Graph email delivery without changing Microsoft 365, CMS content, MediaAsset records, Cloudflare, or the static site.

## Validator Context

For a validation or staging context that should no longer treat the endpoint as production verified:

```text
STATIC_FORM_ENDPOINT_VERIFIED=false
```

or unset `STATIC_FORM_ENDPOINT_VERIFIED` in that context.

## Not Included

Rollback does not require:

- endpoint redeploy
- Azure resource creation
- Microsoft 365 changes
- CMS writes
- MediaAsset writes
- Cloudflare changes
- static deployment

