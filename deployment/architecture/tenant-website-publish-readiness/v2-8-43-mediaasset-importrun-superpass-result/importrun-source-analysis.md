# ImportRun Source Analysis

Result: source fix required and implemented.

Existing source before V2.8.43 had:

- Tenant-scoped Admin Page list/get/create/update routes.
- Tenant-scoped ImportRun list/get/create audit routes.
- Admin UI client-side Page Import/Export workflow.

Gaps found:

- No dedicated API page export endpoint.
- No dedicated API page import endpoint.
- No JWT-authenticated Admin page cleanup delete route.

Implemented directly scoped source fix:

- `GET /api/admin/pages/{tenantId}/export` for one page by slug.
- `POST /api/admin/pages/{tenantId}/import` for exactly one page and one ImportRun audit record.
- `DELETE /api/admin/pages/{tenantId}/{**pageSlug}` for authenticated tenant-scoped page cleanup.

Out of scope: Themes, Forms, FormEntry/contact, media binaries, deployment actions, indexing, and protected config changes.

