# Admin To Pumpkin API Wiring Map

## Source path

| Layer | Source evidence | Runtime dependency |
| --- | --- | --- |
| Admin API base URL | `apps/admin/src/lib/api.ts:17` uses `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5064'` | Live Admin must have `NEXT_PUBLIC_API_URL` set to the verified Pumpkin API base URL |
| Admin list form entries | `apps/admin/src/lib/api.ts:402` calls form-entry list method | Requires JWT auth and tenant id |
| Admin dashboard forms page | `apps/admin/src/app/dashboard/forms/page.tsx:48` calls `apiClient.getFormEntries(token, currentTenant.tenantId)` | Requires active auth session and current tenant |
| Pumpkin API Admin route | `apps/pumpkin-api/Program.cs:1195` maps `GET /api/admin/{tenantId}/form-entries` | Requires live Pumpkin API host and configured provider |
| Pumpkin API single entry route | `apps/pumpkin-api/Program.cs:1227` maps `GET /api/admin/{tenantId}/form-entries/{id}` | Requires live Pumpkin API host and provider data |
| Pumpkin API status update route | `apps/pumpkin-api/Program.cs:1259` maps `PATCH /api/admin/{tenantId}/form-entries/{id}` | Later Admin workflow, not needed for contact persistence proof |

## Required live binding

Admin must point at the same Pumpkin API runtime that receives public contact writes. If Admin points to a different API, local API, stale API, or staging-only API, a successful contact write may still not appear in the Admin form-entry view.

## Verification order

1. Verify or expose live Pumpkin API host.
2. Verify API provider metadata and persistence provider target without reading secrets.
3. Bind Admin `NEXT_PUBLIC_API_URL` to the verified API base URL.
4. Run read-only Admin form-entry list check with approved auth.
5. Only after that, run a controlled contact write and confirm the returned id is visible through the same Admin API.
