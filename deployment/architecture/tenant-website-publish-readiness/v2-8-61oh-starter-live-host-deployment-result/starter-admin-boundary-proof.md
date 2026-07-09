# Starter Admin Boundary Proof

Boundary proof result: passed.

Source classification:

- `STARTER_ADMIN_CLASSIFICATION`: `tenant_site_local_admin_surface`
- `STARTER_PLATFORM_ADMIN_SOURCE_OF_TRUTH`: `standalone_pumpkin_admin_ui`

Starter admin workflows:

- Dashboard: `/admin`
- Pages: `/admin/pages`
- Page Map: `/admin/page-map`
- Forms: `/admin/forms`
- Themes: `/admin/themes`

Starter local API routes:

- `/api/admin/auth/login`
- `/api/admin/auth/logout`
- `/api/admin/pages`
- `/api/admin/pages/[...slug]`
- `/api/admin/forms/definitions`
- `/api/admin/forms/definitions/[id]`
- `/api/admin/themes`
- `/api/admin/themes/[id]`
- `/api/admin/themes/[id]/activate`

Denied platform controls are explicitly listed in source:

- Backup Manager
- Package Intake
- Domain Manager
- Users/Admins platform management
- Hardcopy/recovery controls
- Resource management
- Cross-tenant controls

The standalone Admin UI remains the platform control plane at `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net`.
