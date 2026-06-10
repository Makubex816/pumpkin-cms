# Admin Fake Data Provider

The Phase 2H-10 UI uses `apps/admin/src/lib/outbound-links/mock-provider.ts`.

Provider characteristics:

- local-only fixture records
- typed DTOs in `apps/admin/src/lib/outbound-links/types.ts`
- tenant/site values derived from the selected Admin tenant when available
- Phase 2H-9-style envelope metadata
- dashboard summary calculation
- local filtering, sorting, pagination, detail lookup, review queue, and export-status helpers

Provider guard metadata records:

- `externalHttpCrawling: false`
- `cmsApiCalls: false`
- `cmsWrites: false`
- `protectedConfigReads: false`

