# Admin Readonly UI

Phase 2H-10 adds a local read-only Admin UI foundation for the Outbound Link Manager.

Implemented route family:

- `/dashboard/outbound-links`
- `/dashboard/outbound-links/[id]`
- `/dashboard/outbound-links/[id]/instances`
- `/dashboard/outbound-links/instances`
- `/dashboard/outbound-links/policies`
- `/dashboard/outbound-links/scan-runs`
- `/dashboard/outbound-links/audit`
- `/dashboard/outbound-links/review`
- `/dashboard/outbound-links/exports`

The UI uses `apps/admin/src/lib/outbound-links/mock-provider.ts` and does not call live Admin, CMS, Azure, or crawler services.

