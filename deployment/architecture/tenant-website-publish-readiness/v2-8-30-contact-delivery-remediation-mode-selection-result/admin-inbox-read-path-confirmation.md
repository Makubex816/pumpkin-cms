# Admin Inbox Read Path Confirmation

Admin Lead Inbox route:

- `apps/admin/src/app/dashboard/forms/page.tsx:45-50` calls `apiClient.getFormEntries(token, currentTenant.tenantId)`.
- Empty-state copy in `apps/admin/src/app/dashboard/forms/page.tsx:195-200` states that runtime and future static-compatible form endpoints feed the same inbox.

Admin API client:

- `apps/admin/src/lib/api.ts:402-413` calls `/api/admin/{tenantId}/form-entries`.
- `apps/admin/src/lib/api.ts:416-427` calls `/api/admin/{tenantId}/form-entries/{id}` for a detail read.

Pumpkin API read endpoints:

- `apps/pumpkin-api/Program.cs:1195-1224` lists tenant-scoped form entries with JWT authorization.
- `apps/pumpkin-api/Program.cs:1227-1256` reads one tenant-scoped form entry with JWT authorization.

Conclusion:

Admin does not read Graph mail, a provider inbox, function memory, generated dry-run IDs, or static function local response state. It reads Pumpkin API `FormEntry` records for the selected tenant.
