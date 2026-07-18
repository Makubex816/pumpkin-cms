# Git repository and worktree audit

Six Git repositories/worktrees were discovered under the parent workspace.

| Path | Type | Branch | HEAD | Dirty paths | Remote / role |
| --- | --- | --- | --- | ---: | --- |
| `pumpkin-cms` | repo | `feature/admin-page-editor-import-export` | `611b8237a7d8c3123965edfba7f59b597f31bdf4` | 239 | active downstream repo, origin `Makubex816/pumpkin-cms.git` |
| `external-reference/SDI-AI-pumpkin-cms` | repo | `main` | `565a8afd669a42224a9d15759f7060faa375d000` | 0 | local upstream mirror, stale vs remote `817e176` |
| `external-reference/Makubex816-pumpkin-cms` | repo | `main` | `64156a3015943f08bc89cadb2caae910d5cadf4f` | 0 | public downstream historical reference |
| `v2-8-63crr-clean` | worktree | detached | `5747ee4a3229dcf1373fc5e998f24c0dbabf0d17` | 0 | CRR clean worktree |
| `v2-8-63crs-clean` | worktree | detached | `e337821653ae8bddbd6d9a937e2a08c9c0711af0` | 16 | CRS clean/recovery worktree |
| `v2-8-63crstu-build` | worktree | detached | `87ba5cd0ec305d30b9345ea95475c1b7fcde1c62` | 1 | CRSTU build/source snapshot |

## Strict Atlas history findings

The strict Git search looked for `.project-ops`, `CHAT-PACK`, `BUILD-ATLAS`, `milestone-ledger`, `attempt-ledger`, `CURRENT-STATE`, `CURRENT-PHASE`, `EVIDENCE-INDEX`, and `RESUMPTION-CAPSULE`.

| Path | Tracked strict matches | `.project-ops` | CHAT-PACK | ledgers |
| --- | ---: | ---: | ---: | ---: |
| `pumpkin-cms` | 274 | 0 | 1 | 0 |
| `external-reference/SDI-AI-pumpkin-cms` | 0 | 0 | 0 | 0 |
| `external-reference/Makubex816-pumpkin-cms` | 0 | 0 | 0 | 0 |
| `v2-8-63crr-clean` | 273 | 0 | 0 | 0 |
| `v2-8-63crs-clean` | 273 | 0 | 0 | 0 |
| `v2-8-63crstu-build` | 273 | 0 | 0 | 0 |

The large strict-match counts in the active repo and worktrees are mostly historical `current-state-summary.md` result files, not an Atlas structure. No repository or worktree tracks `.project-ops`, milestone ledger, or attempt ledger files.

## Conclusion

The active downstream source is found and preserved. Git history did not reveal a deleted or moved active Atlas. The local upstream mirror is stale, and current upstream state was rechecked from GitHub directly.
