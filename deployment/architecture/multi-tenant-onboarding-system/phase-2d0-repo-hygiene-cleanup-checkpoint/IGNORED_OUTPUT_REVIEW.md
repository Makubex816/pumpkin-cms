# Ignored Output Review

## Summary

Ignored generated output is present and expected. None of the checked generated output paths were staged.

## Confirmed Ignored Output Classes

| Path Class | Status | Handling |
| --- | --- | --- |
| `.static-release-dry-runs/` | ignored | do not stage |
| `apps/admin/.next/` | ignored | do not stage |
| `apps/admin/node_modules/` | ignored | do not stage |
| `apps/ice-rink-web/.next/` | ignored | do not stage |
| `apps/ice-rink-web/.static-artifacts/` | ignored | do not stage |
| `apps/ice-rink-web/.static-content-snapshots/` | ignored | do not stage |
| `apps/ice-rink-web/out/` | ignored | do not stage |
| `apps/ice-rink-web/node_modules/` | ignored | do not stage |
| `apps/pumpkin-api.Tests/bin/`, `apps/pumpkin-api.Tests/obj/` | ignored | do not stage |
| `apps/pumpkin-api/bin/`, `apps/pumpkin-api/obj/` | ignored | do not stage |
| `apps/pumpkin-net-models/bin/`, `apps/pumpkin-net-models/obj/` | ignored | do not stage |
| `deployment/architecture/multi-tenant-onboarding-system/import-package-builder/.tmp/` | ignored | do not stage |
| `deployment/architecture/multi-tenant-onboarding-system/validator-implementation/.tmp/` | ignored | do not stage |
| `packages/pumpkin-block-views/dist/`, `packages/pumpkin-block-views/node_modules/` | ignored | do not stage |
| `packages/pumpkin-ts-models/dist/` | ignored | do not stage |
| `tools/dotnet-page-contract/bin/`, `tools/dotnet-page-contract/obj/` | ignored | do not stage |
| `tools/ice-rink-local-seed/node_modules/` | ignored | do not stage |

## Roller `.tmp` Output

| Path | Status |
| --- | --- |
| `deployment/architecture/multi-tenant-onboarding-system/import-package-builder/.tmp/real-dry-run-roller-rink-rentals/` | ignored generated package output |
| `deployment/architecture/multi-tenant-onboarding-system/validator-implementation/.tmp/roller-phase-2c6b-env-ready-validation/` | ignored generated validator/support output |

## Broad Enumeration Note

A broad ignored-file path enumeration was too large because it expanded static dry-run output and `node_modules`. The checkpoint therefore uses top-level ignored status entries and targeted path checks instead of printing every generated file.

## Cleanup Handling

Generated output may be deleted in a future cleanup task only after explicit approval naming the target directories. No deletion was performed in Phase 2D-0.
