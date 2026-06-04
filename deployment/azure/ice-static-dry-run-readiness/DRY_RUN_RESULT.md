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
| 5 | yes | exit `1`; approved snapshot/theme read fixed, but production-readiness gates still blocked local route proof |

## Current Outcome

Dry run completed: yes.

Command executed: yes.

Exit code: `0`.

The command completed `snapshot:cms:ice`, `validate:snapshot:ice`, `build:static:ice:cms`, and `static-publish.mjs generate`.

Current snapshot:

| Field | Result |
| --- | --- |
| discoveredPageCount | 6 |
| pageCount after approved-scope filter | 3 |
| required slugs | `home`, `contact`, `service-areas` |
| excluded slugs | `events-holiday-activations`, `ice-rink-rentals`, `phase-5a-csv-import-54754949` |
| themeSnapshot | true |
| theme 401 | fixed |

Fresh static output:

| Location | Routes |
| --- | --- |
| `apps/ice-rink-web/out` | `/`, `/contact`, `/service-areas` |
| `apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out` | `/`, `/contact`, `/service-areas` |

Validator split:

| Validator | Exit | Result |
| --- | ---: | --- |
| `npm run validate:snapshot:ice` | 0 | route/snapshot validation passed; production-readiness blockers remain warnings |
| `validate-static-output.mjs` | 1 | 22 strict production errors |
| `validate-staging-package.mjs` | 1 | 22 strict staging package errors |

Strict production/staging validators still exit `1`, as expected, because production readiness remains blocked by media URLs, unapproved rendered image URLs, noindex metadata, and missing/unverified static form endpoint.

No staging, deployment, CMS writes, Theme writes, MediaAsset writes, email, or Microsoft 365 actions were performed.
