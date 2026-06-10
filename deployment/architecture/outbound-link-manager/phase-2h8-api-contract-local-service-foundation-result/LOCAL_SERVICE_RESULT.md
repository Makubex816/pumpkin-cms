# Local Service Result

Local read-only service modules added:

- `src/api/services/outbound-link-query-service.mjs`
- `src/api/services/outbound-link-detail-service.mjs`
- `src/api/services/outbound-link-instance-service.mjs`
- `src/api/services/outbound-link-policy-service.mjs`
- `src/api/services/outbound-link-scan-run-service.mjs`
- `src/api/services/outbound-link-audit-service.mjs`
- `src/api/services/outbound-link-dashboard-service.mjs`

Implemented methods:

- `listOutboundLinks`
- `getOutboundLink`
- `listOutboundLinkInstances`
- `listOutboundLinkPolicies`
- `listOutboundLinkScanRuns`
- `listOutboundLinkAuditLogs`
- `getOutboundLinkDashboardSummary`

Behavior:

- Reads only from local file-backed stores under `.tmp`.
- Validates store shape before returning data.
- Enforces local tenant/site scope.
- Applies local role guard simulation.
- Returns API-style envelopes.
- Does not mutate the store.
- Does not call live services.

