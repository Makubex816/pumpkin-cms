# Admin API Azure Wiring With Local Mode

Future production wiring must not replace the local mode.

Required future boundaries:

- Admin disabled action buttons stay disabled until a separate production write approval
- API read-only endpoints remain usable without write providers
- local file-backed stores remain a first-class provider for tests
- fake providers remain available for Admin UI development
- Azure/Cosmos providers are selected explicitly, never by default
- live-readonly and live-write profiles are separate
- production write routes require tenant guard, role guard, reason text, idempotency key, conflict handling, audit persistence, backup readiness, and rollback/readback plans

Phase 2H-12 does not wire Azure providers or production write routes.
