# SWA Diagnostic Rollback Result

Rollback probe performed: yes, isolated only.

Reason:

- V2.8.44 had proven production `/api/static-contact-health` HTTP 200.
- V2.8.45 added SWA diagnostics and then health returned HTTP 500.
- Source, tests, and appsettings were healthy after repair.

Action:

- Removed `diag-to-law-pumpkin-prod-001` from isolated SWA only.
- Polled isolated `/api/static-contact-health` six times.

Result:

- Isolated health stayed HTTP 500 with `Backend call failure`.
- SWA diagnostics were not proven causal.
- Production SWA diagnostics were not rolled back.
- The isolated diagnostic setting was restored with `StaticSiteHttpLogs`, `StaticSiteDiagnosticLogs`, and `AllMetrics`.

