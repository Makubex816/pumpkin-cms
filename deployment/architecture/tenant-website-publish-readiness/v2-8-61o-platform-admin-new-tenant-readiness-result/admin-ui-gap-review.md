# Admin UI Gap Review

## Closed In V2.8.61O

| Gap | Decision | Result |
| --- | --- | --- |
| `/dashboard/forms` versus `/dashboard/leads` confusion | Keep `/dashboard/forms` canonical and add `/dashboard/leads` alias | Source-level redirect added |

## Source-Verified Boundaries

- Nav filters SuperAdmin-only items by `roles: ['SuperAdmin']`.
- Onboarding, Backups, Packages, Domains, Users/Admins, and Tenants have page-level SuperAdmin checks.
- Backup and Package pages state that browser execution is not active.

## Gaps Held

- TenantAdmin live denial proof remains blocked by credentials.
- `/dashboard/import-intake`, `/dashboard/import-executions`, and `/dashboard/operator-handoffs` are read-only projection routes outside the named SuperAdmin onboarding nav group; later policy can decide whether they should be nav-hidden from TenantAdmin.
- Existing Tenants page contains create/edit/delete/key controls by source, but no live mutation was executed and tenant creation remains unapproved.
