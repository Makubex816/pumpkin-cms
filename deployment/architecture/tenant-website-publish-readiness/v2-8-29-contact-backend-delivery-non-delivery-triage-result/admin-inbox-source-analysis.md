# Admin Inbox Source Analysis

Source inspected:

- `apps/admin/src/app/dashboard/forms/page.tsx`
- `apps/admin/src/app/dashboard/forms/[id]/page.tsx`
- `apps/admin/src/lib/api.ts`
- `apps/pumpkin-api/Program.cs`

Finding:

Admin's "Lead Inbox" is a Pumpkin API read model, not a Microsoft Graph inbox, email provider inbox, or Static Web Apps function log viewer.

Evidence:

- The Admin forms page loads entries through `apiClient.getFormEntries(token, currentTenant.tenantId)`: `apps/admin/src/app/dashboard/forms/page.tsx:45-50`.
- The Admin API client calls `/api/admin/{tenantId}/form-entries`: `apps/admin/src/lib/api.ts:402-413`.
- The Admin detail page calls `/api/admin/{tenantId}/form-entries/{id}` and can patch only status/tags: `apps/admin/src/app/dashboard/forms/[id]/page.tsx:47-104`.
- Pumpkin API maps `GET /api/admin/{tenantId}/form-entries` to `databaseService.GetFormEntriesByTenantAsync(tenantId)`: `apps/pumpkin-api/Program.cs:1194-1224`.

Conclusion:

The Admin tenant quote/contact submissions view will show the V2.8.26 entry only if a `FormEntry` with that tenant and ID exists in the Pumpkin API backing store Admin is configured to read.

