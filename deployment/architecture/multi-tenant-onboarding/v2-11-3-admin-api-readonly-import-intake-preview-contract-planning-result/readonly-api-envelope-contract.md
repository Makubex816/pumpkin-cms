# Read-Only API Envelope Contract

Schema version:

`pumpkin.importIntakePreview.readonlyApiEnvelope.v1`

Envelope fields:

- `schemaVersion`
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

Rules:

- `readOnly` must be true on envelope and data.
- `providerMode` must be `api-local-import-package-fixture-readonly`.
- `securityBoundary.openFlags` must be empty.
- `meta.writeActionsAllowed` must be false.
- `meta.cmsWrites`, `meta.providerWrites`, `meta.protectedConfigReads`, `meta.deployment`, and `meta.searchConsoleIndexing` must be false.
- `meta.googleIndexingState` must be `deferred_hard_stop`.
