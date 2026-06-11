# Dry-Run To Execution Replay

Replay validation proves that the Phase 2H-17 migration dry-run, Phase 2H-19 apply-plan, Phase 2H-20 staging execution, and Phase 2H-20 readback records describe the same tenant-scoped changes.

## Continuity Points

- migration run ID
- migration record ID
- apply-plan ID
- apply-plan record ID
- staging execution run ID
- staging execution record ID
- readback run ID
- readback record ID
- target entity and target record ID
- before/after state hashes
- migration, apply-plan, execution, and readback hashes

Replay validation fails if a record is missing or if identity/hash continuity breaks.

