# Rollback And Audit Plan

Status: design complete.

## Rollback Requirements

- Preserve the previous canonical domain and default host.
- Preserve every DNS packet version.
- Preserve expected and observed DNS records.
- Preserve Azure hostname binding attempts.
- Preserve TLS state and runtime proof attempts.
- Preserve promotion attempts and approval references.
- Preserve blocked reasons.
- Never delete failed binding records as the rollback mechanism.

## Rollback Modes

Metadata rollback:

- Reverts canonical/public routing metadata to the previous known-good binding.
- Does not mutate registrar DNS.

Azure binding rollback:

- Future approval required if it removes hostnames or certificates.
- Must record before/after state.

Registrar rollback:

- Not automatic.
- Requires explicit provider mutation approval.
- Manual packet generation is preferred for owner action.

## Audit Requirements

Every state change writes an audit event with:

- actor
- action
- from/to state
- timestamp
- summary
- non-secret evidence refs
- approval reference

Audit history is append-only.

