# Multi-Tenant Architecture Contract Summary

V2.8.36 created the durable platform contract at `deployment/architecture/pumpkin-platform/PUMPKIN_MULTI_TENANT_PLATFORM_CONTRACT.md`.

The contract defines Pumpkin as a shared API and shared data platform with strict logical tenant isolation. Tenant isolation must be enforced through:

- `tenantId` on tenant-owned records;
- `/tenantId` partitioning for active Cosmos containers;
- tenant-scoped source queries;
- public tenant API keys;
- Admin JWT tenant and role claims;
- SuperAdmin-only cross-tenant access;
- tenant-specific static runtime bindings;
- media separation by resource, container, prefix, or source mapping.

Future phases must pass the multi-tenancy gate before closeout.
