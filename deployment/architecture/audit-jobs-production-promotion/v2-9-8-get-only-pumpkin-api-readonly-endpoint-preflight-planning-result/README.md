# V2.9.8 GET-Only Pumpkin API Read-Only Endpoint Preflight Planning Result

Status: complete for approved local/read-only API preflight planning.

Created: 2026-06-13T23:34:00-04:00.

This package defines the future Pumpkin API read-only endpoint contract for Audit Jobs / Production Promotion governance. It uses V2.9.6 shared viewer model and read-only API envelope evidence plus the V2.9.7 Admin contract adapter and runtime route proof.

This phase did not implement runtime endpoints. It created planning documents only.

Primary result:

- future base path: `/api/admin/audit-jobs`;
- allowed method: `GET` only;
- future provider mode: `future-pumpkin-api-readonly`;
- fixture preflight provider mode: `local-fixture-readonly`;
- Admin compatibility provider mode: `admin-local-fixture-readonly`;
- required envelope: V2.9.6 read-only API envelope shape;
- indexing state: deferred by hard stop.

Root report:

`PUMPKIN_AUDIT_JOBS_PRODUCTION_PROMOTION_V2_9_8_GET_ONLY_API_PREFLIGHT_REPORT.md`

