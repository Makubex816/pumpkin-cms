# API Response Contracts

Phase 2H-9 mirrors the Phase 2H-8 local response envelope in the Pumpkin API layer.

Envelope fields:

- `ok`
- `status`
- `code`
- `message`
- `data`
- `errors`
- `meta`
- `tenantKey`
- `siteKey`
- `requestId`

Implemented read DTO groups:

- outbound link list
- outbound link detail
- outbound link instances
- outbound link policies
- outbound link scan runs
- outbound link audit logs
- outbound link dashboard summary

Implemented error codes:

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

Response metadata records local-only boundaries and confirms no external crawling, CMS API calls, CMS writes, or protected config reads.

