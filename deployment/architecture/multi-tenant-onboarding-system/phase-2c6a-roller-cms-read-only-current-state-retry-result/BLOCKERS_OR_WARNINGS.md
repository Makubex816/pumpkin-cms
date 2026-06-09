# Blockers Or Warnings

## Blockers

| Blocker | Impact | Required Resolution |
| --- | --- | --- |
| `PUMPKIN_API_URL` missing | CMS/API target cannot be selected | Operator must launch Codex from a process where the variable is present |
| CMS current-state evidence not gathered | Existing Roller tenant/site/domain/route conflicts remain unknown | Run GET/HEAD-only CMS current-state retry after env readiness |

## Warnings

| Warning | Impact | Mitigation |
| --- | --- | --- |
| `ROLLER_RINK_RENTALS_API_KEY` missing | Public tenant-key GET checks unavailable | Use admin JWT read-only checks if sufficient after API target is present |
| `ROLLER_RINK_RENTALS_TENANT_ID` missing | Runtime tenant ID is not available | Treat `roller-rink-rentals` as candidate key only until CMS confirms |
| No dedicated read-only CMS import preflight checker found | Manual endpoint checks may be less consistent | Implement or approve a no-write checker before import execution approval |
| Phase 2C-5 files are staged and Phase 2C-6 files are untracked | Multiple gate artifacts are visible in the worktree | Keep 2C-6A artifacts reviewed separately |

## Not Blockers

- Local Roller package validation passed.
- Support packet redaction passed.
- Generated output remains under ignored `.tmp` paths.
- No CMS write or external mutation occurred.
