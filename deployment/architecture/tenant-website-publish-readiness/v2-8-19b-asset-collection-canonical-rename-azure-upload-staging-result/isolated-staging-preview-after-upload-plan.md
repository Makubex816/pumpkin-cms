# Isolated Staging Preview After Upload Plan

This plan is for a later phase only.

After Azure media upload/readback is separately approved and completed:

1. Update local media reference manifests to use readback-confirmed Azure paths.
2. Run local source/static validation.
3. Verify homepage, service-areas, and contact image references locally.
4. Request separate approval for isolated staging deployment to `swa-ice-static-isolated-staging`.
5. Keep `swa-ice-static-staging` blocked until explicit production-bound approval.

V2.8.19B did not deploy to isolated staging.
