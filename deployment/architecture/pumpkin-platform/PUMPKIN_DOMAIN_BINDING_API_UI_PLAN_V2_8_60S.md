# Pumpkin Domain Binding API UI Plan V2.8.60S

Status: design complete.

API routes are planned as SuperAdmin-only routes under Admin API:

- GET `/api/admin/domain-bindings`
- GET `/api/admin/tenants/{tenantId}/domain-bindings`
- POST `/api/admin/tenants/{tenantId}/domain-bindings`
- POST `/api/admin/tenants/{tenantId}/domain-bindings/{id}/generate-dns-packet`
- POST `/api/admin/tenants/{tenantId}/domain-bindings/{id}/validate-dns`
- POST `/api/admin/tenants/{tenantId}/domain-bindings/{id}/bind-azure-hostname`
- POST `/api/admin/tenants/{tenantId}/domain-bindings/{id}/verify-tls`
- POST `/api/admin/tenants/{tenantId}/domain-bindings/{id}/promote`
- POST `/api/admin/tenants/{tenantId}/domain-bindings/{id}/rollback`

The Admin UI should add:

- `/dashboard/onboarding/domains`
- optional `/dashboard/tenants/[tenantId]/domains`

Screens:

- Domain Overview.
- Add/Replace Domain.
- DNS Record Packet.
- Validation.
- Azure Binding/TLS.
- Promote Canonical Domain.
- Rollback/History.

Guardrails:

- TenantAdmin must not see or access the feature.
- DNS validation must precede Azure binding.
- Runtime proof must precede canonical promotion.
- Rollback must preserve audit history.

