# Editor And Builder Capability Review

## Page Editor

Source files:

- `apps/admin/src/app/dashboard/pages/page.tsx`
- `apps/admin/src/app/dashboard/pages/[id]/edit/page.tsx`
- `apps/admin/src/lib/api.ts`

Capabilities observed by source:

- Tenant-scoped page list.
- Page creation and updates.
- Rich content block editing.
- Media picker integration.
- Static publishing warnings and preview/view/edit links.

V2.8.54A did not create or update a page. Current status: source_present_not_live_proven.

## Theme Manager/Builder

Source files:

- `apps/admin/src/app/dashboard/themes/page.tsx`
- `apps/admin/src/app/dashboard/themes/[id]/page.tsx`

Capabilities observed by source:

- Theme list/detail.
- Create/update/delete flows.
- Active theme toggle and menu editing surfaces.

Proof history: V2.8.49 browser Theme CRUD proof passed. Current status: browser_workflow_proven.

## Form Builder/FormDefinition Editor

Source files:

- `apps/admin/src/app/dashboard/form-builder/page.tsx`
- `apps/admin/src/lib/api.ts`

Capabilities observed by source:

- FormDefinition list/detail.
- Create/update/delete flows.
- Page binding support.
- Linkage to lead inbox and publishing review.

Proof history: V2.8.48 FormDefinition API/storage lifecycle proof and V2.8.49 Admin UI Form Builder browser CRUD proof passed. Current status: browser_workflow_proven.

## Leads/FormEntry Viewer

Source files:

- `apps/admin/src/app/dashboard/forms/page.tsx`
- `apps/admin/src/app/dashboard/forms/[id]/page.tsx`

Capabilities observed by source:

- FormEntry list.
- Status filtering.
- Form filtering.
- CSV and JSON export.
- Detail route link.

Current status: route_readonly_proven. Known gap: `/dashboard/leads` does not exist; current route is `/dashboard/forms`.

