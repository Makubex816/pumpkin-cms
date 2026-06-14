# Risk And Open Decisions

## Risks

- The route is registered but not yet inserted into the shared dashboard top navigation because that layout was already dirty.
- The Admin provider duplicates the local viewer-model transform in TypeScript rather than importing the Node ESM implementation directly.
- Browser rendering was not screenshot-verified because the scoped QA used the existing source/route harness.
- A future API source must not broaden the boundary into protected config, provider calls, or write-capable endpoints.

## Open Decisions

- Whether V2.9.5 should add top-navigation wiring after layout changes are reconciled.
- Whether to create a formal shared package for the viewer model to avoid transform duplication.
- Whether a future API should return the ledger, the viewer model, or both.
- Whether future browser QA should use Playwright if installed and explicitly approved.
