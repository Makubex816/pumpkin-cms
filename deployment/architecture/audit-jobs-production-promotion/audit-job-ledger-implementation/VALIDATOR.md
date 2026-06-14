# Validator Behavior

Result: implemented for V2.9.2, extended for V2.9.3 read-only viewer model output.

The validator is dependency-free Node ESM. It exposes `validateLedger(ledger)` from `src/audit-job-ledger-validator.mjs` and a CLI in `src/audit-job-ledger-cli.mjs`.

## Validation Coverage

Top-level ledger validation checks:

- `schemaVersion` equals `audit-job-ledger.v1`.
- Required ledger arrays exist and are non-empty.
- Top-level no-write safety boundary includes every restricted action flag and keeps it false.
- High-confidence secret-like values are rejected.

Audit event validation checks:

- Required event fields exist.
- `eventType` is in the V2.9.1 audit event taxonomy.
- `outcome` is supported.
- Evidence refs resolve to evidence bindings.
- Trace IDs include common fields and event-specific fields.
- Production static release events include a SHA-256 artifact hash.

Job run validation checks:

- Required job fields exist.
- `jobType` is in the V2.9.1 job taxonomy.
- Status and outcome are supported.
- Evidence refs and audit event refs resolve.

Promotion gate validation checks:

- Required gate fields exist.
- Gate state and result are supported.
- Actual evidence covers required evidence.
- A gate with `result: complete` cannot remain in an open state.
- A complete gate cannot retain blockers.

Evidence binding validation checks:

- Evidence binding required fields exist.
- Evidence types are supported.
- Safe paths are repo-relative and do not point to protected config or credential-like paths.
- Production artifact hash bindings include a lowercase SHA-256 value.

## Failure Codes

The primary negative fixture coverage asserts:

- `MISSING_TRACE_ID`
- `MISSING_ARTIFACT_HASH`
- `UNSUPPORTED_EVENT_TYPE`
- `PROMOTION_GATE_COMPLETE_WHILE_OPEN`

Additional failures include missing required fields, unsupported status/outcome values, unknown refs, protected evidence paths, forbidden safety flags, and high-confidence secret-like values.

## Viewer Model Coverage

The V2.9.3 viewer model is exposed by `createLedgerViewerModel(ledger)` from `src/audit-job-ledger-view-model.mjs`.

It keeps the same local/no-write boundary and derives:

- Required operator panels.
- Required summary fields.
- Audit event, job run, promotion gate, and evidence binding rows.
- Trace explorer entries and a pure local trace search helper.
- Warning, blocker, next-gate, and security boundary summaries.

The CLI command `viewer-summary` prints that derived model for a local fixture and preserves nonzero exit behavior for invalid ledgers.
