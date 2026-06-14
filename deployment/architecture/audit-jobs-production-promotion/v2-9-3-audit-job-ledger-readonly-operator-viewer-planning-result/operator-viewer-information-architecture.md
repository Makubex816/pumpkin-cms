# Operator Viewer Information Architecture

The operator viewer should open directly on the ledger status rather than on a marketing or setup page.

## Primary Flow

1. Release summary.
2. Promotion gates.
3. Job runs.
4. Audit events.
5. Evidence bindings.
6. Trace explorer.
7. Health states and next gates.

## Required Panels

- Release Summary.
- Promotion Gates.
- Job Runs.
- Audit Events.
- Evidence Bindings.
- Trace Explorer.
- Runtime QA.
- Resource Registry / Provider Profile.
- Outbound Link Manager.
- Backup Center.
- Indexing Deferred.
- Blockers and Next Gates.

## State Vocabulary

- `read_only`
- `complete`
- `warning`
- `blocked`
- `deferred`
- `missing_evidence`
- `invalid_ledger`
- `future_boundary_required`

## Navigation Principle

Every panel should be inspectable without exposing write actions. Any future action affordance must be hidden behind a separate explicit phase boundary.
