# Current Live Artifact Candidate

Status: current live artifact cannot be fetched directly under the V2.8.18 no-crawl/no-deploy boundary.

Best evidence-backed candidates:

## Candidate A: V2.8.17D Proven Production Deploy

| Field | Value |
| --- | --- |
| Artifact run | `sanitized_20260613174033` |
| Artifact path | `apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260613174033/repo/apps/ice-rink-web/out` |
| Aggregate hash | `506c6b4c99bcabed162466c79b299f900c6070855b90cd6f38ffae37fceff899` |
| File count | `41` |
| Deployment target | `swa-ice-static-staging` |
| Deployment id | `96fd744f-5589-4ac3-bebb-cfa99048dc0e` |
| Routes | `/`, `/service-areas`, `/contact` |
| Image assets in output | `0` |

This candidate is proven to have been deployed to the production-bound target.

## Candidate B: Later Indexing Cleanup Redeploy

| Field | Value |
| --- | --- |
| Artifact path | `apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out` |
| Manifest generatedAt | `2026-06-13T19:53:26.069Z` |
| Content source | `seed-sites` |
| Page count | `3` |
| File count observed in output | `42` |
| Image assets in output | `0` |

This candidate is documented as a later cleaned redeploy in `deployment/azure/ice-production-indexing-cleanup-result/`, but this phase did not perform live route fetches to prove it is currently served.

Both candidates are minimal static outputs and do not contain the older image-heavy experience.

