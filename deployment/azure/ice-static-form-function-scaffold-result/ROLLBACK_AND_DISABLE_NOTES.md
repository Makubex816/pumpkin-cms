# Rollback And Disable Notes

Generated: 2026-06-05

No rollback is needed now because no endpoint was deployed.

## Future Disable Steps

If a later deployment fails verification:

1. Do not set `NEXT_PUBLIC_STATIC_FORM_ENDPOINT`.
2. Do not set `STATIC_FORM_ENDPOINT_VERIFIED=true`.
3. Stop or disable the Function App under approved Azure operations.
4. Remove or restrict approved origins.
5. Rotate server-side credentials if exposure is suspected.
6. Redeploy the last known-good package if endpoint code caused the issue.

## Static Frontend Rollback

If a future static build was configured with an endpoint URL:

1. unset `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` and compatibility aliases
2. unset `STATIC_FORM_ENDPOINT_VERIFIED`
3. rebuild and redeploy static output only under separate static deployment approval

Expected fallback behavior: the static form shows the configured endpoint missing/error state instead of pretending success.

## Route Rollback

If `/api/static-contact` route alignment causes an issue:

- keep the static frontend unconfigured
- fix the Function route under a new local/package approval
- do not add `/api/contact` deployed compatibility unless separately approved and tested
