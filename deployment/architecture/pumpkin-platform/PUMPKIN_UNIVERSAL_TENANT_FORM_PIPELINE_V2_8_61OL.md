# Pumpkin Universal Tenant Form Pipeline V2.8.61OL

Date: 2026-07-09

## Standard

Every tenant form must route to a tenant-scoped FormEntry pipeline, remain disabled/no-post in preview, and be readable through tenant-scoped Admin API/Admin UI after successful synthetic test submission.

## Required Surfaces

- FormDefinition with tenant id and form key.
- Required fields, optional fields, hidden fields, consent, and honeypot.
- Runtime submit path using Pumpkin API tenant submit or submit alias.
- FormEntry persistence keyed by tenant.
- Admin API readback keyed by tenant.
- Admin UI inbox/detail visibility.
- Email behavior classified without printing secret refs or recipient values.

## Existing Platform Support

Source-discovered support exists:

- `POST /api/forms/{tenantId}/entries`
- `POST /api/forms/{tenantId}/submit/{type}`
- `GET /api/admin/{tenantId}/form-entries`
- `GET /api/admin/forms/{tenantId}/entries`
- `GET /api/admin/forms/{tenantId}/definitions`
- Admin UI Forms inbox and detail routes.

## OL Result

No source repair was required.

Authenticated live submit/readback remains pending an owner-approved credential and email-safety handoff.

Preview remains no-post/disabled.

No deploy was run.
