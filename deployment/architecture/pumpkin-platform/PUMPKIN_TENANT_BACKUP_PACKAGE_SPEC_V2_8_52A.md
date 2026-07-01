# Pumpkin Tenant Backup Package Spec V2.8.52A

## Purpose

This spec defines the protected tenant backup bundle shape proven for the Ice tenant in V2.8.52A. The bundle is an operator-owned, outside-repo artifact intended for audit, checksum proof, and local restore planning.

## Storage Boundary

Backups must be written outside the repo under an operator-controlled protected path. V2.8.52A used:

`C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\tenant-backups\v2-8-52a-ice-rink-rentals-backup-proof`

Protected data, FormEntry contents, user details, media binaries, and secret-like values must not be copied into repo result files.

## Required Files

| Path | Purpose |
| --- | --- |
| `manifest.json` | Bundle summary, counts, file inventory, and restore classification. |
| `checksums.sha256` | SHA-256 checksums for protected bundle files except the checksum file itself. |
| `coverage-matrix.json` | Domain-level coverage, partials, and gaps. |
| `restore-plan.md` | Operator restore sequence and hard stops. |
| `tenant/tenant-summary.json` | Tenant metadata with secret-like fields redacted. |
| `data/pages.json` | Page export. |
| `data/media-assets.json` | MediaAsset record export. |
| `data/themes.json` | Theme export. |
| `data/form-definitions.json` | FormDefinition export. |
| `data/form-entries.json` | Protected FormEntry export; PII-bearing. |
| `data/import-runs.json` | ImportRun export. |
| `data/publish-runs.json` | PublishRun export. |
| `data/users-redacted.json` | Redacted current actor/user identity evidence. |
| `media/manifest.json` | Blob inventory, local protected paths, byte counts, hashes. |
| `package/tenant-onboarding-package-summary.json` | Tenant package summary only. |
| `static-publish/snapshot-summary.json` | Static publish snapshot summary only. |
| `resource-map/resource-summary.json` | Resource inventory summary only. |

## Proven Ice Coverage

| Domain | V2.8.52A Result |
| --- | --- |
| Pages | Covered, 3 records. |
| MediaAssets | Covered, 9 records. |
| Media binaries | Covered, 9 blobs, 22,639,448 bytes, RBAC login only. |
| Themes | Covered, 1 record. |
| FormDefinitions | Covered, 1 record. |
| FormEntries | Covered in protected bundle, 4 records, PII-bearing. |
| ImportRuns | Covered, 1 record. |
| PublishRuns | Covered, 1 record. |
| Users | Partial, redacted current actor only. |
| Static publish | Metadata summary covered. |
| Tenant secrets | Excluded/redacted by design. |

## Checksum Policy

Every protected bundle file except `checksums.sha256` must have a SHA-256 entry. Restore validation must recompute every listed hash before using the bundle.

V2.8.52A proof:

- Checksum lines: 26
- Manifest SHA-256: `60386efdcf3b3ac9d15e30c5113c8ffd49f4faab877c635eb796d5cb941f8187`
- Checksums file SHA-256: `8f36a6b5e0ea4c8bb1e3c4c40d5e4753c7e5d480e1df4b69da916021ac9f620f`

## Restore Contract

The package is restore-planning ready, not live-restore approved. A live restore must have a separate approval that identifies the target tenant, mutation scope, identity handling, secret restore handoff, media overwrite/delete policy, rollback plan, and no-regression proof.
