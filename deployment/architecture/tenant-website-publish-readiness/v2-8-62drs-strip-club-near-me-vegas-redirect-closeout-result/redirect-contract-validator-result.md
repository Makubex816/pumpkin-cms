# Redirect Contract Validator Result

The new durable `redirect-semantics-validator.mjs` classifies source declarations before live import as:

- `persisted_redirect`
- `canonical_noop`
- `client_anchor`
- `external_redirect`
- `blocked_meaningful_redirect`
- `cycle_invalid_redirect`

Vegas replay result: invalid/blocked, 3 declarations, 1 persisted redirect, 0 canonical no-ops, 0 anchors, 0 external redirects, 2 blocked meaningful redirects, 0 cycle-invalid redirects, and 0 graph cycles.

The existing page validator now reports `redirect.update.currentPageSourceUnsupported` for the two pending pages rather than describing them as semantic self-route no-ops.
