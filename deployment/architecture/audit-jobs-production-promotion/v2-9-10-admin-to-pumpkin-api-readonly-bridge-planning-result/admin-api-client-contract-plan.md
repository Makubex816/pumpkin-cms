# Admin API Client Contract Plan

The future Admin API client should be a small read-only module under the existing Audit Jobs Admin domain.

Planned client behavior:

- accept `tenantKey`, `siteKey`, and optional filters;
- call only the eight approved GET endpoints;
- send credentials/session only through the existing Admin runtime auth mechanism when available;
- parse the V2.9.9 read-only envelope shape;
- reject any envelope with `readOnly !== true`;
- reject any envelope with security boundary open flags;
- reject missing `requestId`, `correlationId`, provider mode, tenant key, or site key;
- preserve API `warnings` and `errors` for Admin degraded state rendering;
- never log raw authorization headers or token material.

Planned client return shape:

- `ok`;
- `providerMode`;
- `sourceProviderMode`;
- `requestId`;
- `correlationId`;
- `tenantKey`;
- `siteKey`;
- `data`;
- `warnings`;
- `errors`;
- `fallbackUsed`;
- `fallbackReason`.

The client should not import server-only code into client components. If the Admin page remains a client component, V2.9.11 should keep the API orchestration inside an Admin library boundary that is testable without browser secrets.

