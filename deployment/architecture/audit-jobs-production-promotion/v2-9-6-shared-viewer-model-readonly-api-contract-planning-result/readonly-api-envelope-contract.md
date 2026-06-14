# Read-Only API Envelope Contract

Status: implemented locally in `src/audit-job-ledger-contract.mjs`.

Schema version: `audit-job-ledger-readonly-api-envelope.v1`.

Required fields:

- `ok`
- `requestId`
- `correlationId`
- `providerMode`
- `readOnly`
- `data`
- `warnings`
- `errors`
- `securityBoundary`
- `source`

The envelope also carries Pumpkin API-style fields where useful: `status`, `code`, `message`, `tenantKey`, `siteKey`, and `meta`.

The `data` field contains the shared viewer model. The `source` field identifies the local fixture and carries the V2.9.5 runtime HTTP warning. The `meta` field explicitly records local-only, read-only, no crawling, no CMS writes, no provider writes, no protected config reads, no deployment, and no indexing action.
