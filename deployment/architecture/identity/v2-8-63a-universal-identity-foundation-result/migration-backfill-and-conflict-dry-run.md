# Migration, backfill and conflict dry run

`IdentityMigrationPlanner.CreateDryRun` accepts discovered tenants, users, form recipients and dependency references rather than a tenant allowlist. It produces deterministic tenant UIDs, global user IDs, memberships, fingerprint, resume token, per-record status and conflict holds. Output is safe JSON and `ExecutionEnabled` is always false in 63A.

Source-known tenant candidates are Ice Rink Rentals, Party Pros Philadelphia, Airstrip, and Strip Club Near Me Vegas; they are examples, not hard-coded planner input. No production database was read or mutated in this phase, so record counts are intentionally deferred to the backed-up 63B dry run.

Implemented conflict categories include duplicate normalized email, orphaned user, tenant-slug collision, tenant without active TenantAdmin and multiple apparent primary admins. Required 63B enrichment categories are invalid emails, orphaned membership, role ambiguity, mutable partition/path dependency, runtime-key/storage/fixture/custom-host/backup/DNS/register dependency, and contact/recipient ambiguity. Conflicts hold affected identities; they never cause automatic merge.

Tests prove deterministic output, disabled execution, multi-tenant grouping, duplicate-email detection and orphan detection. Resume IDs use SHA-256-derived deterministic keys; no password, hash, runtime secret or usable token is emitted.
