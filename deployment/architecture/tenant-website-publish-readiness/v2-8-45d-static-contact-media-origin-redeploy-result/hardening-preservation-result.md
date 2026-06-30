# Hardening Preservation Result

No monitoring rollback or storage rollback occurred.

Read-only preservation checks:

| Area | Result |
| --- | --- |
| Production SWA diagnostics | `diag-to-law-pumpkin-prod-001` present with StaticSiteHttpLogs, StaticSiteDiagnosticLogs, and AllMetrics enabled |
| Isolated SWA diagnostics | `diag-to-law-pumpkin-prod-001` present with StaticSiteHttpLogs, StaticSiteDiagnosticLogs, and AllMetrics enabled |
| App Service diagnostics | Present on Pumpkin API, Admin production, and Admin isolated |
| Cosmos diagnostics | Present on Cosmos DB |
| Media storage diagnostics | Present on account and blob service |
| Log Analytics workspace | `law-pumpkin-prod-centralus-001` provisioning state `Succeeded` |
| Metric alerts | 6 enabled |
| Action group | `ag-pumpkin-prod-ops-email-001` enabled |
| Media blob soft delete | enabled, 30 days |
| Media container soft delete | enabled, 30 days |
| Media blob versioning | enabled |
| Media change feed | enabled |
| Cosmos backup | `Continuous30Days` |
