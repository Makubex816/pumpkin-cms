# Known Limitations

This is a local foundation, not a production Outbound Link Manager.

Current limitations:

- fixture JSON only;
- file-backed local `.tmp` persistence only;
- no CMS/API integration;
- no Admin UI;
- local rendering-control prototype only;
- no production renderer integration;
- Backup Center and tenant-bundle compatibility is local export only;
- no Backup Center live workflow integration;
- no onboarding validator live integration;
- no live-readonly inventory mode;
- no external link crawling or health checks;
- no full JSON Schema engine;
- no database migration or schema migration execution;
- render decisions are emitted as deterministic local artifacts, not runtime site behavior;
- conservative URL extraction from declared fields and rich text strings only.

The next phase should connect the local store/rendering artifacts to Backup Center, onboarding import packages, and tenant bundle compatibility before any runtime integration.
