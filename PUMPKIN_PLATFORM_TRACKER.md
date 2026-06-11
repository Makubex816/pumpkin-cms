# Pumpkin Platform Tracker

## Current Visible Tracker

| Field | Value |
| --- | --- |
| currentReference | V2.6.1 |
| currentReferenceName | Runtime QA Harness Operationalization and Evidence Binding |
| currentReferenceStatus | Complete; local/read-only reusable runtime QA harness and evidence binding operationalized |
| provisionalV2OverallCompletion | `80%` |
| currentLayerRefs | L01, L06, L07, L08, L09, L10, L11, L12 |
| nextReference | V2.7.1 |
| nextReferenceName | Admin/API Operator Console Runtime-QA-Bound Readiness |
| nextGate | Local/read-only operator console readiness bound to Runtime QA evidence |
| safetyPosture | Runtime QA harness validator passed; local evidence is ignored; runtime-qa-staging upload blocked before upload by missing Storage data-plane RBAC; production-runtime blocked; live-write-approved scoped-only; no provider write, Azure mutation/RBAC change, production/CMS write, protected-config read |
| blockedState | No V2.6.1 local operationalization blockers remain; runtime QA evidence upload requires future Storage data-plane RBAC; future writes, production actions, Azure mutations, and deployment remain separately gated |

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
| V2.6 | `86%` | Runtime QA harness operationalized with reusable registry, evidence manifest, local QA checks, and upload blocker recorded |
| V2.7 | `55%` | Admin/API operator surfaces exist; complete operator console pending |
| V2.8 | `50%` | Tenant/static history exists; current publish readiness not active |
| V2.9 | `20%` | Audit/jobs/production gates future |

These percentages are provisional control-layer indicators, not deployment approval.
