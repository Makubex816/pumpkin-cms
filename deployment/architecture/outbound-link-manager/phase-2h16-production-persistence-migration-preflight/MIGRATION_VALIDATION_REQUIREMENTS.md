# Migration Validation Requirements

Required validators before migration execution:

- schema contract validation
- tenant/site isolation validation
- local-to-production count parity
- entity referential integrity
- duplicate normalized URL detection per tenant/site
- status enum validation
- policy domain list validation
- render decision link/instance reference validation
- trace field completeness
- audit record non-secret validation
- rollback plan completeness
- checksum validation
- dry-run diff review

Required readback validators for future live-readonly or write-approved phases:

- per-container count by tenant/site
- sample record field parity
- missing reference detection
- unexpected record detection
- conflict detection
- timestamp and record version sanity checks

Validation failure must block migration execution.
