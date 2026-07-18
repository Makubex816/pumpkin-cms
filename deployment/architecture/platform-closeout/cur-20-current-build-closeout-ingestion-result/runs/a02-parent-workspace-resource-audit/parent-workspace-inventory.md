# Parent workspace inventory

Boundary audited: the complete PumpkinCMS parent workspace. Paths below are parent-relative.

No top-level file was present in the observed parent root. All 20 top-level children were directories. No top-level reparse point, junction, symlink, or cloud placeholder attribute was observed.

| Area | Aggregate bytes | Files | Dirs | Archives | Git | Initial classification |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| `backup-inspection` | 126,908 | 6 | 3 | 1 | no | historical backup inspection |
| `content-review` | 62,584,534 | 4 | 1 | 3 | no | content/reference input |
| `crsrlogs2` | 989,070 | 72 | 13 | 0 | no | historical log evidence |
| `cur-20-package-work` | 703,427 | 150 | 20 | 0 | no | A01 extracted Atlas/working-memory inputs |
| `external-reference` | 60,480,078 | 744 | 243 | 0 | yes | external source mirrors |
| `ice-site-recovery-intake` | 86,854,340 | 51 | 18 | 6 | no | recovery/input package area |
| `jsons` | 20,886 | 1 | 1 | 1 | no | historical JSON archive |
| `local-runtime` | 19,665 | 9 | 2 | 0 | no | local runtime metadata |
| `packages` | 0 | 0 | 2 | 0 | no | empty package staging shell |
| `program-management-intake` | 0 | 0 | 1 | 0 | no | empty/OPS-010 shell |
| `program-management-output` | 0 | 0 | 1 | 0 | no | empty/OPS-010 shell |
| `pumpkin-cms` | 4,884,733,244 | 138,579 | 15,056 | 88 | yes | active downstream repository |
| `quota-requests` | 2,173 | 2 | 1 | 0 | no | quota request evidence |
| `secure-operator-handoff` | 1,280,027,571 | 5,153 | 1,002 | 29 | no | secure operator handoff metadata and secret boundary |
| `tenant-onboarding-intake` | 625,318,809 | 2,344 | 273 | 6 | no | tenant/customer source intake |
| `tools` | 0 | 0 | 1 | 0 | no | empty top-level tooling shell |
| `v2-8-63crr-clean` | 137,583,189 | 11,428 | 947 | 0 | worktree | CRR clean historical worktree |
| `v2-8-63crs-clean` | 1,162,775,825 | 41,133 | 4,171 | 0 | worktree | CRS clean/recovery worktree |
| `v2-8-63crstu-build` | 938,173,684 | 39,878 | 3,981 | 0 | worktree | CRSTU build/source snapshot |
| `visual-review` | 161,287,021 | 1,367 | 80 | 0 | no | visual-review evidence |

## Top-level timestamps

Representative UTC last-write values:

- `secure-operator-handoff`: `2026-07-16T15:44:42Z`
- `cur-20-package-work`: `2026-07-16T16:09:32Z`
- `pumpkin-cms`: `2026-07-16T01:07:32Z`
- `v2-8-63crstu-build`: `2026-07-16T01:52:49Z`
- `tenant-onboarding-intake`: `2026-07-11T05:40:34Z`

## Signature summary

- Safe text signature matches: 1,525 files.
- Signature matches by top-level area: `pumpkin-cms` 398, `v2-8-63crr-clean` 362, `v2-8-63crs-clean` 362, `v2-8-63crstu-build` 362, `cur-20-package-work` 39, `ice-site-recovery-intake` 2.
- Structural Atlas/working-memory signature objects: 19, all under `cur-20-package-work`.
- No root workspace README, quick-start, recovery manifest, or owner-startup document existed as a top-level file in the observed parent root.
