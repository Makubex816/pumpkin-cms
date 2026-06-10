# Known Limitations

This is a local foundation, not a production Outbound Link Manager.

Current limitations:

- fixture JSON only;
- file-backed local `.tmp` persistence only;
- no CMS/API integration;
- no Admin UI;
- local rendering-control prototype only;
- no production renderer integration;
- Backup Center, tenant-bundle, and onboarding compatibility are local export/validation only;
- no Backup Center live workflow integration;
- no onboarding validator live integration;
- no live restore execution;
- no live-readonly inventory mode;
- no external link crawling or health checks;
- no full JSON Schema engine;
- no database migration or schema migration execution;
- render decisions are emitted as deterministic local artifacts, not runtime site behavior;
- conservative URL extraction from declared fields and rich text strings only.

The next step after this milestone should be a controlled repo remediation/classification pass before API/Admin implementation planning resumes.
