# Generated Output Status

## Summary

Ignored generated output is present and was left untouched.

No generated output was staged. No generated output was deleted. No generated output was moved or normalized.

## Observed Ignored Output Categories

- `.static-release-dry-runs/`
- Next.js `.next/` output
- static artifacts and static snapshots
- `out/`
- `node_modules/`
- TypeScript build info
- `.NET` `bin` and `obj` output
- Roller import package builder `.tmp` output
- Roller validator `.tmp` output
- package `dist` output

## Cleanup Recommendation

Do not clean generated output in Phase 2D-1.

If cleanup is desired later, require a separate approval listing exact directories to delete. Prefer one category per cleanup command, with path resolution checked before any recursive deletion.
