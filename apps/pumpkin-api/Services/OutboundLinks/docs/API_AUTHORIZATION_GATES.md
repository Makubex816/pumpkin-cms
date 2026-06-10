# API Authorization Gates

Phase 2H-9 adds local read-only authorization gates for Outbound Link Manager endpoints.

Required:

- JWT-authenticated request.
- `tenantId` claim.
- role claim through `ClaimTypes.Role` or `role`.
- requested `tenantKey` and `siteKey`.

Allowed read roles:

- `SuperAdmin`
- `TenantAdmin`
- `Operator`
- `ContentEditor`
- `Viewer`
- `BackupOperator`

Rules:

- `SuperAdmin` can read any local/fake tenant scope.
- Other roles can read only when the authenticated `tenantId` matches requested `tenantKey`.
- Missing or disallowed role returns `OUTBOUND_LINK_FORBIDDEN_ROLE`.
- Tenant mismatch returns `OUTBOUND_LINK_FORBIDDEN_TENANT`.

This phase does not change production auth token issuance.

