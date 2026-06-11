# Pumpkin Platform Tracker

## Current Visible Tracker

| Field | Value |
| --- | --- |
| currentReference | V2.3.2 |
| currentReferenceName | Reviewed Azure Staging Resource Creation and Binding Validation |
| currentReferenceStatus | Complete, blocked before mutation |
| provisionalV2OverallCompletion | `61%` |
| currentLayerRefs | L01, L06, L07, L08, L09, L10, L11, L12 |
| nextReference | V2.3.3 |
| nextReferenceName | Azure Staging Foundation final parameter worksheet and scoped creation retry |
| nextGate | Replace candidate/example values with final reviewed staging parameters before any creation retry |
| safetyPosture | Azure creation approved for V2.3.2 but blocked before mutation; no protected-config-read |
| blockedState | Final reviewed Azure staging target/parameter/RBAC worksheet missing; no live `OLM_STAGING_*` execution values |

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
| V2.2 | `72%` | OLM stage-readiness advanced; value capture and real write still blocked |
| V2.3 | `40%` | Creation gate tested and blocked before mutation with exact missing values |
| V2.4 | `85%` | Backup Center proof and QA signoff strong; target-specific OLM pre-write evidence pending |
| V2.5 | `65%` | Resource Registry and provider profile foundations exist; OLM target mapping pending |
| V2.6 | `75%` | Runtime QA harness exists; broader module coverage pending |
| V2.7 | `55%` | Admin/API operator surfaces exist; complete operator console pending |
| V2.8 | `50%` | Tenant/static history exists; current publish readiness not active |
| V2.9 | `20%` | Audit/jobs/production gates future |

These percentages are provisional control-layer indicators, not deployment approval.
