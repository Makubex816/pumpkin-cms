# Pumpkin Platform Tracker

## Current Visible Tracker

| Field | Value |
| --- | --- |
| currentReference | V2.2.1 |
| currentReferenceName | First Scoped OLM Staging Write and Readback Gate |
| currentReferenceStatus | Blocked before write; repo live Cosmos write/readback executor unavailable |
| provisionalV2OverallCompletion | `67%` |
| currentLayerRefs | L01, L06, L07, L08, L09, L10, L11, L12 |
| nextReference | V2.2.2 |
| nextReferenceName | OLM Azure Cosmos Staging Data-Plane Executor and First-Write Retry |
| nextGate | Implement repo-supported Azure Identity/RBAC writer/readback adapter, then retry only the approved scoped batch if gates pass |
| safetyPosture | Staging Azure foundation created; staging DB-scoped Cosmos RBAC assigned; no OLM write, no protected-config-read |
| blockedState | OLM write blocked by missing live-write-approved Cosmos data-plane executor/readback adapter |

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
| V2.2 | `80%` | OLM stage-readiness advanced; first scoped staging write blocked by missing live Cosmos executor |
| V2.3 | `82%` | Staging Azure foundation, DB-scoped Cosmos RBAC, provider profile candidate, and OLM contract finalized |
| V2.4 | `85%` | Backup Center proof and QA signoff strong; target-specific OLM pre-write evidence pending |
| V2.5 | `72%` | Resource Registry and provider profile foundations include the OLM staging binding candidate |
| V2.6 | `75%` | Runtime QA harness exists; broader module coverage pending |
| V2.7 | `55%` | Admin/API operator surfaces exist; complete operator console pending |
| V2.8 | `50%` | Tenant/static history exists; current publish readiness not active |
| V2.9 | `20%` | Audit/jobs/production gates future |

These percentages are provisional control-layer indicators, not deployment approval.
