# Next Live Cosmos Seed Execution Prompt

Approve a future Ice Cosmos live seed execution only after reviewing the Phase 2F-12O dry-run package, seed manifest, checksums, readback plan, and rollback plan.

Required constraints for the future phase:

- use the approved seed manifest and migration run ID
- perform live Cosmos writes only after fresh owner approval
- keep every operation tenant-scoped to `tenantKey = ice-rink-rentals`
- verify `/tenantKey` partitioning before writes
- perform readback after writes using tenant-scoped counts and sampled IDs
- keep CMS runtime switch blocked unless separately approved
- do not read protected config, print secrets, generate SAS values, export database data, download media, deploy, index, or publish live pages unless separately approved
- do not stage generated live seed/readback artifacts if they contain sensitive or environment-specific data

Fresh approval must name the target account, database, containers, write tool, rollback operator, readback method, and go/no-go criteria.
