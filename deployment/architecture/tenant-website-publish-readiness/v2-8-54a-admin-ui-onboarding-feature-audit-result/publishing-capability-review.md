# Publishing Capability Review

Primary routes:

- `/dashboard/publishing`
- `/dashboard/publishing/action-center`
- `/dashboard/publishing/repairs`

Primary source:

- `apps/admin/src/app/dashboard/publishing/page.tsx`
- `apps/admin/src/app/dashboard/publishing/action-center/page.tsx`
- `apps/admin/src/app/dashboard/publishing/repairs/page.tsx`
- `apps/admin/src/lib/api.ts`

Observed capabilities:

- Tenant publishing readiness review.
- PublishRun history read.
- Static dry-run manifest parsing and correlation.
- CMS publish history creation by source.
- Metadata repair preview.
- Page repair application by source through normal page update endpoints.

V2.8.54A did not create PublishRun records, apply repairs, run static publish dry-runs, deploy, mutate DNS, or trigger indexing.

Current status: source_present_not_live_proven for write paths; route_readonly_proven for app-shell route load. V2.8.44 remains the publish-run/static-site integration proof baseline.

