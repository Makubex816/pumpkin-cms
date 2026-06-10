# Known Limitations

This is a local foundation, not a production Outbound Link Manager.

Current limitations:

- fixture JSON only;
- file-backed local `.tmp` persistence only;
- local API contract/service behavior only;
- no production Pumpkin API endpoint wiring;
- no Admin UI wiring;
- no CMS/API integration;
- no Admin UI;
- local rendering-control prototype only;
- no production renderer integration;
- Backup Center, tenant-bundle, and onboarding compatibility are local export/validation only;
- no Backup Center live workflow integration;
- no onboarding validator live integration;
- no live restore execution;
- no live-readonly inventory mode;
- write-action guard methods are intentionally blocked;
- local role/tenant guards are simulations, not production auth;
- pagination is page/pageSize only, not cursor-based yet;
- response models are local JS contracts, not shared Pumpkin API DTOs yet;
- no external link crawling or health checks;
- no full JSON Schema engine;
- no database migration or schema migration execution;
- render decisions are emitted as deterministic local artifacts, not runtime site behavior;
- conservative URL extraction from declared fields and rich text strings only.

The next step should be Phase 2H-9 API read-only endpoint foundation, which can wire GET endpoints to this local/fake service layer without enabling production writes.
