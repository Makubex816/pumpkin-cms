# Pumpkin Tenant Website Publish Readiness V2.8.18 Live Site Regression Investigation Report

Phase status: complete read-only investigation and recovery plan.

Current lane: V2.8 Tenant Website / Public Website Regression Recovery.

Classification: `readonly_live_site_regression_investigation_no_deploy`.

No production deploy was performed in V2.8.18.

## Boundary Finding

Custom-domain attachment, not resource name, determines the production boundary.

`swa-ice-static-staging` is production-bound because Azure Static Web Apps metadata shows these custom domains attached and `Ready`:

- `iceskatingrinkrentals.com`
- `www.iceskatingrinkrentals.com`

`swa-ice-static-isolated-staging` is the safe isolated staging target. It has default hostname `kind-island-0a85a740f.7.azurestaticapps.net` and no custom hostnames listed.

## Regression Summary

The current public website regression is a V2.8 tenant website content/readiness issue, not an Audit Jobs, OLM, or V2.12 handoff issue.

Evidence-backed finding: the production-bound target has deployment evidence for a sanitized/static three-route page set. The artifacts and current source inventory contain `/`, `/service-areas`, and `/contact`, but no committed image assets under `apps/ice-rink-web/public`, no image files in the current deployable Ice output, and empty image URL fields in the seed page data.

Likely cause, proven for the artifact path: a technically valid minimal static page set was deployed to the production-bound SWA target. Likely cause, unproven for the original old site: the older image-heavy site source/artifact was outside the currently discovered Git/static artifact evidence or was never captured in this repository.

## Result Package

```text
deployment/architecture/tenant-website-publish-readiness/v2-8-18-live-site-regression-investigation-asset-page-recovery-result/
```

Key outputs:

- production-bound and isolated staging target classification
- deployment evidence timeline
- current live artifact candidates
- source/page/asset/static-output inventory
- root-cause evidence and missing evidence
- rollback, rebuild, and hybrid recovery options
- publishing gates requiring isolated staging first and owner visual/content approval
- next-phase prompt for a safe recovery implementation plan

## Security Boundary

No SWA deploy, redeploy, Azure mutation, DNS change, custom-domain change, Search Console/indexing action, token reset/print/inspection, protected config read, `.env.local` access, Key Vault secret query, keys/listKeys, connection string, SAS generation, production crawl, live outbound URL check, contact-form POST, or live publication action occurred.

