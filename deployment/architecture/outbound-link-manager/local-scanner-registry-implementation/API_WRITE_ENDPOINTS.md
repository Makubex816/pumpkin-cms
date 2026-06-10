# API Write Endpoints

The Pumpkin API foundation now exposes scoped write endpoint handlers for local/fake provider testing:

- `PATCH /api/admin/outbound-links/{id}/status`
- `PATCH /api/admin/outbound-link-instances/{id}/status`
- `PUT /api/admin/outbound-link-policies`
- `POST /api/admin/outbound-link-scan-runs`
- `POST /api/admin/outbound-links/bulk-actions`
- `POST /api/admin/outbound-links/review-decisions`
- `POST /api/admin/outbound-links/{id}/restore-status`

These handlers share the Phase 2H-8/2H-9 envelope style and route through write guards, trace logging, audit generation, rollback-plan generation, and the local fake provider. The handlers do not run production migrations, do not call Azure, do not crawl links, and do not write CMS data.

All live provider writes remain blocked unless a future explicit `live-write-approved` provider profile is introduced and validated.
