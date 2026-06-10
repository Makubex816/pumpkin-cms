# Offline Profile Preservation

Phase 2H-17 preserves the local/offline profile as the default operating mode.

## Preserved Behaviors

- Fixtures can still be scanned without network access.
- Local stores remain file-backed under ignored `.tmp` output.
- Local render decisions, integration exports, API contract simulations, and write-action simulations still run without live services.
- Migration dry-run output is generated from local files and a redacted provider profile fixture only.
- Future staging/live provider work must add profiles beside the local profile, not replace it.

## Required Future Gates

Any future staging or live persistence package must keep:

- a local/fake/offline profile for tests and operator rehearsal
- a live-readonly profile for readback and validation only
- a separately approved live-write profile with explicit provider-mode validation
- Resource Registry references that name credential references without values
- blocked behavior for missing approval, tenant mismatch, role mismatch, or unsafe provider mode

This phase implements no live provider profile and performs no production write.
