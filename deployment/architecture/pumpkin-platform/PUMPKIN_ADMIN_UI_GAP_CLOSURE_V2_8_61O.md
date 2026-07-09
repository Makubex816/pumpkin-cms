# Pumpkin Admin UI Gap Closure V2.8.61O

Status: source-level gap closure complete.

## Source Discovery

Dashboard routes are implemented under `apps/admin/src/app/dashboard/`.

The dashboard shell navigation lives in `apps/admin/src/app/dashboard/layout.tsx`.

The canonical lead inbox route is:

- `/dashboard/forms`
- Source: `apps/admin/src/app/dashboard/forms/page.tsx`
- Nav label: `Leads/Form Entries`

## Gap

Historical docs and operator language referenced `/dashboard/leads`, while the implemented UI used `/dashboard/forms`.

## Closure

Added:

- `apps/admin/src/app/dashboard/leads/page.tsx`

Behavior:

- `/dashboard/leads` redirects to `/dashboard/forms`.
- No write controls were added.
- No API behavior changed.
- `/dashboard/forms` remains canonical.
- Runtime proof of the alias requires a future deploy.

## SuperAdmin Boundary Source Review

The following are nav-filtered to `SuperAdmin` in `apps/admin/src/app/dashboard/layout.tsx` and have page-level `user?.role === 'SuperAdmin'` restrictions:

- `/dashboard/onboarding`
- `/dashboard/onboarding/backups`
- `/dashboard/onboarding/packages`
- `/dashboard/onboarding/domains`
- `/dashboard/users`
- `/dashboard/tenants`

Backup and Package Intake pages remain operator-assisted and do not run browser backup/package jobs.

## Remaining Route Naming Notes

- `/dashboard/import-intake`, `/dashboard/import-executions`, and `/dashboard/operator-handoffs` exist as read-only projection routes but are not part of the named SuperAdmin onboarding nav group.
- Future work may decide whether those projection routes should also be hidden from TenantAdmin navigation, but V2.8.61O did not change their behavior.
