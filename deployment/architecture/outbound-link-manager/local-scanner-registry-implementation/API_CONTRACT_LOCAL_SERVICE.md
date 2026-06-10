# API Contract Local Service

Phase 2H-8 adds a local/offline API-style contract layer over the file-backed Outbound Link Manager store.

Implemented local services:

- `listOutboundLinks`
- `getOutboundLink`
- `listOutboundLinkInstances`
- `listOutboundLinkPolicies`
- `listOutboundLinkScanRuns`
- `listOutboundLinkAuditLogs`
- `getOutboundLinkDashboardSummary`

The services read only from local `.tmp` stores created by the existing scanner, merge, lifecycle, policy, rendering, and integration tooling.

Boundary:

- No production Pumpkin API endpoint implementation.
- No Admin UI implementation.
- No database migration.
- No CMS/API calls.
- No external link crawling.
- No protected config reads.
- No deployment, indexing, or live-page publication.

The service layer is intended to become the future Pumpkin API endpoint dependency, but it is not wired into `apps/pumpkin-api` in this phase.

