# Seed and Migration Prerequisites

Seed or migration is not approved in Phase 2F-12J.

## Required Before Any Seed or Migration Approval

- Confirm the current CMS source of truth.
- Capture tenant, site, page, route, form, media, and config inventory counts.
- Define the exact source records to seed.
- Define the exact target containers.
- Define idempotency behavior.
- Define rollback capture.
- Define post-seed readback verification.
- Complete a standard backup of the source state.
- Complete restore validation for the backup.
- Produce a no-write seed/migration plan.

## Required Seed/Migration Plan Contents

- Tenant key and site key
- Source provider classification
- Target provider classification
- Container mapping
- Partition key expectations
- Record identity strategy
- Conflict handling
- Created/adopted/updated/skipped decisions
- Dry-run inventory report
- Abort rules

## Ice Seed Status

Ice seed and migration status remains not started. Cosmos must not receive Ice CMS data until a later explicit execution approval.

