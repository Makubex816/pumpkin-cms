# Pumpkin Platform Tracker

## Current Visible Tracker

| Field | Value |
| --- | --- |
| currentReference | V2.8.10 |
| currentReferenceName | Owner Backend Media And Exact Staging Target Approval Intake |
| currentReferenceStatus | Complete local/control-layer gate closure; endpoint owner, contact-form owner, and media/content approvals are closed for staging-readiness only, while backend verification and exact executable SWA target still block staging execution |
| provisionalV2OverallCompletion | `91%` |
| currentLayerRefs | L01, L02, L03, L04, L06, L07, L08, L09, L10, L11, L12, L15 |
| nextReference | V2.8.11 |
| nextReferenceName | Backend Verification And Exact Staging Target Resolution Boundary |
| nextGate | Resolve backend verification approval/evidence and exact executable SWA target fields before staging publish execution approval |
| safetyPosture | Local/control-layer validation and docs only; no provider write, Azure mutation, RBAC assignment, CMS write, deployment, DNS change, indexing, publication, protected config read, live HTTP check, live contact form submission, or external crawl |
| blockedState | Staging execution is blocked until backend verification and exact executable Azure Static Web Apps target details are resolved |

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
| V2.7 | `100%` | Admin/API Operator Console signoff complete; Runtime QA upload blocker resolved |
| V2.8 | `97%` | Owner/media staging-readiness approvals closed and local validators reduced to one backend gate; backend verification and exact executable SWA target remain unresolved |
| V2.9 | `20%` | Audit/jobs/production gates future |

These percentages are provisional control-layer indicators, not deployment approval.
