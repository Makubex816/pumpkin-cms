# Readonly Service Result

Read-only service boundary:

- `IOutboundLinkReadOnlyService`
- `OutboundLinkReadOnlyService`
- `IOutboundLinkReadOnlyProvider`
- `FakeOutboundLinkReadOnlyProvider`

Implemented read methods:

- `ListLinksAsync`
- `GetLinkAsync`
- `ListInstancesAsync`
- `ListPoliciesAsync`
- `ListScanRunsAsync`
- `ListAuditLogsAsync`
- `GetDashboardSummaryAsync`

Supported local/fake data:

- 5 links
- 5 instances
- 1 policy
- 1 scan run
- 1 audit log
- 3 domains

Supported query behavior:

- domain filter
- status filter
- page id filter
- anchor text filter
- date filters
- review-required filter
- page/pageSize pagination
- allowed sort fields

