# Pumpkin Admin UI Feature Coverage V2.8.54A

Date: 2026-07-01

Status: completed_read_only_no_mutation

This durable matrix summarizes Admin UI feature coverage after V2.8.54A. It is a planning and audit artifact only; V2.8.54A did not create tenants, mutate records, submit forms, upload media, deploy, mutate Azure/appsettings/DNS/indexing, run key-listing operations, generate SAS values, or generate provider connection material.

| Feature | Admin Route | Source/Provider | Proof Status | Notes |
| --- | --- | --- | --- | --- |
| Dashboard | `/dashboard` | `apps/admin/src/app/dashboard/page.tsx` | route_readonly_proven | App shell returned HTTP 200 |
| Page editor | `/dashboard/pages`, `/dashboard/pages/[id]/edit` | `apps/admin/src/app/dashboard/pages/*`, `apps/admin/src/lib/api.ts` | source_present_not_live_proven | Page list/create/update source exists; no V2.8.54A writes |
| Media manager | `/dashboard/media` | `apps/admin/src/app/dashboard/media/page.tsx`, `apps/admin/src/lib/api.ts` | source_present_not_live_proven | Upload source exists; no V2.8.54A upload |
| Theme manager/builder | `/dashboard/themes`, `/dashboard/themes/[id]` | `apps/admin/src/app/dashboard/themes/*` | browser_workflow_proven | V2.8.49 browser CRUD proof passed |
| Form Builder/FormDefinition editor | `/dashboard/form-builder` | `apps/admin/src/app/dashboard/form-builder/page.tsx` | browser_workflow_proven | V2.8.48 API proof and V2.8.49 browser proof passed |
| Leads/FormEntry viewer | `/dashboard/forms` | `apps/admin/src/app/dashboard/forms/*` | route_readonly_proven | Current route is `/dashboard/forms`; `/dashboard/leads` is missing |
| Import/export | `/dashboard/pages/import-export` | `apps/admin/src/app/dashboard/pages/import-export/page.tsx` | source_present_not_live_proven | Dry-run/export/write modes exist by source; no V2.8.54A writes |
| Publishing readiness | `/dashboard/publishing` | `apps/admin/src/app/dashboard/publishing/page.tsx` | route_readonly_proven | PublishRun reads by source; no deploy |
| Publish action center | `/dashboard/publishing/action-center` | `apps/admin/src/app/dashboard/publishing/action-center/page.tsx` | source_present_not_live_proven | Manifest review and PublishRun create source exist; no V2.8.54A writes |
| Publishing repairs | `/dashboard/publishing/repairs` | `apps/admin/src/app/dashboard/publishing/repairs/page.tsx` | source_present_not_live_proven | Repair preview/apply source exists; no V2.8.54A writes |
| Tenant management | `/dashboard/tenants` | `apps/admin/src/app/dashboard/tenants/page.tsx` | source_present_not_live_proven | Tenant create/update/delete/key rotation source exists; creation remains blocked |
| Outbound links | `/dashboard/outbound-links` | `apps/admin/src/components/outbound-links/*` | route_readonly_proven | Current route loads; write progression requires separate approval |
| Audit jobs | `/dashboard/audit-jobs` | `apps/admin/src/components/audit-jobs/*` | route_readonly_proven | Read-only evidence surface |
| Page map | `/dashboard/page-map` | `apps/admin/src/app/dashboard/page-map/page.tsx` | route_readonly_proven | Page route review and update source |
| Icons | `/dashboard/icons` | `apps/admin/src/app/dashboard/icons/page.tsx` | route_readonly_proven | Brand/icon utility surface |
| Import intake | `/dashboard/import-intake` | `apps/admin/src/lib/import-intake/*` | route_readonly_proven | Intake projection surface |
| Import executions | `/dashboard/import-executions` | `apps/admin/src/lib/import-executions/*` | route_readonly_proven | Operator projection surface |
| Operator handoffs | `/dashboard/operator-handoffs` | `apps/admin/src/lib/operator-handoffs/*` | route_readonly_proven | Handoff projection surface |

Known route gap:

- `/dashboard/leads` is prompt-listed but not implemented. The current Leads/FormEntry route is `/dashboard/forms`.

Operator guidance:

- Treat Admin UI writes as source-present unless a prior proof explicitly covers that workflow.
- Real tenant creation remains blocked until partner package, secure handoff, and live mutation approval are all present.
