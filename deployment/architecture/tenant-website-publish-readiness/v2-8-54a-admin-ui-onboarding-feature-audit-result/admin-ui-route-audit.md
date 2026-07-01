# Admin UI Route Audit

GET-only production Admin UI app-shell route checks were run without authentication writes.

| Route | Source Status | GET Result | Audit Classification |
| --- | --- | --- | --- |
| `/` | present | HTTP 200 | route_readonly_proven |
| `/login` | present | HTTP 200 | route_readonly_proven |
| `/dashboard` | present | HTTP 200 | route_readonly_proven |
| `/dashboard/pages` | present | HTTP 200 | route_readonly_proven |
| `/dashboard/media` | present | HTTP 200 | route_readonly_proven |
| `/dashboard/themes` | present | HTTP 200 | route_readonly_proven |
| `/dashboard/form-builder` | present | HTTP 200 | route_readonly_proven |
| `/dashboard/publishing` | present | HTTP 200 | route_readonly_proven |
| `/dashboard/tenants` | present | HTTP 200 | route_readonly_proven |
| `/dashboard/leads` | missing | HTTP 404 | known_gap |
| `/dashboard/forms` | present | HTTP 200 | route_readonly_proven |
| `/dashboard/outbound-links` | present | HTTP 200 | route_readonly_proven |
| `/dashboard/audit-jobs` | present | HTTP 200 | route_readonly_proven |
| `/dashboard/page-map` | present | HTTP 200 | route_readonly_proven |
| `/dashboard/icons` | present | HTTP 200 | route_readonly_proven |
| `/dashboard/pages/import-export` | present | HTTP 200 | route_readonly_proven |
| `/dashboard/publishing/action-center` | present | HTTP 200 | route_readonly_proven |
| `/dashboard/publishing/repairs` | present | HTTP 200 | route_readonly_proven |
| `/dashboard/import-intake` | present | HTTP 200 | route_readonly_proven |
| `/dashboard/import-executions` | present | HTTP 200 | route_readonly_proven |
| `/dashboard/operator-handoffs` | present | HTTP 200 | route_readonly_proven |

Route note: the UI label for lead submissions exists in `/dashboard/forms/page.tsx`, but the prompt-listed `/dashboard/leads` path does not currently exist.

