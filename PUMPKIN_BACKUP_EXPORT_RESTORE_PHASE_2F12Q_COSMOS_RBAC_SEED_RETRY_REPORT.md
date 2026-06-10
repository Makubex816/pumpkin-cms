# Pumpkin Backup Export/Restore Phase 2F-12Q Report

Status: complete

Phase 2F-12Q assigned Cosmos native data-plane RBAC at database scope for the approved current Azure principal, reran the guarded Ice seed runner, and verified tenant-scoped readback.

Why RBAC was required:

- Phase 2F-12P blocked before writes with a Cosmos native RBAC 403 on `executeQuery`.
- The 12P runner could not perform pre-write checks or seed writes without data-plane query/read/create permissions.

Role selected:

- `Cosmos DB Built-in Data Contributor`
- Role definition ID: `00000000-0000-0000-0000-000000000002`
- Scope: `cosmos-pumpkin-prod-eastus/dbs/pumpkin-prod-cms`

The Data Reader role was insufficient because the guarded seed retry required item creation for missing seed documents.

Seed retry result:

| Field | Count |
| --- | ---: |
| Expected seed documents | 27 |
| Created in final retry | 23 |
| Skipped matching existing | 4 |
| Conflicts | 0 |
| Failed writes | 0 |
| Final readback total | 27 |

The first post-RBAC seed attempt hit Cosmos 429 throttling after four deterministic documents had landed. The live client was hardened with retry-after handling and partial-count recording, then the runner was rerun idempotently. Final readback passed with the approved 27 Ice tenant documents.

Readiness classification:

| Item | Status |
| --- | --- |
| 12P guarded seed attempt | complete |
| 12Q RBAC assignment | complete |
| Safe data-plane access after RBAC | yes |
| Live seed documents written | yes |
| Readback verification | yes |
| CMS runtime switch performed | no |
| Live database export performed | no |
| Ice fully backupable today | no |
| External systems changed | approved RBAC assignment and approved Cosmos seed documents only |
| Live pages affected | no |

No keys/listKeys, connection strings, SAS, protected config reads, CMS writes, MediaAsset writes, deployment, Search Console/indexing, or live-page publication occurred. Generated `.tmp` artifacts remain ignored and unstaged.
