# Role Tenant Guard Result

Local guard modules added:

- `src/api/security/local-role-guard.mjs`
- `src/api/security/tenant-scope-guard.mjs`

Simulated roles:

- `SuperAdmin`
- `TenantAdmin`
- `Operator`
- `ContentEditor`
- `Viewer`
- `BackupOperator`

Tested behavior:

- `SuperAdmin` can read the fixture tenant.
- `Viewer` can read the assigned fixture tenant.
- `TenantAdmin` is denied when assigned to a different tenant.

Denied tenant scope returns:

- `OUTBOUND_LINK_FORBIDDEN_TENANT`

This is local simulation only and does not alter production authentication or authorization.

