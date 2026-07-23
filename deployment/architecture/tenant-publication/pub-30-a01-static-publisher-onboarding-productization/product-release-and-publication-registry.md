# Product release and publication registry

The repository implementation provides two compatible registry layers:

- a filesystem-backed immutable registry for deterministic local product proof;
- API-backed release, artifact, job, binding, hold, and audit records stored within the existing tenant-partitioned public-publication aggregate.

An accepted product release binds its immutable release ID and version to source commit, root lock hash, package versions, test-evidence references, licensing/NOTICE state, starter identity when present, artifact/manifest hashes, status, supersession, and replay-protection revision. An accepted tenant artifact binds tenant UID, publication/release IDs, source snapshot, hosting class, indexing/form modes, inventory counts, predecessor, and rollback identity.

The API surface under `/api/admin/publication-products` supports:

- tenant-scoped and SuperAdmin inventory/center reads;
- release and artifact list/register/detail/supersede operations;
- job list/create/detail/resume/promote/rollback operations;
- publication revoke;
- cursor-bounded projections containing metadata, holds, and redacted audit history.

Authorization is fail closed. TenantAdmin is restricted to its own tenant; release registration and supersession require SuperAdmin. Mutations require idempotency and expected revision, immutable fields cannot be rewritten, and conflicting replay is rejected.

API registry and lifecycle source was introduced at `4b5741c5` and is included in final technical source commit `aab6823bd265cf91e77868a6649dd984016837b9`. The focused API regressions and full locked Mongo-enabled/Cosmos-only provider matrices passed in both clean roots. PUB-30 created no live registry records. Registering the preserved A02 baseline, a productized successor, a publication job, and its promotion/rollback sequence remains held by the platform-secret security gate.
