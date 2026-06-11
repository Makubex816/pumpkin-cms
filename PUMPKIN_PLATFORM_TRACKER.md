# Pumpkin Platform Tracker

## Current Visible Tracker

| Field | Value |
| --- | --- |
| currentReference | V2.2.5 |
| currentReferenceName | Outbound Link Manager Final Stage-ready Signoff and Evidence Freeze |
| currentReferenceStatus | Complete; V2.2 stage-ready evidence frozen |
| provisionalV2OverallCompletion | `76%` |
| currentLayerRefs | L01, L06, L07, L08, L09, L10, L11, L12 |
| nextReference | V2.5.1 |
| nextReferenceName | Resource Registry and Provider Profile Operationalization Hardening |
| nextGate | Local/read-only consolidation of registry/profile bindings after V2.2 closure |
| safetyPosture | V2.2 final signoff complete; final readback sanity passed with 48 records and zero writes; no additional OLM staging write, no destructive rollback, no Azure mutation/RBAC change, no production/CMS write, no protected-config read |
| blockedState | No V2.2 stage-ready blockers remain; future writes, production actions, Azure mutations, and deployment remain separately gated |

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
| V2.5 | `72%` | Resource Registry and provider profile foundations include the OLM staging binding candidate |
| V2.6 | `75%` | Runtime QA harness exists; broader module coverage pending |
| V2.7 | `55%` | Admin/API operator surfaces exist; complete operator console pending |
| V2.8 | `50%` | Tenant/static history exists; current publish readiness not active |
| V2.9 | `20%` | Audit/jobs/production gates future |

These percentages are provisional control-layer indicators, not deployment approval.
