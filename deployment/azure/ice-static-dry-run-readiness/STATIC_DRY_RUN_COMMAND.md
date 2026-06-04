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

Secret/JWT values were not printed.

## Current Result

The command was run and completed successfully.

Result:

- exit code: `0`
- `discoveredPageCount: 6`
- `pageCount: 3`
- approved snapshot slugs: `home`, `contact`, `service-areas`
- excluded snapshot slugs: `events-holiday-activations`, `ice-rink-rentals`, `phase-5a-csv-import-54754949`
- `themeSnapshot: true`
- fresh route output: `/`, `/contact`, `/service-areas`

Remaining blockers are production-readiness blockers, not page discovery, theme 401, or local route-shape blockers.
