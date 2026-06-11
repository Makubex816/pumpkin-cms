# Pumpkin Platform Source Of Truth

This document is the canonical navigation layer for current PumpkinCMS platform state as of Phase 2H-24.

Use this first before choosing a next prompt, reading historical result packages, or attempting any provider action.

## Current State

| Field | Canonical state |
| --- | --- |
| Current tracker | `92 / 100` recommended after Phase 2H-24 commit |
| Current lane | Phase 2H, Outbound Link Manager / Tenant Link Governance |
| Current phase | Phase 2H-24, OLM staging target/resource foundation proposal and Source-of-Truth binding |
| Latest completed implementation/control phase | Phase 2H-24, OLM staging target/resource foundation proposal and Source-of-Truth binding |
| Next milestone | `95 / 100` |
| Safety posture | No-write, no-Azure-mutation, no protected-config-read, no deployment |
| Next gate | OLM staging target/operator value capture and presence-only contract validation |

## Latest Canonical Proofs

| Area | Latest canonical reference | State |
| --- | --- | --- |
| Outbound Link Manager | `PUMPKIN_OUTBOUND_LINK_MANAGER_PHASE_2H24_STAGING_TARGET_RESOURCE_FOUNDATION_SOT_BINDING_REPORT.md` | SOT binding and staging foundation proposal complete; real staging write blocked |
| OLM result package | `deployment/architecture/outbound-link-manager/phase-2h24-olm-staging-target-resource-foundation-sot-binding-result/` | Latest OLM package |
| Backup Center | `PUMPKIN_BACKUP_EXPORT_RESTORE_PHASE_2F14_BACKUP_GENERATOR_QA_SIGNOFF_REPORT.md` | Generator QA/signoff complete |
| Resource Registry | `PUMPKIN_BACKUP_EXPORT_RESTORE_PHASE_2F12N_REAL_RESOURCE_REGISTRY_LIVE_INVENTORY_REPORT.md` | Real redacted inventory complete |
| Runtime QA | `PUMPKIN_OUTBOUND_LINK_MANAGER_PHASE_2H21_RUNTIME_QA_PROVIDER_READINESS_STAGING_GATE_REPORT.md` | Reusable harness proven for OLM |
| Platform SOT | `deployment/architecture/platform-source-of-truth/phase-sot01-pumpkin-platform-source-of-truth-control-layer-result/` | Created by SOT-01 |

## Active Blockers

The current hard stop is the missing OLM staging target/profile/session/readback/rollback contract:

- `OLM_STAGING_PROVIDER_PROFILE_ID`
- `OLM_STAGING_PROVIDER_TYPE`
- `OLM_STAGING_PROVIDER_MODE`
- `OLM_STAGING_RESOURCE_SCOPE`
- `OLM_STAGING_ACCOUNT_OR_HOST`
- `OLM_STAGING_DATABASE_OR_NAMESPACE`
- `OLM_STAGING_RBAC_OR_AUTH_MODE`
- `OLM_STAGING_IDENTITY_OR_SESSION_TYPE`
- `OLM_STAGING_READBACK_METHOD`
- `OLM_STAGING_ROLLBACK_METHOD`

Approved OLM IDs remain:

- approval manifest: `olapprove_508df3f03faa4f80`
- first-write batch: `olbatch_b08e184fdc6565aa`
- expected package records: `48`

Records written by the OLM staging write lane: `0`.

Readback run for a real staging write: `false`.

## Canonical Tenant State

| Tenant or scope | Current canonical state | Notes |
| --- | --- | --- |
| Pumpkin platform | Pre-production multi-tenant operations platform | Admin/API/Backup/Resource Registry/Runtime QA foundation exists |
| Ice | Backup proof and Resource Registry inventory exist | Live-readonly backup generator proof passed; no SOT-01 live checks |
| Roller | Paused/static/onboarding history exists | Treat older Roller docs as historical unless refreshed |
| OLM fixture tenant | Local/staging-simulated test scope | `fixture-tenant` / `fixture-site`, 48 candidate records |

## Environment Modes

| Mode | State |
| --- | --- |
| local/offline | Default safe mode |
| fake-provider | Supported for tests and fixtures |
| offline-bundle | Supported for generated proof review |
| local-file-backed | Supported for OLM local store |
| local-api-fake-provider | Supported for read-only Admin/API checks |
| staging-simulated | Supported for `.tmp` evidence only |
| live-readonly | Explicit only; no writes |
| live-write-approved | Future explicit gate; still blocked without SOT and contract |
| production-runtime | Not allowed for scoped OLM staging write |

## Next Recommended Phase

Approve Phase 2H-25 OLM staging target/operator value capture and presence-only contract validation only. This should use the 2H-24 binding package to capture or document approved non-secret `OLM_STAGING_*` values and run the presence-only contract validator without printing values, creating Azure resources, reading protected config, or executing the first scoped staging write.
