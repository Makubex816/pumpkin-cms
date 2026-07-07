# Starter Admin Boundary Classification

Decision: Option A.

Starter `/admin` is a tenant-site-local admin surface for the configured starter tenant.

Allowed workflows:

- dashboard
- pages
- page map
- forms
- themes

Denied platform controls:

- Backup Manager
- Package Intake / Universal Onboarding
- Domain Manager
- users/admins platform management
- hardcopy/recovery/resource controls
- cross-tenant operations

Source enforcement:

- `apps/starter-app/src/lib/starter-admin-boundary.ts`
- `apps/starter-app/src/components/admin/AdminShell.tsx`
- `apps/starter-app/src/app/admin/(workspace)/page.tsx`
