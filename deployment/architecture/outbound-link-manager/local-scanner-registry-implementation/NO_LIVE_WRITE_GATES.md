# No-Live-Write Gates

Phase 2H-19 keeps live provider writes blocked by default.

## Gate Behavior

- `provider-check` can inspect a redacted fixture profile and report capabilities.
- `apply-plan-dry-run` is allowed for local, fake, offline, and `staging-simulated` provider modes.
- `live-readonly` returns `LIVE_READONLY_WRITE_PLAN_BLOCKED`.
- `live-write-approved` returns `LIVE_WRITE_APPROVED_UNAVAILABLE`.
- `production-runtime` returns `PRODUCTION_RUNTIME_WRITE_PLAN_BLOCKED`.

## Required Safety Flags

The profile validator and apply-plan validator require:

- `canPerformLiveWrites: false`
- `liveProviderWrites: false`
- `productionWrites: false`
- `cmsWrites: false`
- `protectedConfigReads: false`
- `externalCrawling: false`
- `deployment: false`
- `searchConsoleIndexing: false`
- `livePagePublication: false`

Any future live-write implementation must introduce a separately approved provider profile, production persistence migration, conflict handling, audit persistence, rollback/readback gates, and Backup Center evidence before writes are possible.

