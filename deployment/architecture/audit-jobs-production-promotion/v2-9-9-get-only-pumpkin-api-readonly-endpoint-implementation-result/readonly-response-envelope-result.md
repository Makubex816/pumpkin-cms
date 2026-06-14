# Read-Only Response Envelope Result

Implemented envelope:

`ReadOnlyApiEnvelopeDto<T>`

Every success and error response includes:

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

Provider mode is `api-local-fixture-readonly`.

Every response keeps `readOnly: true`.

Success code is `AUDIT_JOB_OK`.

