# Blockers Or Warnings

## Blockers

| Blocker | Impact | Required Resolution |
| --- | --- | --- |
| `PUMPKIN_API_URL` missing | CMS/API target cannot be selected | Operator must provide it in the shell for a later approved read-only preflight rerun |
| CMS current-state evidence not gathered | Existing Roller tenant/site/route conflicts are unknown | Run GET/HEAD-only CMS conflict checks after env readiness |

## Warnings

| Warning | Impact | Mitigation |
| --- | --- | --- |
| `ROLLER_RINK_RENTALS_API_KEY` missing | Public tenant-key GET checks are unavailable | Use admin JWT read-only checks if sufficient, or provide runtime-only key without printing it |
| `ROLLER_RINK_RENTALS_TENANT_ID` missing | Runtime tenant ID was not available | Use local expected key `roller-rink-rentals` only as candidate input until CMS confirms |
| No dedicated read-only importer/preflight checker exists | Manual GET/HEAD checks may be error-prone | Implement or approve a no-write checker before execution approval |
| Phase 2C-5 package files are staged in current worktree | Pre-existing staging state may mix gates | Keep Phase 2C-6 files separately reviewed before commit |

## Not Blockers

- Local Roller package validation passed.
- Support packet redaction passed.
- No generated `.tmp` output was staged by this evidence run.
- No CMS write or external mutation occurred.
