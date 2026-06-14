# Future Import Rollback Abort Plan

Status: created.

Ice rollback:

- Rollback plan ID: `rollback:v2-8-17d-production-rollback-plan`.
- Abort before write if package hash, approval manifest, target mapping, backup, registry/profile, Runtime QA, readback, or audit trace checks fail.
- Any destructive rollback action requires a separate explicit approval unless already included in a future execution manifest.

Roller rollback:

- Rollback plan ID: `rollback:paused-no-import-abort-plan`.
- Abort because tenant is paused/no-import/no-resume.

V2.11.6 performed no rollback action because no write/import action occurred.

