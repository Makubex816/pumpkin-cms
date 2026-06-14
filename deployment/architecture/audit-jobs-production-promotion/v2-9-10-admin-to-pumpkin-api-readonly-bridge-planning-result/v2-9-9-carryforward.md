# V2.9.9 Carryforward

V2.9.9 carryforward is accepted as the API foundation for the future Admin bridge.

Implemented API routes:

- `GET /api/admin/audit-jobs/viewer-summary`;
- `GET /api/admin/audit-jobs/events`;
- `GET /api/admin/audit-jobs/job-runs`;
- `GET /api/admin/audit-jobs/promotion-gates`;
- `GET /api/admin/audit-jobs/evidence-bindings`;
- `GET /api/admin/audit-jobs/traces`;
- `GET /api/admin/audit-jobs/blockers`;
- `GET /api/admin/audit-jobs/next-gates`.

Carryforward counts:

- audit events: `11`;
- job runs: `9`;
- promotion gates: `11`;
- evidence bindings: `13`;
- traces: `107`;
- warnings: `1`;
- blockers: `0`;
- next gates: `2`.

Carryforward guarantees:

- all responses use read-only envelopes;
- all responses include request and correlation IDs;
- route family has exactly 8 GET registrations;
- route family has no POST, PUT, PATCH, or DELETE registrations;
- source fixture remains local/read-only;
- tenant/site authorization checks exist;
- Google/Search Console/indexing remains deferred.

