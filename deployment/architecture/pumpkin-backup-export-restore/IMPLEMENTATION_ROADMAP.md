# Implementation Roadmap

## Phase 2F Roadmap

The Backup Center roadmap now includes the Ice Cosmos provider-source path explicitly. The existing local backup, restore validation, fake escrow, fake Cosmos/media connector, and live read-only preflight work remains valid, but Ice is not production-restore-proof until the database/provider source is resolved, Cosmos is provisioned if needed, CMS runtime wiring is verified, and a later approved Cosmos export execution succeeds.

| Phase | Objective | Status |
| --- | --- | --- |
| 2F-1 | Architecture/design package for backup/export/restore/encrypted escrow | Complete |
| 2F-2 | Backup Center implementation plan | Complete |
| 2F-3 | Local standard backup exporter prototype | Complete |
| 2F-4 | Backup validator hardening | Complete |
| 2F-5 | Restore validation dry-run prototype | Complete |
| 2F-6 | Fake encrypted escrow prototype | Complete |
| 2F-7 | Ice real backup preflight package | Complete |
| 2F-8 | Ice full standard backup baseline | Complete |
| 2F-9 | Ice database/media completion preflight | Complete |
| 2F-10 | Ice database/media completion execution and blocker capture | Complete |
| 2F-10A | Ice source-of-truth wiring and tenant website bundle architecture | Complete |
| 2F-10B | Ice Cosmos/media connector implementation plan | Complete |
| 2F-11 | Fake Cosmos/media connector foundation | Complete |
| 2F-12 | Ice live read-only connector preflight | Complete, database source blocked |
| 2F-12A | Ice database/provider source discovery expansion | Complete, source partially identified |
| 2F-12B | Provider source resolver and non-secret metadata endpoint plan | Complete |
| 2F-12C | Ice Cosmos provisioning/readiness and connector execution flow plan | Current planning checkpoint |
| 2F-13 | Provider source resolver implementation foundation | Future approval required |
| 2F-14 | Non-secret CMS provider metadata endpoint implementation | Future approval required |
| 2F-15 | Local-dev and live runtime profile support | Future approval required |
| 2F-16 | Cosmos provisioning/readiness preflight, no mutation | Future approval required |
| 2F-17 | Cosmos provisioning execution if no database exists | Future explicit Azure mutation approval required |
| 2F-18 | Cosmos-backed CMS runtime wiring and readiness | Future explicit config/deployment approval required |
| 2F-19 | Data seed/migration preflight and rollback plan | Future approval required |
| 2F-20 | Data seed/migration execution if approved | Future explicit CMS/database write approval required |
| 2F-21 | Live read-only provider verification after wiring | Future approval required |
| 2F-22 | Backup Center Cosmos export execution preflight | Future approval required |
| 2F-23 | Backup Center Cosmos export execution and restore validation | Future explicit export approval required |
| 2F-24 | Production-restore-proof Backup Center QA and owner gate | Future approval required |

## Cosmos Source Decision

If no existing Ice database/provider source is found, Azure Cosmos DB is the selected target provider. That decision is a planning input only. Cosmos account creation, database/container creation, CMS runtime wiring, data seeding, migration, export, deployment, and live-page publication each remain behind separate approvals.

## Required Flow

1. Implement the provider source resolver with fixture/local profiles first.
2. Add the GET-only CMS provider metadata endpoint with non-secret output only.
3. Add local-dev and live runtime profile support so Backup Center can distinguish fake, local, read-only live, and export-approved modes.
4. Run owner-confirmed Azure scope handling to decide whether a database exists.
5. If no database exists, create a Cosmos provisioning/readiness preflight package.
6. Provision Cosmos only after a separate explicit Azure mutation approval.
7. Wire CMS to Cosmos only after separate config/deployment approval.
8. Seed or migrate data only after separate CMS/database write approval.
9. Verify provider metadata through read-only checks after wiring.
10. Execute Backup Center Cosmos export only after a separate export approval.
11. Validate the standard backup bundle, checksums, source map, and restore-plan dry run before production readiness can be claimed.

## Dependency Rule

No future CMS write/import execution, Roller static readiness execution, production readiness execution, live-page publication, or onboarding UI implementation should proceed until Phase 2F implementation and validation gates are complete and owner-approved.

## Hard Stops

- No Cosmos provisioning without explicit Azure mutation approval.
- No Function App/app setting/runtime wiring without explicit deployment/config approval.
- No CMS/database writes, seed, or migration without explicit write approval.
- No database export without explicit export approval.
- No protected config reads or secret export in standard backup flow.
- No Search Console/indexing or live-page publication in any Backup Center checkpoint.

## First Build Slice

The first implementation slice should include standard backup manifest/job models and the escrow models together. Even if escrow payload creation ships later, the data model and hard stops must exist from the beginning. The next Ice-specific build slice should start with the provider source resolver foundation before any live Cosmos action.
