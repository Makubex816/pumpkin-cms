# Error Codes

Phase 2H-8 implements the local API error catalog in `src/api/contracts/error-codes.mjs`.

Implemented codes:

| Code | HTTP-like status | Meaning |
| --- | ---: | --- |
| `OUTBOUND_LINK_NOT_FOUND` | 404 | Link id was not found in tenant/site scope |
| `OUTBOUND_LINK_INSTANCE_NOT_FOUND` | 404 | Instance id was not found in tenant/site scope |
| `OUTBOUND_LINK_POLICY_NOT_FOUND` | 404 | Policy id was not found in tenant/site scope |
| `OUTBOUND_LINK_FORBIDDEN_TENANT` | 403 | Actor is not allowed for requested tenant/site |
| `OUTBOUND_LINK_FORBIDDEN_ROLE` | 403 | Actor role cannot perform the operation |
| `OUTBOUND_LINK_WRITE_NOT_APPROVED` | 403 | Write action is blocked in this phase |
| `OUTBOUND_LINK_INVALID_FILTER` | 400 | Unsupported or invalid filter |
| `OUTBOUND_LINK_INVALID_SORT` | 400 | Unsupported sort field or direction |
| `OUTBOUND_LINK_INVALID_PAGINATION` | 400 | Invalid page or page size |
| `OUTBOUND_LINK_STORE_INVALID` | 500 | Local store failed validation or could not be read |

Success responses use `OK`.

