# Runtime Browser QA

Runtime browser QA is required before any real live write phase.

Phase 2H-21 adds a reusable platform runtime QA harness pattern. The Outbound Link Manager check uses `apps/admin/scripts/runtime-qa-harness.mjs` through `npm run test:phase-2h21` in `apps/admin`.

Browser automation may run only when tooling is already installed and local dev/runtime startup can occur without protected config reads. If `.env.local` or another protected config source would be loaded by the dev server, browser QA must be blocked and documented. When browser automation is unavailable, the harness remains useful as a local Node source/route runtime-safety check.

## Expected Checks

- `/dashboard/outbound-links` renders
- provider-mode/status messaging is visible
- Action Center renders
- detail drawer opens
- provider readiness is visible
- live write controls remain blocked/future-gated
- no uncontrolled write network calls occur
- provider-mode messaging distinguishes local/offline, fake-provider, staging-simulated, live-readonly, and future live-write-approved states
- generated evidence stays under ignored `.tmp`

Source/build/type checks remain required even if runtime browser QA is blocked.
