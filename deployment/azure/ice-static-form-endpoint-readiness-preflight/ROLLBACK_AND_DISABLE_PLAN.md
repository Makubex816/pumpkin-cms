# Rollback And Disable Plan

## Before Deployment

Current state requires no rollback because no endpoint was deployed and no env vars were set.

## Future Disable Strategy

If a future endpoint is deployed and must be disabled:

1. Remove or unset `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` from the static build environment.
2. Remove or unset compatibility endpoint aliases if used.
3. Remove or unset `STATIC_FORM_ENDPOINT_VERIFIED`.
4. Rebuild static output.
5. Confirm the form shows the static endpoint configuration error instead of pretending success.
6. Disable or restrict the endpoint host.
7. Rotate any server-side credentials if exposure is suspected.

## User-Facing Failure Mode

The current static frontend safely shows a form configuration error when no endpoint is configured. That is the preferred fallback over silently accepting submissions.

## No CMS Rollback

No CMS writes are required for this preflight or for disabling a future static endpoint URL. The form blocks can remain in content while the frontend endpoint setting controls whether static submissions are connected.

