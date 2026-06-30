# Monitoring Alert Runbook

Primary surfaces:

- Log Analytics workspace: `law-pumpkin-prod-centralus-001`.
- Action group: `ag-pumpkin-prod-ops-email-001`.
- Diagnostic setting name: `diag-to-law-pumpkin-prod-001`.

Triage order:

1. Check active metric alert details and affected resource.
2. Check resource health and recent deployment history.
3. Query App Service/SWA HTTP logs for matching time windows.
4. For Cosmos RU alert, inspect normalized RU and request patterns before changing throughput.
5. For storage availability alert, inspect Azure status, blob-service diagnostics, and public media GET behavior.
6. Escalate any tenant-specific content/data investigation to a separately approved tenant-data phase.
