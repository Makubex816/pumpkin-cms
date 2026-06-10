# Migration Dry-Run Requirements

The next phase should generate deterministic production-ready records without writing them to production.

Dry-run inputs:

- local store export
- render decision export
- Backup Center outbound-link candidate
- Resource Registry target provider metadata without secrets
- tenant and site identifiers
- schema version

Dry-run outputs:

- production-shaped JSON records per entity
- migration manifest
- checksum manifest
- referential integrity report
- tenant/site isolation report
- schema validation report
- diff summary
- rollback preview
- Resource Registry update proposal

Dry-run rules:

- no protected config reads
- no live writes
- no Azure mutation
- no external crawling
- deterministic record IDs
- stable ordering
- no secret-like values in output
- stop if tenant/site fields are missing or mixed
