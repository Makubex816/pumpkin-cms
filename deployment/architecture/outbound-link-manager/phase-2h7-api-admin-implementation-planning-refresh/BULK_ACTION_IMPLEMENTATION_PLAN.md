# Bulk Action Implementation Plan

Bulk actions are high-risk and must use preview-before-execute.

## Supported Future Actions

- Mark selected links pending review.
- Disable selected links.
- Enable selected links.
- Archive stale links.
- Disable all links for a reviewed domain.
- Set selected instances to disabled.
- Convert selected instances to plain text through rendering policy.

## Preview Contract

Preview requires:

- tenant/site scope
- action type
- filters or selected ids
- actor identity
- reason draft

Preview returns:

- `previewId`
- matched count
- affected domains
- affected pages
- target summaries
- blocked targets
- warnings
- expiration timestamp

## Execute Contract

Execution requires:

- `previewId`
- `expectedCount`
- final reason
- idempotency key
- actor confirmation

Execution stops on:

- tenant mismatch
- preview expiration
- changed target count
- ETag conflict
- permission downgrade
- policy violation
- mixed tenant/site targets

Bulk execution remains future-only and is not approved by Phase 2H-7.

