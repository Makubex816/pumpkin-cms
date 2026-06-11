# Blockers And Open Decisions

## Blockers

- No real scoped staging provider profile ID.
- No concrete staging provider type.
- No scoped staging write provider mode.
- No approved non-production target scope/account/database identifiers.
- No approved RBAC/session mode/type.
- No approved concrete readback method.
- No approved concrete rollback method.
- No target-specific Backup Center pre-write evidence.
- No final Resource Registry mapping candidate for the real target.

## Open Decisions

- Whether the OLM staging target should be an existing non-production provider target or a future new staging provider resource.
- Whether the provider type is Cosmos-native RBAC or another repo-supported provider.
- Whether rollback should use restore-from-backup, manifest-scoped delete, or both.
- Whether the future write approval should be preceded by a presence-only operator value capture phase.

No blocker was resolved by reading protected config or mutating Azure.

