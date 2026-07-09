# FormEntry Readback And Isolation Proof

## Source Isolation Model

FormEntry creation is tenant-scoped in source:

- `apps/pumpkin-api/Managers/PumpkinManager.cs:178` handles tenant submit.
- `apps/pumpkin-api/Managers/PumpkinManager.cs:223` handles submit aliases.
- `apps/pumpkin-api/Services/CosmosDataConnection.cs:422` validates the tenant API key and writes a FormEntry with tenant context.
- `apps/pumpkin-api/Services/CosmosDataConnection.cs:479` reads FormEntries by tenant.
- `apps/pumpkin-api/Services/CosmosDataConnection.cs:511` reads a single FormEntry by tenant and id.

The readback queries use the tenant id partition, which is the source-supported tenant isolation boundary for FormEntry reads.

## Admin API Readback Routes

Readback routes exist:

- `GET /api/admin/{tenantId}/form-entries`
- `GET /api/admin/{tenantId}/form-entries/{id}`
- `GET /api/admin/forms/{tenantId}/entries`
- `GET /api/admin/forms/{tenantId}/entries/{entryId}`

## Live Auth Boundary

Unauthenticated readback checks on 2026-07-09 returned:

| Path | Status |
| --- | ---: |
| `/api/admin/ice-rink-rentals/form-entries` | 401 |
| `/api/admin/forms/ice-rink-rentals/entries` | 401 |
| `/api/admin/forms/ice-rink-rentals/definitions` | 401 |
| `/api/admin/party-pros-philadelphia/form-entries` | 401 |
| `/api/admin/forms/party-pros-philadelphia/entries` | 401 |
| `/api/admin/forms/party-pros-philadelphia/definitions` | 401 |
| `/api/admin/forms/airstrip-club-las-vegas/definitions` | 401 |

No secrets, tokens, cookies, or protected config values were used or printed.

## Cross-Tenant Isolation

No cross-tenant leakage was observed in unauthenticated probes; all Admin readback routes rejected unauthenticated access.

Authenticated cross-tenant readback proof remains pending because OL did not include an approved Admin/SuperAdmin credential handoff.

## Result

Source isolation: present.

Unauthenticated live boundary: enforced.

Authenticated live FormEntry readback/isolation: blocked pending approved readback auth.
