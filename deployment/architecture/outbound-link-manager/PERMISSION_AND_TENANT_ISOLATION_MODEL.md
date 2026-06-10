# Permission And Tenant Isolation Model

## Roles

`SuperAdmin`: Can manage links across tenants.

`TenantAdmin`: Can manage links for assigned tenant only.

`Operator`: Can run approved scans and prepare reports.

`ContentEditor`: Can view links and request changes.

`Viewer`: Read-only.

`SystemScanner`: Can create/update discovered instances through a controlled service path only.

`BackupOperator`: Can export registry data but cannot change links.

## Tenant Isolation Rules

- Every record must include tenant and site scope.
- Every query must include tenant/site filters.
- Every route must authorize tenant access before loading data.
- Bulk action previews and execution must be scoped to one tenant/site unless a SuperAdmin explicitly chooses cross-tenant reporting.
- Audit logs must include tenant/site fields.
- Backup exports must never mix tenant records unless the backup scope is explicitly platform-level.

## System Scanner Permissions

The scanner should not act as a normal user. It should use a constrained service identity or local execution context that can write only discovery results after validation in future implementation phases.

For Phase 2H-1, this is design only and no scanner writes occur.
