# PPEC Validator Review

Patched file:

- `tools/import-preflight/import-preflight.mjs`

Changes:

- Added `partnerCta` as a recognized section variant marker.
- Replaced the broad homepage `/East Coast/i` warning with `analyzeEastCoastUsage`.
- The exact partner brand phrase `Party Pros East Coast` is removed before checking for remaining `East Coast` wording.
- Any remaining `East Coast` wording still fails `production-service-area-copy`.

Proof:

- Homepage PPEC candidate: `production-service-area-copy` passed with message `East Coast wording is limited to the Party Pros East Coast partner brand name.`
- Negative fixture: `validator-generic-east-coast-negative-fixture.json` failed with `Generic East Coast service-area wording requires explicit approval before production import.`

Scope:

This does not broadly allow regional service-area claims. It only allows the approved partner/business name when no other `East Coast` wording remains.
