# Contract Parity Test Plan

V2.9.11 should add parity tests proving the Admin fixture provider and future API provider produce equivalent Admin viewer models.

Required parity assertions:

- provider mode transitions are explicit;
- fixture mode remains `admin-local-fixture-readonly`;
- API mode is `admin-api-readonly`;
- API envelope provider mode `api-local-fixture-readonly` is accepted only for API mode;
- both modes produce 12 panels;
- both modes produce counts `11/9/11/13/107/1/0/2`;
- both modes produce the same record kinds;
- both modes preserve Google indexing deferred warning and next gate;
- both modes keep all future actions disabled;
- both modes reject open write boundaries;
- both modes reject non-read-only envelopes;
- both modes never expose high-confidence secret-like values.

Suggested test files:

- Admin adapter unit/QA test extending the existing V2.9.7 runner;
- API client contract test with mocked fetch responses;
- source scan test proving no Audit Jobs Admin POST/PUT/PATCH/DELETE call sites.

