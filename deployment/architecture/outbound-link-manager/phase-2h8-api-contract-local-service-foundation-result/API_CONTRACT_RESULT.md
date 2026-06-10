# API Contract Result

Local API contract modules added:

- `src/api/contracts/response-envelope.mjs`
- `src/api/contracts/error-codes.mjs`
- `src/api/contracts/query-normalizer.mjs`
- `src/api/contracts/pagination.mjs`
- `src/api/contracts/filter-sort-model.mjs`

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

Success envelopes use `OK`.

