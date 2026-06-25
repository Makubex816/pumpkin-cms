# Isolated Staging Preview After Upload Plan

This plan remains for a later phase only.

After Azure media upload/readback is separately approved and completed:

1. Update source/media references to readback-confirmed Azure media paths.
2. Run local source/static validation.
3. Request separate approval for isolated staging deployment to `swa-ice-static-isolated-staging`.
4. Keep `swa-ice-static-staging` blocked until explicit production-bound approval.

V2.8.19C did not deploy to isolated staging.
