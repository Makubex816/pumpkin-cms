# Authorization Gate Result

Authorization service:

- `IOutboundLinkAuthorizationService`
- `OutboundLinkAuthorizationService`

Supported read roles:

- `SuperAdmin`
- `TenantAdmin`
- `Operator`
- `ContentEditor`
- `Viewer`
- `BackupOperator`

Rules:

- Requests must be authenticated.
- `SuperAdmin` can read all local/fake tenant scopes.
- Other roles can read only when authenticated `tenantId` matches requested `tenantKey`.
- Disallowed role returns `OUTBOUND_LINK_FORBIDDEN_ROLE`.
- Tenant mismatch returns `OUTBOUND_LINK_FORBIDDEN_TENANT`.

Tests covered wrong-tenant denial and Viewer read-only access.

