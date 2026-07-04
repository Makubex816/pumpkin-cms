# Domain Binding API Plan

Status: design complete.

All candidate routes are SuperAdmin-only and require JWT authentication.

## Candidate Routes

- GET `/api/admin/domain-bindings`
- GET `/api/admin/tenants/{tenantId}/domain-bindings`
- POST `/api/admin/tenants/{tenantId}/domain-bindings`
- POST `/api/admin/tenants/{tenantId}/domain-bindings/{id}/generate-dns-packet`
- POST `/api/admin/tenants/{tenantId}/domain-bindings/{id}/validate-dns`
- POST `/api/admin/tenants/{tenantId}/domain-bindings/{id}/bind-azure-hostname`
- POST `/api/admin/tenants/{tenantId}/domain-bindings/{id}/verify-tls`
- POST `/api/admin/tenants/{tenantId}/domain-bindings/{id}/promote`
- POST `/api/admin/tenants/{tenantId}/domain-bindings/{id}/rollback`

## Service Layer

Recommended services:

- `DomainBindingService`: lifecycle orchestration and state transitions.
- `DomainBindingRepository`: data access abstraction.
- `DnsPacketService`: record packet generation and versioning.
- `DnsValidationService`: public DNS observation and comparison.
- `AzureHostnameBindingService`: hostname binding and TLS checks, gated by approval.
- `DomainRuntimeProofService`: GET-only proof after binding.
- `DomainBindingAuditService`: append-only audit event writer.

## Guardrails

- Endpoints must not return provider credentials.
- Provider mutation methods require an approval reference.
- DNS validation must happen before Azure hostname binding.
- Promotion must require runtime proof.
- Rollback must not mutate registrar DNS unless a later approval explicitly authorizes provider mutation.
- API responses must be redacted and safe for Admin UI display.

## Data Access Additions

Future `IDatabaseService` and `IDataConnection` additions should include:

- list bindings by tenant.
- get binding by tenant and id.
- create binding.
- update binding state.
- append audit event.
- set expected/observed DNS record results.
- set Azure binding/TLS status.
- set runtime proof result.

