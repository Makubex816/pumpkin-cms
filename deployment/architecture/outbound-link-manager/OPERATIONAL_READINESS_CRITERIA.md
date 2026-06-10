# Operational Readiness Criteria

Outbound Link Manager is operationally ready only when these criteria are met.

## Architecture Readiness

- Domain model approved.
- Schema drafts approved.
- Scanner model approved.
- Rendering policy approved.
- Backup/restore integration approved.
- Onboarding integration approved.
- Permission model approved.

## Implementation Readiness

Future implementation must prove:

- local scanner works without live services;
- registry and instance contracts validate;
- Admin read workflows are tenant-scoped;
- write actions are permissioned and audited;
- renderer behavior is deterministic;
- backup/restore includes outbound link state;
- publication gates block unreviewed links;
- no external crawling occurs unless separately approved.

## Production Readiness

Production readiness requires:

- migration/backfill dry-run;
- owner review of blocked and pending domains;
- restore validation proof;
- audit retention policy;
- rollback plan;
- operator runbook;
- security review;
- live-readonly inventory approval if live data is needed.

Phase 2H-1 reaches architecture readiness only.
