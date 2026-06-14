# Read-Only Response Envelope Mapping

Status: planned only.

Future envelope name:

`ReadOnlyApiEnvelopeDto<T>`

Required fields:

- `ok`
- `status`
- `code`
- `message`
- `requestId`
- `correlationId`
- `providerMode`
- `readOnly`
- `data`
- `warnings`
- `errors`
- `securityBoundary`
- `source`
- `tenantKey`
- `siteKey`
- `meta`

Mapping from V2.9.6 envelope:

- `schemaVersion` -> `meta.contractSchemaVersion`
- `ok` -> `ok`
- `status` -> `status`
- `code` -> `code`
- `message` -> `message`
- `requestId` -> `requestId`
- `correlationId` -> `correlationId`
- `providerMode` -> `providerMode`
- `readOnly` -> `readOnly`
- `data` -> route-specific DTO data
- `warnings` -> `warnings`
- `errors` -> `errors`
- `securityBoundary` -> `securityBoundary`
- `source` -> `source`
- `tenantKey` -> `tenantKey`
- `siteKey` -> `siteKey`
- `meta` -> `meta`

Success behavior:

- `ok: true`;
- HTTP `200`;
- `code: AUDIT_JOB_OK`;
- `readOnly: true`;
- `providerMode: future-pumpkin-api-readonly` for future runtime endpoints;
- `providerMode: local-fixture-readonly` for fixture preflight.

Error behavior:

- `ok: false`;
- data omitted or `null`;
- errors array contains structured codes and paths;
- `readOnly: true` remains true even on errors;
- no error response may include protected config or secret material.

