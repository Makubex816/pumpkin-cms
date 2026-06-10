# Known Limitations

This is a local foundation, not a production Outbound Link Manager.

Current limitations:

- fixture JSON only;
- file-backed local `.tmp` persistence only;
- no CMS/API integration;
- no Admin UI;
- no renderer integration;
- Backup Center and tenant-bundle compatibility is local export only;
- no Backup Center live workflow integration;
- no onboarding validator live integration;
- no live-readonly inventory mode;
- no external link crawling or health checks;
- no full JSON Schema engine;
- no database migration or schema migration execution;
- no production renderer rules;
- conservative URL extraction from declared fields and rich text strings only.

The next phase should prototype rendering-control behavior locally before any runtime integration.
