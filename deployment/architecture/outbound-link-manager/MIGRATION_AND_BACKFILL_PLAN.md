# Migration And Backfill Plan

This is a planning model only. No migration is approved in Phase 2H-1.

## Phase 1: Inventory Planning

- Identify link-bearing content fields.
- Define scanner source adapters.
- Define tenant/site scope mapping.
- Define policy defaults.

## Phase 2: Local Backfill Dry-Run

- Scan local fixtures, import packages, and backup bundles.
- Produce proposed registry and instance files under ignored local output.
- Compare counts with expected owner review files.
- Do not write CMS or database state.

## Phase 3: Owner Review

- Review domains and high-impact links.
- Confirm default disabled behavior.
- Confirm blocked/allowed domain lists.
- Confirm publication gates.

## Phase 4: Controlled Data Migration

Future approval only.

- Create schema/database containers or tables.
- Import approved registry records.
- Import approved instances.
- Import policy.
- Write audit entries for migration.

## Phase 5: Renderer And Admin Integration

Future approval only.

- Wire renderer to resolved outbound link state.
- Expose Admin read workflows.
- Add controlled write actions after audit and permission gates.

## Rollback

Until renderer integration is active, rollback is deleting or ignoring proposed registry state. After renderer integration, rollback must restore previous outbound link policy and registry snapshots.
