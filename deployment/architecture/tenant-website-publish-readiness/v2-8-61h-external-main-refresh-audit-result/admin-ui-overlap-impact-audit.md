# Admin UI Overlap Impact Audit

Status: overlap confirmed.

Upstream standalone `apps/admin` changes include:

- `apps/admin/src/app/dashboard/users/page.tsx` added.
- `AdminPageHeader.tsx` and `AdminStates.tsx` added.
- Theme pages and API client changed.
- Admin layout/navigation changed.

Upstream starter app also embeds its own admin:

- `/admin/login`
- `/admin/(workspace)/forms`
- `/admin/(workspace)/pages`
- `/admin/(workspace)/themes`
- `/admin/(workspace)/page-map`

Current active Admin UI already includes or plans:

- `/dashboard`
- `/dashboard/pages`
- `/dashboard/themes`
- `/dashboard/form-builder`
- `/dashboard/forms`
- `/dashboard/tenants`
- `/dashboard/onboarding`
- `/dashboard/users`
- `/dashboard/onboarding/domains`
- `/dashboard/onboarding/backups`
- `/dashboard/onboarding/packages`
- `/dashboard/import-executions`
- `/dashboard/operator-handoffs`
- `/dashboard/outbound-links`

Compatibility finding:

The upstream Admin UI should not replace the current Admin UI. Useful pieces should be ported feature-by-feature after comparing:

- route paths;
- auth roles;
- API client response shapes;
- SuperAdmin/TenantAdmin boundaries;
- current operator-only no-write surfaces;
- current DomainBinding and backup/intake panels.

Embedded starter `/admin` conflicts with the standalone production Admin UI App Service if treated as the production admin surface. It can remain a future template/admin-in-a-box experiment.
