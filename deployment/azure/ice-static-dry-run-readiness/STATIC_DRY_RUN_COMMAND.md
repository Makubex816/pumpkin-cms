# Static Dry Run Command

## Candidate Commands Reviewed

`npm run publish:dry-run:cms` was not used because it loops over both Ice and Roller. Roller remains paused.

The safe Ice-only command is:

```powershell
cd apps/ice-rink-web
npm run export:static:ice:cms
```

This command runs:

1. `snapshot:cms:ice`
2. `validate:snapshot:ice`
3. `build:static:ice:cms`
4. `static-publish.mjs generate`

## Current Required Env

| Env var | Status |
| --- | --- |
| `PUMPKIN_API_URL` | PRESENT |
| `ICE_RINK_RENTALS_API_KEY` | PRESENT |
| `ICE_RINK_RENTALS_TENANT_ID` | PRESENT |
| `PUMPKIN_ADMIN_JWT` | PRESENT |
| `PUMPKIN_ADMIN_JWT` temp file | PRESENT |

Secret/JWT values were not printed.

## Current Result

The command was run and stopped during `snapshot:cms:ice`.

The snapshot tooling now:

- uses the admin active-theme read endpoint when an admin token is available
- falls back to the approved temp admin token file when env-token sources are absent
- filters Ice snapshot pages to `home`, `contact`, and `service-areas`
- records excluded slug names in `manifest.json`

Result:

- `discoveredPageCount: 6`
- `pageCount: 3`
- `themeSnapshot: true`
- exit code: `1`

Remaining blockers are production-readiness blockers, not page discovery or theme 401.
