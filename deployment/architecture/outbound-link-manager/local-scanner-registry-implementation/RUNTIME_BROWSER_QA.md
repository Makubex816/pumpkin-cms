# Runtime Browser QA

Runtime browser QA is required before any real live write phase.

Phase 2H-20 may run browser QA only when local dev servers can start without reading protected config. If `.env.local` or another protected config source would be loaded by the dev server, browser QA must be blocked and documented.

## Expected Checks

- `/dashboard/outbound-links` renders
- provider-mode/status messaging is visible
- Action Center renders
- detail drawer opens
- provider readiness is visible
- live write controls remain blocked/future-gated
- no uncontrolled write network calls occur

Source/build/type checks remain required even if runtime browser QA is blocked.

