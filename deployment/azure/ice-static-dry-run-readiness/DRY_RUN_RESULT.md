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

This current outcome is after the approved active CMS metadata repair for `home` and `service-areas`.

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
| robots metadata | `home`, `contact`, and `service-areas` all `index,follow` |
| active OG/Twitter local social images | none |

Fresh static output:

| Location | Routes |
| --- | --- |
| `apps/ice-rink-web/out` | `/`, `/contact`, `/service-areas` |
| `apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out` | `/`, `/contact`, `/service-areas` |

Latest validator split:

| Validator | Exit | Result |
| --- | ---: | --- |
| `npm run validate:snapshot:ice` | 0 | route/snapshot validation passed; production-readiness blockers remain warnings |
| `validate-static-output.mjs` | 0 | passed after later media/revision cleanup, production form enablement, and official fresh CMS export retry |
| `validate-staging-package.mjs` | 0 | passed after later media/revision cleanup, production form enablement, and official fresh CMS export retry |

Strict production/staging validators now pass in the latest official fresh CMS-backed verification. Later approved MediaAsset, active page body/media, static revision-payload cleanup, and static form production enablement cleared the previous media/form strict errors.

Noindex errors and the unapproved rendered social image URL are cleared.

There are no remaining strict static/staging validator errors in the latest fresh CMS-backed verification. Azure staging remains a separate approval.

No staging, deployment, Theme writes, MediaAsset writes, email, or Microsoft 365 actions were performed. Only the explicitly approved active CMS metadata fields were changed.
