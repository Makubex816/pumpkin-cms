# Warning Blocker Health State Model

The viewer model separates informational warnings from blockers and next gates.

## Warnings

Warnings include:

- Validator failures.
- Deferred indexing.
- Missing gate evidence.
- No-write boundary warning.

## Blockers

Blockers include:

- Blocked promotion gates.
- Missing required gate evidence.
- Invalid ledger state.

## Next Gates

Next gates include:

- `future-boundary-required`
- `google-indexing-deferred`

## Combined Fixture

The combined fixture has one informational deferred-indexing warning, zero blockers, and two next gates.
