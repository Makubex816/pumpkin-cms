# Starter Admin Boundary Carryforward

Status: source reviewed.

Starter app `/admin` remains tenant-local and is not the platform Admin UI.

Evidence:

- `apps/starter-app/src/app/admin/(workspace)/layout.tsx` calls `requireStarterAdmin()`.
- `apps/starter-app/src/app/admin/(workspace)/page.tsx` describes the surface as `Starter Tenant-local Admin` and says workflows are scoped to the configured tenant.
- `apps/starter-app/src/lib/starter-admin-boundary.ts` classifies the surface as `tenant_site_local_admin_surface`.
- Starter admin routes use `/admin/...`, while platform Admin UI routes use `/dashboard/...`.

No starter-app source was changed in V2.8.61O.
