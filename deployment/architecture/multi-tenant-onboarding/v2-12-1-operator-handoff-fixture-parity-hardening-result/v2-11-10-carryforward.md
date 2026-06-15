# V2.11.10 Carryforward

V2.11.10 closed V2.11 at `100% with indexing deferred`.

Carried forward into V2.12.1:

- Frozen Ice package hash: `sha256:b0fdd67d5d31e798bf1a9ae3e5f576c17129030cd816e3a8b726b0767002d073`.
- Approval manifest ID: `approval-ice-rink-rentals-carryforward-v2-11-2-v2-11-7a-execution`.
- Execution run ID: `execution-ice-rink-rentals-carryforward-v2-11-2-v2-11-7a-local`.
- Target mode: `local_scoped_import_execution`.
- Entity mappings: `10`.
- Readback: routes `3/3`, content refs `4/4`, media refs `1/1`, form configs `1/1`.
- API projection base path: `/api/admin/import-executions`.
- Admin projection route: `/dashboard/import-executions`.
- Projection model: read-only, 15 operator panels, 7 future GET-only API routes.
- Roller state: paused/no-import/no-resume.
- Google/Search Console/indexing: deferred by hard stop.

V2.12.1 uses these as immutable carryforward facts and does not re-execute the import.
