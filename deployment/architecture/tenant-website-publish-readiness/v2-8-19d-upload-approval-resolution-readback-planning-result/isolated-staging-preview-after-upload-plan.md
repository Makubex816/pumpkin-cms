# Isolated Staging Preview After Upload Plan

No isolated staging deploy was performed in V2.8.19D.

After a later approved upload/readback phase succeeds:

- Create or update source references to readback-confirmed public media URLs in a separately approved source integration phase.
- Ensure public email display uses `contact@iceskatingrinkrentals.com`.
- Keep contact replacement rows excluded unless owner approval changes.
- Build a preview candidate for `swa-ice-static-isolated-staging` only after source integration is approved.
- Validate the isolated staging preview before any production-bound deployment is considered.

The production-bound target remains blocked. Isolated staging preview is not bundled with media upload/readback.
