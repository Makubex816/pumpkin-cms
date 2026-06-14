# Admin Runtime QA Plan

V2.9.11 runtime QA should verify Admin behavior in two modes.

Fixture mode checks:

- `/dashboard/audit-jobs` renders with provider mode `admin-local-fixture-readonly`;
- all panels and counts match V2.9.7/V2.9.9 carryforward;
- future actions remain disabled.

API mode checks:

- API-mode test harness uses mocked or safe local GET responses;
- `/dashboard/audit-jobs` renders provider mode `admin-api-readonly`;
- request ID and correlation ID are surfaced in contract metadata;
- panel grid, record table, search/filter/sort, and detail panel render from API data;
- fallback to fixture mode renders if API client returns a redacted error;
- no mutation controls become enabled.

Runtime route proof:

- use local browser or HTTP QA only after Admin source is changed in V2.9.11;
- do not require protected config;
- do not crawl external URLs;
- do not submit forms;
- do not call Google/Search Console.

Admin checks are not run in V2.9.10 because no Admin source files were modified.

