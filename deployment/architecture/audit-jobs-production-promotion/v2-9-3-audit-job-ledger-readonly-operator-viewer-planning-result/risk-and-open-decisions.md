# Risk And Open Decisions

## Risks

- Future Admin/API/Electron surfaces must not add write controls by accident.
- A future API source must preserve the same no-secret and no-protected-config boundary.
- Large ledgers may need pagination or virtualization in a UI.
- The current viewer model is a JavaScript contract plus human-readable schema note, not a runtime JSON Schema.
- Trace search is local and simple by design.

## Open Decisions

- Whether to add a formal JSON Schema for `audit-job-ledger-viewer.v1`.
- Whether V2.9.4 should implement a local Admin prototype or only a static fixture-rendering proof.
- Whether the Pumpkin API should serve raw ledger data, derived viewer data, or both.
- Whether Electron should read from local files or from a future read-only API.

## Recommended Defaults

- Keep V2.9.4 read-only.
- Keep Google indexing deferred.
- Add any runtime surface only behind a new explicit approval.
