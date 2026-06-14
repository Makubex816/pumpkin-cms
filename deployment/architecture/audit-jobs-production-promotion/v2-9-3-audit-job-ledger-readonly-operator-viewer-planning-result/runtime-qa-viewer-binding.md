# Runtime QA Viewer Binding

The Runtime QA panel is considered complete when the ledger contains `runtime_qa_passed`.

## Binding

- Source: audit events.
- Event type: `runtime_qa_passed`.
- Panel: Runtime QA.
- State when present and valid: `complete`.
- State when missing: `missing_evidence`.

## Combined Fixture

The combined fixture includes `audit-combined-runtime-qa-passed`, so the Runtime QA panel is `complete`.

## Boundary

The viewer only displays carried-forward Runtime QA evidence. It does not run browser tests, call production routes, crawl pages, or open a live network connection.
