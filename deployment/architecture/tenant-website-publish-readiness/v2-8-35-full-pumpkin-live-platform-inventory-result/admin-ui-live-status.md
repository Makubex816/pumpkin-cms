# Admin UI Live Status

Classification: `local_only_not_live_deployed`.

Source status:

- Admin app path: `apps/admin`.
- Framework: Next.js 14 app.
- API client source: `apps/admin/src/lib/api.ts`.
- API binding env name: `NEXT_PUBLIC_API_URL`.
- Source fallback API URL: `http://localhost:5064`.
- Type-check result: passed.
- Admin routes include login, dashboard, tenants, pages, page editor/view, media, forms, publishing, import/export, outbound links, audit jobs, import intake, import executions, and operator handoffs.

Azure status:

- No Static Web App, Web App, or clear Azure resource was found for a deployed Admin UI.
- Existing SWAs are for public Ice production and isolated proof environments, not Admin UI.

Recommended next deployment target:

- Resource group: `rg-pumpkin-api-prod-centralus`.
- Resource name: `swa-pumpkin-admin-prod-centralus-001`.
- App root: `apps/admin`.
- Required public env binding: `NEXT_PUBLIC_API_URL=https://app-pumpkin-api-prod-centralus-001.azurewebsites.net`.
- Deployment should be a separate approval after container alignment and Admin API auth proof are revalidated.

V2.8.35 did not deploy the Admin UI.
