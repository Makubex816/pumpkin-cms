# Admin UI Route Map

Source root: `apps/admin/src/app/dashboard/`

| Route | Owner-friendly name | Source | Boundary |
| --- | --- | --- | --- |
| `/dashboard` | Dashboard | `dashboard/page.tsx` | authenticated |
| `/dashboard/pages` | Pages | `dashboard/pages/page.tsx` | authenticated |
| `/dashboard/pages/[id]` | Page edit/detail legacy route | `dashboard/pages/[id]/page.tsx` | authenticated |
| `/dashboard/pages/[id]/edit` | Page editor | `dashboard/pages/[id]/edit/page.tsx` | authenticated |
| `/dashboard/pages/[id]/view` | Page preview/detail | `dashboard/pages/[id]/view/page.tsx` | authenticated |
| `/dashboard/pages/import-export` | Page import/export | `dashboard/pages/import-export/page.tsx` | authenticated, write controls exist but not used |
| `/dashboard/pages/import-diff` | Import diff | `dashboard/pages/import-diff/page.tsx` | authenticated |
| `/dashboard/pages/import-runs` | Import runs | `dashboard/pages/import-runs/page.tsx` | authenticated |
| `/dashboard/pages/content-packages` | Content packages | `dashboard/pages/content-packages/page.tsx` | authenticated |
| `/dashboard/pages/content-validator` | Content validator | `dashboard/pages/content-validator/page.tsx` | authenticated |
| `/dashboard/forms` | Leads/Form Entries | `dashboard/forms/page.tsx` | authenticated |
| `/dashboard/forms/[id]` | Form entry detail | `dashboard/forms/[id]/page.tsx` | authenticated |
| `/dashboard/leads` | Leads alias | `dashboard/leads/page.tsx` | redirects to `/dashboard/forms` |
| `/dashboard/form-builder` | Form Builder | `dashboard/form-builder/page.tsx` | authenticated |
| `/dashboard/media` | Media | `dashboard/media/page.tsx` | authenticated |
| `/dashboard/media/[id]` | Media detail | `dashboard/media/[id]/page.tsx` | authenticated |
| `/dashboard/themes` | Themes | `dashboard/themes/page.tsx` | authenticated |
| `/dashboard/themes/[id]` | Theme detail/editor | `dashboard/themes/[id]/page.tsx` | authenticated |
| `/dashboard/publishing` | Publishing | `dashboard/publishing/page.tsx` | authenticated, no deploy run in V2.8.61O |
| `/dashboard/publishing/action-center` | Publishing action center | `dashboard/publishing/action-center/page.tsx` | authenticated |
| `/dashboard/publishing/repairs` | Publishing repairs | `dashboard/publishing/repairs/page.tsx` | authenticated |
| `/dashboard/outbound-links` | Outbound Links | `dashboard/outbound-links/page.tsx` | authenticated |
| `/dashboard/audit-jobs` | Audit Jobs | `dashboard/audit-jobs/page.tsx` | authenticated |
| `/dashboard/page-map` | Page Map | `dashboard/page-map/page.tsx` | authenticated |
| `/dashboard/icons` | Icons | `dashboard/icons/page.tsx` | authenticated |
| `/dashboard/import-intake` | Import Intake Preview | `dashboard/import-intake/page.tsx` | authenticated, read-only projection |
| `/dashboard/import-executions` | Import Execution Projection | `dashboard/import-executions/page.tsx` | authenticated, read-only projection |
| `/dashboard/operator-handoffs` | Operator Handoffs | `dashboard/operator-handoffs/page.tsx` | authenticated, read-only projection |
| `/dashboard/onboarding` | Tenant Onboarding | `dashboard/onboarding/page.tsx` | SuperAdmin nav + page guard |
| `/dashboard/onboarding/backups` | Backups | `dashboard/onboarding/backups/page.tsx` | SuperAdmin nav + page guard |
| `/dashboard/onboarding/packages` | Packages | `dashboard/onboarding/packages/page.tsx` | SuperAdmin nav + page guard |
| `/dashboard/onboarding/domains` | Domains | `dashboard/onboarding/domains/page.tsx` | SuperAdmin nav + page guard |
| `/dashboard/users` | Users/Admins | `dashboard/users/page.tsx` | SuperAdmin nav + page guard |
| `/dashboard/tenants` | Tenants | `dashboard/tenants/page.tsx` | SuperAdmin nav + page guard |

Navigation source: `apps/admin/src/app/dashboard/layout.tsx`.
