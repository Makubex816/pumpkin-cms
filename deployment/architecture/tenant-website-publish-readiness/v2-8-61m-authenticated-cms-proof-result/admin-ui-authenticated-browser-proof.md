# Admin UI Authenticated Browser Proof

Status: passed.

Admin UI base:

`https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net`

Execution:

- Chrome was launched with a temporary profile under `.tmp/v2-8-61m/browser-profile`.
- Auth state was seeded in browser storage in memory for the temporary profile only.
- No browser storage value was printed.
- The browser profile was deleted after proof collection.
- No clicks, submits, uploads, deletes, DNS validations, backup executions, or package executions were performed.

| Route | Surface | Final path | Rendered | Label matched | Access restricted |
| --- | --- | --- | --- | --- | --- |
| `/dashboard` | Dashboard | `/dashboard` | yes | yes | no |
| `/dashboard/forms` | Forms/FormEntries | `/dashboard/forms` | yes | yes | no |
| `/dashboard/pages` | Pages | `/dashboard/pages` | yes | yes | no |
| `/dashboard/form-builder` | Form Builder | `/dashboard/form-builder` | yes | yes | no |
| `/dashboard/media` | Media | `/dashboard/media` | yes | yes | no |
| `/dashboard/themes` | Themes | `/dashboard/themes` | yes | yes | no |
| `/dashboard/users` | Users/Admins | `/dashboard/users` | yes | yes | no |
| `/dashboard/onboarding` | Onboarding | `/dashboard/onboarding` | yes | yes | no |
| `/dashboard/onboarding/domains` | Domains | `/dashboard/onboarding/domains` | yes | yes | no |
| `/dashboard/onboarding/backups` | Backups | `/dashboard/onboarding/backups` | yes | yes | no |
| `/dashboard/onboarding/packages` | Packages | `/dashboard/onboarding/packages` | yes | yes | no |

Source-discovered routes came from `apps/admin/src/app/dashboard/layout.tsx` and implemented route folders under `apps/admin/src/app/dashboard/`.

The Users/Admins page includes sign-in related profile copy, but the route rendered at `/dashboard/users` inside the authenticated Pumpkin shell and did not redirect to `/login`.
