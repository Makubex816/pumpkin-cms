# Pumpkin Platform Tracker

## Current Visible Tracker

| Field | Value |
| --- | --- |
| currentReference | V2.3.3 |
| currentReferenceName | Azure Staging Target Finalization and Resource Creation Retry |
| currentReferenceStatus | Complete, staging resources created, RBAC skipped |
| provisionalV2OverallCompletion | `64%` |
| currentLayerRefs | L01, L06, L07, L08, L09, L10, L11, L12 |
| nextReference | V2.3.4 |
| nextReferenceName | Azure Staging RBAC, provider profile activation, and readback preflight |
| nextGate | Approve minimum staging RBAC, register provider profile, and validate readback without keys |
| safetyPosture | Staging Azure foundation created; no RBAC, no OLM write, no protected-config-read |
| blockedState | OLM write still blocked by provider profile activation, provider mode, RBAC/auth, and identity/session binding |

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
| V2.3 | `70%` | Staging Azure foundation created; RBAC/profile/readback binding pending |
| V2.4 | `85%` | Backup Center proof and QA signoff strong; target-specific OLM pre-write evidence pending |
| V2.5 | `65%` | Resource Registry and provider profile foundations exist; OLM target mapping pending |
| V2.6 | `75%` | Runtime QA harness exists; broader module coverage pending |
| V2.7 | `55%` | Admin/API operator surfaces exist; complete operator console pending |
| V2.8 | `50%` | Tenant/static history exists; current publish readiness not active |
| V2.9 | `20%` | Audit/jobs/production gates future |

These percentages are provisional control-layer indicators, not deployment approval.
