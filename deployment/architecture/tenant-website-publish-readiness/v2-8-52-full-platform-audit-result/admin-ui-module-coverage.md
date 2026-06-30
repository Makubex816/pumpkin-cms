# Admin UI Module Coverage

| Module | Route | Route Status | Workflow Proof Status | Gap |
| --- | --- | --- | --- | --- |
| Dashboard | `/dashboard` | Production HTTP 200 | Read-only route load proven | None for load. |
| Tenants | `/dashboard/tenants` | Source route present | SuperAdmin read-only tenant list proven through API | Live create/update/delete not approved in V2.8.52. |
| Pages | `/dashboard/pages` | Source route present; prior browser proof | Create/update/public/sitemap cleanup proven for Ice | Secondary tenant workflow not run. |
| Page editor | `/dashboard/pages/[id]/edit` | Source route present | Ice Page edit workflow proven | Secondary tenant not proven. |
| Page map | `/dashboard/page-map` | Source route present | Route coverage only | Workflow proof missing. |
| Media | `/dashboard/media` | Source route present; prior read route proof | MediaAsset lifecycle proven by API; UI read route proved | Secondary upload not run. |
| Themes | `/dashboard/themes` | Source route present | Browser Theme CRUD proof passed and cleaned | Secondary theme baseline not run. |
| Form Builder | `/dashboard/form-builder` | Source route present | Browser FormDefinition CRUD proof passed and cleaned | Secondary form baseline not run. |
| Forms/FormEntries | `/dashboard/forms` | Source route present | FormEntry readback proven; status update not part of V2.8.52 | Non-contact submit optional. |
| Import/Export | `/dashboard/pages/import-export` | Source route present | API import/export proved in V2.8.43A | Secondary import not run. |
| Import runs | `/dashboard/pages/import-runs` | Source route present | ImportRun readback proved | Secondary import runs absent. |
| Publishing | `/dashboard/publishing` | Source route present | PublishRun integration proved | Secondary publish not run. |
| Import intake | `/dashboard/import-intake` | Source route present | Read-only/prototype source present | Not V2.8 live-workflow proven. |
| Import executions | `/dashboard/import-executions` | Source route present | Read-only/prototype source present | Not V2.8 live-workflow proven. |
| Operator handoffs | `/dashboard/operator-handoffs` | Source route present | Read-only/prototype source present | Not V2.8 live-workflow proven. |
| Audit jobs | `/dashboard/audit-jobs` | Source route present | Read-only/prototype source present | Not V2.8 live-workflow proven. |
| Outbound links | `/dashboard/outbound-links/*` | Source route present | Separate outbound-link lane, not V2.8 tenant expansion proof | Keep outside active V2.8 creation map. |
