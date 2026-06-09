# Tooling And Env Readiness Matrix

## Local Tooling

| Tool | Result | Use |
| --- | --- | --- |
| `node` | PRESENT | Backup Center CLI/tests |
| `npm` | PRESENT | Backup Center scripts/tests |
| `az` | PRESENT | Read-only Azure discovery when logged in |
| `sqlpackage` | MISSING | Azure SQL/BACPAC export, if ever selected |

## Phase 2F-10 Env Readiness

| Area | Result |
| --- | --- |
| CMS read-only env | Present for `PUMPKIN_API_URL` and `PUMPKIN_ADMIN_JWT` |
| Ice API-key env | Missing |
| Azure SQL export env | Missing |
| Cosmos provider env | Not yet defined in Backup Center profile |
| Media blob copy env | Missing |
| Backup private storage env | Missing |
| Escrow env | Not applicable to standard backup |

## Required Additions

Add profile-aware presence checks for:

- database provider;
- Cosmos account/database/container or Mongo equivalent;
- media account/container/public host;
- local ignored output root;
- private backup storage target;
- artifact encryption mode;
- restore validation mode.

All checks must print only PRESENT/MISSING.

