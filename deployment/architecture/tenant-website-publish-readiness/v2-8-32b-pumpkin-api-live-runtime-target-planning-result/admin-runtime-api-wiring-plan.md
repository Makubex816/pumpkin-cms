# Admin Runtime API Wiring Plan

## Source wiring

| Admin source | Purpose |
| --- | --- |
| `apps/admin/src/lib/api.ts:17` | Defines `API_URL` as `NEXT_PUBLIC_API_URL` with localhost fallback |
| `apps/admin/src/lib/api.ts:402` | Lists form entries |
| `apps/admin/src/lib/api.ts:416` | Reads one form entry |
| `apps/admin/src/lib/api.ts:429` | Updates form-entry status |
| `apps/admin/src/app/dashboard/forms/page.tsx:48` | Calls `apiClient.getFormEntries(token, currentTenant.tenantId)` |

## Required runtime binding

| Setting name | Target value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://app-pumpkin-api-prod-eastus-001.azurewebsites.net` after API host is verified |

## Admin validation gates

1. API host exists and health passes.
2. API provider metadata is readable with approved JWT and reports production Cosmos profile.
3. Admin runtime is built with the verified `NEXT_PUBLIC_API_URL`.
4. Admin form-entry list returns from `GET /api/admin/ice-rink-rentals/form-entries`.
5. After isolated contact write, Admin readback returns the same `FormEntry` id.

## Important invariant

Admin and static contact must use the same Pumpkin API base URL. If Admin points at a different backend than static contact, the contact gate can fail even when the write succeeds.
