# Delete Approval Required List

No files were deleted in Phase 2D-0.

The following paths are candidates for future cleanup, but every deletion requires explicit approval naming the target.

## High-Confidence Accidental Artifact

| Path | Reason |
| --- | --- |
| `tatus --short` | likely accidental truncated command/output artifact |

## Generated Output Candidates

| Path | Reason |
| --- | --- |
| `deployment/architecture/multi-tenant-onboarding-system/import-package-builder/.tmp/` | generated import package output |
| `deployment/architecture/multi-tenant-onboarding-system/validator-implementation/.tmp/` | generated validator/support output |
| `.static-release-dry-runs/` | generated static dry-run output |
| `apps/ice-rink-web/.static-artifacts/` | generated static artifacts |
| `apps/ice-rink-web/.static-content-snapshots/` | generated CMS/static snapshots |
| `apps/admin/.next/`, `apps/ice-rink-web/.next/`, `apps/ice-rink-web/out/` | generated frontend output |
| `bin/`, `obj/`, `dist/` outputs | generated build output |
| `node_modules/` directories | dependency installs |

## Raw Input Candidates Not Recommended For Deletion Yet

| Path | Reason To Keep |
| --- | --- |
| `content-review/ice-final-contact-input/` | raw source package for separate content review |
| `content-review/ice-service-areas-input/` | raw source package for separate content review |

Do not delete raw inputs during repo hygiene cleanup unless a future content-ingestion/review workflow explicitly closes them out.
