# Pumpkin Platform Tracker

## Current Visible Tracker

| Field | Value |
| --- | --- |
| currentReference | V2.5.1 |
| currentReferenceName | Resource Registry and Provider Profile Operationalization Hardening |
| currentReferenceStatus | Complete; local/read-only registry/profile control layer operationalized |
| provisionalV2OverallCompletion | `78%` |
| currentLayerRefs | L01, L06, L07, L08, L09, L10, L11, L12 |
| nextReference | V2.6.1 |
| nextReferenceName | Runtime QA Harness Platform Operationalization and Evidence Binding |
| nextGate | Local/read-only runtime QA evidence binding against registry/profile states |
| safetyPosture | Registry/profile validator passed; staging resource/container checks were read-only; production-runtime blocked; live-write-approved scoped-only; no provider write, Azure mutation/RBAC change, production/CMS write, protected-config read |
| blockedState | No V2.5.1 hardening blockers remain; future uploads/writes, production actions, Azure mutations, and deployment remain separately gated |

## Legacy Tracker Freeze

| Legacy field | Frozen value |
| --- | --- |
| legacyTrackerName | Legacy 2H Tracker v1 |
| frozenValue | `92 / 100` |
| finalLegacyPhase | Phase 2H-24, OLM staging target/resource foundation and Source-of-Truth binding |
| actualStagingWriteExecutionPercent | `100%` for the approved first scoped batch only |
| recordsWritten | `48` |
| readbackRun | `true` |

Do not continue incrementing the old `92 / 100` tracker as the visible platform tracker.

## V2 Completion Model

| Reference | Completion | State |
| --- | --- | --- |
| V2.0 | `100%` | Master reference rebaseline complete |
| V2.1 | `70%` | Source-of-truth governance foundation exists; hardening next |
| V2.2 | `100%` | OLM final stage-ready signoff complete; evidence package frozen |
| V2.3 | `84%` | Staging Azure foundation, DB-scoped Cosmos RBAC, provider profile candidate, OLM contract, and container-scoped Backup Center Storage RBAC proof finalized |
| V2.4 | `87%` | Backup Center proof and QA signoff strong; OLM staging storage proof uploaded |
| V2.5 | `82%` | Resource Registry and provider profiles operationalized for local/read-only control-layer validation |
| V2.6 | `75%` | Runtime QA harness exists; broader module coverage pending |
| V2.7 | `55%` | Admin/API operator surfaces exist; complete operator console pending |
| V2.8 | `50%` | Tenant/static history exists; current publish readiness not active |
| V2.9 | `20%` | Audit/jobs/production gates future |

These percentages are provisional control-layer indicators, not deployment approval.
