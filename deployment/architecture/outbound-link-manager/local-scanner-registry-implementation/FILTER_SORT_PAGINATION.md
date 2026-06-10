# Filter Sort Pagination

Supported filters:

- `tenantKey`
- `siteKey`
- `domain`
- `status`
- `pageId`
- `anchorText`
- `firstDetectedFrom`
- `lastDetectedTo`
- `reviewRequired`

Supported sorts:

- `domain`
- `normalizedUrl`
- `status`
- `firstDetectedAt`
- `lastDetectedAt`
- `instanceCount`

Supported pagination fields:

- `page`
- `pageSize`
- `totalItems`
- `totalPages`
- `hasNextPage`
- `hasPreviousPage`

Rules:

- Page numbers are one-based.
- `pageSize` must be positive and cannot exceed `100`.
- Unknown filters return `OUTBOUND_LINK_INVALID_FILTER`.
- Unknown sort fields or directions return `OUTBOUND_LINK_INVALID_SORT`.
- Invalid page values return `OUTBOUND_LINK_INVALID_PAGINATION`.

