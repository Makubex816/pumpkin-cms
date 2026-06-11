# Pumpkin Platform Tracker

## Current Visible Tracker

| Field | Value |
| --- | --- |
| currentReference | V2.3.4 |
| currentReferenceName | Staging RBAC, Provider Profile Binding, and OLM Contract Finalization |
| currentReferenceStatus | Complete, Cosmos data-plane RBAC assigned, provider profile candidate created, OLM contract validated, first write not executed |
| provisionalV2OverallCompletion | `66%` |
| currentLayerRefs | L01, L06, L07, L08, L09, L10, L11, L12 |
| nextReference | V2.2.1 |
| nextReferenceName | First Scoped OLM Staging Provider Write Reattempt |
| nextGate | Revalidate package linkage, Backup Center evidence, Runtime QA evidence, RBAC propagation, readback, and rollback before any write |
| safetyPosture | Staging Azure foundation created; staging DB-scoped Cosmos RBAC assigned; no OLM write, no protected-config-read |
| blockedState | OLM write still blocked by separate first-write approval and execution evidence refresh |

## Legacy Tracker Freeze

| Legacy field | Frozen value |
| --- | --- |
| legacyTrackerName | Legacy 2H Tracker v1 |
| frozenValue | `92 / 100` |
| finalLegacyPhase | Phase 2H-24, OLM staging target/resource foundation and Source-of-Truth binding |
| actualStagingWriteExecutionPercent | `0%` |
| recordsWritten | `0` |
| readbackRun | `false` |

Do not continue incrementing the old `92 / 100` tracker as the visible platform tracker.

## V2 Completion Model

| Reference | Completion | State |
| --- | --- | --- |
| V2.0 | `100%` | Master reference rebaseline complete |
| V2.1 | `70%` | Source-of-truth governance foundation exists; hardening next |
| V2.2 | `78%` | OLM stage-readiness advanced; first scoped staging write still not executed |
| V2.3 | `82%` | Staging Azure foundation, DB-scoped Cosmos RBAC, provider profile candidate, and OLM contract finalized |
| V2.4 | `85%` | Backup Center proof and QA signoff strong; target-specific OLM pre-write evidence pending |
| V2.5 | `72%` | Resource Registry and provider profile foundations include the OLM staging binding candidate |
| V2.6 | `75%` | Runtime QA harness exists; broader module coverage pending |
| V2.7 | `55%` | Admin/API operator surfaces exist; complete operator console pending |
| V2.8 | `50%` | Tenant/static history exists; current publish readiness not active |
| V2.9 | `20%` | Audit/jobs/production gates future |

These percentages are provisional control-layer indicators, not deployment approval.
