# Export Guards

## Live Database Export

Live database export is always blocked in Phase 2F-12K.

Common reason codes:

- `local-or-offline-profile-disallows-live-export`
- `read-only-profile-disallows-live-export`
- `future-runtime-profile-not-active`
- `provider-is-future-target-not-active-runtime`
- `runtime-not-configured`
- `seed-migration-gate-not-passed`
- `runtime-switch-gate-not-approved`
- `live-database-export-not-approved`

## Fake Complete Export

Fake complete export is allowed only for `local-dev` and `fake-provider`.

It remains fake-only and writes only local folder-bundle output under ignored `.tmp` paths.

## Production Write Profile

`production-write-approved` is implemented as a future profile name but remains hard-stopped. Even when a fixture sets future gates to true, the guard keeps production writes and live export blocked.

## Backup Center Bundle Integration

Generated standard bundles now include:

- `database/runtime-profile/runtime-profile.json`
- `database/runtime-profile/RUNTIME_PROFILE.md`

These files document the guard decision used by the bundle.

