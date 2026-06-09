# Risk Register

| Risk | Impact | Mitigation | Status |
| --- | --- | --- | --- |
| Protected config read during execution | Secret exposure | Use process env presence only; never read protected files | open for future execution |
| Standard backup accidentally includes secrets | Backup becomes unsafe to store/share | Secret scan, redacted inventory, escrow absence marker, fail closed | open for future execution |
| Database artifact contains sensitive data | Sensitive artifact exposure | Encrypt portable artifacts, checksum, access-limit, retention-limit | open for future execution |
| Database export during writes is inconsistent | Restore proof unreliable | Prefer transactionally consistent export and record timing | open for future execution |
| Media copy/download scope too broad | Unnecessary sensitive media capture | Use MediaAsset reference map and approved inventory/copy scope | open for future execution |
| Static evidence accidentally triggers deployment or indexing | Live state changes | Explicitly forbid deployment and Search Console actions | mitigated by hard stop |
| Escrow boundary blurred with standard backup | Secret payload enters normal bundle | Keep escrow marker only; require separate approval for escrow | mitigated by package policy |
| Dirty worktree complicates staging | Unrelated files could be mixed | Use exact paths only in future staging; avoid blanket staging commands | open |
| Raw `content-review` inputs staged | Raw inputs enter repo | Leave untouched and unstaged | open |
| Restore target points at production | Production data mutation | Require local/sandbox target and path safety validation | open for future execution |

## Current Overall Risk

Medium-low for preflight documentation.

Medium for future execution until database export mode, storage target, media copy scope, and retention plan are explicitly approved.
