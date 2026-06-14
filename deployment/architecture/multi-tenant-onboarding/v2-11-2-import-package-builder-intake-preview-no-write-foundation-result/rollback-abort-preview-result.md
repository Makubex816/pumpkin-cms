# Rollback Abort Preview Result

The builder records `rollbackPlanId` in normalized manifests and preview output.

Ice:

- rollback plan id: `rollback:v2-8-17d-production-rollback-plan`.

Roller:

- rollback plan id: `rollback:paused-no-import-abort-plan`.

Future import execution remains blocked until a separately approved gate defines actual import execution, rollback behavior, audit logging, and owner/operator approvals.
