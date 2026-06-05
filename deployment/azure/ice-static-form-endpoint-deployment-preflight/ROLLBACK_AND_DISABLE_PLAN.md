# Rollback And Disable Plan

Generated: 2026-06-05

This plan is for future endpoint deployment rollback only. Nothing was deployed in this preflight.

## Disable Static Frontend Posting

Future approved rollback:

1. Remove or unset `NEXT_PUBLIC_STATIC_FORM_ENDPOINT`.
2. Remove or unset compatibility aliases if used:
   - `STATIC_FORM_ENDPOINT`
   - `NEXT_PUBLIC_STATIC_FORM_ACTION`
   - `STATIC_FORM_ACTION`
3. Remove or unset `STATIC_FORM_ENDPOINT_VERIFIED`.
4. Rebuild static output only under separate static deployment approval.

Expected frontend behavior: the static form should show the existing inline endpoint-not-configured error rather than pretending success.

## Disable Endpoint Runtime

Future approved rollback:

- stop or disable the Function App
- remove allowed origins
- change `STATIC_FORM_ALLOWED_SITE_KEYS` to an empty or non-Ice-safe value if the handler supports the selected state
- set `STATIC_FORM_FORWARD_MODE=dry-run` only for validation containment
- remove or rotate server-side Pumpkin API key if exposure is suspected

## Roll Back Endpoint Code

Future approved rollback:

- redeploy the last known-good Function package
- revert the route decision if the route caused the break
- keep public frontend endpoint URL unset until verification passes again

## Roll Back Data Effects

If approved test submissions created `FormEntry` records:

- identify test entries through approved admin tooling
- do not delete CMS content or MediaAsset records as part of endpoint rollback
- do not trigger email cleanup unless separately approved

## DNS And Cloudflare

No DNS or Cloudflare change is part of the recommended endpoint rollback unless a future deployment explicitly adds a custom endpoint domain or route through Cloudflare.

## Current State

No rollback action is needed now because no endpoint was deployed, no env vars were set, no static output was rebuilt, and no external systems were changed.
