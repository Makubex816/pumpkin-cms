# Active resource register

The register was resolved by authority, not by recency alone.

| Resource | Category | State | Authority |
| --- | --- | --- | --- |
| `SRC-ACTIVE-REPO` | source repository | `ACTIVE` | active downstream repo and CUR-20 result lane |
| `SRC-CRSTU-WORKTREE` | Git worktree | `CURRENT_REFERENCE` | CRSTU source/build snapshot |
| `SRC-UPSTREAM-MIRROR` | source repository | `STALE` | local upstream mirror only; remote rechecked separately |
| `SRC-PUBLIC-DOWNSTREAM` | source repository | `HISTORICAL` | public lineage reference |
| `ATLAS-BRIDGE-V3` | proposed bridge | `PROPOSED` | supplied bridge only, not active Atlas |
| `WM-V090` | working-memory package | `ACTIVE_INPUT` | precloseout package input |
| `RESULT-A01` | active output | `ACTIVE_OUTPUT` | committed A01 result |
| `SECURE-HANDOFF` | secure handoff | `CURRENT_REFERENCE` | secure metadata and secret boundary |
| `SECURE-PLATFORM-IDENTITY-CRST` | metadata register | `CURRENT_REFERENCE` | identity/capacity handoff evidence |
| `TENANT-INTAKE` | tenant intake | `ACTIVE_INPUT` | customer/private onboarding input |
| `ARCHIVE-CENSUS` | backup/archive register | `CURRENT_REFERENCE` | complete archive census |
| `DEPLOYMENT-REFS` | active deployment reference | `CURRENT_REFERENCE` | CRSTUR/A01 live carryforward |
| `TOOLS-ATLAS-BRIDGE` | tool | `PROPOSED` | bridge package tools only |
| `PROGRAM-MGMT-SHELLS` | program-management input/output | `UNKNOWN` | empty shells; no active Atlas evidence |

## Authority notes

- The active source repository is `pumpkin-cms`, not the public fork mirror.
- The only complete Atlas-shaped tree is the supplied bridge, and it is not active.
- Secure handoff content is current reference evidence, not an Atlas authority source.
- Tenant intake packages are active inputs for tenant onboarding lanes, not Build Atlas authorities.
- Archive packages contain source/tenant/rollback content, but no Atlas structural signatures were found in archive central directories.
