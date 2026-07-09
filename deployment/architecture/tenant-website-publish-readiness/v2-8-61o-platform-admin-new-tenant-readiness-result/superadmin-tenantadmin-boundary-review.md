# SuperAdmin/TenantAdmin Boundary Review

Status: source reviewed.

## SuperAdmin-Only Nav Items

Source: `apps/admin/src/app/dashboard/layout.tsx`

The following nav entries include `roles: ['SuperAdmin']`:

- Onboarding: `/dashboard/onboarding`
- Backups: `/dashboard/onboarding/backups`
- Packages: `/dashboard/onboarding/packages`
- Domains: `/dashboard/onboarding/domains`
- Users/Admins: `/dashboard/users`
- Tenants: `/dashboard/tenants`

## Page-Level Guards

The following pages check `user?.role === 'SuperAdmin'` and return an Access Restricted state for non-SuperAdmin users:

- `apps/admin/src/app/dashboard/onboarding/page.tsx`
- `apps/admin/src/app/dashboard/onboarding/backups/page.tsx`
- `apps/admin/src/app/dashboard/onboarding/packages/page.tsx`
- `apps/admin/src/app/dashboard/onboarding/domains/page.tsx`
- `apps/admin/src/app/dashboard/users/page.tsx`
- `apps/admin/src/app/dashboard/tenants/page.tsx`

## Remaining Credential Gap

V2.8.61O did not perform live TenantAdmin proof because approved TenantAdmin credentials were not available. This remains a carryforward gap from V2.8.61M.
