# Pumpkin Platform Tracker

## Current Visible Tracker

| Field | Value |
| --- | --- |
| currentReference | V2.0 |
| currentReferenceName | Master Reference Rebaseline and Layer Alignment |
| currentReferenceStatus | Complete |
| provisionalV2OverallCompletion | `58%` |
| currentLayerRefs | L01, L05, L08, L09, L10, L12 |
| nextReference | V2.1 |
| nextReferenceName | Source-of-Truth / Governance Control |
| nextGate | V2.1 governance control hardening before V2.2 OLM Stage-Ready value capture |
| safetyPosture | No-write, no-Azure-mutation, no protected-config-read |
| blockedState | Missing canonical `OLM_STAGING_*` target/profile/session/readback/rollback contract |

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
| V2.3 | `20%` | Azure staging resource foundation proposal pending |
| V2.4 | `85%` | Backup Center proof and QA signoff strong; target-specific OLM pre-write evidence pending |
| V2.5 | `65%` | Resource Registry and provider profile foundations exist; OLM target mapping pending |
| V2.6 | `75%` | Runtime QA harness exists; broader module coverage pending |
| V2.7 | `55%` | Admin/API operator surfaces exist; complete operator console pending |
| V2.8 | `50%` | Tenant/static history exists; current publish readiness not active |
| V2.9 | `20%` | Audit/jobs/production gates future |

These percentages are provisional control-layer indicators, not deployment approval.
