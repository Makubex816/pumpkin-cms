# DomainBinding API Route Result

Status: passed.

Implemented routes:

- GET `/api/admin/domain-bindings`
- GET `/api/admin/tenants/{tenantId}/domain-bindings`
- GET `/api/admin/tenants/{tenantId}/domain-bindings/{id}`
- POST `/api/admin/tenants/{tenantId}/domain-bindings`
- PUT `/api/admin/tenants/{tenantId}/domain-bindings/{id}`
- POST `/api/admin/tenants/{tenantId}/domain-bindings/{id}/generate-dns-packet`
- POST `/api/admin/tenants/{tenantId}/domain-bindings/{id}/validate-dns`

Not implemented in V2.8.60T:

- Azure hostname binding.
- TLS verification.
- Canonical promotion.
- Rollback.
- Admin UI.

