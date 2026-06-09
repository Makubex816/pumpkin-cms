# Backup Center Cosmos Export Execution Flow

## Purpose

Define the later approved path from verified Cosmos source to a production-restore-proof standard backup.

## Pre-Export Gates

1. Provider resolver implemented and passing tests.
2. Non-secret CMS provider metadata endpoint implemented and read-only verified.
3. Cosmos source exists and matches owner-confirmed scope.
4. CMS runtime is wired to Cosmos and readback verified.
5. Data seed/migration gates are complete if Cosmos was newly provisioned.
6. Tenant/site scope is explicit.
7. Export output path is private and ignored.
8. Standard backup secret-exclusion rules pass.
9. Owner approves live Cosmos export execution.

## Export Execution

Future export execution should:

- collect Cosmos platform backup evidence where allowed;
- export tenant/site-scoped portable JSON records;
- write export manifest and checksums;
- integrate database output into the standard backup bundle;
- update tenant website bundle source map;
- run validator in production-restore-proof mode;
- run restore-plan dry-run;
- write JSON and Markdown reports.

## Post-Export Gates

- checksum validation passes;
- secret-leak scan passes;
- record counts match expected inventory;
- restore-plan dry-run passes;
- media proof is complete or separately blocked;
- owner receives go/no-go for production restore proof.

## Hard Stop

Phase 2F-12C does not perform export and does not create backup artifacts.
