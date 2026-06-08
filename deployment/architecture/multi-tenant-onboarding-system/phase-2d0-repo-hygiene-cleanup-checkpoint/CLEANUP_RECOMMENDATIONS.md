# Cleanup Recommendations

## Recommended Order

1. Keep Phase 2C-6B committed state as the current milestone baseline.
2. Review and stage Phase 2D-0 checkpoint docs as a small docs-only commit after validation.
3. Review untracked onboarding evidence packages in phase batches, especially Phase 2C-6 and Phase 2C-6A blocker history.
4. Review modified onboarding architecture docs separately from app source and static/Azure files.
5. Leave raw `content-review` folders untouched until a content-ingestion owner handles them.
6. Leave ignored generated output alone unless the operator approves explicit directory deletion.
7. Resolve the accidental `tatus --short` artifact only after explicit delete approval.

## Safe Cleanup Candidates Requiring Explicit Approval

| Candidate | Reason | Approval Needed |
| --- | --- | --- |
| `tatus --short` | likely accidental command-output artifact | explicit delete approval |
| Old `.tmp` package/validator output | generated evidence can be regenerated | explicit delete approval naming directories |
| `.static-release-dry-runs/` | generated static dry-run output | explicit delete approval |
| `.next/`, `out/`, `bin/`, `obj/`, `dist/` | generated build output | explicit delete approval |
| `node_modules/` | reinstallable dependencies | explicit delete approval |

## Staging Recommendations

- Use path-specific `git add` only.
- Do not use `git add -A`.
- Keep documentation-only, source-code, raw-input, and generated-output categories separate.
- Run a staged secret/path scan before every commit.
- Do not stage ignored output or raw `content-review` inputs.

## No `.gitignore` Change Needed Now

The observed generated output and protected config paths are already ignored. The accidental `tatus --short` file should be handled as a one-off delete candidate, not a reason for broad ignore rules.

## Next Functional Step

After cleanup docs are reviewed, the next functional phase should be Roller reconciliation planning only, not CMS import execution.
