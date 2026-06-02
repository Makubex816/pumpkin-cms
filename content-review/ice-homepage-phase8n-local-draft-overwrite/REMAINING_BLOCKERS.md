# Remaining Blockers

Run blocker corrected:

- The prior homepage overwrite attempt stopped because `/service-areas` returned HTTP 404.
- That was an overly strict untouched-route guard for this project state.
- `/service-areas` has not been imported yet, so HTTP 404 is accepted as `expected-not-found` baseline for homepage-only overwrite.
- The guard should no longer block solely because `/service-areas` is 404.

Before local draft overwrite retry:

- Save a fresh valid JWT to `$env:TEMP\pumpkin-admin-jwt.txt`.
- Use the corrected untouched-route guard behavior.
- Capture `/contact` before overwrite and verify it unchanged after overwrite.
- Capture `/service-areas` before overwrite and verify it unchanged after overwrite; HTTP 404 is valid if it remains 404.
- Complete homepage readback verification after the write.
- Verify revision and rollback metadata after the write.

Before local preview:

- Complete the homepage draft overwrite in a separate authorized run.
- Open the local draft preview route and visually review the Phase 8N homepage.

Before static regeneration:

- Complete local homepage draft overwrite and readback verification.
- Manual browser preview review is required.
- Static regeneration must be separately authorized.
- `staticPublishing.staticEligible` remains false.

Before production/indexing:

- Production approval and publish approval are still false.
- Final public contact policy and phone/email display decision remain under review.
- Deployment and indexing must be separately authorized.

This patch run did not update CMS Page records, Theme records, MediaAsset records, static packages, DNS, email/provider settings, or RollerRinkRentals.com.
