# TASK ID SEC-20-A01 — Managed multi-operator secret-provider decision

Status: `CONDITIONAL_OWNER_DECISION_REQUIRED`.

## Decision

Decide whether publication deployment must move beyond the current Windows DPAPI `CurrentUser` single-operator fixture. This prompt does not authorize a paid secret store, migration, credential read, or rotation.

## Trigger

Activate only when the owner requires multi-operator or unattended deployment, the same-profile DPAPI limitation prevents the approved operating model, or the separately authorized `PLATFORM_SECRET_ROTATION_AND_PARITY_RECOVERY` chooses a new provider.

## Required comparison

Compare at least:

- approved operators and service identities;
- value-free repository and browser references;
- authentication and least privilege;
- versioning, rotation, invalidation, supersession, recovery, and break-glass behavior;
- child-process-only delivery and environment clearing;
- audit events that never include values;
- local development and disaster-recovery behavior;
- platform/customer isolation;
- recurring and migration cost;
- provider availability and lock-in;
- no-plaintext-at-rest and no-command-line requirements.

## Implementation gate

Require explicit owner choice of provider and budget, exact secret classes and resources, rotation authority, secure handoff, rollback, production-parity readback, clean-room tests, and a repository-safe evidence package. Never print, copy into source, store in static artifacts, add to browser code, or include a protected value in Atlas or logs.

If the owner retains single-operator DPAPI, record that decision and keep automation limited to the approved Windows profile.

The PUB-30 security interruption did not expose the SWA deployment token and did not authorize replacing its current DPAPI provider. SEC-20 must not be used to broaden rotation, paid-resource, deployment, customer, domain, indexing, or capacity authority.
