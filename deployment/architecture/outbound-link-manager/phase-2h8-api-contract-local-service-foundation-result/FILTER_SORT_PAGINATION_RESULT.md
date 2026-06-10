# Filter Sort Pagination Result

Implemented filters:

- `tenantKey`
- `siteKey`
- `domain`
- `status`
- `pageId`
- `anchorText`
- `firstDetectedFrom`
- `lastDetectedTo`
- `reviewRequired`

Implemented sorts:

- `domain`
- `normalizedUrl`
- `status`
- `firstDetectedAt`
- `lastDetectedAt`
- `instanceCount`

Pagination:

- `page`
- `pageSize`
- `totalItems`
- `totalPages`
- `hasNextPage`
- `hasPreviousPage`

Validation behavior:

- Unknown filters return `OUTBOUND_LINK_INVALID_FILTER`.
- Unknown sort fields return `OUTBOUND_LINK_INVALID_SORT`.
- Invalid page values return `OUTBOUND_LINK_INVALID_PAGINATION`.

