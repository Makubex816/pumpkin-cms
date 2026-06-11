# Pumpkin Platform Tracker

## Current Visible Tracker

| Field | Value |
| --- | --- |
| currentReference | V2.3.1 |
| currentReferenceName | Azure Staging Foundation Inventory and IaC Package |
| currentReferenceStatus | Complete |
| provisionalV2OverallCompletion | `60%` |
| currentLayerRefs | L01, L06, L07, L08, L09, L10, L11, L12 |
| nextReference | V2.3.2 |
| nextReferenceName | Azure Staging Foundation target finalization and deployment dry-run validation |
| nextGate | Finalize non-secret staging target/profile values and validate IaC without creation |
| safetyPosture | No-write, no-Azure-mutation, no protected-config-read |
| blockedState | Missing canonical `OLM_STAGING_*` execution values; V2.3.1 source map exists |

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
| V2.3 | `35%` | No-deploy Azure inventory, staging foundation proposal, and IaC draft complete |
| V2.4 | `85%` | Backup Center proof and QA signoff strong; target-specific OLM pre-write evidence pending |
| V2.5 | `65%` | Resource Registry and provider profile foundations exist; OLM target mapping pending |
| V2.6 | `75%` | Runtime QA harness exists; broader module coverage pending |
| V2.7 | `55%` | Admin/API operator surfaces exist; complete operator console pending |
| V2.8 | `50%` | Tenant/static history exists; current publish readiness not active |
| V2.9 | `20%` | Audit/jobs/production gates future |

These percentages are provisional control-layer indicators, not deployment approval.
