# Admin Inbox Read Path Confirmation

Admin Lead Inbox source reads Pumpkin `FormEntry` records.

Evidence:

- `apps/admin/src/app/dashboard/forms/page.tsx:48` calls `apiClient.getFormEntries(token, currentTenant.tenantId)`.
- `apps/admin/src/lib/api.ts:402-413` calls `GET /api/admin/{tenantId}/form-entries`.
- `apps/pumpkin-api/Program.cs:1247-1276` maps the Admin FormEntry list route and requires authorization.
- `apps/pumpkin-api/Services/CosmosDataConnection.cs:479-502` queries `FormEntry` records by `tenantId`.

No Admin live readback was performed in this phase.
