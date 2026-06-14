# Risk And Open Decisions

Open decisions:

- Decide whether V2.9.6 should extract a shared viewer-model package before any read-only API endpoint is implemented.
- Decide the eventual read-only API contract shape separately from this Admin fixture-backed prototype.
- Decide whether runtime browser QA should be added after the local Next dev server readiness issue is resolved.

Risks:

- The Admin viewer currently duplicates some transformation logic from the audit-ledger implementation package.
- Local Next dev servers listened on ports 3000 and 3002 but did not become HTTP-responsive during this pass.
- Future API/Electron/live-provider implementation remains gated and should not be inferred from this prototype.

No production/live boundary was opened.
