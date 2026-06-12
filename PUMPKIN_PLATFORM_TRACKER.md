# Pumpkin Platform Tracker

## Current Visible Tracker

| Field | Value |
| --- | --- |
| currentReference | V2.8.3 |
| currentReferenceName | Ice Local Publish-Readiness Final Signoff and Gate Freeze |
| currentReferenceStatus | Complete local Ice publish-readiness signoff; canonical routes and static output validated; deployment remains closed |
| provisionalV2OverallCompletion | `88%` |
| currentLayerRefs | L01, L02, L03, L04, L06, L07, L08, L09, L10, L11, L12, L15 |
| nextReference | V2.8.4 |
| nextReferenceName | Ice Staging Publish Approval Worksheet And No-Go Criteria |
| nextGate | Prepare no-deploy staging publish approval worksheet and no-go criteria; deployment, DNS, indexing, and publication remain closed |
| safetyPosture | Local/read-only signoff only; no provider write, Azure mutation, RBAC assignment, CMS write, deployment, DNS change, indexing, or publication; Next static build auto-detected `.env.local` and is recorded as a protected-config caveat |
| blockedState | Ice is locally publish-ready; deployment, DNS, indexing, live publication, CMS/provider writes, protected config, and production actions remain separately gated |

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
| V2.8 | `82%` | Ice local publish-readiness signed off; staging/publish worksheet, deployment, DNS, indexing, and live publication remain closed |
| V2.9 | `20%` | Audit/jobs/production gates future |

These percentages are provisional control-layer indicators, not deployment approval.
