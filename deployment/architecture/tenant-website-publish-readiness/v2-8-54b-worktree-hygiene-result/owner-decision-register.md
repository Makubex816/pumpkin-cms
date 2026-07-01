# Owner Decision Register

| scope | count | recommended_bucket | reason |
| --- | --- | --- | --- |
| tracked modified source/docs | 157 | defer_needs_owner_decision | Broad cross-lane changes predate V2.8.54B and need phase/owner commit grouping. |
| untracked content-review assets/packages | 36 | defer_needs_owner_decision | Could be package input or owner-provided media; deletion not approved. |
| untracked test-results/.last-run.json | 1 | defer_needs_owner_decision | Non-ignored generated test state; preserve until ignore/delete decision. |
| ignored secure/config-looking paths | 106 | defer_needs_owner_decision | Contents not read; preserved because of protected-config risk. |
| ordinary node_modules directories | 77331 | keep_untracked_intentionally | Dependency cache deletion was not approved. |
| outside repo secure/operator/intake/reference paths | 3 existing / 1 missing | defer_needs_owner_decision | External clone, secure handoff, and secondary candidate exist and were not mutated; tenant-backups path absent. |


See tracked-change-disposition.md and untracked-file-disposition.md for per-file classification.
