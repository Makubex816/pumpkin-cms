# Dry Run Result

## Command

```powershell
cd apps/ice-rink-web
npm run export:static:ice:cms
```

## Previous Outcomes

| Attempt | Command executed | Outcome |
| --- | --- | --- |
| 1 | yes | exit `1`; `ICE_RINK_RENTALS_API_KEY` missing |
| 2 | no | preflight stopped because `PUMPKIN_API_URL`, `ICE_RINK_RENTALS_API_KEY`, and `ICE_RINK_RENTALS_TENANT_ID` were missing |
| 3 | yes | exit `1`; `pageCount: 0`, missing `home`, `contact`, `service-areas`, Admin JWT not provided, theme 401 |
| 4 | yes | exit `1`; `pageCount: 6`, required slugs present, theme 401, obsolete/extra slugs present |

## Current Outcome

Dry run completed: no.

Command executed: yes.

Exit code: `1`.

The command stopped during `snapshot:cms:ice`.

Current snapshot:

| Field | Result |
| --- | --- |
| discoveredPageCount | 6 |
| pageCount after approved-scope filter | 3 |
| required slugs | `home`, `contact`, `service-areas` |
| excluded slugs | `events-holiday-activations`, `ice-rink-rentals`, `phase-5a-csv-import-54754949` |
| themeSnapshot | true |
| theme 401 | fixed |

Blocker:

```text
snapshot:cms:ice fails production-readiness validation because approved pages still contain local-dev media URLs, home/service-areas noindex metadata, missing/unverified static form endpoint settings, and theme navigation warnings.
```

The command did not proceed to static build, static generation, release packaging, staging, deployment, CMS writes, Theme writes, or MediaAsset writes.
