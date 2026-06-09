# Backup Center Roadmap Update

## New Explicit Sequence

The top-level `IMPLEMENTATION_ROADMAP.md` now includes the Ice Cosmos path:

1. provider source resolver implementation foundation;
2. non-secret CMS provider metadata endpoint;
3. local-dev and live runtime profile support;
4. Cosmos provisioning/readiness preflight;
5. Cosmos provisioning execution if no database exists;
6. Cosmos-backed CMS runtime wiring;
7. data seed/migration preflight;
8. data seed/migration execution if approved;
9. live read-only provider verification;
10. Backup Center Cosmos export preflight;
11. Backup Center Cosmos export execution and restore validation;
12. production-restore-proof QA and owner gate.

## Why This Change Was Needed

Earlier Backup Center roadmap entries were broad. Phase 2F-12A and 2F-12B proved that Ice needs a more precise source-resolution path before Backup Center can claim production restore proof.

## Roadmap Principle

The roadmap separates planning, implementation, read-only verification, provisioning, CMS wiring, migration, export, and production readiness. Each step has its own approval boundary.
