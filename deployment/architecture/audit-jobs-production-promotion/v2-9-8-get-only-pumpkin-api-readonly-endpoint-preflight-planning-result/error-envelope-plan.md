# Error Envelope Plan

Status: planned only.

Future error codes:

- `AUDIT_JOB_OK`
- `AUDIT_JOB_SCOPE_REQUIRED`
- `AUDIT_JOB_AUTH_REQUIRED`
- `AUDIT_JOB_FORBIDDEN_ROLE`
- `AUDIT_JOB_FORBIDDEN_TENANT`
- `AUDIT_JOB_FORBIDDEN_SITE`
- `AUDIT_JOB_INVALID_FILTER`
- `AUDIT_JOB_INVALID_SORT`
- `AUDIT_JOB_INVALID_PAGINATION`
- `AUDIT_JOB_PROVIDER_NOT_CONFIGURED`
- `AUDIT_JOB_CONTRACT_INVALID`
- `AUDIT_JOB_RECORD_NOT_FOUND`
- `AUDIT_JOB_READONLY_BOUNDARY_OPEN`
- `AUDIT_JOB_INDEXING_DEFERRED`
- `AUDIT_JOB_WRITE_METHOD_NOT_ALLOWED`

HTTP mapping:

- `200`: successful read;
- `400`: invalid filter, sort, pagination, or missing tenant/site scope;
- `401`: unauthenticated request;
- `403`: role, tenant, or site denial;
- `404`: record not found for a future detail route;
- `405`: write method not allowed if framework route fallback is added later;
- `503`: provider not configured or contract source unavailable;
- `500`: unexpected unhandled error, with redacted message only.

Every error response must preserve:

- read-only envelope shape;
- `requestId`;
- `correlationId`;
- `providerMode`;
- `readOnly: true`;
- `securityBoundary`;
- no secret/protected config material.

