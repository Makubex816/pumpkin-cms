# Preview Dry-Run Result

Phase 2B-2 adds safe preview/diff summary behavior through `--dry-run`.

## Preview Includes

- files that would be created
- files that would be overwritten
- unchanged files
- pages generated
- approved and forbidden routes
- media refs generated
- form refs generated
- validator command that would run after generation
- support packet flag

## Limit

The preview is summary-only. Full line-by-line file diffs are documented as backlog because this phase prioritized safe, non-mutating operator preview output.

`--dry-run` writes no package files and skips validator execution.
