# Future API Route Contract Plan

Status: planned only; no endpoint implemented.

Future GET-only route contracts:

- `GET /api/admin/audit-jobs/viewer-summary`
- `GET /api/admin/audit-jobs/events`
- `GET /api/admin/audit-jobs/job-runs`
- `GET /api/admin/audit-jobs/promotion-gates`
- `GET /api/admin/audit-jobs/evidence-bindings`
- `GET /api/admin/audit-jobs/traces`

Expected future runtime shape:

- Require Admin authorization using existing Pumpkin API conventions.
- Require tenant/site context.
- Return the V2.9.6 read-only API envelope.
- Set `providerMode` to `future-pumpkin-api-readonly`.
- Keep all write flags closed.
- Do not add POST/PUT/PATCH/DELETE routes for this viewer.

Implementation is not approved in V2.9.6.
