# Local Role And Tenant Guards

Phase 2H-8 adds local guard simulation for future API/Admin behavior.

Supported local roles:

- `SuperAdmin`
- `TenantAdmin`
- `Operator`
- `ContentEditor`
- `Viewer`
- `BackupOperator`

Read rules:

- `SuperAdmin` can read any local store tenant in simulation.
- Tenant-scoped roles must include the requested tenant in `assignedTenants`.
- If `assignedSites` is provided, the requested site must be included.
- Requested tenant/site must match the local store tenant/site.

Denied tenant scope returns:

- `OUTBOUND_LINK_FORBIDDEN_TENANT`

Denied role returns:

- `OUTBOUND_LINK_FORBIDDEN_ROLE`

This is a local simulation only. It does not modify the production authentication or authorization system.

