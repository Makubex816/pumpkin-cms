# Hardening Preservation Result

Monitoring and storage hardening preservation:

- Production SWA diagnostic setting `diag-to-law-pumpkin-prod-001`: present.
- Isolated SWA diagnostic setting `diag-to-law-pumpkin-prod-001`: present after isolated non-causal probe restore.
- SWA log categories preserved: `StaticSiteHttpLogs`, `StaticSiteDiagnosticLogs`.
- SWA metric category preserved: `AllMetrics`.
- Pumpkin API App Service diagnostic setting `diag-to-law-pumpkin-prod-001`: present.
- Log Analytics workspace: present.
- Action group: present.
- Metric alerts with `alert-pumpkin*` or `alert-ice*` names: six present and enabled.
- Media storage blob soft delete: enabled, 30 days.
- Media storage container soft delete: enabled, 30 days.
- Media storage blob versioning: enabled.
- Media storage change feed: enabled.

No storage protection rollback occurred.

