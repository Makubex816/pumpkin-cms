# API Contract Result

Contracts added:

- `OutboundLinkApiEnvelope<T>`
- `OutboundLinkApiError`
- `OutboundLinkApiMeta`
- `OutboundLinkApiQuery`
- `OutboundLinkSort`
- `OutboundLinkPaginationMeta`
- DTOs for links, instances, policies, scan runs, audit logs, and dashboard summary.

Error codes include:

- `OUTBOUND_LINK_NOT_FOUND`
- `OUTBOUND_LINK_INSTANCE_NOT_FOUND`
- `OUTBOUND_LINK_POLICY_NOT_FOUND`
- `OUTBOUND_LINK_FORBIDDEN_TENANT`
- `OUTBOUND_LINK_FORBIDDEN_ROLE`
- `OUTBOUND_LINK_WRITE_NOT_APPROVED`
- `OUTBOUND_LINK_INVALID_FILTER`
- `OUTBOUND_LINK_INVALID_SORT`
- `OUTBOUND_LINK_INVALID_PAGINATION`
- `OUTBOUND_LINK_STORE_INVALID`
- `OUTBOUND_LINK_PROVIDER_NOT_CONFIGURED`

The envelope is designed to match the Phase 2H-8 local contract and to support future Admin read-only UI work.

