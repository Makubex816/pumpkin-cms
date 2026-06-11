# Rollback Integration

The apply-plan dry-run validates that the Phase 2H-17 rollback package is present and referenced by planned records.

## Validation

- rollback package must exist
- rollback package must be marked non-executable against live systems
- apply-plan records must carry a rollback plan ID
- rollback integration result must pass before the apply plan can pass validation

## Boundary

Rollback output remains a local evidence artifact. No live rollback operation is implemented or executed.

