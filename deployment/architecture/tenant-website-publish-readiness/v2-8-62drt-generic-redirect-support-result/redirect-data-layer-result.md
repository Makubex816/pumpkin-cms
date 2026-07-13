# Redirect Data-Layer Result

## Cosmos

- Dedicated `TenantRedirect` container.
- Partition key: `/tenantId`.
- Unique key: `/sourcePath` plus `/active` within the tenant partition.
- Every list/read/update/resolve query uses the normalized tenant partition.
- Runtime resolution requires a valid tenant API key and a resolved active record.
- Read/list/validate does not create the container; only a future approved create operation calls `CreateContainerIfNotExistsAsync`.

## Mongo

- Dedicated `TenantRedirect` collection under the existing `USE_MONGODB` implementation boundary.
- Compound unique index on tenant, source path, and active state.
- Every operation filters by tenant.
- Runtime resolution requires a valid tenant API key and a resolved active record.

## Backup And Restore

`TenantRedirectBackupEnvelope` is a versioned `pumpkin.tenant-redirects` representation. Restore validation checks schema/kind, tenant scope, IDs, canonical source/target, status code, active/pending safety, precedence metadata, source-state uniqueness, self-loops, and active graph cycles. Focused JSON round-trip proof preserved inactive state and audit events and rejected cross-tenant restore.

No Cosmos container or redirect record was created during DRT.
