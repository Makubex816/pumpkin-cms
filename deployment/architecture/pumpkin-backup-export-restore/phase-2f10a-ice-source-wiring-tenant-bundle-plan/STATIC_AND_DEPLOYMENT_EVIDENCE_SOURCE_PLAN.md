# Static And Deployment Evidence Source Plan

## Static Source Layers

| Layer | Source | Status |
| --- | --- | --- |
| CMS snapshot | `.static-content-snapshots/{siteKey}/` generated from Pumpkin API | Ignored generated source snapshot |
| Static output | `apps/ice-rink-web/.static-artifacts/{siteKey}/out/` | Ignored generated output |
| Dry-run release | `.static-release-dry-runs/{runId}/{siteKey}/` | Ignored release rehearsal |
| Live static host | Azure Static Web App per cutover docs | Documented as live |
| Public routes | `/`, `/contact`, `/service-areas`, `sitemap.xml`, `robots.txt` | Documented smoke tests passed |

## Live Evidence From Safe Docs

Production cutover docs identify:

- Static Web App: `swa-ice-static-staging`;
- resource group: `rg-ice-static-staging`;
- default hostname: `happy-mud-0b375e20f.7.azurestaticapps.net`;
- custom domains: `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com`;
- approved routes returning 200 and obsolete routes returning 404 in the prior smoke report.

## Backup Source Role

Static evidence in a standard backup should include:

- static output manifest;
- route list;
- sitemap/robots evidence;
- canonical host evidence;
- static asset manifest;
- public media URL validation summary;
- form endpoint reference;
- deployment/run metadata.

It should not include deployment tokens, generated workflows, protected config, or live Search Console/indexing actions.

