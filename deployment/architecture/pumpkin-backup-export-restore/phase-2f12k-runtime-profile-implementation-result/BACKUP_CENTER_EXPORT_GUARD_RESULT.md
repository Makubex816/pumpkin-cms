# Backup Center Export Guard Result

## Live Export Guard

Live database export remains blocked for every Phase 2F-12K profile.

## Fake Complete Export Guard

Fake complete export is allowed only for local/fake profiles:

- `local-dev`
- `fake-provider`

It is blocked for:

- `offline-bundle`
- `local-with-live-readonly`
- `live-readonly`
- `runtime-cosmos-future`
- `production-write-approved`

## Bundle Integration

Standard bundles now include runtime profile guard metadata:

- `database/runtime-profile/runtime-profile.json`
- `database/runtime-profile/RUNTIME_PROFILE.md`

The bundle manifest includes runtime profile status under `componentStatus.runtimeProfile`.

## Production Proof Boundary

Fake complete export remains fake-only. It is not production restore proof for Ice until real seed/migration, real provider readback, and backup/restore validation gates are approved and completed.

